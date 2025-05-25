import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "next-intl";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Icon } from "@iconify/react";

interface TimeSeriesProps {
  urlInfo: {
    total_clicks: number;
  };
  timeSeriesData: {
    timestamp: string;
    total_clicks: number;
  }[];
  timeRange: string;
}

export function TimeSeriesChart({ urlInfo, timeSeriesData, timeRange }: TimeSeriesProps) {
  const t = useTranslations("Dashboard");

  // Calculate best day (day with most clicks)
  const bestDay = React.useMemo(() => {
    if (!timeSeriesData || timeSeriesData.length === 0) return null;
    
    // Group data by day
    const clicksByDay = timeSeriesData.reduce((acc, point) => {
      const date = new Date(point.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          clicks: 0,
          displayDate: new Date(dateKey).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        };
      }
      
      acc[dateKey].clicks += point.total_clicks;
      return acc;
    }, {} as Record<string, { date: string; clicks: number; displayDate: string }>);
    
    // Find the day with the most clicks
    const sortedDays = Object.values(clicksByDay).sort((a, b) => b.clicks - a.clicks);
    return sortedDays.length > 0 ? sortedDays[0] : null;
  }, [timeSeriesData]);

  // Calculate trend (percentage change)
  const trend = React.useMemo(() => {
    if (!timeSeriesData || timeSeriesData.length < 2) return null;
    
    // Sort by timestamp
    const sortedData = [...timeSeriesData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Divide the time period into two equal parts
    const midpoint = Math.floor(sortedData.length / 2);
    
    // Calculate the total clicks in each period
    const firstHalfClicks = sortedData.slice(0, midpoint).reduce(
      (sum, point) => sum + point.total_clicks, 0
    );
    
    const secondHalfClicks = sortedData.slice(midpoint).reduce(
      (sum, point) => sum + point.total_clicks, 0
    );
    
    // Calculate percentage change
    const percentChange = firstHalfClicks === 0 
      ? (secondHalfClicks > 0 ? 100 : 0) 
      : ((secondHalfClicks - firstHalfClicks) / firstHalfClicks) * 100;
    
    return {
      value: Math.round(percentChange),
      isPositive: percentChange >= 0,
    };
  }, [timeSeriesData]);

  // Chart configurations
  const timeSeriesConfig: ChartConfig = {
    clicks: {
      label: "Clicks",
      color: "var(--chart-1)",
    },
  };

  // Format based on timeRange
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === "24h" || timeRange === "1h") {
      return `${date.getHours()}:00`;
    } else if (timeRange === "7d") {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("urlAnalytics.clicksOverTime")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={timeSeriesConfig}
          className="min-h-[300px] w-full"
        >
          <AreaChart data={timeSeriesData} accessibilityLayer>
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
              tickFormatter={formatXAxis}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, "auto"]}
              allowDataOverflow={true}
              tickCount={5}
              allowDecimals={false}
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
              dataKey="total_clicks"
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
            <div className="mt-1 text-2xl font-bold">
              {bestDay ? (
                <div className="flex flex-col">
                  <span>{bestDay.displayDate}</span>
                  <span className="text-xs text-muted-foreground">
                    {bestDay.clicks} clicks
                  </span>
                </div>
              ) : (
                "-"
              )}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs font-medium text-muted-foreground">
              {t("urlAnalytics.trend")}
            </div>
            {trend ? (
              <div className="mt-1 flex items-center text-2xl font-bold">
                <div 
                  className={`flex items-center ${
                    trend.isPositive ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  <Icon 
                    icon={trend.isPositive ? "lucide:trending-up" : "lucide:trending-down"} 
                    className="mr-1 h-4 w-4" 
                  />
                  {trend.value}%
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center text-2xl font-bold text-muted-foreground">
                <Icon icon="lucide:minus" className="mr-1 h-4 w-4" />-
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 