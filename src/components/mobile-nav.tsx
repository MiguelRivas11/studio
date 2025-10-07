"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Bot, HeartPulse, LayoutGrid, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/dashboard/learn", icon: BookOpen, label: "Aprender" },
  { href: "/dashboard/tutor", icon: Bot, label: "Tutor" },
  { href: "/dashboard/health", icon: HeartPulse, label: "Salud" },
  { href: "/dashboard/goals", icon: Target, label: "Metas" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-10">
      <nav className="grid h-full grid-cols-5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
