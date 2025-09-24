'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  FileText,
  Database,
  Settings,
  Bot,
  Menu,
  ChevronRight,
  Sparkles,
  BrainCircuit,
  Upload
} from 'lucide-react'

const sidebarItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Dashboard overview and statistics"
  },
  {
    title: "System Prompts",
    href: "/admin/prompts",
    icon: BrainCircuit,
    description: "Manage AI behavior and responses"
  },
  {
    title: "Knowledge Base",
    href: "/admin/knowledge",
    icon: Database,
    description: "Upload and manage documents"
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Configure system settings"
  }
]

function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {sidebarItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-gray-100",
            pathname === item.href
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <item.icon className={cn(
            "h-4 w-4 transition-colors",
            pathname === item.href ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
          )} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {item.title}
              {item.href === "/admin/prompts" && (
                <Sparkles className="h-3 w-3 text-purple-600" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 hidden lg:block">
              {item.description}
            </p>
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 opacity-0 transition-all group-hover:opacity-100",
            pathname === item.href && "opacity-100"
          )} />
        </Link>
      ))}
    </nav>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:border-r lg:bg-white">
          <div className="flex h-full flex-col">
            <div className="border-b px-6 py-5">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Emer Admin</h2>
                  <p className="text-xs text-gray-500">AI Assistant Control Panel</p>
                </div>
              </Link>
            </div>

            <ScrollArea className="flex-1 px-4 py-6">
              <SidebarNav />

              <Separator className="my-6" />

              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 border border-purple-200/50">
                <div className="flex items-start gap-3">
                  <Upload className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Pro Tip</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Upload PDFs to the Knowledge Base to enhance your AI assistant's domain expertise.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-4">
              <Link href="/" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 hover:bg-gray-50">
                  <Bot className="h-4 w-4" />
                  Back to Chat Interface
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:pl-72">
          {/* Mobile Header with Sheet */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6 lg:hidden">
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <h1 className="text-lg font-semibold">Emer Admin</h1>
              </div>
            </header>

            {/* Mobile Sidebar Content */}
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-full flex-col">
                <div className="border-b bg-white px-6 py-4">
                  <Link href="/admin" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Emer Admin</h2>
                      <p className="text-xs text-gray-500">Control Panel</p>
                    </div>
                  </Link>
                </div>
                <ScrollArea className="flex-1 bg-white px-4 py-4">
                  <SidebarNav />
                </ScrollArea>
                <div className="border-t bg-white px-6 py-4">
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Bot className="h-4 w-4" />
                      Back to Chat
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Page Content */}
          <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen bg-gray-50/50">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}