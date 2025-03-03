"use client";

import { format, formatDistanceToNow } from "date-fns";
import { enUS, zhTW } from "date-fns/locale";
// Icons
import {
  BarChart3,
  Calendar,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Link as LinkIcon,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import useSWR from "swr";

import { useState } from "react";

import { UrlDialog } from "@/components/dashboard/url-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// shadcn components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import API_URLS from "@/lib/api-urls";
// Types
import { ListUrlsResponse, Url } from "@/types/url";

// Fetcher function for SWR with authentication
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const data = await response.json();
    error.message = data.message || "Failed to load URLs";
    throw error;
  }

  return response.json();
};

export default function DashboardPage() {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Url>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const locale = useLocale();

  // Sidebar state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [urlToEdit, setUrlToEdit] = useState<Url | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<Url | null>(null);

  // Use SWR for data fetching
  const { 
    data, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error, 
    isLoading, 
    mutate 
  } = useSWR<ListUrlsResponse>(
    API_URLS.URL.LIST,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    },
  );

  const urls = data?.result?.urls || [];
  const dateLocale = locale === "zh-tw" ? zhTW : enUS;

  const handleCopy = (shortCode: string) => {
    const fullUrl = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl).then(
      () => {
        toast.success(t("Dashboard.url.copied"), {
          description: t("Dashboard.url.copied_description"),
        });
      },
      () => {
        toast.error(t("Dashboard.error.copy_failed"));
      },
    );
  };

  const handleDeleteClick = (url: Url) => {
    setUrlToDelete(url);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!urlToDelete) return;

    try {
      const response = await fetch(
        `${API_URLS.URL.DELETE}/${urlToDelete.short_code}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(t("Dashboard.error.delete_failed"));
      }

      toast.success(t("Dashboard.url.deleted"), {
        description: t("Dashboard.url.deleted_description"),
      });

      setShowDeleteDialog(false);
      mutate();
    } catch (error) {
      toast.error(t("Dashboard.error.delete_failed"), {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleEdit = (url: Url) => {
    setUrlToEdit(url);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setUrlToEdit(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUrlToEdit(null);
  };

  // Keeping handleSort but commenting out since it might be needed in the future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSort = (field: keyof Url) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter URLs based on search term
  const filteredUrls = urls.filter((url) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      url.original_url?.toLowerCase().includes(searchTermLower) ||
      url.short_code?.toLowerCase().includes(searchTermLower)
    );
  });

  // Sort URLs based on sort field and direction
  const sortedUrls = [...filteredUrls].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || bValue === undefined) {
      return 0;
    }

    if (sortField === "click_count") {
      return sortDirection === "asc"
        ? (a.click_count || 0) - (b.click_count || 0)
        : (b.click_count || 0) - (a.click_count || 0);
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue, locale)
        : bValue.localeCompare(aValue, locale);
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue, locale)
        : bValue.localeCompare(aValue, locale);
    }

    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">{t("Dashboard.title")}</h1>
        <Button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("Dashboard.url.create_new")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("Dashboard.url.your_urls")}</CardTitle>
          <CardDescription>
            {t("Dashboard.url.manage_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="relative w-full flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder={t("Dashboard.url.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="hidden sm:block">
              <Button
                disabled={isLoading}
                variant="outline"
                size="icon"
                onClick={() => mutate()}
                title={t("Dashboard.url.refresh")}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <Skeleton className="h-5 w-32 mb-3" />
                    <Skeleton className="h-4 w-full mb-5" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                  <div className="border-t">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedUrls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full mb-4">
                <LinkIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">
                {t("Dashboard.url.no_urls")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                {t("Dashboard.url.no_urls_description")}
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t("Dashboard.url.create_first")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedUrls.map((url) => (
                <div key={url.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="group">
                        <div className="flex items-center gap-1">
                          <div className="font-medium truncate max-w-[180px]">
                            {url.short_code}
                          </div>
                        </div>

                        {url.expires_at && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="outline"
                                className="ml-1 border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                              >
                                <Clock className="h-3 w-3 mr-1" />{" "}
                                {t("Dashboard.url.expires")}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {format(new Date(url.expires_at), "PPP", {
                                  locale: dateLocale,
                                })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t("Dashboard.url.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleCopy(url.short_code)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {t("Dashboard.url.copy")}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`${window.location.origin}/${url.short_code}`}
                              target="_blank"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {t("Dashboard.url.visit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/analytics/${url.short_code}`}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              {t("Dashboard.url.analytics")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(url)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("Dashboard.url.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onSelect={() => handleDeleteClick(url)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            {t("Dashboard.url.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t("Dashboard.url.destination")}
                      </div>
                      <div className="truncate text-sm">{url.original_url}</div>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800">
                          <BarChart3 className="h-3 w-3 mr-1" />{" "}
                          {url.click_count}
                        </Badge>
                      </div>
                      <div
                        className="text-muted-foreground"
                        title={new Date(url.created_at).toLocaleString()}
                      >
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDistanceToNow(new Date(url.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t bg-muted/20">
                    <button
                      className="flex-1 p-2 text-xs flex justify-center items-center hover:bg-muted transition-colors border-r"
                      onClick={() => handleCopy(url.short_code)}
                    >
                      <Copy className="h-3 w-3 mr-1" />{" "}
                      {t("Dashboard.url.copy")}
                    </button>
                    <button
                      className="flex-1 p-2 text-xs flex justify-center items-center hover:bg-muted transition-colors border-r"
                      onClick={() => handleEdit(url)}
                    >
                      <Edit className="h-3 w-3 mr-1" />{" "}
                      {t("Dashboard.url.edit")}
                    </button>
                    <Link
                      href={`/dashboard/analytics/${url.short_code}`}
                      className="flex-1 p-2 text-xs flex justify-center items-center hover:bg-muted transition-colors"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />{" "}
                      {t("Dashboard.url.analytics")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-gray-500 border-t px-6 py-4">
          <div>
            {filteredUrls.length > 0 && (
              <span>
                {t("Dashboard.url.showing", {
                  count: filteredUrls.length,
                  total: urls.length,
                })}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* URL Dialog for creating/editing */}
      <UrlDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        editUrl={urlToEdit}
        onSuccess={mutate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Trash className="h-5 w-5 text-destructive" />
              {t("Dashboard.url.delete")}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-3">
                <p className="text-lg text-muted-foreground">
                  {t("Dashboard.url.confirm_delete")}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t("Dashboard.url.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("Dashboard.url.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
