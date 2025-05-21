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
  YAxis,
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
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from "lucide-react";
import { fetcher } from "@/lib/utils/api";
import useSWR from "swr";
import API_URLS from "@/lib/api-urls";

interface AnalyticsItem {
  url_id: number;
  referrer: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  click_count: number;
  bucket_time: string;
}

interface AnalyticsResponse {
  url: {
    short_code: string;
    original_url: string;
    total_clicks: number;
    created_at: string;
    expires_at: string | null;
  };
  analytics: {
    total_clicks: number;
    referrer: AnalyticsItem[];
    country: AnalyticsItem[];
    city: AnalyticsItem[];
    device: AnalyticsItem[];
    browser: AnalyticsItem[];
    os: AnalyticsItem[];
  };
}

interface TimeSeriesResponse {
  url: {
    id: number;
    short_code: string;
    original_url: string;
  };
  time_series: {
    data: {
      timestamp: string;
      click_count: number;
    }[];
    granularity: string;
    filters: Record<string, string>;
    date_range: {
      start: string;
      end: string;
    };
  };
}

export default function URLAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("7d");
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Dashboard");

  const workspaceId = params.workspaceId as string;
  const urlId = params.urlId as string;

  // Calculate time range parameters based on the selected timeRange
  const getTimeRangeParams = () => {
    const end = Math.floor(Date.now() / 1000); // Current time in seconds
    let start: number;

    switch (timeRange) {
      case "1h":
        start = end - 3600; // 1 hour in seconds
        break;
      case "24h":
        start = end - 86400; // 24 hours in seconds
        break;
      case "7d":
        start = end - 604800; // 7 days in seconds
        break;
      case "30d":
        start = end - 2592000; // 30 days in seconds
        break;
      case "90d":
        start = end - 7776000; // 90 days in seconds
        break;
      default:
        // For 'all', use a very old date
        start = 0;
    }

    return { start, end };
  };

  const { start, end } = getTimeRangeParams();

  // Fetch analytics data
  const {
    data: analyticsData,
    error: analyticsError,
    isLoading: isAnalyticsLoading,
  } = useSWR<AnalyticsResponse>(
    `${API_URLS.URL.ANALYTICS(workspaceId, urlId)}?start=${start}&end=${end}`,
    fetcher
  );

  // Fetch time series data with proper time range
  const {
    data: timeSeriesData,
    error: timeSeriesError,
    isLoading: isTimeSeriesLoading,
  } = useSWR<TimeSeriesResponse>(
    `${API_URLS.URL.TIMESERIES(workspaceId, urlId)}?start=${start}&end=${end}`,
    fetcher
  );

  const isLoading = isAnalyticsLoading || isTimeSeriesLoading;
  const error = analyticsError || timeSeriesError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-primary">
          <Icon icon="lucide:loader-2" className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (error || !analyticsData || !timeSeriesData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
          {error && (
            <p className="text-destructive text-sm mt-2">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  const urlInfo = analyticsData.url;
  const analytics = analyticsData.analytics;
  const timeSeries = timeSeriesData.time_series;

  // Transform data for charts - filter out ENGAGEMENT entries and format data
  const referrerData = (analytics.referrer || [])
    .filter((item) => item.referrer !== "ENGAGEMENT")
    .map((item) => ({
      name: item.referrer || "Unknown",
      value: item.click_count || 0,
      fill: item.referrer
        ? `var(--color-${item.referrer.replace(/\./g, "-")})`
        : "var(--muted)",
    }));

  // Function to fill in missing time points with zero values
  const fillMissingTimePoints = (
    data: any[],
    startTime: number,
    endTime: number
  ) => {
    // If no data provided, return an empty array
    if (!data || data.length === 0) {
      console.log("No data to fill");
      return [];
    }

    console.log("Original data:", data);

    // Convert the original data points to a map for quick lookup
    const originalPoints = new Map();
    data.forEach((point) => {
      const timestamp = new Date(point.timestamp).getTime();
      originalPoints.set(timestamp, {
        timestamp: point.timestamp,
        click_count: point.click_count,
      });
    });

    // Sort original data points by timestamp
    const sortedTimestamps = Array.from(originalPoints.keys()).sort(
      (a, b) => a - b
    );

    // If there are no data points, return empty array
    if (sortedTimestamps.length === 0) return [];

    // Use the actual data for start/end times if they're more restrictive
    const actualStartTime = Math.min(startTime * 1000, sortedTimestamps[0]);
    const actualEndTime = Math.max(
      endTime * 1000,
      sortedTimestamps[sortedTimestamps.length - 1]
    );

    // Choose a reasonable interval based on the data density and time range
    const totalHours = (actualEndTime - actualStartTime) / (60 * 60 * 1000);

    // Use the interval that matches the data granularity
    let interval = 60 * 60 * 1000; // Default to hourly
    if (timeSeries.granularity === "minute") {
      interval = 2 * 60 * 1000; // 2 minutes
    } else if (timeSeries.granularity === "daily") {
      interval = 24 * 60 * 60 * 1000; // Daily
    } else if (timeSeries.granularity === "monthly") {
      interval = 30 * 24 * 60 * 60 * 1000; // Approximate monthly
    }

    // Generate the filled data array
    const filledData = [];

    // Ensure we have the original data points first
    for (const point of data) {
      filledData.push({
        timestamp: point.timestamp,
        click_count: point.click_count,
      });
    }

    // Now add zero points for gaps
    for (let time = actualStartTime; time <= actualEndTime; time += interval) {
      // Skip if this timestamp already exists (within a small tolerance)
      const tolerance = 60 * 1000; // 1 minute tolerance
      let exists = false;

      for (const existingTime of sortedTimestamps) {
        if (Math.abs(existingTime - time) < tolerance) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        filledData.push({
          timestamp: new Date(time).toISOString(),
          click_count: 0,
        });
      }
    }

    // Sort the combined array by timestamp
    filledData.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log("Filled data:", filledData);
    return filledData;
  };

  // Fill in missing data points for time series
  const filledTimeSeriesData = fillMissingTimePoints(
    timeSeries.data,
    start,
    end
  );

  const deviceData = (analytics.device || [])
    .filter((item) => item.device !== "ENGAGEMENT")
    .map((item) => ({
      name: item.device || "Unknown",
      value: item.click_count || 0,
      fill: item.device
        ? `var(--color-${item.device.toLowerCase().replace(/\s+/g, "-")})`
        : "var(--muted)",
    }));

  const browserData = (analytics.browser || [])
    .filter((item) => item.browser !== "ENGAGEMENT")
    .map((item) => ({
      name: item.browser || "Unknown",
      value: item.click_count || 0,
      fill: item.browser
        ? `var(--color-${item.browser.toLowerCase().replace(/\s+/g, "-")})`
        : "var(--muted)",
    }));

  const countryData = (analytics.country || [])
    .filter((item) => item.country !== "ENGAGEMENT")
    .map((item) => ({
      value: item.country || "Unknown",
      total: item.click_count || 0,
    }));

  const cityData = (analytics.city || [])
    .filter((item) => item.city !== "ENGAGEMENT")
    .map((item) => ({
      value: item.city || "Unknown",
      total: item.click_count || 0,
    }));

  const osData = (analytics.os || [])
    .filter((item) => item.os !== "ENGAGEMENT")
    .map((item) => ({
      value: item.os || "Unknown",
      total: item.click_count || 0,
    }));

  const handleBack = () => {
    router.back();
  };

  // Chart configurations
  const timeSeriesConfig: ChartConfig = {
    clicks: {
      label: "Clicks",
      color: "var(--chart-1)",
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

  const countriesConfig = {
    total: {
      label: "Clicks",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

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
          <CardTitle className="text-xl">{urlInfo.short_code}</CardTitle>
          <CardDescription className="truncate max-w-2xl">
            {urlInfo.original_url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:link"
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="text-sm">{`${window.location.origin}/${urlInfo.short_code}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:clock"
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="text-sm">
                {new Date(urlInfo.created_at).toLocaleDateString()}
              </span>
            </div>
            {urlInfo.expires_at && (
              <div className="flex items-center gap-2">
                <Icon
                  icon="lucide:calendar"
                  className="h-4 w-4 text-muted-foreground"
                />
                <span className="text-sm">
                  Expires: {new Date(urlInfo.expires_at).toLocaleDateString()}
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
            {urlInfo.total_clicks} clicks
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select
            defaultValue={timeRange}
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("analytics.selectPeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">{t("analytics.last1Hour")}</SelectItem>
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
          <ChartContainer
            config={timeSeriesConfig}
            className="min-h-[300px] w-full"
          >
            <AreaChart data={filledTimeSeriesData} accessibilityLayer>
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
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
                allowDataOverflow={true}
                // Ensure Y-axis only shows integer values
                tickCount={5}
                allowDecimals={false}
                // Format ticks as integers
                tickFormatter={(value) => Math.floor(value).toString()}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [value, "Clicks"]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return `${date.toLocaleDateString()} ${date.getHours()}:00`;
                }}
              />
              <Area
                type="monotone"
                dataKey="click_count"
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
                {urlInfo.total_clicks}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.avgClicksPerDay")}
              </div>
              <div className="mt-1 text-2xl font-bold">
                {Math.max(
                  1,
                  Math.round(
                    urlInfo.total_clicks /
                      (timeRange === "24h"
                        ? 1
                        : timeRange === "7d"
                        ? 7
                        : timeRange === "30d"
                        ? 30
                        : 90)
                  )
                )}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.bestDay")}
              </div>
              <div className="mt-1 text-2xl font-bold">-</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t("urlAnalytics.trend")}
              </div>
              <div className="mt-1 flex items-center text-2xl font-bold text-emerald-500">
                <Icon icon="lucide:trending-up" className="mr-1 h-4 w-4" />-
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
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {deviceData.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={`var(--chart-${(index % 4) + 1})`}
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
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {browserData.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={`var(--chart-${(index % 4) + 1})`}
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
          <TabsTrigger value="countries">
            {t("analytics.topCountries")}
          </TabsTrigger>
          <TabsTrigger value="cities">{t("analytics.topCities")}</TabsTrigger>
          <TabsTrigger value="referrers">
            {t("analytics.topReferrers")}
          </TabsTrigger>
          <TabsTrigger value="os">{t("analytics.os")}</TabsTrigger>
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
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) =>
                      value === 0 ? null : [`${value} clicks`, "Clicks"]
                    }
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--chart-1)"
                    radius={5}
                    onMouseEnter={(data) => {
                      const element = document.querySelector(
                        `.recharts-bar-rectangle-${data.index}`
                      );
                      if (element) {
                        element.setAttribute("fill", "var(--chart-1-hover)");
                      }
                    }}
                    onMouseLeave={(data) => {
                      const element = document.querySelector(
                        `.recharts-bar-rectangle-${data.index}`
                      );
                      if (element) {
                        element.setAttribute("fill", "var(--chart-1)");
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
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) =>
                      value === 0 ? null : [`${value} clicks`, "Clicks"]
                    }
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--chart-2)"
                    radius={5}
                    onMouseEnter={(data) => {
                      const element = document.querySelector(
                        `.recharts-bar-rectangle-${data.index}`
                      );
                      if (element) {
                        element.setAttribute("fill", "var(--chart-2-hover)");
                      }
                    }}
                    onMouseLeave={(data) => {
                      const element = document.querySelector(
                        `.recharts-bar-rectangle-${data.index}`
                      );
                      if (element) {
                        element.setAttribute("fill", "var(--chart-2)");
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
              <CardDescription>
                {t("analytics.topReferrersDesc")}
              </CardDescription>
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
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) =>
                      value === 0 ? null : [`${value} clicks`, "Clicks"]
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--chart-3)"
                    radius={5}
                    onMouseEnter={(data) => {
                      const element = document.querySelector(
                        `.recharts-bar-rectangle-${data.index}`
                      );
                      if (element) {
                        element.setAttribute("fill", "var(--chart-3-hover)");
                      }
                    }}
                    onMouseLeave={(data) => {
                      const element = document.querySelector(
                        `.recharts-bar-rectangle-${data.index}`
                      );
                      if (element) {
                        element.setAttribute("fill", "var(--chart-3)");
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
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) =>
                      value === 0 ? null : [`${value} clicks`, "Clicks"]
                    }
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--chart-4)"
                    radius={5}
                    onMouseEnter={(data) => {
                      const element = document.querySelector(
                        `.recharts-bar-rectangle-${data.index}`
                      );
                      if (element) {
                        element.setAttribute("fill", "var(--chart-4-hover)");
                      }
                    }}
                    onMouseLeave={(data) => {
                      const element = document.querySelector(
                        `.recharts-bar-rectangle-${data.index}`
                      );
                      if (element) {
                        element.setAttribute("fill", "var(--chart-4)");
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
              {analytics.referrer.slice(0, 5).map((item, i) => (
                <div key={i} className="grid grid-cols-4 py-3 px-4">
                  <div className="text-muted-foreground">
                    {item.bucket_time !== "0001-01-01T00:00:00Z"
                      ? new Date(item.bucket_time).toLocaleString()
                      : "N/A"}
                  </div>
                  <div>{item.referrer || "N/A"}</div>
                  <div>{item.country || "N/A"}</div>
                  <div>{item.device || "N/A"}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
