"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Bot, HeartPulse, LayoutGrid, Target, User } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/icons"

const navItems = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/dashboard/learn", icon: BookOpen, label: "Aprender" },
  { href: "/dashboard/tutor", icon: Bot, label: "Tutor IA" },
  { href: "/dashboard/health", icon: HeartPulse, label: "Salud Financiera" },
  { href: "/dashboard/goals", icon: Target, label: "Metas y Presupuesto" },
]

const bottomNavItems = [
    { href: "/dashboard/profile", icon: User, label: "Perfil" },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-sidebar-border group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <Logo className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          FinLit Tutor
        </span>
      </div>
      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <div className="mt-auto p-2">
        <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </div>
    </nav>
  )
}
