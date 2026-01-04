import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CheckForm } from "@/components/check-form"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { AccessDeniedDialog } from "@/components/access-denied-dialog"

export default async function ChequePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Les rôles direction et regionale ne peuvent pas créer/imprimer des chèques
  const hasAccess = user.role !== "direction" && user.role !== "regionale"

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau Chèque</h1>
          <p className="mt-2 text-muted-foreground">Remplissez les informations du chèque</p>
        </div>
        {hasAccess ? (
          <CheckForm userId={user.id} />
        ) : (
          <AccessDeniedDialog 
            title="Accès refusé"
            message="Votre rôle ne vous permet pas de créer ou imprimer des chèques. Seuls les utilisateurs avec le rôle 'Comptabilité' ou 'Admin' peuvent effectuer cette action."
            redirectTo="/dashboard"
          />
        )}
      </div>
    </LayoutWrapper>
  )
}
