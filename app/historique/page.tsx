import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { CheckHistory } from "@/components/check-history"
import { getChecks, getUsers } from "@/lib/db"

export default async function HistoriquePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const checks = getChecks()
  const users = getUsers()

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des Chèques</h1>
          <p className="mt-2 text-muted-foreground">Consultez tous les chèques émis</p>
        </div>
        <CheckHistory checks={checks} users={users} />
      </div>
    </LayoutWrapper>
  )
}
