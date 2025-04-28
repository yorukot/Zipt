"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

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

export default function URLAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("7d")
  const [isLoading, setIsLoading] = React.useState(true)
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("Dashboard")
  
  const workspaceId = params.workspaceId as string
  const urlId = params.urlId as string

  // In a real implementation, you would fetch data from the API endpoints
  // /api/v1/url/:workspaceID/:urlID/analytics
  // /api/v1/url/:workspaceID/:urlID/analytics/timeseries
  
  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [workspaceId, urlId, timeRange])

  // Mock URL info data
  const urlInfo = {
    shortCode: "abc123",
    originalUrl: "https://example.com/some-very-long-path-that-needed-to-be-shortened-for-better-usability",
    shortUrl: "https://zipt.io/abc123",
    totalClicks: 542,
    createdAt: "2023-06-15T14:30:45Z",
    expiresAt: "2023-12-31T23:59:59Z"
  }

  // Mock analytics data
  const analyticsData = {
    total_clicks: 542,
    referrer: [
      { value: "direct", total: 180 },
      { value: "google.com", total: 125 },
      { value: "twitter.com", total: 87 },
      { value: "facebook.com", total: 75 },
      { value: "linkedin.com", total: 55 }
    ],
    country: [
      { value: "United States", total: 215 },
      { value: "Germany", total: 98 },
      { value: "United Kingdom", total: 76 },
      { value: "Canada", total: 47 },
      { value: "Australia", total: 36 }
    ],
    city: [
      { value: "New York", total: 68 },
      { value: "Berlin", total: 54 },
      { value: "London", total: 42 },
      { value: "Toronto", total: 33 },
      { value: "San Francisco", total: 29 }
    ],
    device: [
      { value: "Desktop", total: 312 },
      { value: "iPhone", total: 156 },
      { value: "Android", total: 74 }
    ],
    browser: [
      { value: "Chrome", total: 287 },
      { value: "Safari", total: 138 },
      { value: "Firefox", total: 67 },
      { value: "Edge", total: 50 }
    ],
    os: [
      { value: "Windows", total: 215 },
      { value: "iOS", total: 156 },
      { value: "macOS", total: 97 },
      { value: "Android", total: 74 }
    ]
  }

  // Mock time series data
  const timeSeriesData = {
    granularity: "hourly",
    total_clicks: 542,
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      clicks: Math.floor(Math.random() * 30)
    }))
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-primary">
          <Icon icon="lucide:loader-2" className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-3xl font-bold">{t("urlAnalytics.title")}</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{urlInfo.shortCode}</CardTitle>
          <CardDescription className="truncate max-w-2xl">{urlInfo.originalUrl}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:link" className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{urlInfo.shortUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="lucide:clock" className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{new Date(urlInfo.createdAt).toLocaleDateString()}</span>
            </div>
            {urlInfo.expiresAt && (
              <div className="flex items-center gap-2">
                <Icon icon="lucide:calendar" className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Expires: {new Date(urlInfo.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{t("urlAnalytics.overviewTitle")}</h2>
          <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
            {urlInfo.totalClicks} clicks
          </div>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle>{t("urlAnalytics.clicksOverTime")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MockChart 
            title=""
            className="h-[300px] w-full" 
          />
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.totalClicks")}
              </div>
              <div className="mt-1 text-2xl font-bold">{analyticsData.total_clicks}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.avgClicksPerDay")}
              </div>
              <div className="mt-1 text-2xl font-bold">
                {Math.round(analyticsData.total_clicks / 30)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.topReferrer")}
              </div>
              <div className="mt-1 text-2xl font-bold">
                {analyticsData.referrer[0].value}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.topCountry")}
              </div>
              <div className="mt-1 text-2xl font-bold">
                {analyticsData.country[0].value}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="geography" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-6">
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="browsers">Browsers</TabsTrigger>
          <TabsTrigger value="os">OS</TabsTrigger>
          <TabsTrigger value="clicks">Clicks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geography" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("urlAnalytics.topCountries")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.country.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{i + 1}.</span>
                        <span className="text-sm">{item.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.total}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round((item.total / analyticsData.total_clicks) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("urlAnalytics.topCities")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.city.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{i + 1}.</span>
                        <span className="text-sm">{item.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.total}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round((item.total / analyticsData.total_clicks) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="referrers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("urlAnalytics.topReferrers")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.referrer.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{i + 1}.</span>
                      <span className="text-sm">{item.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.total}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((item.total / analyticsData.total_clicks) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("urlAnalytics.devices")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.device.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{i + 1}.</span>
                      <span className="text-sm">{item.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.total}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((item.total / analyticsData.total_clicks) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="browsers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("urlAnalytics.browsers")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.browser.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{i + 1}.</span>
                      <span className="text-sm">{item.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.total}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((item.total / analyticsData.total_clicks) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="os" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("urlAnalytics.operatingSystems")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.os.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{i + 1}.</span>
                      <span className="text-sm">{item.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.total}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((item.total / analyticsData.total_clicks) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clicks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("urlAnalytics.clickDetails")}</CardTitle>
              <CardDescription>{t("urlAnalytics.clickDetailsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <MockChart 
                title=""
                className="h-[300px] w-full mb-6" 
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t("urlAnalytics.clicksChartDesc")}</p>
                <Button variant="outline">
                  <Icon icon="lucide:filter" className="mr-2 h-4 w-4" />
                  {t("urlAnalytics.filterData")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
