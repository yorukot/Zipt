"use client"

import { useRouter } from "next/navigation"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { CreateWorkspaceForm, WorkspaceValues } from "@/components/workspace/create-workspace-form"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function CreateWorkspacePage() {
  const router = useRouter()
  const t = useTranslations("Workspace.create")

  async function onSubmit(values: WorkspaceValues & { invitedEmails: string[] }) {
    // Here you would normally send the data to your API
    // For now we'll just simulate a successful creation
    console.log("Workspace name:", values.name)
    console.log("Invited emails:", values.invitedEmails)
    
    // Wait for 1 second to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success toast
    toast.success(t("success"))
    
    // Redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <WorkspaceLayout type="create">
          <CreateWorkspaceForm onSubmit={onSubmit} />
        </WorkspaceLayout>
      </div>
    </div>
  )
} 