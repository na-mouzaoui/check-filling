"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, History, Settings, Building2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Nouveau Chèque", href: "/cheque", icon: FileText },
  { name: "Historique", href: "/historique", icon: History },
  { name: "Gestion Banques", href: "/banques", icon: Building2 },
  { name: "Calibrage", href: "/calibrage", icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-white transition-all duration-300",
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
    </div>
  )
}
