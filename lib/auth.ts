"use server"

import { cookies } from "next/headers"
import { getUserByEmail, type User } from "./db"

const SESSION_COOKIE = "session_user_id"

export async function login(email: string, password: string) {
  const user = getUserByEmail(email)

  if (!user || user.password !== password) {
    return { success: false, error: "Email ou mot de passe incorrect" }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get(SESSION_COOKIE)?.value

  if (!userId) return null

  const { getUserById } = await import("./db")
  return getUserById(userId) || null
}
