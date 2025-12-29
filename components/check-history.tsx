"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"
import { exportHistoryToPDF } from "@/lib/export-utils"
import type { Check, User } from "@/lib/db"
import { Search } from "lucide-react"

interface CheckHistoryProps {
  checks: Check[]
  users: User[]
}

export function CheckHistory({ checks, users }: CheckHistoryProps) {
  const [search, setSearch] = useState("")
  const [bankFilter, setBankFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const userMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user.email
      return acc
    },
    {} as Record<string, string>,
  )

  const sortedChecks = [...checks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const filteredChecks = sortedChecks.filter((check) => {
    const matchesSearch =
      check.payee.toLowerCase().includes(search.toLowerCase()) ||
      check.reference.toLowerCase().includes(search.toLowerCase()) ||
      userMap[check.userId]?.toLowerCase().includes(search.toLowerCase())

    const matchesBank = bankFilter === "all" || check.bank === bankFilter
    const matchesUser = userFilter === "all" || check.userId === userFilter

    const matchesMinAmount = minAmount === "" || check.amount >= Number.parseFloat(minAmount)
    const matchesMaxAmount = maxAmount === "" || check.amount <= Number.parseFloat(maxAmount)

    const checkDate = new Date(check.date)
    const matchesStartDate = startDate === "" || checkDate >= new Date(startDate)
    const matchesEndDate = endDate === "" || checkDate <= new Date(endDate)

    return (
      matchesSearch &&
      matchesBank &&
      matchesUser &&
      matchesMinAmount &&
      matchesMaxAmount &&
      matchesStartDate &&
      matchesEndDate
    )
  })

  const uniqueBanks = Array.from(new Set(checks.map((c) => c.bank)))

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleExportPDF = () => {
    exportHistoryToPDF(filteredChecks, users)
  }

  const resetFilters = () => {
    setSearch("")
    setBankFilter("all")
    setUserFilter("all")
    setMinAmount("")
    setMaxAmount("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>Historique des Chèques</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {showFilters ? "Masquer" : "Filtres"}
            </Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exporter en PDF
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Filtres Avancés</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* User Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">Utilisateur</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les utilisateurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">Banque</label>
                <Select value={bankFilter} onValueChange={setBankFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les banques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les banques</SelectItem>
                    {uniqueBanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium">Montant min (DZD)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium">Montant max (DZD)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="mb-2 block text-sm font-medium">Date début</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              {/* End Date */}
              <div>
                <label className="mb-2 block text-sm font-medium">Date fin</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={resetFilters} variant="outline" size="sm">
                Réinitialiser
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par bénéficiaire, référence ou utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredChecks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead>Banque</TableHead>
                  <TableHead className="text-right">Montant (DZD)</TableHead>
                  <TableHead>Date Émission</TableHead>
                  <TableHead>Date/Heure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-mono text-sm">{check.reference || "—"}</TableCell>
                    <TableCell className="text-sm">{userMap[check.userId] || "Inconnu"}</TableCell>
                    <TableCell className="font-medium">{check.payee}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{check.bank}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{check.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(check.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(check.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            {checks.length === 0 ? "Aucun chèque émis pour le moment" : "Aucun résultat trouvé"}
          </div>
        )}

        {filteredChecks.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {filteredChecks.length} chèque{filteredChecks.length > 1 ? "s" : ""} trouvé
              {filteredChecks.length > 1 ? "s" : ""}
            </p>
            <p className="text-sm font-medium">
              Total:{" "}
              <span className="text-lg text-blue-900">
                {filteredChecks.reduce((sum, check) => sum + check.amount, 0).toFixed(2)} DZD
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
