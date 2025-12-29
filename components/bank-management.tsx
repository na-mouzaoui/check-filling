"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload, Trash2, Edit } from "lucide-react"
import type { Bank } from "@/lib/db"

type BankManagementProps = {
  onChange?: () => void
}

export function BankManagement({ onChange }: BankManagementProps) {
  const [banks, setBanks] = useState<Bank[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newBank, setNewBank] = useState({ code: "", name: "" })
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => {
    loadBanks()
  }, [])

  const loadBanks = async () => {
    const response = await fetch("/api/banks")
    const data = await response.json()
    setBanks(data.banks)
  }

  const handleAddBank = async () => {
    if (!newBank.code || !newBank.name) return

    const formData = new FormData()
    formData.append("code", newBank.code)
    formData.append("name", newBank.name)
    if (pdfFile) {
      formData.append("pdf", pdfFile)
    }

    const response = await fetch("/api/banks", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      setNewBank({ code: "", name: "" })
      setPdfFile(null)
      setIsAdding(false)
      await loadBanks()
      onChange?.()
    }
  }

  const handleEditBank = async () => {
    if (!newBank.code || !newBank.name || !editingId) return

    const formData = new FormData()
    formData.append("code", newBank.code)
    formData.append("name", newBank.name)
    if (pdfFile) {
      formData.append("pdf", pdfFile)
    }

    const response = await fetch(`/api/banks/${editingId}`, {
      method: "PATCH",
      body: formData,
    })

    if (response.ok) {
      setNewBank({ code: "", name: "" })
      setPdfFile(null)
      setIsEditing(false)
      setEditingId(null)
      await loadBanks()
      onChange?.()
    }
  }

  const startEdit = (bank: Bank) => {
    setNewBank({ code: bank.code, name: bank.name })
    setEditingId(bank.id)
    setIsEditing(true)
    setIsAdding(false)
  }

  const cancelEdit = () => {
    setNewBank({ code: "", name: "" })
    setPdfFile(null)
    setIsEditing(false)
    setEditingId(null)
    setIsAdding(false)
  }

  const handleDeleteBank = async (id: string) => {
    const response = await fetch(`/api/banks/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      await loadBanks()
      onChange?.()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une banque
        </Button>
      </div>

      {(isAdding || isEditing) && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">{isEditing ? "Modifier la banque" : "Nouvelle Banque"}</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code de la banque</Label>
              <Input
                id="code"
                placeholder="Ex: BDL"
                value={newBank.code}
                onChange={(e) => setNewBank({ ...newBank, code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Ex: BDL - Banque de Développement Local"
                value={newBank.name}
                onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="pdf">Modèle de chèque (PDF)</Label>
              <div className="flex items-center gap-2">
                <Input id="pdf" type="file" accept=".pdf" onChange={handleFileChange} />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              {pdfFile && <p className="mt-1 text-sm text-muted-foreground">{pdfFile.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button onClick={isEditing ? handleEditBank : handleAddBank}>
                {isEditing ? "Enregistrer" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {banks.map((bank) => (
          <Card key={bank.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{bank.code}</h3>
                <p className="text-sm text-muted-foreground">{bank.name}</p>
                {bank.pdfUrl && <p className="mt-2 text-xs text-green-600">✓ Modèle PDF chargé</p>}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(bank)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBank(bank.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
