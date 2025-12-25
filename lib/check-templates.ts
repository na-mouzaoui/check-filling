// Check template configuration for different Algerian banks
// Users can provide PDF scans which will be used as background images

export interface FieldPosition {
  x: number // Position horizontale (px)
  y: number // Position verticale (px)
  width: number // Largeur disponible pour le champ (px)
  fontSize: number // Taille de la police (px)
}

export interface CheckTemplate {
  bankCode: string
  bankName: string
  imageUrl?: string // Will be populated when user uploads bank check scan
  // Position coordinates for each field with width and font size
  positions: {
    city: FieldPosition
    date: FieldPosition
    payee: FieldPosition
    amountInWords: FieldPosition
    amountInWordsLine2?: FieldPosition // Optional second line
    amount: FieldPosition
    reference?: FieldPosition
  }
}

// Default templates - positions can be adjusted when user provides actual check scans
export const checkTemplates: Record<string, CheckTemplate> = {
  BNA: {
    bankCode: "BNA",
    bankName: "BNA - Banque Nationale d'Algérie",
    positions: {
      city: { x: 50, y: 100, width: 150, fontSize: 14 },
      date: { x: 400, y: 100, width: 150, fontSize: 14 },
      payee: { x: 120, y: 180, width: 400, fontSize: 14 },
      amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
      amount: { x: 450, y: 300, width: 150, fontSize: 18 },
      reference: { x: 50, y: 350, width: 200, fontSize: 10 },
    },
  },
  CPA: {
    bankCode: "CPA",
    bankName: "CPA - Crédit Populaire d'Algérie",
    positions: {
      city: { x: 50, y: 100, width: 150, fontSize: 14 },
      date: { x: 400, y: 100, width: 150, fontSize: 14 },
      payee: { x: 120, y: 180, width: 400, fontSize: 14 },
      amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
      amount: { x: 450, y: 300, width: 150, fontSize: 18 },
      reference: { x: 50, y: 350, width: 200, fontSize: 10 },
    },
  },
  BEA: {
    bankCode: "BEA",
    bankName: "BEA - Banque Extérieure d'Algérie",
    positions: {
      city: { x: 50, y: 100, width: 150, fontSize: 14 },
      date: { x: 400, y: 100, width: 150, fontSize: 14 },
      payee: { x: 120, y: 180, width: 400, fontSize: 14 },
      amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
      amount: { x: 450, y: 300, width: 150, fontSize: 18 },
      reference: { x: 50, y: 350, width: 200, fontSize: 10 },
    },
  },
  BADR: {
    bankCode: "BADR",
    bankName: "BADR - Banque de l'Agriculture et du Développement Rural",
    positions: {
      city: { x: 50, y: 100, width: 150, fontSize: 14 },
      date: { x: 400, y: 100, width: 150, fontSize: 14 },
      payee: { x: 120, y: 180, width: 400, fontSize: 14 },
      amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
      amount: { x: 450, y: 300, width: 150, fontSize: 18 },
      reference: { x: 50, y: 350, width: 200, fontSize: 10 },
    },
  },
}

export function getCheckTemplate(bankName: string): CheckTemplate | undefined {
  // Try to find by full name first
  const template = Object.values(checkTemplates).find((t) => t.bankName === bankName)
  if (template) return template

  // Try to find by bank code
  const bankCode = bankName.split(" ")[0] // Extract code like "BNA" from "BNA - Banque..."
  return checkTemplates[bankCode]
}
