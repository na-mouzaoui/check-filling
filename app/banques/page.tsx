import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { BankManagement } from "@/components/bank-management"

export default async function BanquesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Banques</h1>
          <p className="mt-2 text-muted-foreground">Ajoutez et gérez les banques avec leurs modèles de chèques</p>
        </div>
        <BankManagement />
      </div>
    </LayoutWrapper>
  )
}
