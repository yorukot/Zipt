"use client";

import * as React from "react";
// useParams import removed as it's not used
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("7d");
  // const params = useParams(); // Unused for now
  const t = useTranslations("Dashboard");
  // const workspaceId = params.workspaceId as string; // Unused for now

  // Mock analytics data - replace with API call later
  const analyticsData = {
    totalClicks: 430,
    uniqueVisitors: 325,
    clicksOverTime: [
      { day: "Mon", clicks: 54 },
      { day: "Tue", clicks: 67 },
      { day: "Wed", clicks: 34 },
      { day: "Thu", clicks: 78 },
      { day: "Fri", clicks: 91 },
      { day: "Sat", clicks: 62 },
      { day: "Sun", clicks: 44 },
    ],
    visitsOverTime: [
      { day: "Mon", visits: 41 },
      { day: "Tue", visits: 58 },
      { day: "Wed", visits: 29 },
      { day: "Thu", clicks: 65 },
      { day: "Fri", visits: 77 },
      { day: "Sat", visits: 42 },
      { day: "Sun", visits: 33 },
    ],
    topCountries: [
      { country: "United States", clicks: 210 },
      { country: "Germany", clicks: 85 },
      { country: "United Kingdom", clicks: 65 },
      { country: "Canada", clicks: 40 },
      { country: "Australia", clicks: 30 },
    ],
    topDevices: [
      { device: "Desktop", value: 58 },
      { device: "Mobile", value: 38 },
      { device: "Tablet", value: 4 },
    ],
    topBrowsers: [
      { browser: "Chrome", value: 64 },
      { browser: "Safari", value: 18 },
      { browser: "Firefox", value: 10 },
      { browser: "Edge", value: 8 },
    ],
    topReferrers: [
      { referrer: "Direct", visits: 145 },
      { referrer: "Google", visits: 95 },
      { referrer: "Twitter", visits: 45 },
      { referrer: "Facebook", visits: 24 },
      { referrer: "LinkedIn", visits: 16 },
    ],
  };

  // Chart configurations
  const clicksConfig: ChartConfig = {
    clicks: {
      label: "Clicks",
      color: "var(--chart-1)",
    },
  };

  const visitsConfig: ChartConfig = {
    visits: {
      label: "Unique Visitors",
      color: "var(--chart-2)",
    },
  };

  const deviceConfig: ChartConfig = {
    Desktop: {
      label: "Desktop",
      color: "var(--chart-1)",
    },
    Mobile: {
      label: "Mobile",
      color: "var(--chart-2)",
    },
    Tablet: {
      label: "Tablet",
      color: "var(--chart-3)",
    },
  };

  const browserConfig: ChartConfig = {
    Chrome: {
      label: "Chrome",
      color: "var(--chart-1)",
    },
    Safari: {
      label: "Safari",
      color: "var(--chart-2)",
    },
    Firefox: {
      label: "Firefox",
      color: "var(--chart-3)",
    },
    Edge: {
      label: "Edge",
      color: "var(--chart-4)",
    },
  };

  // Transform data for pie charts
  const deviceData = analyticsData.topDevices.map((item) => ({
    name: item.device,
    value: item.value,
    fill: `var(--color-${item.device.toLowerCase()})`,
  }));

  const browserData = analyticsData.topBrowsers.map((item) => ({
    name: item.browser,
    value: item.value,
    fill: `var(--color-${item.browser.toLowerCase()})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
        <div className="flex items-center gap-4">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
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
            <div className="text-4xl font-bold mb-4">
              {analyticsData.totalClicks}
            </div>
            <ChartContainer
              config={clicksConfig}
              className="min-h-[200px] w-full"
            >
              <AreaChart data={analyticsData.clicksOverTime} accessibilityLayer>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--chart-1)"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("analytics.uniqueVisitors")}</CardTitle>
            <CardDescription>
              {t("analytics.uniqueVisitorsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {analyticsData.uniqueVisitors}
            </div>
            <ChartContainer
              config={visitsConfig}
              className="min-h-[200px] w-full"
            >
              <AreaChart data={analyticsData.visitsOverTime} accessibilityLayer>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-2)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-2)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="var(--chart-2)"
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="countries" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="countries">
            {t("analytics.topCountries")}
          </TabsTrigger>
          <TabsTrigger value="devices">{t("analytics.topDevices")}</TabsTrigger>
          <TabsTrigger value="browsers">
            {t("analytics.topBrowsers")}
          </TabsTrigger>
          <TabsTrigger value="referrers">
            {t("analytics.topReferrers")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.topCountries")}</CardTitle>
              <CardDescription>
                {t("analytics.topCountriesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topCountries} layout="vertical">
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.topDevices")}</CardTitle>
              <CardDescription>{t("analytics.topDevicesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-center">
              <div className="min-h-[300px] w-full md:w-1/2">
                <ChartContainer
                  config={deviceConfig}
                  className="min-h-[300px] w-full"
                >
                  <PieChart accessibilityLayer>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`var(--chart-${index + 1})`}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="space-y-4 w-full md:w-1/2">
                {analyticsData.topDevices.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.device}</span>
                      <span className="text-muted-foreground">
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: `var(--chart-${i + 1})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browsers">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.topBrowsers")}</CardTitle>
              <CardDescription>
                {t("analytics.topBrowsersDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-center">
              <div className="min-h-[300px] w-full md:w-1/2">
                <ChartContainer
                  config={browserConfig}
                  className="min-h-[300px] w-full"
                >
                  <PieChart accessibilityLayer>
                    <Pie
                      data={browserData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {browserData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`var(--chart-${index + 1})`}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="space-y-4 w-full md:w-1/2">
                {analyticsData.topBrowsers.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.browser}</span>
                      <span className="text-muted-foreground">
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: `var(--chart-${i + 1})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrers">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.topReferrers")}</CardTitle>
              <CardDescription>
                {t("analytics.topReferrersDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topReferrers} layout="vertical">
                    <CartesianGrid
                      horizontal={true}
                      vertical={false}
                      strokeDasharray="3 3"
                    />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="referrer"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} visits`, "Visits"]}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="visits"
                      fill="var(--chart-3)"
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.clicksMap")}</CardTitle>
          <CardDescription>{t("analytics.clicksMapDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="h-[300px] w-full flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t("analytics.worldMapPlaceholder")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
