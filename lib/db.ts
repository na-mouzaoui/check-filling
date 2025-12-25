export interface User {
  id: string
  email: string
  password: string
  createdAt: string
}

export interface Check {
  id: string
  userId: string
  amount: number
  amountInWords: string
  payee: string
  city: string
  date: string
  reference: string
  bank: string
  createdAt: string
}

export interface Bank {
  id: string
  code: string
  name: string
  pdfUrl?: string
  checkImage?: string
  template?: {
    city: { x: number; y: number; width: number; fontSize: number }
    date: { x: number; y: number; width: number; fontSize: number }
    payee: { x: number; y: number; width: number; fontSize: number }
    amountInWords: { x: number; y: number; width: number; fontSize: number }
    amountInWordsLine2?: { x: number; y: number; width: number; fontSize: number }
    amount: { x: number; y: number; width: number; fontSize: number }
    reference?: { x: number; y: number; width: number; fontSize: number }
  }
  positions: {
    city: { x: number; y: number; width: number; fontSize: number }
    date: { x: number; y: number; width: number; fontSize: number }
    payee: { x: number; y: number; width: number; fontSize: number }
    amountInWords: { x: number; y: number; width: number; fontSize: number }
    amountInWordsLine2?: { x: number; y: number; width: number; fontSize: number }
    amount: { x: number; y: number; width: number; fontSize: number }
    reference?: { x: number; y: number; width: number; fontSize: number }
  }
  createdAt: string
}

// In-memory storage (will be replaced with real database later)
const users: User[] = [
  {
    id: "1",
    email: "test@gmail.com",
    password: "test1234", // In production, this should be hashed
    createdAt: new Date().toISOString(),
  },
]

const checks: Check[] = []

const banks: Bank[] = [
  {
    id: "1",
    code: "BNA",
    name: "BNA - Banque Nationale d'Algérie",
    pdfUrl: undefined, // Peut être mis à jour avec un PDF de chèque
    positions: {
      city: { x: 50, y: 100, width: 150, fontSize: 14 },
      date: { x: 400, y: 100, width: 150, fontSize: 14 },
      payee: { x: 120, y: 180, width: 400, fontSize: 14 },
      amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
      amount: { x: 450, y: 300, width: 150, fontSize: 18 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    code: "CPA",
    name: "CPA - Crédit Populaire d'Algérie",
    pdfUrl: undefined, // Peut être mis à jour avec un PDF de chèque
    positions: {
      city: { x: 50, y: 100, width: 150, fontSize: 14 },
      date: { x: 400, y: 100, width: 150, fontSize: 14 },
      payee: { x: 120, y: 180, width: 400, fontSize: 14 },
      amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
      amount: { x: 450, y: 300, width: 150, fontSize: 18 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    code: "BEA",
    name: "BEA - Banque Extérieure d'Algérie",
    pdfUrl: undefined, // Peut être mis à jour avec un PDF de chèque
    positions: {
      city: { x: 50, y: 100, width: 150, fontSize: 14 },
      date: { x: 400, y: 100, width: 150, fontSize: 14 },
      payee: { x: 120, y: 180, width: 400, fontSize: 14 },
      amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
      amount: { x: 450, y: 300, width: 150, fontSize: 18 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    code: "BADR",
    name: "BADR - Banque de l'Agriculture et du Développement Rural",
    pdfUrl: undefined, // Peut être mis à jour avec un PDF de chèque
    positions: {
      city: { x: 50, y: 100, width: 150, fontSize: 14 },
      date: { x: 400, y: 100, width: 150, fontSize: 14 },
      payee: { x: 120, y: 180, width: 400, fontSize: 14 },
      amountInWords: { x: 120, y: 240, width: 500, fontSize: 12 },
      amount: { x: 450, y: 300, width: 150, fontSize: 18 },
    },
    createdAt: new Date().toISOString(),
  },
]

// User operations
export const getUsers = () => users
export const getUserByEmail = (email: string) => users.find((u) => u.email === email)
export const getUserById = (id: string) => users.find((u) => u.id === id)
export const createUser = (user: Omit<User, "id" | "createdAt">) => {
  const newUser: User = {
    ...user,
    id: String(users.length + 1),
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  return newUser
}

// Check operations
export const getChecks = () => checks
export const getChecksByUserId = (userId: string) => checks.filter((c) => c.userId === userId)
export const createCheck = (check: Omit<Check, "id" | "createdAt">) => {
  const newCheck: Check = {
    ...check,
    id: String(checks.length + 1),
    createdAt: new Date().toISOString(),
  }
  checks.push(newCheck)
  return newCheck
}

// Bank operations
export const getBanks = () => banks
export const getBankById = (id: string) => banks.find((b) => b.id === id)
export const getBankByCode = (code: string) => banks.find((b) => b.code === code)
export const createBank = (bank: Omit<Bank, "id" | "createdAt">) => {
  const newBank: Bank = {
    ...bank,
    id: String(banks.length + 1),
    createdAt: new Date().toISOString(),
  }
  banks.push(newBank)
  return newBank
}
export const updateBank = (id: string, updates: Partial<Bank>) => {
  const index = banks.findIndex((b) => b.id === id)
  if (index === -1) return null
  banks[index] = { ...banks[index], ...updates }
  return banks[index]
}
export const deleteBank = (id: string) => {
  const index = banks.findIndex((b) => b.id === id)
  if (index === -1) return false
  banks.splice(index, 1)
  return true
}

// Statistics
export const getCheckStats = () => {
  const totalAmount = checks.reduce((sum, check) => sum + check.amount, 0)
  const totalChecks = checks.length

  // Group by bank
  const checksByBank = checks.reduce(
    (acc, check) => {
      acc[check.bank] = (acc[check.bank] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Sum by user
  const amountByUser = checks.reduce(
    (acc, check) => {
      acc[check.userId] = (acc[check.userId] || 0) + check.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalAmount,
    totalChecks,
    checksByBank,
    amountByUser,
  }
}
