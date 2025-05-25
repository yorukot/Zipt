"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { GeneralSettings } from "../_components";
import API_URLS from "@/lib/api-urls";

interface Workspace {
  id: string;
  name: string;
  domain?: string;
  members?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  integrations?: {
    googleAnalytics: boolean;
    slack: boolean;
    discord: boolean;
  };
}

export default function GeneralSettingsPage() {
  const [workspace, setWorkspace] = React.useState<Workspace | null>(null);
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
        setWorkspace(data);
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error(
          error instanceof Error ? error.message : t("settings.error")
        );
      }
    };

    fetchWorkspace();
  }, [workspaceId, t]);

  if (!workspace) {
    return null;
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

  return <GeneralSettings workspaceSettings={workspaceSettings} />;
} 