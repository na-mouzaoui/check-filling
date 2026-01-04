export interface User {
  id: string | number
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: string
  direction: string
  region?: string
  createdAt: string
}

export interface Check {
  id: string | number
  userId: string | number
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
  positionsJson?: string
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
