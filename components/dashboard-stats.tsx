"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Banknote, FileText, TrendingUp, Building2, Download, FileSpreadsheet } from "lucide-react"
import type { Check, User } from "@/lib/db"
import { exportToExcel, exportStatsToPDF } from "@/lib/export-utils"

interface DashboardStatsProps {
  stats: {
    totalAmount: number
    totalChecks: number
    checksByBank: Record<string, number>
    amountByUser: Record<string, number>
  }
  checks: Check[]
  users: User[]
}

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

export function DashboardStats({ stats, checks, users }: DashboardStatsProps) {
  const userMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user.email
      return acc
    },
    {} as Record<string, string>,
  )

  const bankData = Object.entries(stats.checksByBank).map(([bank, count]) => ({
    bank,
    count,
  }))

  const userAmountData = Object.entries(stats.amountByUser).map(([userId, amount]) => ({
    email: userMap[userId] || "Inconnu",
    amount,
  }))

  const pieData = Object.entries(stats.checksByBank).map(([name, value]) => ({
    name,
    value,
  }))

  const handleExportExcel = () => {
    exportToExcel(stats, checks, users)
  }

  const handleExportPDF = () => {
    exportStatsToPDF(stats, checks, users)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExportExcel} variant="outline" className="gap-2 bg-transparent">
          <FileSpreadsheet className="h-4 w-4" />
          Exporter en Excel
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Exporter en PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Montant Total</CardTitle>
            <Banknote className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} DZD</div>
            <p className="text-xs text-muted-foreground">Somme de tous les chèques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre de Chèques</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChecks}</div>
            <p className="text-xs text-muted-foreground">Chèques émis au total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Montant Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalChecks > 0 ? (stats.totalAmount / stats.totalChecks).toFixed(2) : "0.00"} DZD
            </div>
            <p className="text-xs text-muted-foreground">Par chèque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Banques</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.checksByBank).length}</div>
            <p className="text-xs text-muted-foreground">Banques différentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chèques par Banque</CardTitle>
          </CardHeader>
          <CardContent>
            {bankData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bankData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bank" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Nombre de chèques" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Banque</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Montant Émis par Utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          {userAmountData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="text-right">Montant Total (DZD)</TableHead>
                  <TableHead className="text-right">Nombre de Chèques</TableHead>
                  <TableHead className="text-right">Montant Moyen (DZD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userAmountData.map((item) => {
                  const userId = Object.keys(stats.amountByUser).find((id) => userMap[id] === item.email)
                  const userChecks = checks.filter((c) => c.userId === userId)
                  const avgAmount = userChecks.length > 0 ? item.amount / userChecks.length : 0
                  return (
                    <TableRow key={item.email}>
                      <TableCell className="font-medium">{item.email}</TableCell>
                      <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{userChecks.length}</TableCell>
                      <TableCell className="text-right">{avgAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Aucun chèque émis pour le moment
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
