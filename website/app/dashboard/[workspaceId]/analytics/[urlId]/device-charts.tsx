import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTranslations } from "next-intl";
import { hasFlag } from "country-flag-icons";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { Icon } from "@iconify/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { CountryFlag } from "./country-flag";

interface ChartItem {
  name: string;
  value: number;
  fill: string;
}

interface DeviceChartsProps {
  deviceData: ChartItem[];
  countryData: ChartItem[];
}

// Helper function to get device icon
const getDeviceIcon = (deviceType: string) => {
  const type = deviceType.toLowerCase();
  if (type.includes("desktop") || type.includes("computer")) {
    return <Icon icon="qlementine-icons:computer-16" />;
  } else if (type.includes("mobile") || type.includes("phone")) {
    return <Icon icon="qlementine-icons:smartphone-16" width="16" height="16" />;
  } else if (type.includes("tablet")) {
    return <Icon icon="qlementine-icons:tablet-16" />;
  }
  return <Icon icon="material-symbols:question-mark" />;
};

// Custom device display component
const DeviceDisplay = ({ deviceName }: { deviceName: string }) => {
  return (
    <span className="flex items-center gap-2">
      <span className="text-muted-foreground">{getDeviceIcon(deviceName)}</span>
      <span>{deviceName}</span>
    </span>
  );
};

// Custom tooltip content for device data
const DeviceTooltipContent = (props: any) => {
  const { active, payload } = props;
  
  if (!active || !payload || !payload.length) {
    return null;
  }
  
  const data = payload[0].payload;
  
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="flex flex-col space-y-1.5 text-sm">
        <DeviceDisplay deviceName={data.name} />
        <div className="flex items-center">
          <span className="text-muted-foreground">Clicks:</span>
          <span className="ml-auto font-medium">{data.value}</span>
        </div>
      </div>
    </div>
  );
};

// Custom legend content for device data
const DeviceLegendContent = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <DeviceDisplay deviceName={entry.value} />
        </li>
      ))}
    </ul>
  );
};

// Custom tooltip content for country data
const CountryTooltipContent = (props: any) => {
  const { active, payload } = props;
  
  if (!active || !payload || !payload.length) {
    return null;
  }
  
  const data = payload[0].payload;
  
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="flex flex-col space-y-1.5 text-sm">
        <CountryFlag 
          countryCode={data.name} 
        />
        <div className="flex items-center">
          <span className="text-muted-foreground">Clicks:</span>
          <span className="ml-auto font-medium">{data.value}</span>
        </div>
      </div>
    </div>
  );
};

// Custom legend content for country data
const CountryLegendContent = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <CountryFlag 
            countryCode={entry.value}
            className="text-sm"
          />
        </li>
      ))}
    </ul>
  );
};

export function DeviceCharts({ deviceData, countryData }: DeviceChartsProps) {
  const t = useTranslations("Dashboard");

  // Chart configurations
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

  const countryConfig: ChartConfig = {
    USA: {
      label: "USA",
      color: "var(--chart-1)",
    },
    Canada: {
      label: "Canada",
      color: "var(--chart-2)",
    },
    UK: {
      label: "UK",
      color: "var(--chart-3)",
    },
    Other: {
      label: "Other",
      color: "var(--chart-4)",
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t("urlAnalytics.deviceBreakdown")}</CardTitle>
          <CardDescription>{t("analytics.topDevicesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-medium mb-4">Device Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                content={<DeviceTooltipContent />}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
                label={({ name, percent }) => {
                  const icon = getDeviceIcon(name);
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
              >
                {deviceData.map((item, index) => (
                  <Cell
                    key={`${item.name}-${index}`}
                    fill={`var(--chart-${(index % 4) + 1})`}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t("urlAnalytics.countryBreakdown")}</CardTitle>
          <CardDescription>{t("analytics.topCountriesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-medium mb-4">Location Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                content={<CountryTooltipContent />}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Pie
                data={countryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
                label={({ name, percent }) => {
                  const code = name.length === 2 ? name.toUpperCase() : "";
                  const flag = code && hasFlag(code) ? getUnicodeFlagIcon(code) : "";
                  return `${flag} ${name}: ${(percent * 100).toFixed(0)}%`;
                }}
              >
                {countryData.map((item, index) => (
                  <Cell
                    key={`${item.name}-${index}`}
                    fill={`var(--chart-${(index % 4) + 1})`}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 