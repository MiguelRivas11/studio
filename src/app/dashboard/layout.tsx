import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <MainNav />
      </Sidebar>
      <div className="flex-1">
        <SidebarInset>
          <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 border-b bg-background/80 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg font-semibold font-headline hidden md:block">
                FinLit Tutor
              </h1>
            </div>
            <UserNav />
          </header>
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
          <MobileNav />
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
