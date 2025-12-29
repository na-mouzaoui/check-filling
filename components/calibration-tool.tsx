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
import dynamic from "next/dynamic"
import { CheckCanvas } from "./check-canvas"
import { useToast } from "@/hooks/use-toast"

type CalibrationToolProps = {
  refreshKey?: number
}

// Import PDFViewer dynamically with ssr disabled
const PDFViewer = dynamic(() => import("./pdf-viewer").then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-4">Chargement...</div>
})

export function CalibrationTool({ refreshKey }: CalibrationToolProps) {
  const { toast } = useToast()
  const [banks, setBanks] = useState<Bank[]>([])
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageWidth, setPageWidth] = useState(600)
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
  const [positions, setPositions] = useState({
    city: { x: 50, y: 100, width: 150, fontSize: 14 },
    date: { x: 400, y: 100, width: 150, fontSize: 14 },
    payee: { x: 120, y: 180, width: 400, fontSize: 14 },
    amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
    amountInWordsLine2: { x: 120, y: 260, width: 500, fontSize: 12 },
    amount: { x: 450, y: 300, width: 150, fontSize: 18 },
  })
  const [hasSecondLine, setHasSecondLine] = useState(false)

  useEffect(() => {
    loadBanks()
  }, [refreshKey])

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setPageWidth(width)
      }
    }
    // Delay to ensure container is fully rendered
    const timer = setTimeout(updateWidth, 100)
    window.addEventListener('resize', updateWidth)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateWidth)
    }
  }, [selectedBank])

  useEffect(() => {
    if (selectedBank) {
      setPositions({
        ...selectedBank.positions,
        amountInWordsLine2: selectedBank.positions.amountInWordsLine2 || { x: 120, y: 260, width: 500, fontSize: 12 },
      })
      setHasSecondLine(!!selectedBank.positions.amountInWordsLine2)
    }
  }, [selectedBank])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const loadBanks = async () => {
    const response = await fetch("/api/banks")
    const data = await response.json()
    setBanks(data.banks)
    if (data.banks.length > 0) {
      setSelectedBank(data.banks[0])
    }
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
      const response = await fetch(`/api/banks/${selectedBank.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions: finalPositions }),
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
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Configuration</h2>
        <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-calib md:max-h-[calc(100vh-220px)]">
          <div className="space-y-4">
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
            <div className="space-y-4">
              <h3 className="font-medium">Calibrage des champs</h3>

              {/* City field */}
              <div className="space-y-2 rounded-lg border p-3">
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
                    <Button type="button" variant="ghost" size="sm" onClick={() => setHasSecondLine(!hasSecondLine)}>
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
                  {expandedFields.amountInWordsLine2 && (
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

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Aperçu du chèque</h2>
        <CheckCanvas
          pdfUrl={selectedBank?.pdfUrl}
          pageWidth={pageWidth}
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
        <p className="mt-4 text-sm text-muted-foreground">
          Les rectangles semi-transparents montrent les zones de texte.{" "}
          {hasSecondLine && "Le montant en lettres est automatiquement divisé sur 2 lignes si nécessaire."}
        </p>
      </Card>
    </div>
  )
}
