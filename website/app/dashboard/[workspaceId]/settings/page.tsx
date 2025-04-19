"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const params = useParams()
  const t = useTranslations("Dashboard")
  const workspaceId = params.workspaceId as string
  
  // Mock workspace settings - replace with API call later
  const workspaceSettings = {
    name: workspaceId === "workspace-1" 
      ? "My Personal Workspace" 
      : workspaceId === "workspace-2"
        ? "Marketing Team"
        : "Development",
    domain: "zipt.sh",
    members: [
      { name: "John Doe", email: "john@example.com", role: "Owner" },
      { name: "Jane Smith", email: "jane@example.com", role: "Admin" },
      { name: "Mike Johnson", email: "mike@example.com", role: "Member" },
    ],
    integrations: {
      googleAnalytics: false,
      slack: true,
      discord: false,
    },
    linkSettings: {
      enableUtmParams: true,
      defaultPrivacy: "public",
      passwordProtection: false,
    },
  }

  const handleWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(t("settings.savedWorkspace"))
    } catch (error) {
      toast.error(t("settings.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(t("settings.savedDomain"))
    } catch (error) {
      toast.error(t("settings.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleIntegrationToggle = async (integration: string, value: boolean) => {
    setIsLoading(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(value 
        ? t("settings.integrationEnabled", { integration }) 
        : t("settings.integrationDisabled", { integration }))
    } catch (error) {
      toast.error(t("settings.error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="general">
            <Icon icon="lucide:settings" className="mr-2 h-4 w-4" />
            {t("settings.general")}
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Icon icon="lucide:globe" className="mr-2 h-4 w-4" />
            {t("settings.domain")}
          </TabsTrigger>
          <TabsTrigger value="members">
            <Icon icon="lucide:users" className="mr-2 h-4 w-4" />
            {t("settings.members")}
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Icon icon="lucide:plug" className="mr-2 h-4 w-4" />
            {t("settings.integrations")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
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
                    defaultValue={workspaceSettings.name}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    {t("settings.workspaceNameDesc")}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("settings.linkDefaults")}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("settings.utmParams")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.utmParamsDesc")}
                      </p>
                    </div>
                    <Switch 
                      defaultChecked={workspaceSettings.linkSettings.enableUtmParams} 
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("settings.passwordProtection")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.passwordProtectionDesc")}
                      </p>
                    </div>
                    <Switch 
                      defaultChecked={workspaceSettings.linkSettings.passwordProtection}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("settings.saveChanges")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="domain">
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
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.teamMembers")}</CardTitle>
              <CardDescription>
                {t("settings.teamMembersDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Input 
                    placeholder={t("settings.inviteEmail")}
                    className="max-w-sm"
                  />
                  <Button>
                    <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
                    {t("settings.inviteMember")}
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 font-medium">
                      <div>{t("settings.name")}</div>
                      <div>{t("settings.email")}</div>
                      <div>{t("settings.role")}</div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {workspaceSettings.members.map((member, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 p-4">
                        <div>{member.name}</div>
                        <div className="text-muted-foreground">{member.email}</div>
                        <div className="flex items-center justify-between">
                          <span>{member.role}</span>
                          {member.role !== "Owner" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Icon icon="lucide:more-horizontal" className="h-4 w-4" />
                              <span className="sr-only">{t("settings.memberOptions")}</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.integrations")}</CardTitle>
              <CardDescription>
                {t("settings.integrationsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between space-y-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Google Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.googleAnalyticsDesc")}
                  </p>
                </div>
                <Switch 
                  checked={workspaceSettings.integrations.googleAnalytics}
                  onCheckedChange={(checked) => handleIntegrationToggle("Google Analytics", checked)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-start justify-between space-y-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Slack</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.slackDesc")}
                  </p>
                </div>
                <Switch 
                  checked={workspaceSettings.integrations.slack}
                  onCheckedChange={(checked) => handleIntegrationToggle("Slack", checked)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-start justify-between space-y-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Discord</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.discordDesc")}
                  </p>
                </div>
                <Switch 
                  checked={workspaceSettings.integrations.discord}
                  onCheckedChange={(checked) => handleIntegrationToggle("Discord", checked)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 