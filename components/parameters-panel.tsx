"use client"

import { useState } from "react"
import { BankManagement } from "./bank-management"
import { CalibrationTool } from "./calibration-tool"

export function ParametersPanel() {
  const [banksVersion, setBanksVersion] = useState(0)

  const handleBanksChange = () => setBanksVersion((version) => version + 1)

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Gestion des banques</h2>
          <p className="text-muted-foreground">Ajoutez, mettez à jour ou supprimez les modèles de chèques.</p>
        </div>
        <BankManagement onChange={handleBanksChange} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Calibrage des chèques</h2>
          <p className="text-muted-foreground">Ajustez la position des champs sur les modèles PDF.</p>
        </div>
        <CalibrationTool refreshKey={banksVersion} />
      </section>
    </div>
  )
}
