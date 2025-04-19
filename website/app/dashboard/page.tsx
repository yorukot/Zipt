"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// This is a redirect page from the old dashboard url to the new workspace-based url
export default function DashboardRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the first workspace 
    // In a real app, we would fetch the user's workspaces and redirect to the first or default one
    router.replace("/dashboard/workspace-1")
  }, [router])
  
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to your workspace</p>
      </div>
    </div>
  )
} 