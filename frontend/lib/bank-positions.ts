import type { Bank } from "./db"

export const DEFAULT_BANK_POSITIONS: Bank["positions"] = {
  city: { x: 50, y: 100, width: 150, fontSize: 14 },
  date: { x: 400, y: 100, width: 150, fontSize: 14 },
  payee: { x: 120, y: 180, width: 400, fontSize: 14 },
  amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
  amount: { x: 450, y: 300, width: 150, fontSize: 18 },
}

export function mergeBankPositions(positions?: Partial<Bank["positions"]>): Bank["positions"] {
  return {
    city: positions?.city ?? DEFAULT_BANK_POSITIONS.city,
    date: positions?.date ?? DEFAULT_BANK_POSITIONS.date,
    payee: positions?.payee ?? DEFAULT_BANK_POSITIONS.payee,
    amountInWords: positions?.amountInWords ?? DEFAULT_BANK_POSITIONS.amountInWords,
    amountInWordsLine2: positions?.amountInWordsLine2,
    amount: positions?.amount ?? DEFAULT_BANK_POSITIONS.amount,
    reference: positions?.reference,
  }
}

function keysToCamelCase(value: any): any {
  if (Array.isArray(value)) {
    return value.map(keysToCamelCase)
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce<Record<string, any>>((acc, [key, entryValue]) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1)
      acc[camelKey] = keysToCamelCase(entryValue)
      return acc
    }, {})
  }

  return value
}

export function parseBankPositions(serialized?: string): Partial<Bank["positions"]> {
  if (!serialized) {
    return {}
  }

  try {
    const parsed = JSON.parse(serialized)
    const camelized = keysToCamelCase(parsed)
    return typeof camelized === "object" && camelized !== null ? camelized : {}
  } catch {
    return {}
  }
}
