"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();

  const navItems = [
    {
      title: t("Settings.password.title"),
      href: "/settings",
      active: pathname === "/settings",
    },
    // More nav items can be added here in the future
  ];

  return (
    <div className="flex justify-center">
      <div className="container py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <Card className="p-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold mb-3">
                  {t("Settings.title")}
                </h2>
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={item.active ? "default" : "ghost"}
                    className={cn("w-full justify-start", {
                      "bg-primary text-primary-foreground": item.active,
                    })}
                    asChild
                  >
                    <Link href={item.href}>{item.title}</Link>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
