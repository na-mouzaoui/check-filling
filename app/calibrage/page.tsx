import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ParametersPanel } from "@/components/parameters-panel"

export default async function CalibragePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-2 text-muted-foreground">Gérez vos banques et calibrez les modèles de chèques depuis un seul endroit</p>
        </div>
        <ParametersPanel />
      </div>
    </LayoutWrapper>
  )
}
