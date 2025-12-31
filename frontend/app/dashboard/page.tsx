import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { DashboardStats } from "@/components/dashboard-stats"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const cookieStore = await cookies()
  const jwt = cookieStore.get("jwt")
  const headers = jwt ? { cookie: `jwt=${jwt.value}` } : {}

  const [stats, checks, users] = await Promise.all([
    fetch(`${API_BASE}/api/checks/stats`, { cache: "no-store", headers })
      .then(async (r) => {
        if (!r.ok) {
          console.error("Stats fetch failed:", r.status, await r.text())
          return { totalAmount: 0, totalChecks: 0, checksByBank: {}, amountByUser: {} }
        }
        return r.json()
      })
      .catch((e) => {
        console.error("Stats fetch error:", e)
        return { totalAmount: 0, totalChecks: 0, checksByBank: {}, amountByUser: {} }
      }),
    fetch(`${API_BASE}/api/checks`, { cache: "no-store", headers })
      .then(async (r) => {
        if (!r.ok) {
          console.error("Checks fetch failed:", r.status, await r.text())
          return []
        }
        const data = await r.json()
        console.log("Checks received:", data)
        return Array.isArray(data) ? data : []
      })
      .catch((e) => {
        console.error("Checks fetch error:", e)
        return []
      }),
    fetch(`${API_BASE}/api/users`, { cache: "no-store", headers })
      .then(async (r) => {
        if (!r.ok) {
          console.error("Users fetch failed:", r.status, await r.text())
          return []
        }
        return r.json()
      })
      .catch((e) => {
        console.error("Users fetch error:", e)
        return []
      }),
  ])

  console.log("Dashboard data - checks count:", checks?.length, "users count:", users?.length)

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="mt-2 text-muted-foreground">Vue d'ensemble et historique des chèques</p>
        </div>
        <DashboardStats stats={stats} checks={checks} users={users} />
      </div>
    </LayoutWrapper>
  )
}
