"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/utils/api";
import API_URLS from "@/lib/api-urls";

import { URLHeader } from "./_components/url-header";
import { PeriodSelector } from "./_components/period-selector";
import { TimeSeriesChart } from "./_components/time-series-chart";
import { DeviceCharts } from "./_components/device-charts";
import { DetailTabs } from "./_components/detail-tabs";
import {
  AnalyticsResponse,
  TimeSeriesResponse,
  fillMissingTimePoints,
  getTimeRangeParams,
  transformReferrerData,
  transformDeviceData,
  transformCountryData,
  transformCityData,
  transformOsData,
} from "./_components/utils";

// Helper function to convert bar chart data to pie chart format
function convertToPieChartFormat(barData: { value: string; total: number }[]): { name: string; value: number; fill: string }[] {
  return barData.map(item => ({
    name: item.value,
    value: item.total,
    fill: `var(--color-${item.value.toLowerCase().replace(/\s+/g, "-")})`,
  }));
}

export default function URLAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("7d");
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Dashboard");

  const workspaceId = params.workspaceId as string;
  const urlId = params.urlId as string;

  // Get time range parameters
  const { start, end } = getTimeRangeParams(timeRange);

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

  const handleBack = () => {
    router.back();
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
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

  // Process data for components
  const urlInfo = analyticsData.url;
  const analytics = analyticsData.analytics;
  const timeSeries = timeSeriesData.time_series;

  // Transform data with utility functions
  const referrerData = transformReferrerData(analytics.referrer);
  const deviceData = transformDeviceData(analytics.device);
  const countryBarData = transformCountryData(analytics.country);
  const countryPieData = convertToPieChartFormat(countryBarData);
  const cityData = transformCityData(analytics.city);
  const osData = transformOsData(analytics.os);

  // Fill in missing time points for time series
  const filledTimeSeriesData = fillMissingTimePoints(
    timeSeries.data,
    start,
    end,
    timeSeries.granularity
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-3xl font-bold">{t("urlAnalytics.title")}</h1>
      </div>

      <URLHeader urlInfo={urlInfo} />

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
          <PeriodSelector 
            timeRange={timeRange} 
            onTimeRangeChange={handleTimeRangeChange} 
          />
        </div>
      </div>

      <TimeSeriesChart 
        urlInfo={urlInfo} 
        timeSeriesData={filledTimeSeriesData} 
        timeRange={timeRange}
      />

      <DeviceCharts deviceData={deviceData} countryData={countryPieData} />

      <DetailTabs 
        countryData={countryBarData}
        cityData={cityData}
        referrerData={referrerData}
        osData={osData}
      />
    </div>
  );
}
