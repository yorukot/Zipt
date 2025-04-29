import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

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

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onSuccess: (link: LinkData) => void;
  apiUrls: {
    CREATE: (workspaceId: string) => string;
    UPDATE?: (workspaceId: string, linkId: string) => string;
    DELETE?: (workspaceId: string, linkId: string) => string;
  };
  domains: DomainData[];
  isEditMode?: boolean;
  initialData?: LinkData;
  trigger?: React.ReactNode;
}

// Define the form schema with Zod
const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  customSlug: z.string().optional(),
  domainId: z.string().optional(),
  enableExpiration: z.boolean(),
  expirationDate: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LinkDialog({
  open,
  onOpenChange,
  workspaceId,
  onSuccess,
  apiUrls,
  domains = [],
  isEditMode = false,
  initialData,
  trigger,
}: LinkDialogProps) {
  const t = useTranslations("Dashboard.links");
  const commonT = useTranslations("Dashboard.common");
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Determine if this link has an expiration date
  const hasExpiration = !!initialData?.expires_at;
  
  // Extract expiration date from initial data if available
  const initialExpirationDate = initialData?.expires_at 
    ? new Date(initialData.expires_at) 
    : null;

  // Initialize React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: initialData?.original_url || "",
      customSlug: initialData?.short_code || "",
      domainId: undefined, // This would need to be populated if we have domain data
      enableExpiration: hasExpiration,
      expirationDate: initialExpirationDate,
    },
  });

  // Reset form when dialog closes or when initial data changes
  React.useEffect(() => {
    if (!open) {
      // Only reset if not in edit mode or if initialData has changed
      if (!isEditMode) {
        form.reset();
      }
    } else if (isEditMode && initialData) {
      // Update form when editing and initialData is available
      form.reset({
        url: initialData.original_url,
        customSlug: initialData.short_code,
        domainId: undefined, // Would need domain ID here if available
        enableExpiration: !!initialData.expires_at,
        expirationDate: initialData.expires_at ? new Date(initialData.expires_at) : null,
      });
    }
  }, [open, form, isEditMode, initialData]);

  // Watch for enableExpiration changes to conditionally render the date picker
  const enableExpiration = form.watch("enableExpiration");

  const onSubmit = async (data: FormValues) => {
    if (!data.url) return;
    
    setIsLoading(true);

    try {
      const payload: Record<string, any> = {
        original_url: data.url,
      };

      if (data.customSlug) {
        payload.short_code = data.customSlug;
      }

      if (data.domainId) {
        payload.domain_id = data.domainId;
      }

      if (data.enableExpiration && data.expirationDate) {
        payload.expires_at = data.expirationDate.toISOString();
      }

      let response;
      
      if (isEditMode && initialData?.id && apiUrls.UPDATE) {
        // Update existing link
        response = await fetch(apiUrls.UPDATE(workspaceId, initialData.id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new link
        response = await fetch(apiUrls.CREATE(workspaceId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process link");
      }

      const responseData = await response.json();

      // Create link object
      const linkData: LinkData = isEditMode && initialData
        ? {
            ...initialData,
            original_url: data.url,
            short_code: responseData.short_code || initialData.short_code,
            short_url: responseData.short_url || initialData.short_url,
            domain_name: responseData.domain_name || initialData.domain_name,
            expires_at: data.enableExpiration && data.expirationDate 
              ? data.expirationDate.toISOString() 
              : undefined,
          }
        : {
            id: responseData.id,
            short_code: responseData.short_code,
            original_url: responseData.original_url,
            short_url: responseData.short_url,
            domain_name: responseData?.domain_name || "",
            clicks: 0,
            created_at: new Date().toISOString().split("T")[0],
            expires_at: responseData.expires_at,
          };

      // Call success callback with the link data
      onSuccess(linkData);
      
      // Reset form and close dialog
      if (!isEditMode) {
        form.reset();
      }
      onOpenChange(false);

      // Show success message
      toast.success(isEditMode 
        ? t("updated") || "Link updated successfully!" 
        : t("created")
      );
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} link:`, error);
      toast.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData?.id || !apiUrls.DELETE) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(
        apiUrls.DELETE(workspaceId, initialData.id),
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      onOpenChange(false);
      toast.success(t("deleted") || "Link deleted successfully");
      
      // Call onSuccess with the deleted link to allow the parent to update UI
      onSuccess(initialData);
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete link");
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine dialog title and description based on mode
  const dialogTitle = isEditMode 
    ? t("settings") 
    : t("create");
  
  const dialogDescription = isEditMode
    ? initialData?.short_url || ""
    : t("createDescription");

  // Determine submit button text
  const submitButtonText = isEditMode
    ? commonT("save")
    : t("shorten");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("longUrl")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/very/long/url"
                      {...field}
                      type="url"
                      disabled={isEditMode && !initialData?.original_url}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customSlug")}</FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 text-sm text-muted-foreground">
                      zipt.sh/
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="custom-slug (optional)" 
                        {...field} 
                        disabled={isEditMode && !!initialData?.short_code}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domainId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={"0"}
                    disabled={isEditMode && !!initialData?.short_url?.includes("/")}
                  >
                    <FormControl defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a domain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{process.env.NEXT_PUBLIC_DEFAULT_DOMAIN}</SelectItem>
                      {domains
                        .filter((domain) => domain.verified)
                        .map((domain) => (
                          <SelectItem key={domain.id} value={domain.id}>
                            {domain.domain}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enableExpiration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Set expiration date</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {enableExpiration && (
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration date</FormLabel>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            onClick={(e) => e.stopPropagation()}
                            type="button"
                          >
                            <Icon
                              icon="lucide:calendar"
                              className="mr-2 h-4 w-4"
                            />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Link stats only shown in edit mode */}
            {isEditMode && initialData && (
              <FormItem>
                <FormLabel>{t("stats")}</FormLabel>
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">
                      {t("clicks")}
                    </span>
                    <span className="font-medium">{initialData.clicks}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t">
                    <span className="text-sm text-muted-foreground">{t("created")}</span>
                    <span className="font-medium">
                      {initialData.created_at}
                    </span>
                  </div>
                </div>
              </FormItem>
            )}
            
            <DialogFooter className={cn("pt-2", isEditMode ? "justify-between" : "")}>
              {isEditMode && apiUrls.DELETE && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isLoading}
                >
                  {isDeleting && (
                    <Icon
                      icon="lucide:loader-2"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                  )}
                  <Icon icon="lucide:trash" className="mr-2 h-4 w-4" />
                  {t("delete")}
                </Button>
              )}
              
              <div className="flex space-x-2">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    {commonT("close")}
                  </Button>
                )}
                <Button
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Icon
                      icon="lucide:loader-2"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                  )}
                  {submitButtonText}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// For backward compatibility, export CreateLinkDialog alias
export const CreateLinkDialog = (props: LinkDialogProps) => <LinkDialog {...props} />;
