import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { CalibrationTool } from "@/components/calibration-tool"

export default async function CalibragePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <LayoutWrapper user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calibrage des Chèques</h1>
          <p className="mt-2 text-muted-foreground">Ajustez la position des champs de texte pour chaque banque</p>
        </div>
        <CalibrationTool />
      </div>
    </LayoutWrapper>
  )
}
