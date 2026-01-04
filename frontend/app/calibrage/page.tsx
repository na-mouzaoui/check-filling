import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ParametersPanel } from "@/components/parameters-panel"
import { AccessDeniedDialog } from "@/components/access-denied-dialog"

export default async function CalibragePage({ searchParams }: { searchParams: Promise<{ bank?: string }> }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Les rôles direction et regionale ne peuvent pas modifier les banques/calibrage
  const hasAccess = user.role !== "direction" && user.role !== "regionale"
  const params = await searchParams
  const preSelectedBankId = params.bank

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-2 text-muted-foreground">Gérez vos banques et calibrez les modèles de chèques depuis un seul endroit</p>
        </div>
        {hasAccess ? (
          <ParametersPanel preSelectedBankId={preSelectedBankId} />
        ) : (
          <AccessDeniedDialog 
            title="Accès refusé"
            message="Votre rôle ne vous permet pas de créer, modifier ou supprimer des banques, ni de modifier les paramètres de calibrage. Seuls les utilisateurs avec le rôle 'Comptabilité' ou 'Admin' peuvent effectuer cette action."
            redirectTo="/dashboard"
          />
        )}
      </div>
    </LayoutWrapper>
  )
}
