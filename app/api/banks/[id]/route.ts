import { type NextRequest, NextResponse } from "next/server"
import { deleteBank, updateBank, getBanks } from "@/lib/db"
import { loadBanksFromDisk, saveBanksToDisk } from "@/lib/banks-store"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const success = deleteBank(id)

  if (success) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Bank not found" }, { status: 404 })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("PATCH /api/banks/[id] - ID:", id)

  try {
    const contentType = request.headers.get("content-type") || ""
    console.log("Content-Type:", contentType)

    // JSON payload: positions update only
    if (contentType.includes("application/json")) {
      const body = await request.json()
      console.log("Updating positions for bank ID:", id, "with data:", body.positions)
      
      const currentBanks = getBanks()
      console.log("Current banks in memory:", currentBanks.map(b => ({ id: b.id, name: b.name })))
      
      const updatedBank = updateBank(id, { positions: body.positions })

      if (updatedBank) {
        console.log("Bank updated successfully:", updatedBank.id, updatedBank.name)
        await saveBanksToDisk(getBanks())
        return NextResponse.json({ bank: updatedBank })
      }
      console.error("Bank not found with ID:", id)
      return NextResponse.json({ error: `Bank not found with ID: ${id}` }, { status: 404 })
    }

    // Multipart: code/name/pdf update
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

    const updateData: any = { code, name }
    if (pdfUrl) {
      updateData.pdfUrl = pdfUrl
    }

    const updatedBank = updateBank(id, updateData)

    if (updatedBank) {
      // Keep pdfUrl/positions in sync from disk if present
      const stored = await loadBanksFromDisk()
      const match = stored.find((s) => s.id === updatedBank.id)
      if (match?.positions) updatedBank.positions = match.positions
      if (match?.pdfUrl) updatedBank.pdfUrl = match.pdfUrl
      await saveBanksToDisk(getBanks())
      return NextResponse.json({ bank: updatedBank })
    }

    return NextResponse.json({ error: "Bank not found" }, { status: 404 })
  } catch (error) {
    console.error("Error updating bank:", error)
    return NextResponse.json({ error: "Failed to update bank" }, { status: 500 })
  }
}
