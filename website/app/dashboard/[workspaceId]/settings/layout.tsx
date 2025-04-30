"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import API_URLS from "@/lib/api-urls";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const params = useParams();
  const t = useTranslations("Dashboard");
  const workspaceId = params.workspaceId as string;

  React.useEffect(() => {
    const checkWorkspaceExists = async () => {
      try {
        const response = await fetch(API_URLS.WORKSPACE.GET(workspaceId), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch workspace");
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
        toast.error(
          error instanceof Error ? error.message : t("settings.error")
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkWorkspaceExists();
  }, [workspaceId, t]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center">
          <Icon icon="lucide:loader-2" className="h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading workspace settings...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center text-center max-w-md">
          <Icon
            icon="lucide:alert-circle"
            className="h-10 w-10 text-destructive mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">
            Failed to load workspace settings
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-muted-foreground">
            Try refreshing the page or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
      </div>

      <div className="flex mb-6">
        <Button asChild variant="outline" className="mr-2">
          <Link href={`/dashboard/${workspaceId}/settings/general-setting`}>
            <Icon icon="lucide:settings" className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">{t("settings.general")}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="mr-2">
          <Link href={`/dashboard/${workspaceId}/settings/domain-setting`}>
            <Icon icon="lucide:globe" className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">{t("settings.domain")}</span>
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/dashboard/${workspaceId}/settings/member-setting`}>
            <Icon icon="lucide:users" className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">{t("settings.members")}</span>
          </Link>
        </Button>
      </div>

      {children}
    </div>
  );
}
