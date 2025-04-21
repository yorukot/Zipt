"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UrlFavicon } from "@/components/url-favicon";

// Mock data for links - replace with API call later
const mockLinks = [
  {
    id: "1",
    shortUrl: "zipt.sh/abc123",
    originalUrl:
      "https://example.com/very/long/url/that/needs/shortening/for/social/media/marketing/campaign",
    clicks: 245,
    createdAt: "2023-08-15",
  },
  {
    id: "2",
    shortUrl: "zipt.sh/def456",
    originalUrl: "https://another-example.com/some/long/path",
    clicks: 128,
    createdAt: "2023-08-14",
  },
  {
    id: "3",
    shortUrl: "zipt.sh/ghi789",
    originalUrl: "https://yet-another-example.com/very/long/url",
    clicks: 57,
    createdAt: "2023-08-13",
  },
];

export default function DashboardPage() {
  const [url, setUrl] = React.useState("");
  const [customSlug, setCustomSlug] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [links, setLinks] = React.useState(mockLinks);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const [selectedLinkId, setSelectedLinkId] = React.useState<string | null>(
    null
  );
  const params = useParams();
  const t = useTranslations("Dashboard");
  const workspaceId = params.workspaceId as string;

  // Mock workspace info - replace with API call later
  const workspaceInfo = {
    name:
      workspaceId === "workspace-1"
        ? "My Personal Workspace"
        : workspaceId === "workspace-2"
        ? "Marketing Team"
        : "Development",
    totalLinks: links.length,
    totalClicks: links.reduce((sum, link) => sum + link.clicks, 0),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a random short code
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let shortCode = "";
      for (let i = 0; i < 6; i++) {
        shortCode += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      // Use custom slug if provided
      const slug = customSlug || shortCode;

      // Add new link to the list
      const newLink = {
        id: Date.now().toString(),
        shortUrl: `zipt.sh/${slug}`,
        originalUrl: url,
        clicks: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setLinks([newLink, ...links]);
      setUrl("");
      setCustomSlug("");
      setDialogOpen(false);

      // Show success message
      toast.success(t("links.created"));
    } catch {
      toast.error(t("links.error"));
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="flex flex-col min-h-full pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{workspaceInfo.name}</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              {t("links.create")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("links.create")}</DialogTitle>
              <DialogDescription>
                {t("links.createDescription")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("links.longUrl")}
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("links.customSlug")}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 text-sm text-muted-foreground">
                    zipt.sh/
                  </div>
                  <Input
                    placeholder="custom-slug (optional)"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading || !url}>
                  {isLoading && (
                    <Icon
                      icon="lucide:loader-2"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                  )}
                  {t("links.shorten")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
            <p className="text-sm text-muted-foreground">{t("links.recentDescription")}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="rounded-lg border border-border/60 p-5 bg-card hover:bg-card/80 transition-all shadow-sm hover:shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <UrlFavicon url={link.originalUrl} className="h-5 w-5 flex-shrink-0" />
                  <h3 className="font-medium truncate">{link.shortUrl}</h3>
                </div>
                <div className="ml-2 flex-shrink-0 flex items-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(link.shortUrl)}
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
                title={link.originalUrl}
              >
                {link.originalUrl}
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
                    {link.createdAt}
                  </span>
                </div>

                <Button variant="outline" size="sm" className="sm:hidden">
                  <Icon icon="lucide:bar-chart-2" className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Icon icon="lucide:bar-chart-2" className="mr-2 h-4 w-4" />
                  <span>{t("links.analytics")}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("links.settings")}</DialogTitle>
            <DialogDescription>
              {selectedLink && <span>{selectedLink.shortUrl}</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("links.longUrl")}
              </label>
              <Input
                type="url"
                defaultValue={selectedLink?.originalUrl}
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("links.customSlug")}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 text-sm text-muted-foreground">
                  zipt.sh/
                </div>
                <Input
                  defaultValue={selectedLink?.shortUrl.replace("zipt.sh/", "")}
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("links.created")}
              </label>
              <div className="rounded-md border p-4">
                <div className="flex justify-between">
                  <span>{t("links.clicks")}</span>
                  <span className="font-medium">{selectedLink?.clicks}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>{t("links.created")}</span>
                  <span className="font-medium">{selectedLink?.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="space-x-2">
            <Button variant="destructive">
              <Icon icon="lucide:trash" className="mr-2 h-4 w-4" />
              {t("links.delete")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(false)}
            >
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
