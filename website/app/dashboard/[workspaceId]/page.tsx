"use client"

import * as React from "react"
import { useParams } from "next/navigation"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data for links - replace with API call later
const mockLinks = [
  {
    id: "1",
    shortUrl: "zipt.sh/abc123",
    originalUrl: "https://example.com/very/long/url/that/needs/shortening/for/social/media/marketing/campaign",
    clicks: 245,
    createdAt: "2023-08-15",
  },
  {
    id: "2",
    shortUrl: "zipt.sh/def456",
    originalUrl: "https://another-example.com/some/long/path",
    clicks: 128,
    createdAt: "2023-08-14",
  },
  {
    id: "3",
    shortUrl: "zipt.sh/ghi789",
    originalUrl: "https://yet-another-example.com/very/long/url",
    clicks: 57,
    createdAt: "2023-08-13",
  },
]

export default function DashboardPage() {
  const [url, setUrl] = React.useState("")
  const [customSlug, setCustomSlug] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [links, setLinks] = React.useState(mockLinks)
  const params = useParams()
  const t = useTranslations("Dashboard")
  const workspaceId = params.workspaceId as string
  
  // Mock workspace info - replace with API call later
  const workspaceInfo = {
    name: workspaceId === "workspace-1" 
      ? "My Personal Workspace" 
      : workspaceId === "workspace-2"
        ? "Marketing Team"
        : "Development",
    totalLinks: links.length,
    totalClicks: links.reduce((sum, link) => sum + link.clicks, 0),
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    
    setIsLoading(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate a random short code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let shortCode = ''
      for (let i = 0; i < 6; i++) {
        shortCode += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      
      // Use custom slug if provided
      const slug = customSlug || shortCode
      
      // Add new link to the list
      const newLink = {
        id: Date.now().toString(),
        shortUrl: `zipt.sh/${slug}`,
        originalUrl: url,
        clicks: 0,
        createdAt: new Date().toISOString().split('T')[0],
      }
      
      setLinks([newLink, ...links])
      setUrl("")
      setCustomSlug("")
      
      // Show success message
      toast.success(t("links.created"))
    } catch {
      toast.error(t("links.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t("links.copied"))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{workspaceInfo.name}</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.totalLinks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceInfo.totalLinks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.totalClicks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceInfo.totalClicks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.clickRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceInfo.totalLinks 
                ? Math.round(workspaceInfo.totalClicks / workspaceInfo.totalLinks) 
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("links.create")}</CardTitle>
          <CardDescription>{t("links.createDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("links.longUrl")}</label>
              <Input 
                type="url" 
                placeholder="https://example.com/very/long/url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("links.customSlug")}</label>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 text-sm text-muted-foreground">
                  zipt.sh/
                </div>
                <Input 
                  placeholder="custom-slug (optional)" 
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !url}
            >
              {isLoading && (
                <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("links.shorten")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("links.recent")}</CardTitle>
          <CardDescription>
            {t("links.recentDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="table-responsive">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("links.shortUrl")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("links.originalUrl")}</TableHead>
                  <TableHead>{t("links.clicks")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("links.created")}</TableHead>
                  <TableHead className="w-[100px]">{t("links.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      {link.shortUrl}
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                      {link.originalUrl}
                    </TableCell>
                    <TableCell>{link.clicks}</TableCell>
                    <TableCell className="hidden sm:table-cell">{link.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => copyToClipboard(link.shortUrl)}
                        >
                          <Icon icon="lucide:copy" className="h-4 w-4" />
                          <span className="sr-only">{t("links.copy")}</span>
                        </Button>
                        <Button size="icon" variant="ghost" className="hidden sm:flex">
                          <Icon icon="lucide:bar-chart-2" className="h-4 w-4" />
                          <span className="sr-only">{t("links.analytics")}</span>
                        </Button>
                        <Button size="icon" variant="ghost" className="hidden sm:flex">
                          <Icon icon="lucide:settings" className="h-4 w-4" />
                          <span className="sr-only">{t("links.settings")}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 