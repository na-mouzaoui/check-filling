"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import type { Bank } from "@/lib/db"
import { splitAmountInWords } from "@/lib/text-utils"
import { DEFAULT_BANK_POSITIONS, mergeBankPositions, parseBankPositions } from "@/lib/bank-positions"
import dynamic from "next/dynamic"
import { CheckCanvas } from "./check-canvas"
import { useToast } from "@/hooks/use-toast"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

type CalibrationToolProps = {
  refreshKey?: number
  preSelectedBankId?: string
}

// Import PDFViewer dynamically with ssr disabled
const PDFViewer = dynamic(() => import("./pdf-viewer").then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-4">Chargement...</div>
})

export function CalibrationTool({ refreshKey, preSelectedBankId }: CalibrationToolProps) {
  const { toast } = useToast()
  const [banks, setBanks] = useState<Bank[]>([])
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageWidth, setPageWidth] = useState(600)
  const [pageHeight, setPageHeight] = useState(850)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedFields, setExpandedFields] = useState({
    city: true,
    date: true,
    payee: true,
    amountInWords: true,
    amountInWordsLine2: true,
    amount: true,
  })
  const [positions, setPositions] = useState(DEFAULT_BANK_POSITIONS)
  const [hasSecondLine, setHasSecondLine] = useState(false)

  useEffect(() => {
    loadBanks()
  }, [refreshKey, preSelectedBankId])

  useEffect(() => {
    if (selectedBank) {
      setPositions(selectedBank.positions)
      setHasSecondLine(!!selectedBank.positions.amountInWordsLine2)
    }
  }, [selectedBank])

  const onDocumentLoadSuccess = ({ numPages, pageWidth, pageHeight }: { numPages: number; pageWidth: number; pageHeight: number }) => {
    setNumPages(numPages)
    // Calibrage indépendant de l'écran : utiliser la largeur native de la page PDF
    setPageWidth(Math.max(Math.round(pageWidth), 400))
    setPageHeight(Math.max(Math.round(pageHeight), 600))
  }

  const requestWithAuth = async (input: string, init: RequestInit = {}) =>
    fetch(input, { ...init, credentials: "include" })

  const loadBanks = async () => {
    const response = await requestWithAuth(`${API_BASE}/api/banks`)
    if (!response.ok) {
      console.error("Failed to load banks", await response.text())
      return
    }
    const data = await response.json()
    const rawBanks = Array.isArray(data.banks) ? data.banks : []
    const normalizedBanks = rawBanks.map((bank: Bank & { positionsJson?: string }) => ({
      ...bank,
      positions: mergeBankPositions(parseBankPositions(bank.positionsJson)),
    }))
    setBanks(normalizedBanks)
    if (normalizedBanks.length === 0) {
      setSelectedBank(null)
      return
    }

    // Priority: preSelectedBankId from URL > previous selection > first bank
    let nextBank: Bank | undefined
    
    console.log("PreSelectedBankId from URL:", preSelectedBankId)
    console.log("Available banks:", normalizedBanks.map((b: Bank) => ({ id: b.id, name: b.name })))
    
    if (preSelectedBankId) {
      // Compare as strings since URL params are strings
      nextBank = normalizedBanks.find((bank: Bank) => String(bank.id) === String(preSelectedBankId))
      console.log("Found bank by preSelectedBankId:", nextBank?.name)
    }
    
    if (!nextBank) {
      const previousId = selectedBank?.id
      nextBank = normalizedBanks.find((bank: Bank) => bank.id === previousId) ?? normalizedBanks[0]
      console.log("Using fallback bank:", nextBank?.name)
    }
    
    setSelectedBank(nextBank || null)
  }

  const handleSave = async () => {
    if (!selectedBank) {
      toast({
        title: "Erreur",
        description: "Aucune banque sélectionnée",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    const finalPositions = hasSecondLine ? positions : { ...positions, amountInWordsLine2: undefined }

    console.log("Saving positions for bank:", selectedBank.id, selectedBank.name)
    console.log("Positions to save:", finalPositions)

    try {
      const response = await requestWithAuth(`${API_BASE}/api/banks/${selectedBank.id}/positions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPositions),
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("Save successful:", result)
        toast({
          title: "✓ Succès",
          description: "Les positions ont été sauvegardées avec succès!",
        })
        await loadBanks()
      } else {
        const errorData = await response.json().catch(() => null)
        console.error("Save failed:", response.status, errorData)
        
        const errorMessage = errorData?.error 
          ? `${errorData.error} (Banque ID: ${selectedBank.id})`
          : `La banque avec l'ID "${selectedBank.id}" n'a pas été trouvée. Code: ${response.status}`
        
        toast({
          title: "✗ Erreur de sauvegarde",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      const errorMsg = error instanceof Error ? error.message : "Erreur inconnue"
      toast({
        title: "✗ Erreur réseau",
        description: `Impossible de se connecter au serveur: ${errorMsg}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updatePosition = (field: string, property: "x" | "y" | "width" | "fontSize", value: number) => {
    setPositions((prev) => ({
      ...prev,
      [field]: {
        ...prev[field as keyof typeof prev],
        [property]: value,
      },
    }))
  }

  const toggleField = (field: keyof typeof expandedFields) => {
    setExpandedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const sampleText = "cinquante mille trois cent quarante-deux dinars algériens"
  const { line1, line2 } = hasSecondLine
    ? splitAmountInWords(sampleText, positions.amountInWords.width, positions.amountInWords.fontSize)
    : { line1: sampleText, line2: "" }

  return (
    <div className="grid gap-4 lg:grid-cols-[400px_1fr] h-full">
      <Card className="p-4 flex flex-col">
        <h2 className="mb-3 text-lg font-semibold">Configuration</h2>
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3">
          <div>
            <Label>Sélectionner une banque</Label>
            <Select
              value={selectedBank?.id}
              onValueChange={(id) => {
                const bank = banks.find((b) => b.id === id)
                if (bank) setSelectedBank(bank)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une banque" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBank && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Calibrage des champs</h3>

              {/* City field */}
              <div className="space-y-2 rounded-lg border p-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Ville</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleField("city")}
                    className="h-6 w-6 p-0"
                  >
                    {expandedFields.city ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {expandedFields.city && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Position X (px)</Label>
                      <Input
                        type="number"
                        value={positions.city.x}
                        onChange={(e) => updatePosition("city", "x", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position Y (px)</Label>
                      <Input
                        type="number"
                        value={positions.city.y}
                        onChange={(e) => updatePosition("city", "y", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Largeur (px)</Label>
                      <Input
                        type="number"
                        value={positions.city.width}
                        onChange={(e) => updatePosition("city", "width", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Taille police (px)</Label>
                      <Input
                        type="number"
                        value={positions.city.fontSize}
                        onChange={(e) => updatePosition("city", "fontSize", Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Date field */}
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Date</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleField("date")}
                    className="h-6 w-6 p-0"
                  >
                    {expandedFields.date ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {expandedFields.date && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Position X (px)</Label>
                      <Input
                        type="number"
                        value={positions.date.x}
                        onChange={(e) => updatePosition("date", "x", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position Y (px)</Label>
                      <Input
                        type="number"
                        value={positions.date.y}
                        onChange={(e) => updatePosition("date", "y", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Largeur (px)</Label>
                      <Input
                        type="number"
                        value={positions.date.width}
                        onChange={(e) => updatePosition("date", "width", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Taille police (px)</Label>
                      <Input
                        type="number"
                        value={positions.date.fontSize}
                        onChange={(e) => updatePosition("date", "fontSize", Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payee field */}
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Bénéficiaire</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleField("payee")}
                    className="h-6 w-6 p-0"
                  >
                    {expandedFields.payee ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {expandedFields.payee && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Position X (px)</Label>
                      <Input
                        type="number"
                        value={positions.payee.x}
                        onChange={(e) => updatePosition("payee", "x", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position Y (px)</Label>
                      <Input
                        type="number"
                        value={positions.payee.y}
                        onChange={(e) => updatePosition("payee", "y", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Largeur (px)</Label>
                      <Input
                        type="number"
                        value={positions.payee.width}
                        onChange={(e) => updatePosition("payee", "width", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Taille police (px)</Label>
                      <Input
                        type="number"
                        value={positions.payee.fontSize}
                        onChange={(e) => updatePosition("payee", "fontSize", Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Amount in words - Line 1 */}
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Montant en lettres - Ligne 1</Label>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      const newHasSecondLine = !hasSecondLine
                      setHasSecondLine(newHasSecondLine)
                      if (newHasSecondLine && !positions.amountInWordsLine2) {
                        // Initialize line 2 with default values based on line 1
                        setPositions(prev => ({
                          ...prev,
                          amountInWordsLine2: {
                            x: prev.amountInWords.x,
                            y: prev.amountInWords.y + 25,
                            width: prev.amountInWords.width,
                            fontSize: prev.amountInWords.fontSize
                          }
                        }))
                      }
                    }}>
                      {hasSecondLine ? <Trash2 className="mr-1 h-3 w-3" /> : <Plus className="mr-1 h-3 w-3" />}
                      {hasSecondLine ? "Supprimer ligne 2" : "Ajouter ligne 2"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleField("amountInWords")}
                      className="h-8 w-8 p-0"
                    >
                      {expandedFields.amountInWords ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {expandedFields.amountInWords && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Position X (px)</Label>
                      <Input
                        type="number"
                        value={positions.amountInWords.x}
                        onChange={(e) => updatePosition("amountInWords", "x", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position Y (px)</Label>
                      <Input
                        type="number"
                        value={positions.amountInWords.y}
                        onChange={(e) => updatePosition("amountInWords", "y", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Largeur (px)</Label>
                      <Input
                        type="number"
                        value={positions.amountInWords.width}
                        onChange={(e) => updatePosition("amountInWords", "width", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Taille police (px)</Label>
                      <Input
                        type="number"
                        value={positions.amountInWords.fontSize}
                        onChange={(e) => updatePosition("amountInWords", "fontSize", Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Amount in words - Line 2 (conditional) */}
              {hasSecondLine && (
                <div className="space-y-2 rounded-lg border border-orange-300 bg-orange-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-orange-900">Montant en lettres - Ligne 2</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleField("amountInWordsLine2")}
                      className="h-6 w-6 p-0"
                    >
                      {expandedFields.amountInWordsLine2 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  {expandedFields.amountInWordsLine2 && positions.amountInWordsLine2 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Position X (px)</Label>
                      <Input
                        type="number"
                        value={positions.amountInWordsLine2.x}
                        onChange={(e) => updatePosition("amountInWordsLine2", "x", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position Y (px)</Label>
                      <Input
                        type="number"
                        value={positions.amountInWordsLine2.y}
                        onChange={(e) => updatePosition("amountInWordsLine2", "y", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Largeur (px)</Label>
                      <Input
                        type="number"
                        value={positions.amountInWordsLine2.width}
                        onChange={(e) => updatePosition("amountInWordsLine2", "width", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Taille police (px)</Label>
                      <Input
                        type="number"
                        value={positions.amountInWordsLine2.fontSize}
                        onChange={(e) => updatePosition("amountInWordsLine2", "fontSize", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  )}
                </div>
              )}

              {/* Amount field */}
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Montant</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleField("amount")}
                    className="h-6 w-6 p-0"
                  >
                    {expandedFields.amount ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {expandedFields.amount && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Position X (px)</Label>
                      <Input
                        type="number"
                        value={positions.amount.x}
                        onChange={(e) => updatePosition("amount", "x", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position Y (px)</Label>
                      <Input
                        type="number"
                        value={positions.amount.y}
                        onChange={(e) => updatePosition("amount", "y", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Largeur (px)</Label>
                      <Input
                        type="number"
                        value={positions.amount.width}
                        onChange={(e) => updatePosition("amount", "width", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Taille police (px)</Label>
                      <Input
                        type="number"
                        value={positions.amount.fontSize}
                        onChange={(e) => updatePosition("amount", "fontSize", Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Sauvegarde..." : "Sauvegarder les positions"}
              </Button>
            </div>
          )}
          </div>
        </div>
      </Card>

      <Card className="p-4 flex flex-col">
        <h2 className="mb-3 text-lg font-semibold">Aperçu du chèque</h2>
        {selectedBank ? (
          <div className="flex-1">
            <CheckCanvas
              pdfUrl={selectedBank.pdfUrl}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              containerRef={containerRef}
              positions={positions}
              showRectangles={true}
              values={{
                city: "Alger",
                date: new Date().toLocaleDateString("fr-FR"),
                payee: "M. Exemple Bénéficiaire",
                amount: "50,342",
                amountLine1: line1,
                amountLine2: hasSecondLine ? line2 : "",
              }}
              PDFComponent={PDFViewer}
              onDocumentLoadSuccess={onDocumentLoadSuccess}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Les rectangles semi-transparents montrent les zones de texte. {hasSecondLine && "Le montant en lettres est automatiquement divisé sur 2 lignes si nécessaire."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-sm text-muted-foreground bg-gray-50 rounded-lg border border-dashed p-6">
            <p className="text-center">Sélectionnez une banque pour voir l'aperçu.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
