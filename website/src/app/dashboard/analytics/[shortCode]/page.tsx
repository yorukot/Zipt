"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ChartTooltip,
} from "@/components/ui/chart";

import API_URLS from "@/lib/api-urls";

// Chart config type definition
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ChartConfig = {
  [key: string]: {
    label: string;
    theme: {
      light: string;
      dark: string;
    };
  };
};

// Fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch analytics data");
  }
  
  return response.json();
};

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), "PPP");
  } catch {
    // Using catch without an error param to avoid linter warnings
    console.error('Invalid date:', dateString);
    return '-';
  }
};

// Define types for analytics data
interface ReferrerStat {
  referrer: string;
  click_count: number;
  percentage: number;
}

interface CountryStat {
  country: string;
  click_count: number;
  percentage: number;
}

interface HourlyEngagement {
  time_start: string;
  engagement: number;
}

export default function AnalyticsPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const t = useTranslations();
  
  const { data, error, isLoading } = useSWR(
    `${API_URLS.URL.ANALYTICS(shortCode)}`,
    fetcher
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            {t("Dashboard.analytics.error")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error.message}
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <Icon icon="lucide:arrow-left" className="mr-2 h-4 w-4" />
            {t("Dashboard.analytics.go_back")}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">
              {t("Dashboard.analytics.loading")}
            </p>
          </div>
          <AnalyticsSkeletonLoader />
        </div>
      </div>
    );
  }

  const analytics = data?.result?.analytics;
  const urlData = data?.result?.url;

  // Transform data for charts
  const referrerData = analytics?.referrer_stats?.map((stat: ReferrerStat) => ({
    referrer: stat.referrer,
    count: stat.click_count,
    percentage: stat.percentage,
  })) || [];

  const countryData = analytics?.country_stats?.map((stat: CountryStat) => ({
    country: stat.country,
    count: stat.click_count,
    percentage: stat.percentage,
  })) || [];

  const hourlyData = analytics?.hourly_engagement?.map((stat: HourlyEngagement) => ({
    hour: format(new Date(stat.time_start), "HH:mm"),
    count: stat.engagement,
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => window.history.back()}
          >
            <Icon icon="lucide:arrow-left" className="mr-2 h-4 w-4" />
            {t("Dashboard.analytics.back_to_dashboard")}
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Icon icon="lucide:activity" className="h-6 w-6" />
            {t("Dashboard.analytics.title")}
          </h1>
        </div>
        {urlData && (
          <Button
            onClick={() => window.open(`/${shortCode}`, '_blank')}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
          >
            <Icon icon="lucide:external-link" className="h-4 w-4 mr-2" />
            {t("Dashboard.analytics.visit_url")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title={t("Dashboard.analytics.total_clicks")}
          value={analytics?.total_clicks || 0}
          icon={<Icon icon="lucide:mouse-pointer-click" className="h-4 w-4" />}
        />
        
        <StatsCard
          title={t("Dashboard.analytics.created_at")}
          value={formatDate(urlData?.created_at)}
          icon={<Icon icon="lucide:calendar" className="h-4 w-4" />}
        />
        
        <StatsCard
          title={t("Dashboard.analytics.expires_at")}
          value={urlData?.expires_at ? formatDate(urlData.expires_at) : t("Dashboard.analytics.never")}
          icon={<Icon icon="lucide:clock" className="h-4 w-4" />}
        />
        
        <StatsCard
          title={t("Dashboard.analytics.original_url")}
          value={urlData?.original_url || '-'}
          icon={<Icon icon="lucide:link" className="h-4 w-4" />}
          tooltip
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="lucide:globe-2" className="h-5 w-5" />
              {t("Dashboard.analytics.countries")}
            </CardTitle>
            <CardDescription>
              {t("Dashboard.analytics.countries_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData}>
                    <CartesianGrid 
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="country"
                      className="text-sm fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      className="text-sm fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Bar
                      dataKey="count"
                      fill="currentColor"
                      className="fill-primary"
                      radius={[4, 4, 0, 0]}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload) return null;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Country
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0]?.payload?.country}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Clicks
                                </span>
                                <span className="font-bold">
                                  {payload[0]?.value}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrers Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="lucide:link" className="h-5 w-5" />
              {t("Dashboard.analytics.referrers")}
            </CardTitle>
            <CardDescription>
              {t("Dashboard.analytics.referrers_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={referrerData}>
                    <CartesianGrid 
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="referrer"
                      className="text-sm fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      className="text-sm fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Bar
                      dataKey="count"
                      fill="currentColor"
                      className="fill-primary"
                      radius={[4, 4, 0, 0]}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload) return null;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Referrer
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0]?.payload?.referrer}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Clicks
                                </span>
                                <span className="font-bold">
                                  {payload[0]?.value}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Engagement Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="lucide:clock" className="h-5 w-5" />
              {t("Dashboard.analytics.hourly")}
            </CardTitle>
            <CardDescription>
              {t("Dashboard.analytics.hourly_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid 
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="hour"
                      className="text-sm fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      className="text-sm fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Bar
                      dataKey="count"
                      fill="currentColor"
                      className="fill-primary"
                      radius={[4, 4, 0, 0]}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload) return null;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Time
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0]?.payload?.hour}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Clicks
                                </span>
                                <span className="font-bold">
                                  {payload[0]?.value}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon, tooltip = false }: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tooltip?: boolean;
}) {
  const content = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold truncate">
          {value}
        </div>
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <p>{value}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// Skeleton Loader Component
function AnalyticsSkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[150px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 