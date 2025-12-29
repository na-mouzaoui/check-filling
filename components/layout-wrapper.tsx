"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import type { User } from "@/lib/db"
import { useState } from "react"

interface LayoutWrapperProps {
  user: User
  children: React.ReactNode
}

export function LayoutWrapper({ user, children }: LayoutWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-6">{children}</main>
      </div>
    </div>
  )
}
