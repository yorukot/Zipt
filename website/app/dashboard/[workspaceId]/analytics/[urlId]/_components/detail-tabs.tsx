import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useTranslations } from "next-intl";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface BarChartItem {
  value: string;
  total: number;
}

interface ReferrerItem {
  name: string;
  value: number;
  fill: string;
}

interface DetailTabsProps {
  countryData: BarChartItem[];
  cityData: BarChartItem[];
  referrerData: ReferrerItem[];
  osData: BarChartItem[];
}

export function DetailTabs({ countryData, cityData, referrerData, osData }: DetailTabsProps) {
  const t = useTranslations("Dashboard");

  const chartConfig = {
    total: {
      label: "Clicks",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
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
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart
                data={countryData}
                layout="vertical"
                height={Math.max(300, countryData.length * 40 + 20)}
                margin={{
                  left: 0,
                  top: 10,
                  bottom: 10,
                  right: 10,
                }}
                accessibilityLayer
              >
                <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />
                <XAxis type="number" dataKey="total" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="value"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => [`${value} clicks`, "Clicks"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                  }}
                  cursor={{fill: 'var(--muted)', opacity: 0.1}}
                />
                <Bar
                  dataKey="total"
                  fill="var(--chart-1)"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
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
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart
                data={cityData}
                layout="vertical"
                height={Math.max(300, cityData.length * 40 + 20)}
                margin={{
                  left: 0,
                  top: 10,
                  bottom: 10,
                  right: 10,
                }}
                accessibilityLayer
              >
                <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />
                <XAxis type="number" dataKey="total" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="value"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => [`${value} clicks`, "Clicks"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                  }}
                  cursor={{fill: 'var(--muted)', opacity: 0.1}}
                />
                <Bar
                  dataKey="total"
                  fill="var(--chart-1)"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
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
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart
                data={referrerData}
                layout="vertical"
                height={Math.max(300, referrerData.length * 40 + 20)}
                margin={{
                  left: 0,
                  top: 10,
                  bottom: 10,
                  right: 10,
                }}
                accessibilityLayer
              >
                <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />
                <XAxis type="number" dataKey="value" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => [`${value} clicks`, "Clicks"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                  }}
                  cursor={{fill: 'var(--muted)', opacity: 0.1}}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                >
                  {referrerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />
                  ))}
                </Bar>
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
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart
                data={osData}
                layout="vertical"
                height={Math.max(300, osData.length * 40 + 20)}
                margin={{
                  left: 0,
                  top: 10,
                  bottom: 10,
                  right: 10,
                }}
                accessibilityLayer
              >
                <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />
                <XAxis type="number" dataKey="total" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="value"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => [`${value} clicks`, "Clicks"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                  }}
                  cursor={{fill: 'var(--muted)', opacity: 0.1}}
                />
                <Bar
                  dataKey="total"
                  fill="var(--chart-1)"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 