"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"

// Mock user data - replace with actual auth later
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - fixed on desktop, sliding on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 md:z-0
      `}>
        <Sidebar user={mockUser} onClose={closeSidebar} />
      </div>

      {/* Main content area */}
      <div className="relative flex-1 min-w-0 flex flex-col w-full">
        {/* Mobile header with menu button on right */}
        <div className="flex items-center justify-between border-b p-4 md:hidden">
          <span className="text-xl font-bold">Zipt</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Icon icon="lucide:menu" className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 h-full overflow-auto">
          <div className="h-full w-full mx-auto px-4 py-6 md:px-6 md:py-8 max-w-full md:max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
} 