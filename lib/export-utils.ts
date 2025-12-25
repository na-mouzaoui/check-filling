import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Check, User } from "./db"

export function exportToExcel(
  stats: {
    totalAmount: number
    totalChecks: number
    checksByBank: Record<string, number>
    amountByUser: Record<string, number>
  },
  checks: Check[],
  users: User[],
) {
  const wb = XLSX.utils.book_new()

  // Feuille 1: Statistiques générales
  const statsData = [
    ["Statistique", "Valeur"],
    ["Montant Total (DZD)", stats.totalAmount.toFixed(2)],
    ["Nombre de Chèques", stats.totalChecks],
    ["Montant Moyen (DZD)", stats.totalChecks > 0 ? (stats.totalAmount / stats.totalChecks).toFixed(2) : "0"],
    ["Nombre de Banques", Object.keys(stats.checksByBank).length],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(statsData)
  XLSX.utils.book_append_sheet(wb, ws1, "Statistiques")

  // Feuille 2: Chèques par banque
  const bankData = [["Banque", "Nombre de Chèques"], ...Object.entries(stats.checksByBank)]
  const ws2 = XLSX.utils.aoa_to_sheet(bankData)
  XLSX.utils.book_append_sheet(wb, ws2, "Par Banque")

  // Feuille 3: Montant par utilisateur
  const userMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user.email
      return acc
    },
    {} as Record<string, string>,
  )
  const userAmountData = [
    ["Utilisateur", "Montant Total (DZD)", "Nombre de Chèques", "Montant Moyen (DZD)"],
    ...Object.entries(stats.amountByUser).map(([userId, amount]) => {
      const userChecks = checks.filter((c) => c.userId === userId)
      const avgAmount = userChecks.length > 0 ? amount / userChecks.length : 0
      return [userMap[userId] || "Inconnu", amount.toFixed(2), userChecks.length, avgAmount.toFixed(2)]
    }),
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(userAmountData)
  XLSX.utils.book_append_sheet(wb, ws3, "Par Utilisateur")

  // Feuille 4: Tous les chèques
  const checksData = [
    ["Date", "Utilisateur", "Banque", "Montant (DZD)", "À l'ordre de", "Ville", "Référence"],
    ...checks.map((check) => [
      new Date(check.createdAt).toLocaleString("fr-FR"),
      userMap[check.userId] || "Inconnu",
      check.bank,
      check.amount.toFixed(2),
      check.orderOf,
      check.city,
      check.reference || "N/A",
    ]),
  ]
  const ws4 = XLSX.utils.aoa_to_sheet(checksData)
  XLSX.utils.book_append_sheet(wb, ws4, "Tous les Chèques")

  XLSX.writeFile(wb, `tableau_bord_cheques_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export function exportStatsToPDF(
  stats: {
    totalAmount: number
    totalChecks: number
    checksByBank: Record<string, number>
    amountByUser: Record<string, number>
  },
  checks: Check[],
  users: User[],
) {
  const doc = new jsPDF()

  // Titre
  doc.setFontSize(18)
  doc.text("Tableau de Bord - Statistiques des Chèques", 14, 22)

  // Date
  doc.setFontSize(10)
  doc.text(`Généré le: ${new Date().toLocaleString("fr-FR")}`, 14, 30)

  // Statistiques générales
  doc.setFontSize(14)
  doc.text("Statistiques Générales", 14, 42)

  const statsTable = [
    ["Montant Total", `${stats.totalAmount.toFixed(2)} DZD`],
    ["Nombre de Chèques", stats.totalChecks.toString()],
    ["Montant Moyen", stats.totalChecks > 0 ? `${(stats.totalAmount / stats.totalChecks).toFixed(2)} DZD` : "0 DZD"],
    ["Nombre de Banques", Object.keys(stats.checksByBank).length.toString()],
  ]

  autoTable(doc, {
    startY: 46,
    head: [["Statistique", "Valeur"]],
    body: statsTable,
    theme: "grid",
  })

  // Chèques par banque
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Répartition par Banque", 14, 22)

  const bankTable = Object.entries(stats.checksByBank).map(([bank, count]) => [bank, count.toString()])

  autoTable(doc, {
    startY: 28,
    head: [["Banque", "Nombre de Chèques"]],
    body: bankTable,
    theme: "grid",
  })

  // Montant par utilisateur
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Montant par Utilisateur", 14, 22)

  const userMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user.email
      return acc
    },
    {} as Record<string, string>,
  )

  const userTable = Object.entries(stats.amountByUser).map(([userId, amount]) => {
    const userChecks = checks.filter((c) => c.userId === userId)
    const avgAmount = userChecks.length > 0 ? amount / userChecks.length : 0
    return [
      userMap[userId] || "Inconnu",
      `${amount.toFixed(2)} DZD`,
      userChecks.length.toString(),
      `${avgAmount.toFixed(2)} DZD`,
    ]
  })

  autoTable(doc, {
    startY: 28,
    head: [["Utilisateur", "Montant Total", "Nombre", "Montant Moyen"]],
    body: userTable,
    theme: "grid",
  })

  doc.save(`statistiques_cheques_${new Date().toISOString().split("T")[0]}.pdf`)
}

export function exportHistoryToPDF(checks: Check[], users: User[]) {
  const doc = new jsPDF()

  // Titre
  doc.setFontSize(18)
  doc.text("Historique des Chèques", 14, 22)

  // Date
  doc.setFontSize(10)
  doc.text(`Généré le: ${new Date().toLocaleString("fr-FR")}`, 14, 30)

  const userMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user.email
      return acc
    },
    {} as Record<string, string>,
  )

  const checksData = checks.map((check) => [
    new Date(check.createdAt).toLocaleDateString("fr-FR"),
    new Date(check.createdAt).toLocaleTimeString("fr-FR"),
    userMap[check.userId] || "Inconnu",
    check.bank,
    `${check.amount.toFixed(2)} DZD`,
    check.orderOf,
    check.city,
  ])

  autoTable(doc, {
    startY: 38,
    head: [["Date", "Heure", "Utilisateur", "Banque", "Montant", "À l'ordre de", "Ville"]],
    body: checksData,
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  doc.save(`historique_cheques_${new Date().toISOString().split("T")[0]}.pdf`)
}
