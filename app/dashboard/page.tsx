import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { DashboardStats } from "@/components/dashboard-stats"
import { getCheckStats, getChecks, getUsers } from "@/lib/db"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const stats = getCheckStats()
  const checks = getChecks()
  const users = getUsers()

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="mt-2 text-muted-foreground">Vue d'ensemble de vos chèques</p>
        </div>
        <DashboardStats stats={stats} checks={checks} users={users} />
      </div>
    </LayoutWrapper>
  )
}
