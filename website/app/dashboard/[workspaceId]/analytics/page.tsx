"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock chart component (replace with an actual chart library)
function MockChart({ title, className }: { title: string; className?: string }) {
  return (
    <div className={`rounded-lg bg-muted p-4 ${className}`}>
      <h3 className="mb-4 text-sm font-medium">{title}</h3>
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Chart visualization will go here</p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("7d")
  const params = useParams()
  const t = useTranslations("Dashboard")
  const workspaceId = params.workspaceId as string
  
  // Mock analytics data - replace with API call later
  const analyticsData = {
    totalClicks: 430,
    uniqueVisitors: 325,
    topCountries: [
      { country: "United States", clicks: 210 },
      { country: "Germany", clicks: 85 },
      { country: "United Kingdom", clicks: 65 },
      { country: "Canada", clicks: 40 },
      { country: "Australia", clicks: 30 },
    ],
    topDevices: [
      { device: "Desktop", percentage: 58 },
      { device: "Mobile", percentage: 38 },
      { device: "Tablet", percentage: 4 },
    ],
    topBrowsers: [
      { browser: "Chrome", percentage: 64 },
      { browser: "Safari", percentage: 18 },
      { browser: "Firefox", percentage: 10 },
      { browser: "Edge", percentage: 8 },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
        <div className="flex items-center gap-4">
          <Select 
            defaultValue={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("analytics.selectPeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{t("analytics.last24Hours")}</SelectItem>
              <SelectItem value="7d">{t("analytics.last7Days")}</SelectItem>
              <SelectItem value="30d">{t("analytics.last30Days")}</SelectItem>
              <SelectItem value="90d">{t("analytics.last90Days")}</SelectItem>
              <SelectItem value="all">{t("analytics.allTime")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Icon icon="lucide:download" className="h-4 w-4" />
            <span className="sr-only">{t("analytics.export")}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("analytics.totalClicks")}</CardTitle>
            <CardDescription>{t("analytics.totalClicksDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">{analyticsData.totalClicks}</div>
            <MockChart title={t("analytics.clicksOverTime")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("analytics.uniqueVisitors")}</CardTitle>
            <CardDescription>{t("analytics.uniqueVisitorsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">{analyticsData.uniqueVisitors}</div>
            <MockChart title={t("analytics.visitorsOverTime")} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.topCountries")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCountries.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{item.country}</span>
                  <span className="font-medium">{item.clicks}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.topDevices")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topDevices.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{item.device}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.topBrowsers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topBrowsers.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{item.browser}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.clicksMap")}</CardTitle>
          <CardDescription>{t("analytics.clicksMapDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <MockChart 
            title={t("analytics.worldMap")} 
            className="h-[300px] w-full" 
          />
        </CardContent>
      </Card>
    </div>
  )
} 