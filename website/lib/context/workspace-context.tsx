"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import useSWR from "swr"
import API_URLS from "@/lib/api-urls"
import { fetcher } from "@/lib/utils/api"

interface Workspace {
  id: string
  name: string
}

interface WorkspaceContextType {
  workspaces: Workspace[]
  isLoading: boolean
  error: Error | null
  mutate: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  // Simple client-side check
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Only fetch data on client-side
  const { data, error, isLoading, mutate } = useSWR(
    mounted ? API_URLS.WORKSPACE.LIST : null, 
    fetcher, 
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspaces: data || [], 
        isLoading: !mounted || isLoading, 
        error, 
        mutate 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
} 