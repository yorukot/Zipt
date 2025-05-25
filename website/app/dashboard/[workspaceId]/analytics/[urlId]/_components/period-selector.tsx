import * as React from "react";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodSelectorProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

export function PeriodSelector({ timeRange, onTimeRangeChange }: PeriodSelectorProps) {
  const t = useTranslations("Dashboard");

  return (
    <Select value={timeRange} onValueChange={onTimeRangeChange}>
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
  );
} 