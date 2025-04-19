"use client"

import { Sidebar } from "@/components/dashboard/sidebar"

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
  return (
    <div className="flex h-screen">
      <Sidebar user={mockUser} />
      <main className="flex-1 overflow-auto">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  )
} 