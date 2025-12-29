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
import { CheckHistory } from "./check-history"

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

      <CheckHistory checks={checks} users={users} />
    </div>
  )
}
