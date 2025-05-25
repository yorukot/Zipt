export interface AnalyticsItem {
  value: string;
  total_clicks: number;
}

export interface AnalyticsResponse {
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

export interface TimeSeriesResponse {
  url: {
    id: number;
    short_code: string;
    original_url: string;
  };
  time_series: {
    data: {
      timestamp: string;
      total_clicks: number;
    }[];
    granularity: string;
    filters: Record<string, string>;
    date_range: {
      start: string;
      end: string;
    };
  };
}

export interface ChartItem {
  name: string;
  value: number;
  fill: string;
}

export interface BarChartItem {
  value: string;
  total: number;
}

// Fill in missing time points with zero values for time series data
export function fillMissingTimePoints(
  data: { timestamp: string; total_clicks: number }[] | undefined,
  startTime: number,
  endTime: number,
  granularity: string
): { timestamp: string; total_clicks: number }[] {
  // If no data provided, return an empty array
  if (!data || data.length === 0) {
    return [];
  }

  // Convert the original data points to a map for quick lookup
  const originalPoints = new Map();
  data.forEach((point) => {
    const timestamp = new Date(point.timestamp).getTime();
    originalPoints.set(timestamp, {
      timestamp: point.timestamp,
      total_clicks: point.total_clicks,
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

  // Choose a reasonable interval based on data granularity
  let interval = 60 * 60 * 1000; // Default to hourly
  if (granularity === "minute") {
    interval = 2 * 60 * 1000; // 2 minutes
  } else if (granularity === "daily") {
    interval = 24 * 60 * 60 * 1000; // Daily
  } else if (granularity === "monthly") {
    interval = 30 * 24 * 60 * 60 * 1000; // Approximate monthly
  }

  // Generate the filled data array
  const filledData = [];

  // Ensure we have the original data points first
  for (const point of data) {
    filledData.push({
      timestamp: point.timestamp,
      total_clicks: point.total_clicks,
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
        total_clicks: 0,
      });
    }
  }

  // Sort the combined array by timestamp
  filledData.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return filledData;
}

// Transform data for charts - filter out ENGAGEMENT entries and format data
export function transformReferrerData(referrerItems: AnalyticsItem[]): ChartItem[] {
  return (referrerItems || [])
    .map((item) => ({
      name: item.value || "Unknown",
      value: item.total_clicks || 0,
      fill: item.value
        ? `var(--color-${item.value.replace(/\./g, "-")})`
        : "var(--muted)",
    }));
}

export function transformDeviceData(deviceItems: AnalyticsItem[]): ChartItem[] {
  return (deviceItems || [])
    .map((item) => ({
      name: item.value || "Unknown",
      value: item.total_clicks || 0,
      fill: item.value
        ? `var(--color-${item.value.toLowerCase().replace(/\s+/g, "-")})`
        : "var(--muted)",
    }));
}

export function transformBrowserData(browserItems: AnalyticsItem[]): ChartItem[] {
  return (browserItems || [])
    .map((item) => ({
      name: item.value || "Unknown",
      value: item.total_clicks || 0,
      fill: item.value
        ? `var(--color-${item.value.toLowerCase().replace(/\s+/g, "-")})`
        : "var(--muted)",
    }));
}

export function transformCountryData(countryItems: AnalyticsItem[]): BarChartItem[] {
  return (countryItems || [])
    .map((item) => ({
      value: item.value || "Unknown",
      total: item.total_clicks || 0,
    }));
}

export function transformCityData(cityItems: AnalyticsItem[]): BarChartItem[] {
  return (cityItems || [])
    .map((item) => ({
      value: item.value || "Unknown",
      total: item.total_clicks || 0,
    }));
}

export function transformOsData(osItems: AnalyticsItem[]): BarChartItem[] {
  return (osItems || [])
    .map((item) => ({
      value: item.value || "Unknown",
      total: item.total_clicks || 0,
    }));
}

// Calculate time range parameters based on the selected timeRange
export function getTimeRangeParams(timeRange: string) {
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
} 