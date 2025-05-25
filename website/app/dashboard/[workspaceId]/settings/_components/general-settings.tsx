"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import API_URLS from "@/lib/api-urls"

interface GeneralSettingsProps {
  workspaceSettings: {
    name: string;
  }
}

export function GeneralSettings({ workspaceSettings }: GeneralSettingsProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [workspaceName, setWorkspaceName] = React.useState(workspaceSettings.name)
  const [confirmChecks, setConfirmChecks] = React.useState({
    understanding: false,
    links: false,
    permanent: false,
  })
  const t = useTranslations("Dashboard")
  const router = useRouter()

  const handleWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const workspaceId = window.location.pathname.split('/')[2]
      const response = await fetch(API_URLS.WORKSPACE.UPDATE(workspaceId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: workspaceName })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update workspace")
      }
      
      toast.success(t("settings.savedWorkspace"))
    } catch (error) {
      console.error("Error updating workspace:", error)
      toast.error(error instanceof Error ? error.message : t("settings.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    setIsDeleteLoading(true)
    
    try {
      const workspaceId = window.location.pathname.split('/')[2]
      const response = await fetch(API_URLS.WORKSPACE.DELETE(workspaceId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete workspace")
      }
      
      toast.success(t("settings.workspaceDeleted"))
      setDialogOpen(false)
      
      // Redirect to the workspace selection page
      router.push('/dashboard')
    } catch (error) {
      console.error("Error deleting workspace:", error)
      toast.error(error instanceof Error ? error.message : t("settings.error"))
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const allChecksConfirmed = Object.values(confirmChecks).every(Boolean)
  const nameCorrect = deleteConfirmation === workspaceSettings.name
  const canDelete = allChecksConfirmed && nameCorrect

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.generalSettings")}</CardTitle>
        <CardDescription>
          {t("settings.generalDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleWorkspaceSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("settings.workspaceName")}
            </label>
            <Input 
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              {t("settings.workspaceNameDesc")}
            </p>
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("settings.saveChanges")}
          </Button>
        </form>
        
        <div className="pt-6">
          <Separator className="mb-6" />
          <h3 className="text-lg font-medium text-destructive mb-2">{t("settings.dangerZone")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("settings.dangerZoneDescription")}
          </p>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center">
                <Icon icon="lucide:trash-2" className="mr-2 h-4 w-4" />
                {t("settings.deleteWorkspace")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-destructive">{t("settings.deleteWorkspaceTitle")}</DialogTitle>
                <DialogDescription>
                  {t("settings.deleteWorkspaceDescription")}
                  <span className="font-bold"> {workspaceSettings.name}</span>.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="check-understanding" 
                      checked={confirmChecks.understanding} 
                      onCheckedChange={(checked) => 
                        setConfirmChecks(prev => ({ ...prev, understanding: checked === true }))
                      }
                    />
                    <label 
                      htmlFor="check-understanding" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t("settings.deleteWorkspaceCheckUnderstanding")}
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="check-links" 
                      checked={confirmChecks.links} 
                      onCheckedChange={(checked) => 
                        setConfirmChecks(prev => ({ ...prev, links: checked === true }))
                      }
                    />
                    <label 
                      htmlFor="check-links" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t("settings.deleteWorkspaceCheckLinks")}
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="check-permanent" 
                      checked={confirmChecks.permanent} 
                      onCheckedChange={(checked) => 
                        setConfirmChecks(prev => ({ ...prev, permanent: checked === true }))
                      }
                    />
                    <label 
                      htmlFor="check-permanent" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t("settings.deleteWorkspaceCheckPermanent")}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t("settings.deleteWorkspaceConfirmation", { workspaceName: workspaceSettings.name })}
                  </p>
                  <Input 
                    placeholder={t("settings.deleteWorkspaceConfirmationPlaceholder")}
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="border-destructive/50 focus-visible:ring-destructive/30"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t("settings.cancel")}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteWorkspace}
                  disabled={!canDelete || isDeleteLoading}
                >
                  {isDeleteLoading && (
                    <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("settings.deleteWorkspacePermanently")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
} 