"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Settings, ChevronLeft, ChevronRight, LogOut, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { logout } from "@/lib/auth"
import type { User } from "@/lib/db"
import { useEffect, useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Nouveau Chèque", href: "/cheque", icon: FileText },
  { name: "Paramètres", href: "/calibrage", icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  user: User
}

export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
    router.refresh()
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-white dark:bg-gray-900 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("border-b p-4 flex items-center justify-between", collapsed && "justify-center")}>
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-blue-900">Gestion Chèques</h1>
            <p className="text-sm text-muted-foreground">Système de remplissage</p>
          </div>
        )}
        {collapsed && <div className="h-8 w-8 rounded-lg bg-blue-900" />}
        <Button variant="ghost" size="sm" onClick={onToggle} className={cn(collapsed && "w-full")}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-blue-900 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-blue-900",
                collapsed && "justify-center",
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4 space-y-2">
        {!collapsed && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Thème</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 p-0"
                title={mounted && theme === "dark" ? "Mode clair" : "Mode sombre"}
              >
                {mounted ? (
                  theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground truncate" title={user.email}>
              {user.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </>
        )}
        {collapsed && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full p-2"
              title={mounted && theme === "dark" ? "Mode clair" : "Mode sombre"}
            >
              {mounted ? (
                theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full p-2"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
