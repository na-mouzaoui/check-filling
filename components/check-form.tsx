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
import { createCheckAction } from "@/app/actions"
import { CheckPreview } from "./check-preview"
import { PrintConfirmationDialog } from "./print-confirmation-dialog"
import { RefreshCcw, Settings } from "lucide-react"
import type { Bank } from "@/lib/db"
import { WILAYAS } from "@/lib/wilayas"
import Link from "next/link"

interface CheckFormProps {
  userId: string
}

export function CheckForm({ userId }: CheckFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [amountInWords, setAmountInWords] = useState("")
  const [payee, setPayee] = useState("")
  const [city, setCity] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [reference, setReference] = useState("")
  const [bank, setBank] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])

  useEffect(() => {
    const loadBanks = async () => {
      const response = await fetch("/api/banks")
      const data = await response.json()
      setBanks(data.banks)
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
    await createCheckAction({
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
      // Redirect to history after printing
      setTimeout(() => {
        router.push("/historique")
      }, 500)
    }, 100)
  }

  const selectedBank = banks.find((b) => b.name === bank)
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
                        {banks.map((b) => (
                          <SelectItem key={b.id} value={b.name}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!selectedBank}
                    asChild
                  >
                    <Link href={selectedBank ? `/calibrage?bank=${selectedBank.id}` : "#"}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
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
                    <RefreshCcw className="mr-1 h-3 w-3" />
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

      {showPreview && (
        <div className="print-only fixed inset-0 bg-white">
          <CheckPreview
            amount={amount}
            amountInWords={amountInWords}
            payee={payee}
            city={city}
            date={date}
            reference={reference}
            bank={bank}
            showRectangles={false}
          />
        </div>
      )}
    </>
  )
}
