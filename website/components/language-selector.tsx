"use client";

import { useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setUserLocale } from "@/lib/local";
import { useTransition } from "react";
import { Locale } from "@/i18n/settings";

export function LanguageSelector() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function onChange(value: string) {
    const newLocale = value as Locale;
    startTransition(async () => {
      await setUserLocale(newLocale);
      router.refresh(); // Force a refresh to update the locale
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Icon icon="lucide:globe" className="h-4 w-4" />
          <span className="hidden sm:inline">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onChange("en")}
          className={`cursor-pointer ${locale === "en" ? "bg-accent" : ""}`}
        >
          <Icon icon="emojione:flag-for-united-states" className="mr-2 h-4 w-4" />
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange("zh-TW")}
          className={`cursor-pointer ${locale === "zh-TW" ? "bg-accent" : ""}`}
        >
          <Icon icon="emojione:flag-for-taiwan" className="mr-2 h-4 w-4" />
          <span>繁體中文</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
