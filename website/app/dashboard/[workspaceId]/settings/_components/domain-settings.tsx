"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { API_URLS } from "@/lib/api-urls"

interface DomainSettingsProps {
  workspaceId: string;
}

interface DomainData {
  domain: string;
  isVerified: boolean;
  verificationCode?: string;
}

interface DomainListData {
  domains: Array<{
    domain: string;
    isVerified: boolean;
    verificationCode?: string;
  }>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function DomainSettings({ workspaceId }: DomainSettingsProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [newDomain, setNewDomain] = React.useState("")
  const [isValidDomain, setIsValidDomain] = React.useState(true)
  const t = useTranslations("Dashboard")
  
  const { data: currentDomain, error: currentDomainError, mutate: mutateCurrentDomain } = useSWR<DomainData>(
    API_URLS.WORKSPACE.DOMAIN.GET(workspaceId),
    fetcher
  )

  const { data: domainList, error: domainListError, mutate: mutateDomainList } = useSWR<DomainListData>(
    API_URLS.WORKSPACE.DOMAIN.LIST(workspaceId),
    fetcher
  )

  const checkDomainValidity = async (domain: string) => {
    try {
      const response = await fetch(API_URLS.WORKSPACE.DOMAIN.CHECK_VALIDITY(domain))
      const data = await response.json()
      setIsValidDomain(data.isValid)
      return data.isValid
    } catch (error) {
      setIsValidDomain(false)
      return false
    }
  }

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (!await checkDomainValidity(newDomain)) {
        toast.error(t("settings.invalidDomain"))
        return
      }

      const response = await fetch(API_URLS.WORKSPACE.DOMAIN.UPDATE(workspaceId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: newDomain }),
      })

      if (!response.ok) {
        throw new Error("Failed to update domain")
      }

      await Promise.all([mutateCurrentDomain(), mutateDomainList()])
      setNewDomain("")
      toast.success(t("settings.savedDomain"))
    } catch (error) {
      toast.error(t("settings.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyDomain = async (domain: string) => {
    try {
      const response = await fetch(API_URLS.WORKSPACE.DOMAIN.VERIFY(workspaceId, domain))
      if (!response.ok) {
        throw new Error("Failed to verify domain")
      }
      await Promise.all([mutateCurrentDomain(), mutateDomainList()])
      toast.success(t("settings.domainVerified"))
    } catch (error) {
      toast.error(t("settings.verificationError"))
    }
  }

  if (currentDomainError || domainListError) return <div>Failed to load domain settings</div>
  if (!currentDomain || !domainList) return <div>Loading...</div>

  // Sort domains to show unverified ones first
  const sortedDomains = [...domainList.domains].sort((a, b) => {
    if (a.isVerified === b.isVerified) return 0
    return a.isVerified ? 1 : -1
  })

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
              {t("settings.addNewDomain")}
            </label>
            <div className="flex gap-2">
              <Input 
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className={!isValidDomain ? "border-red-500" : ""}
              />
              <Button type="submit" disabled={isLoading || !newDomain}>
                {isLoading && (
                  <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("settings.addDomain")}
              </Button>
            </div>
            {!isValidDomain && (
              <p className="text-sm text-red-500">{t("settings.invalidDomainFormat")}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("settings.yourDomains")}</h3>
            {sortedDomains.map((domain) => (
              <div key={domain.domain} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{domain.domain}</span>
                    {!domain.isVerified && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        {t("settings.unverified")}
                      </span>
                    )}
                  </div>
                  {!domain.isVerified && domain.verificationCode && (
                    <div className="text-sm text-muted-foreground">
                      <p>{t("settings.verificationInstructions")}</p>
                      <p className="font-mono bg-muted p-2 rounded mt-1">
                        {domain.verificationCode}
                      </p>
                    </div>
                  )}
                </div>
                {!domain.isVerified && (
                  <Button
                    variant="outline"
                    onClick={() => handleVerifyDomain(domain.domain)}
                  >
                    {t("settings.verifyDomain")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 