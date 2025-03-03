"use client";

import { format } from "date-fns";
import { CalendarIcon, LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import API_URLS from "@/lib/api-urls";
import { cn } from "@/lib/utils";
import { Url } from "@/types/url";

interface UrlDialogProps {
  open: boolean;
  onClose: () => void;
  editUrl?: Url | null;
  onSuccess: () => void;
}

// Define type for URL payload
interface UrlPayload {
  original_url: string;
  short_code?: string;
  expiration_date?: string;
}

export function UrlDialog({
  open,
  onClose,
  editUrl,
  onSuccess,
}: UrlDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [useExpiration, setUseExpiration] = useState(false);

  // Reset form or populate with edit data when dialog opens/changes
  useEffect(() => {
    if (editUrl) {
      setUrl(editUrl.original_url || "");
      setCustomCode(editUrl.short_code || "");
      setUseCustomCode(true);

      if (editUrl.expires_at) {
        setExpiresAt(new Date(editUrl.expires_at));
        setUseExpiration(true);
      } else {
        setExpiresAt(undefined);
        setUseExpiration(false);
      }
    } else {
      // Reset form for new URL
      setUrl("");
      setCustomCode("");
      setUseCustomCode(false);
      setExpiresAt(undefined);
      setUseExpiration(false);
    }
  }, [editUrl, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast.error(t("Dashboard.url.error.url_required"));
      return;
    }

    setLoading(true);

    try {
      const payload: UrlPayload = {
        original_url: url,
      };

      if (useCustomCode && customCode) {
        payload.short_code = customCode;
      }

      if (useExpiration && expiresAt) {
        payload.expiration_date = expiresAt.toISOString();
      }

      const endpoint = editUrl
        ? `${API_URLS.URL.UPDATE}/${editUrl.short_code}`
        : API_URLS.URL.CREATE;

      const method = editUrl ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          editUrl ? t("Dashboard.url.updated") : t("Dashboard.url.created"),
          {
            description: editUrl
              ? t("Dashboard.url.updated_description")
              : t("Dashboard.url.created_description"),
          },
        );
        onSuccess();
        onClose();
      } else {
        throw new Error(data.message || "An error occurred");
      }
    } catch (error) {
      toast.error(
        editUrl
          ? t("Dashboard.url.error.update_failed")
          : t("Dashboard.url.error.create_failed"),
        {
          description: error instanceof Error ? error.message : String(error),
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LinkIcon className="h-5 w-5" />
            {editUrl ? t("Dashboard.url.edit") : t("Dashboard.url.create_new")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              {t("Dashboard.url.destination")}
            </Label>
            <Textarea
              id="url"
              placeholder="https://example.com/long-url-to-shorten"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              rows={3}
              className="resize-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
            <Switch
                  id="useCustomCode"
                  checked={useCustomCode}
                  onCheckedChange={setUseCustomCode}
                />

              <Label htmlFor="custom-code" className="text-sm font-medium">
                {t("Dashboard.url.custom_code")}
              </Label>
            </div>

            {useCustomCode && (
              <div className="flex mt-2">
                <div className="bg-muted px-3 py-2 rounded-l-md flex items-center text-muted-foreground text-sm border-y border-l">
                  {typeof window !== "undefined" ? window.location.host : ""}/
                </div>
                <Input
                  id="custom-code"
                  placeholder="custom-code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="rounded-l-none focus:ring-2 focus:ring-primary"
                  disabled={!useCustomCode}
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="useExpiration"
                checked={useExpiration}
                onCheckedChange={setUseExpiration}
              />
              <Label htmlFor="expiration" className="text-sm font-medium">
                {t("Dashboard.url.expiration")}
              </Label>
              <div className="flex items-center space-x-2"></div>
            </div>

            {useExpiration && (
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiresAt && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiresAt
                        ? format(expiresAt, "PPP")
                        : t("Dashboard.url.pick_date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expiresAt}
                      onSelect={setExpiresAt}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {t("Dashboard.url.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("Dashboard.url.processing")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                {editUrl
                  ? t("Dashboard.url.update")
                  : t("Dashboard.url.create")}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
