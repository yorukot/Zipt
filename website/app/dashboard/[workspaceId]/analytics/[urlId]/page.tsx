"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Line, 
  LineChart, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  type ChartConfig
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from "lucide-react";

export default function URLAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("7d");
  const [isLoading, setIsLoading] = React.useState(true);
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Dashboard");

  const workspaceId = params.workspaceId as string;
  const urlId = params.urlId as string;

  // In a real implementation, you would fetch data from the API endpoints
  // /api/v1/url/:workspaceID/:urlID/analytics
  // /api/v1/url/:workspaceID/:urlID/analytics/timeseries

  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [workspaceId, urlId, timeRange]);

  // Mock URL info data
  const urlInfo = {
    shortCode: "abc123",
    originalUrl:
      "https://example.com/some-very-long-path-that-needed-to-be-shortened-for-better-usability",
    shortUrl: "https://zipt.io/abc123",
    totalClicks: 542,
    createdAt: "2023-06-15T14:30:45Z",
    expiresAt: "2023-12-31T23:59:59Z",
  };

  // Mock analytics data
  const analyticsData = {
    total_clicks: 542,
    referrer: [
      { value: "direct", total: 180 },
      { value: "google.com", total: 125 },
      { value: "twitter.com", total: 87 },
      { value: "facebook.com", total: 75 },
      { value: "linkedin.com", total: 55 },
    ],
    country: [
      { value: "United States", total: 215 },
      { value: "Germany", total: 98 },
      { value: "United Kingdom", total: 76 },
      { value: "Canada", total: 47 },
      { value: "Australia", total: 36 },
    ],
    city: [
      { value: "New York", total: 68 },
      { value: "Berlin", total: 54 },
      { value: "London", total: 42 },
      { value: "Toronto", total: 33 },
      { value: "San Francisco", total: 29 },
    ],
    device: [
      { value: "Desktop", total: 312 },
      { value: "iPhone", total: 156 },
      { value: "Android", total: 74 },
    ],
    browser: [
      { value: "Chrome", total: 287 },
      { value: "Safari", total: 138 },
      { value: "Firefox", total: 67 },
      { value: "Edge", total: 50 },
    ],
    os: [
      { value: "Windows", total: 215 },
      { value: "iOS", total: 156 },
      { value: "macOS", total: 97 },
      { value: "Android", total: 74 },
    ],
  };

  // Mock time series data
  const timeSeriesData = {
    granularity: "hourly",
    total_clicks: 542,
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      clicks: Math.floor(Math.random() * 30),
    })),
  };

  // Chart configurations
  const timeSeriesConfig: ChartConfig = {
    clicks: {
      label: "Clicks",
      color: "var(--chart-1)"
    }
  };
  const deviceConfig: ChartConfig = {
    Desktop: {
      label: "Desktop",
      color: "var(--chart-1)"
    },
    Mobile: {
      label: "Mobile",
      color: "var(--chart-2)"
    },
    Tablet: {
      label: "Tablet",
      color: "var(--chart-3)"
    }
  };

  const browserConfig: ChartConfig = {
    Chrome: {
      label: "Chrome",
      color: "var(--chart-1)"
    },
    Safari: {
      label: "Safari",
      color: "var(--chart-2)"
    },
    Firefox: {
      label: "Firefox",
      color: "var(--chart-3)"
    },
    Edge: {
      label: "Edge",
      color: "var(--chart-4)"
    }
  };

  const countriesConfig = {
    total: {
      label: "Clicks",
      color: "var(--chart-1)"
    }
  } satisfies ChartConfig;

  // Transform data for charts
  const referrerData = Array.from({ length: 10 }, (_, i) => {
    const item = analyticsData.referrer[i];
    return {
      name: item?.value || `Referrer ${i + 1}`,
      value: item?.total || 0,
      fill: item ? `var(--color-${item.value.replace('.', '-')})` : 'var(--muted)'
    };
  });

  const deviceData = Array.from({ length: 10 }, (_, i) => {
    const item = analyticsData.device[i];
    return {
      name: item?.value || `Device ${i + 1}`,
      value: item?.total || 0,
      fill: item ? `var(--color-${item.value.toLowerCase()})` : 'var(--muted)'
    };
  });

  const browserData = Array.from({ length: 10 }, (_, i) => {
    const item = analyticsData.browser[i];
    return {
      name: item?.value || `Browser ${i + 1}`,
      value: item?.total || 0,
      fill: item ? `var(--color-${item.value.toLowerCase()})` : 'var(--muted)'
    };
  });

  // Transform country data for the chart
  const countryData = Array.from({ length: 10 }, (_, i) => {
    const item = analyticsData.country[i];
    return {
      value: item?.value || `Country ${i + 1}`,
      total: item?.total || 0
    };
  });

  // Transform city data for the chart
  const cityData = Array.from({ length: 10 }, (_, i) => {
    const item = analyticsData.city[i];
    return {
      value: item?.value || `City ${i + 1}`,
      total: item?.total || 0
    };
  });

  // Transform OS data for the chart
  const osData = Array.from({ length: 10 }, (_, i) => {
    const item = analyticsData.os[i];
    return {
      value: item?.value || `OS ${i + 1}`,
      total: item?.total || 0
    };
  });

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-primary">
          <Icon icon="lucide:loader-2" className="h-8 w-8" />
        </div>
      </div>
    );
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
          <CardDescription className="truncate max-w-2xl">
            {urlInfo.originalUrl}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:link"
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="text-sm">{urlInfo.shortUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:clock"
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="text-sm">
                {new Date(urlInfo.createdAt).toLocaleDateString()}
              </span>
            </div>
            {urlInfo.expiresAt && (
              <div className="flex items-center gap-2">
                <Icon
                  icon="lucide:calendar"
                  className="h-4 w-4 text-muted-foreground"
                />
                <span className="text-sm">
                  Expires: {new Date(urlInfo.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">
            {t("urlAnalytics.overviewTitle")}
          </h2>
          <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
            {urlInfo.totalClicks} clicks
          </div>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle>{t("urlAnalytics.clicksOverTime")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={timeSeriesConfig} className="min-h-[300px] w-full">
            <AreaChart data={timeSeriesData.data} accessibilityLayer>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  return `${date.getHours()}:00`;
                }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [value, 'Clicks']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return `${date.toLocaleDateString()} ${date.getHours()}:00`;
                }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="var(--chart-1)"
                fillOpacity={1}
                fill="url(#colorClicks)"
              />
            </AreaChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.totalClicks")}
              </div>
              <div className="mt-1 text-2xl font-bold">
                {analyticsData.total_clicks}
              </div>
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
                {t("urlAnalytics.bestDay")}
              </div>
              <div className="mt-1 text-2xl font-bold">Friday</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.trend")}
              </div>
              <div className="mt-1 flex items-center text-2xl font-bold text-emerald-500">
                <Icon icon="lucide:trending-up" className="mr-1 h-4 w-4" />
                12%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("urlAnalytics.deviceBreakdown")}</CardTitle>
            <CardDescription>{t("analytics.topDevicesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            <ChartContainer config={deviceConfig} className="min-h-[300px] w-full">
              <PieChart accessibilityLayer>
                <Pie
                  data={analyticsData.device}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="total"
                  nameKey="value"
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.device.map((item, index) => (
                    <Cell
                      key={item.value}
                      fill={`var(--chart-${index + 1})`}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("urlAnalytics.browserBreakdown")}</CardTitle>
            <CardDescription>{t("analytics.topBrowsersDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            <ChartContainer config={browserConfig} className="min-h-[300px] w-full">
              <PieChart accessibilityLayer>
                <Pie
                  data={analyticsData.browser}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="total"
                  nameKey="value"
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.browser.map((item, index) => (
                    <Cell
                      key={item.value}
                      fill={`var(--chart-${index + 1})`}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="countries">
        <TabsList className="mb-4">
          <TabsTrigger value="countries">{t("analytics.topCountries")}</TabsTrigger>
          <TabsTrigger value="cities">{t("analytics.topCities")}</TabsTrigger>
          <TabsTrigger value="referrers">{t("analytics.topReferrers")}</TabsTrigger>
          <TabsTrigger value="os">{t("analytics.os")}</TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.topCountries")}</CardTitle>
              <CardDescription>{t("analytics.topCountriesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countriesConfig}>
                <BarChart
                  accessibilityLayer
                  data={countryData}
                  layout="vertical"
                  margin={{
                    left: -20,
                  }}
                >
                  <XAxis type="number" dataKey="total" hide />
                  <YAxis
                    dataKey="value"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={120}
                    tickFormatter={(value) => value.startsWith('Country') ? '' : value}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) => value === 0 ? null : [`${value} clicks`, "Clicks"]}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="var(--chart-1)" 
                    radius={5}
                    onMouseEnter={(data) => {
                      const element = document.querySelector(`.recharts-bar-rectangle-${data.index}`);
                      if (element) {
                        element.setAttribute('fill', 'var(--chart-1-hover)');
                      }
                    }}
                    onMouseLeave={(data) => {
                      const element = document.querySelector(`.recharts-bar-rectangle-${data.index}`);
                      if (element) {
                        element.setAttribute('fill', 'var(--chart-1)');
                      }
                    }}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.topCities")}</CardTitle>
              <CardDescription>{t("analytics.topCitiesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countriesConfig}>
                <BarChart
                  accessibilityLayer
                  data={cityData}
                  layout="vertical"
                  margin={{
                    left: -20,
                  }}
                >
                  <XAxis type="number" dataKey="total" hide />
                  <YAxis
                    dataKey="value"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={120}
                    tickFormatter={(value) => value.startsWith('City') ? '' : value}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) => value === 0 ? null : [`${value} clicks`, "Clicks"]}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="var(--chart-2)" 
                    radius={5}
                    onMouseEnter={(data) => {
                      const element = document.querySelector(`.recharts-bar-rectangle-${data.index}`);
                      if (element) {
                        element.setAttribute('fill', 'var(--chart-2-hover)');
                      }
                    }}
                    onMouseLeave={(data) => {
                      const element = document.querySelector(`.recharts-bar-rectangle-${data.index}`);
                      if (element) {
                        element.setAttribute('fill', 'var(--chart-2)');
                      }
                    }}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrers">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.topReferrers")}</CardTitle>
              <CardDescription>{t("analytics.topReferrersDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countriesConfig}>
                <BarChart
                  accessibilityLayer
                  data={referrerData}
                  layout="vertical"
                  margin={{
                    left: -20,
                  }}
                >
                  <XAxis type="number" dataKey="value" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={120}
                    tickFormatter={(value) => value.startsWith('Referrer') ? '' : value}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) => value === 0 ? null : [`${value} clicks`, "Clicks"]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="var(--chart-3)" 
                    radius={5}
                    onMouseEnter={(data) => {
                      const element = document.querySelector(`.recharts-bar-rectangle-${data.index}`);
                      if (element) {
                        element.setAttribute('fill', 'var(--chart-3-hover)');
                      }
                    }}
                    onMouseLeave={(data) => {
                      const element = document.querySelector(`.recharts-bar-rectangle-${data.index}`);
                      if (element) {
                        element.setAttribute('fill', 'var(--chart-3)');
                      }
                    }}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="os">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.os")}</CardTitle>
              <CardDescription>{t("analytics.osDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countriesConfig}>
                <BarChart
                  accessibilityLayer
                  data={osData}
                  layout="vertical"
                  margin={{
                    left: -20,
                  }}
                >
                  <XAxis type="number" dataKey="total" hide />
                  <YAxis
                    dataKey="value"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={120}
                    tickFormatter={(value) => value.startsWith('OS') ? '' : value}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) => value === 0 ? null : [`${value} clicks`, "Clicks"]}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="var(--chart-4)" 
                    radius={5}
                    onMouseEnter={(data) => {
                      const element = document.querySelector(`.recharts-bar-rectangle-${data.index}`);
                      if (element) {
                        element.setAttribute('fill', 'var(--chart-4-hover)');
                      }
                    }}
                    onMouseLeave={(data) => {
                      const element = document.querySelector(`.recharts-bar-rectangle-${data.index}`);
                      if (element) {
                        element.setAttribute('fill', 'var(--chart-4)');
                      }
                    }}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{t("urlAnalytics.heatmap")}</CardTitle>
          <CardDescription>{t("urlAnalytics.heatmapDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="h-[300px] w-full flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{t("analytics.heatmapPlaceholder")}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("urlAnalytics.rawData")}</CardTitle>
            <CardDescription>{t("urlAnalytics.rawDataDesc")}</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Icon icon="lucide:download" className="mr-2 h-4 w-4" />
            {t("urlAnalytics.downloadCSV")}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 border-b py-3 px-4 font-medium">
              <div>{t("urlAnalytics.timestamp")}</div>
              <div>{t("urlAnalytics.source")}</div>
              <div>{t("urlAnalytics.location")}</div>
              <div>{t("urlAnalytics.device")}</div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 py-3 px-4">
                  <div className="text-muted-foreground">
                    {new Date(Date.now() - i * 3600000).toLocaleString()}
                  </div>
                  <div>{analyticsData.referrer[i % analyticsData.referrer.length].value}</div>
                  <div>{analyticsData.country[i % analyticsData.country.length].value}</div>
                  <div>{analyticsData.device[i % analyticsData.device.length].value}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
