import { useTranslations } from "next-intl";

import SelectLanguage from "@/components/select-language";
import { ToggleTheme } from "@/components/toggle-theme";

export default function Home() {
  const t = useTranslations("HomePage");
  return (
    <div>
      <ToggleTheme />
      <SelectLanguage />
      {t("title")}
    </div>
  );
}
