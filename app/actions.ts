"use server"

import { createCheck } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createCheckAction(data: {
  userId: string
  amount: number
  amountInWords: string
  payee: string
  city: string
  date: string
  reference: string
  bank: string
}) {
  createCheck(data)
  revalidatePath("/historique")
  revalidatePath("/dashboard")
}
