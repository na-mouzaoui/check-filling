import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CheckForm } from "@/components/check-form"
import { LayoutWrapper } from "@/components/layout-wrapper"

export default async function ChequePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau Chèque</h1>
          <p className="mt-2 text-muted-foreground">Remplissez les informations du chèque</p>
        </div>
        <CheckForm userId={user.id} />
      </div>
    </LayoutWrapper>
  )
}
