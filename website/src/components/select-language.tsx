"use client";

import { useLocale } from "next-intl";

import { useTransition } from "react";

import { Icon } from "@iconify/react";

import { Locale, LocaleDetail, localesDetail } from "@/i18n/config";
import { setUserLocale } from "@/service/locale";

import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

export default function SelectLanguage() {
  const [, startTransition] = useTransition();
  const locale = useLocale();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }
  return (
    <Select onValueChange={(value) => onChange(value)} defaultValue={locale}>
      <SelectTrigger className="border-none w-6 h-6 p-0 bg-transparent select-none">
        <Icon
          icon="lucide:languages"
          className="w-6 h-6 text-green select-none "
        />
      </SelectTrigger>
      <SelectContent className="select-none">
        {localesDetail.map((locale: LocaleDetail) => (
          <SelectItem key={locale.id} value={locale.id}>
            <div className="flex space-x-1 items-center justify-center">
              <Icon icon={`circle-flags:${locale.flag}`} />
              <p>{locale.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
