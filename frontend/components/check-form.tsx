"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { numberToWordsFR } from "@/lib/number-to-words"
import { CheckPreview } from "./check-preview"
import { PrintConfirmationDialog } from "./print-confirmation-dialog"
import { RefreshCcw, Settings } from "lucide-react"
import type { Bank } from "@/lib/db"
import { WILAYAS } from "@/lib/wilayas"
import Link from "next/link"
import dynamic from "next/dynamic"
import { splitAmountInWords } from "@/lib/text-utils"
import { mergeBankPositions, parseBankPositions } from "@/lib/bank-positions"

const PDFViewer = dynamic(() => import("./pdf-viewer").then(mod => mod.PDFViewer), {
  ssr: false,
})

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

const requestWithAuth = async (input: string, init: RequestInit = {}) =>
  fetch(input, { ...init, credentials: "include" })

const createCheck = async (data: {
  userId: string
  amount: number
  amountInWords: string
  payee: string
  city: string
  date: string
  reference: string
  bank: string
}) => {
  const response = await requestWithAuth(`${API_BASE}/api/checks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      wilaya: data.city, // Send city as wilaya
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.text().catch(() => "")
    throw new Error(payload || `Erreur ${response.status}`)
  }
  return response
}

function PrintCheckCanvas({ positions, values }: {
  positions: Bank["positions"]
  values: {
    city: string
    date: string
    payee: string
    amount: string
    amountLine1: string
    amountLine2?: string
  }
}) {
  const { line1: amountLine1, line2: amountLine2 } = positions.amountInWordsLine2
    ? splitAmountInWords(values.amountLine1, positions.amountInWords.width, positions.amountInWords.fontSize)
    : { line1: values.amountLine1, line2: "" }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          left: `${positions.city.x}px`,
          top: `${positions.city.y}px`,
          width: `${positions.city.width}px`,
          fontSize: `${positions.city.fontSize}px`,
          fontWeight: '500',
          color: 'black',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {values.city}
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${positions.date.x}px`,
          top: `${positions.date.y}px`,
          width: `${positions.date.width}px`,
          fontSize: `${positions.date.fontSize}px`,
          fontWeight: '500',
          color: 'black',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {values.date}
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${positions.payee.x}px`,
          top: `${positions.payee.y}px`,
          width: `${positions.payee.width}px`,
          fontSize: `${positions.payee.fontSize}px`,
          fontWeight: '500',
          color: 'black',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {values.payee}
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${positions.amountInWords.x}px`,
          top: `${positions.amountInWords.y}px`,
          width: `${positions.amountInWords.width}px`,
          fontSize: `${positions.amountInWords.fontSize}px`,
          fontWeight: '500',
          color: 'black',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {amountLine1}
      </div>
      {positions.amountInWordsLine2 && amountLine2 && (
        <div
          style={{
            position: 'absolute',
            left: `${positions.amountInWordsLine2.x}px`,
            top: `${positions.amountInWordsLine2.y}px`,
            width: `${positions.amountInWordsLine2.width}px`,
            fontSize: `${positions.amountInWordsLine2.fontSize}px`,
            fontWeight: '500',
            color: 'black',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {amountLine2}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: `${positions.amount.x}px`,
          top: `${positions.amount.y}px`,
          width: `${positions.amount.width}px`,
          fontSize: `${positions.amount.fontSize}px`,
          fontWeight: 'bold',
          color: 'black',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {values.amount}
      </div>
    </div>
  )
}

interface CheckFormProps {
  userId: string | number
}

export function CheckForm({ userId }: CheckFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [amountInWords, setAmountInWords] = useState("")
  const [payee, setPayee] = useState("")
  const [city, setCity] = useState("Alger")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [reference, setReference] = useState("")
  const [bank, setBank] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])

  useEffect(() => {
    const loadBanks = async () => {
      const response = await requestWithAuth(`${API_BASE}/api/banks`)
      if (!response.ok) {
        console.error("Impossible de charger la liste des banques", await response.text().catch(() => ""))
        return
      }
      const data = await response.json()
      const payload = Array.isArray(data.banks) ? data.banks : []
      const normalizedBanks = payload.map((bank: Bank & { positionsJson?: string }) => ({
        ...bank,
        positions: mergeBankPositions(parseBankPositions(bank.positionsJson)),
      }))
      setBanks(normalizedBanks)
    }
    loadBanks()
  }, [])

  const formatAmountWithSpaces = (value: string): string => {
    // Retirer tous les espaces existants
    const cleaned = value.replace(/\s/g, "")
    // Séparer partie entière et décimale
    const parts = cleaned.split(".")
    // Ajouter espaces tous les 3 chiffres pour partie entière
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    // Retourner avec décimale si présente
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart
  }

  const handleAmountChange = (value: string) => {
    // Retirer les espaces pour le calcul
    const cleanValue = value.replace(/\s/g, "")
    // Formater avec espaces pour l'affichage
    const formatted = formatAmountWithSpaces(cleanValue)
    setAmount(formatted)
    
    const numValue = Number.parseFloat(cleanValue)
    if (!isNaN(numValue) && numValue > 0) {
      setAmountInWords(numberToWordsFR(numValue))
    } else {
      setAmountInWords("")
    }
  }

  const handleRegenerateWords = () => {
    const numValue = Number.parseFloat(amount.replace(/\s/g, ""))
    if (!isNaN(numValue) && numValue > 0) {
      setAmountInWords(numberToWordsFR(numValue))
    }
  }

  const handlePrintClick = () => {
    setShowPrintDialog(true)
  }

  const handlePrintConfirmed = async () => {
    // Save the check first
    await createCheck({
      userId,
      amount: Number.parseFloat(amount.replace(/\s/g, "")),
      amountInWords,
      payee,
      city,
      date,
      reference,
      bank,
    })

    setShowPrintDialog(false)
    setShowPreview(true)
    setTimeout(() => {
      window.print()
      // Reset preview after print dialog closes
      setTimeout(() => {
        setShowPreview(false)
        // Réinitialiser le formulaire pour un nouveau chèque
        setAmount("")
        setAmountInWords("")
        setPayee("")
        setCity("Alger")
        setReference("")
        // Rediriger vers l'historique
        router.push("/dashboard")
      }, 1000)
    }, 100)
  }

  const validBanks = banks.filter((b) => !!b.name && b.name.trim().length > 0)
  const selectedBank = validBanks.find((b) => b.name === bank)
  const isBankSelected = Boolean(bank)

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="bank">Banque</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select value={bank} onValueChange={setBank} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une banque" />
                      </SelectTrigger>
                      <SelectContent>
                          {validBanks.map((b) => (
                            <SelectItem key={b.id} value={b.name}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                  </div>
                  {selectedBank ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link href={`/calibrage?bank=${selectedBank.id}`}>
                        <Settings className="h-4 w-4" style={{ color: '#e82c2a' }} />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled
                    >
                      <Settings className="h-4 w-4" style={{ color: '#e82c2a' }} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant (DZD)</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="10 000.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  disabled={!isBankSelected}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amountInWords">Montant en lettres</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateWords}
                    className="h-8"
                    disabled={!isBankSelected || !amount}
                  >
                    <RefreshCcw className="mr-1 h-3 w-3" style={{ color: '#e82c2a' }} />
                    Régénérer
                  </Button>
                </div>
                <Textarea
                  id="amountInWords"
                  placeholder="dix mille dinars algériens"
                  value={amountInWords}
                  onChange={(e) => setAmountInWords(e.target.value)}
                  disabled={!isBankSelected}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payee">À l'ordre de</Label>
                <Input
                  id="payee"
                  type="text"
                  placeholder="Nom du bénéficiaire"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  disabled={!isBankSelected}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Wilaya</Label>
                  <Select value={city} onValueChange={setCity} required disabled={!isBankSelected}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une wilaya" />
                    </SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map((wilaya) => (
                        <SelectItem key={wilaya.code} value={wilaya.name}>
                          {wilaya.code} - {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={!isBankSelected}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="Référence du chèque"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  disabled={!isBankSelected}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={handlePrintClick}
                  disabled={!amount || !payee || !city || !date || !bank}
                >
                  Imprimer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          <CheckPreview
            amount={amount}
            amountInWords={amountInWords}
            payee={payee}
            city={city}
            date={date}
            reference={reference}
            bank={bank}
            showRectangles={true}
          />
        </div>
      </div>

      <PrintConfirmationDialog
        open={showPrintDialog}
        onConfirm={handlePrintConfirmed}
        onCancel={() => setShowPrintDialog(false)}
      />

      {showPreview && selectedBank && (
        <div className="print-only">
          <PrintCheckCanvas
            positions={selectedBank.positions}
            values={{
              city,
              date: new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
              payee,
              amount: amount || "",
              amountLine1: amountInWords,
              amountLine2: "",
            }}
          />
        </div>
      )}
    </>
  )
}
