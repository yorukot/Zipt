"use client"

import * as React from "react"
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

interface DomainSettingsProps {
  workspaceSettings: {
    domain: string;
  }
}

export function DomainSettings({ workspaceSettings }: DomainSettingsProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const t = useTranslations("Dashboard")

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(t("settings.savedDomain"))
    } catch {
      toast.error(t("settings.error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.domainSettings")}</CardTitle>
        <CardDescription>
          {t("settings.domainDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDomainSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("settings.currentDomain")}
            </label>
            <div className="flex items-center gap-2">
              <Input 
                defaultValue={workspaceSettings.domain}
                disabled
                className="bg-muted"
              />
              <Button type="button" variant="outline" className="flex-shrink-0">
                {t("settings.upgrade")}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("settings.customDomainUpgrade")}
            </p>
          </div>
          
          <Button type="submit" disabled={isLoading} variant="outline">
            {isLoading && (
              <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("settings.saveChanges")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 