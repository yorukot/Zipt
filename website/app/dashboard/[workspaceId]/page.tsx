"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlFavicon } from "@/components/url-favicon";
import API_URLS from "@/lib/api-urls";
import { useWorkspace } from "@/lib/context/workspace-context";
import { LinkDialog } from "@/components/shortener/create-link-dialog";

// Define interfaces for our data
interface LinkData {
  id: string;
  short_code: string;
  original_url: string;
  short_url: string;
  domain_name: string;
  clicks: number;
  created_at: string;
  expires_at?: string;
}

interface DomainData {
  id: string;
  domain: string;
  verified: boolean;
}

export default function DashboardPage() {
  const [links, setLinks] = React.useState<LinkData[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const [selectedLinkId, setSelectedLinkId] = React.useState<string | null>(
    null
  );
  const [isLoadingLinks, setIsLoadingLinks] = React.useState(true);
  const [domains] = React.useState<DomainData[]>([]);
  // const [isLoadingDomains, setIsLoadingDomains] = React.useState(false); // Unused for now
  
  const params = useParams();
  const t = useTranslations("Dashboard");
  const workspaceId = params.workspaceId as string;
  const { workspaces } = useWorkspace();

  // Find the current workspace name
  const currentWorkspace = workspaces?.find(
    (workspace) => workspace.id === workspaceId
  );
  const workspaceName = currentWorkspace?.name || workspaceId;

  // Format the title with possessive form
  const workspaceTitle = `${workspaceName}${
    workspaceName.endsWith("s") ? "'" : "'s"
  } Workspace`;

  // This function would fetch domains once the API endpoint is available (unused for now)
  // const fetchDomains = async () => {
  //   // setIsLoadingDomains(true); // Commented out since setIsLoadingDomains is unused
  //   try {
  //     // Example endpoint - replace with actual API endpoint when available
  //     const response = await fetch(`/api/workspaces/${workspaceId}/domains`);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch domains");
  //     }
  //     const data = await response.json();
  //     if (data) {
  //       setDomains(data);
  //     } else {
  //       setDomains([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching domains:", error);
  //     toast.error("Failed to load domains");
  //   } finally {
  //     // setIsLoadingDomains(false); // Commented out since setIsLoadingDomains is unused
  //   }
  // };

  const fetchLinks = React.useCallback(async () => {
    setIsLoadingLinks(true);
    try {
      const response = await fetch(API_URLS.URL.LIST(workspaceId));
      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }
      const data = await response.json();
      if (data) {
        const formattedLinks = data.map((link: {
          id: string;
          short_code: string;
          original_url: string;
          short_url: string;
          domain_name: string;
          total_clicks?: number;
          created_at: string;
          expires_at?: string;
        }) => ({
          id: link.id,
          short_code: link.short_code,
          original_url: link.original_url,
          short_url: link.short_url,
          domain_name: link.domain_name,
          clicks: link.total_clicks || 0,
          created_at: new Date(link.created_at).toISOString().split("T")[0],
          expires_at: link.expires_at
            ? new Date(link.expires_at).toISOString()
            : undefined,
        }));
        setLinks(formattedLinks);
      } else {
        setLinks([]);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
      toast.error(t("links.fetchError"));
    } finally {
      setIsLoadingLinks(false);
    }
  }, [workspaceId, t]);

  // Fetch links when component mounts or workspaceId changes
  React.useEffect(() => {
    fetchLinks();
    // Uncomment when API endpoint is available
    // fetchDomains();
  }, [fetchLinks]);

  // Calculate workspace info based on actual data
  const workspaceInfo = {
    name: workspaceTitle,
    totalLinks: links.length,
    totalClicks: links.reduce((sum, link) => sum + link.clicks, 0),
  };

  const handleCreateLinkSuccess = (newLink: LinkData) => {
    setLinks([newLink, ...links]);
    // Refresh links list to make sure we have the latest data
    fetchLinks();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("links.copied"));
  };

  const openSettingsDialog = (linkId: string) => {
    setSelectedLinkId(linkId);
    setSettingsDialogOpen(true);
  };

  const selectedLink = selectedLinkId
    ? links.find((link) => link.id === selectedLinkId)
    : null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col min-h-full pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{workspaceInfo.name}</h1>

        <LinkDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          workspaceId={workspaceId}
          onSuccess={handleCreateLinkSuccess}
          apiUrls={{
            CREATE: API_URLS.URL.CREATE
          }}
          domains={domains}
          trigger={
            <Button>
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              {t("links.create")}
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.totalLinks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspaceInfo.totalLinks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.totalClicks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceInfo.totalClicks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.clickRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceInfo.totalLinks
                ? Math.round(
                    workspaceInfo.totalClicks / workspaceInfo.totalLinks
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{t("links.recent")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("links.recentDescription")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoadingLinks ? (
            <div className="flex justify-center p-8">
              <Icon
                icon="lucide:loader-2"
                className="h-8 w-8 animate-spin text-muted-foreground"
              />
            </div>
          ) : links.length === 0 ? (
            <div className="rounded-lg border border-border/60 p-8 text-center">
              <Icon
                icon="lucide:link-off"
                className="mx-auto h-12 w-12 text-muted-foreground"
              />
              <h3 className="mt-4 text-lg font-medium">{t("links.empty")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("links.emptyDescription")}
              </p>
              <Button onClick={() => setDialogOpen(true)} className="mt-4">
                <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
                {t("links.create")}
              </Button>
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="rounded-lg border border-border/60 p-5 bg-card hover:bg-card/80 transition-all shadow-sm hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <UrlFavicon
                      url={link.original_url}
                      className="h-5 w-5 flex-shrink-0"
                    />
                    <h3 className="font-medium truncate">{link.domain_name + "/" + link.short_code}</h3>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex items-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(link.short_url)}
                      className="h-8 w-8"
                    >
                      <Icon icon="lucide:copy" className="h-4 w-4" />
                      <span className="sr-only">{t("links.copy")}</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openSettingsDialog(link.id)}
                      className="h-8 w-8"
                    >
                      <Icon icon="lucide:settings" className="h-4 w-4" />
                      <span className="sr-only">{t("links.settings")}</span>
                    </Button>
                  </div>
                </div>

                <p
                  className="text-sm text-muted-foreground truncate mt-2"
                  title={link.original_url}
                >
                  {link.original_url}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-sm">
                      <Icon
                        icon="lucide:mouse-pointer-click"
                        className="mr-1 h-4 w-4 text-muted-foreground"
                      />
                      {link.clicks} {t("links.clicks")}
                    </span>
                    <span className="hidden sm:inline text-sm text-muted-foreground">
                      {link.created_at}
                    </span>
                    {link.expires_at && (
                      <span className="hidden sm:inline text-sm text-amber-500">
                        <Icon
                          icon="lucide:alarm-clock"
                          className="mr-1 h-4 w-4 inline"
                        />
                        Expires: {link.expires_at ? formatDate(link.expires_at) : ''}
                      </span>
                    )}
                  </div>

                  <Button variant="outline" size="sm" className="sm:hidden">
                    <Icon icon="lucide:bar-chart-2" className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                    onClick={() =>
                      (window.location.href = `/dashboard/${workspaceId}/analytics/${link.id}`)
                    }
                  >
                    <Icon icon="lucide:bar-chart-2" className="mr-2 h-4 w-4" />
                    <span>{t("links.analytics")}</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <LinkDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        workspaceId={workspaceId}
        isEditMode={true}
        initialData={selectedLink || undefined}
        onSuccess={(link) => {
          // If the link was deleted
          if (link && selectedLinkId) {
            setLinks(links.filter((l) => l.id !== link.id));
          } else if (link) {
            // If the link was updated
            setLinks(
              links.map((l) => (l.id === link.id ? link : l))
            );
          }
          // Refresh links list to get the latest data
          fetchLinks();
        }}
        apiUrls={{
          CREATE: API_URLS.URL.CREATE,
          UPDATE: API_URLS.URL.UPDATE,
          DELETE: API_URLS.URL.DELETE
        }}
        domains={domains}
      />
    </div>
  );
}
