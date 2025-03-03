export type Locale = (typeof locales)[number];

export const locales = ["en", "zh-tw"] as const;

export type LocaleDetail = {
  flag: string;
  name: string;
  id: Locale;
};

export const localesDetail: LocaleDetail[] = [
  { flag: "us-um", name: "English", id: "en" },
  { flag: "tw", name: "繁體中文", id: "zh-tw" },
];

export const defaultLocale: Locale = "en";
