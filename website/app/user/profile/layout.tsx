"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import API_URLS from "@/lib/api-urls"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <main className="min-h-screen bg-background">
      {children}
    </main>
  )
} 