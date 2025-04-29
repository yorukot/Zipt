"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  GeneralSettings,
  DomainSettings,
  MembersSettings,
} from "./_components";
import API_URLS from "@/lib/api-urls";

interface Workspace {
  id: string;
  name: string;
  domain?: string;
  members?: any[];
  integrations?: {
    googleAnalytics: boolean;
    slack: boolean;
    discord: boolean;
  };
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [workspace, setWorkspace] = React.useState<Workspace | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const params = useParams();
  const t = useTranslations("Dashboard");
  const workspaceId = params.workspaceId as string;

  React.useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await fetch(API_URLS.WORKSPACE.GET(workspaceId), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch workspace");
        }

        // Set workspace data
        setWorkspace(data.result);
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

    fetchWorkspace();
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
  if (error || !workspace) {
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
          <p className="text-muted-foreground mb-4">
            {error || "Workspace not found"}
          </p>
          <p className="text-muted-foreground">
            Try refreshing the page or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  // Default fallback data if API doesn't provide certain properties
  const workspaceSettings = {
    name: workspace.name,
    domain: workspace.domain || "zipt.sh",
    members: workspace.members || [
      { name: "You", email: "you@example.com", role: "Owner" },
    ],
    integrations: workspace.integrations || {
      googleAnalytics: false,
      slack: false,
      discord: false,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="general">
            <Icon icon="lucide:settings" className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.general")}</span>
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Icon icon="lucide:globe" className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.domain")}</span>
          </TabsTrigger>
          <TabsTrigger value="members">
            <Icon icon="lucide:users" className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.members")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings workspaceSettings={workspaceSettings} />
        </TabsContent>

        <TabsContent value="domain">
          <DomainSettings workspaceSettings={workspaceSettings} />
        </TabsContent>

        <TabsContent value="members">
          <MembersSettings workspaceSettings={workspaceSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
