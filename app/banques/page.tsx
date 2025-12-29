import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function BanquesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  redirect("/calibrage")
}
