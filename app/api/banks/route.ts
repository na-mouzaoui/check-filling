import { type NextRequest, NextResponse } from "next/server"
import { getBanks, createBank } from "@/lib/db"
import { loadBanksFromDisk, saveBanksToDisk } from "@/lib/banks-store"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function GET() {
  const banks = getBanks()
  const stored = await loadBanksFromDisk()
  banks.forEach((b) => {
    const match = stored.find((s) => s.id === b.id)
    if (match?.positions) b.positions = match.positions
    if (match?.pdfUrl) b.pdfUrl = match.pdfUrl
  })
  return NextResponse.json({ banks })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const code = formData.get("code") as string
    const name = formData.get("name") as string
    const pdf = formData.get("pdf") as File | null

    let pdfUrl: string | undefined

    if (pdf) {
      // Convertir le fichier en buffer et le sauvegarder
      const bytes = await pdf.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Créer le dossier uploads s'il n'existe pas
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Dossier existe déjà
      }
      
      // Nom de fichier unique
      const fileName = `${code}-${Date.now()}.pdf`
      const filePath = join(uploadDir, fileName)
      
      // Sauvegarder le fichier
      await writeFile(filePath, buffer)
      
      // URL publique pour accéder au fichier
      pdfUrl = `/uploads/${fileName}`
    }

    const newBank = createBank({
      code,
      name,
      pdfUrl,
      positions: {
        city: { x: 50, y: 100, width: 150, fontSize: 14 },
        date: { x: 400, y: 100, width: 150, fontSize: 14 },
        payee: { x: 120, y: 180, width: 400, fontSize: 14 },
        amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
        amount: { x: 450, y: 300, width: 150, fontSize: 18 },
      },
    })

    await saveBanksToDisk(getBanks())

    return NextResponse.json({ bank: newBank })
  } catch (error) {
    console.error("Error creating bank:", error)
    return NextResponse.json({ error: "Failed to create bank" }, { status: 500 })
  }
}
