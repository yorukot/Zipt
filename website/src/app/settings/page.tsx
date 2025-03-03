"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form validation
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// API
import API_URLS from "@/lib/api-urls";

// Define form schema with Zod
const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).refine(password => {
    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers;
  }, {
    message: "Password must include uppercase, lowercase letters and numbers",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Initialize form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: PasswordFormValues) {
    // Reset states
    setIsSubmitting(true);
    setSuccess(false);
    setError("");

    // Additional validation
    if (!values.currentPassword.trim()) {
      setError(t("Auth.error.please_enter_password"));
      setIsSubmitting(false);
      return;
    }

    // Check if new password meets requirements
    if (values.newPassword.length < 8) {
      setError(t("Auth.error.password_min_length"));
      setIsSubmitting(false);
      return;
    }

    // Check if passwords match
    if (values.newPassword !== values.confirmPassword) {
      setError(t("Auth.error.passwords_dont_match"));
      setIsSubmitting(false);
      return;
    }

    // Check if new password is different from current password
    if (values.currentPassword === values.newPassword) {
      setError(t("Auth.error.password_same_as_current"));
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare request data
      const requestData = {
        current_password: values.currentPassword,
        new_password: values.newPassword,
      };

      // Log request (for development only, remove in production)
      console.log("Sending password change request");

      const response = await fetch(API_URLS.AUTH.CHANGE_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      // Check for specific error responses
      if (!response.ok) {
        // Handle different error cases
        if (response.status === 401) {
          throw new Error(t("Auth.error.unauthorized"));
        } else if (response.status === 400 && data.code === "invalid_password") {
          throw new Error(t("Auth.error.invalid_credentials"));
        } else {
          throw new Error(data.message || t("Settings.password.error"));
        }
      }

      // Success
      setSuccess(true);
      form.reset();
      toast.success(t("Settings.password.success"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Global.error.unexpected_error"));
      toast.error(t("Settings.password.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Settings.password.title")}</CardTitle>
        <CardDescription>{t("Settings.password.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>{t("Settings.password.successTitle")}</AlertTitle>
                <AlertDescription>
                  {t("Settings.password.successMessage")}
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("Settings.password.errorTitle")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="max-w-md">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>{t("Settings.password.current")}</FormLabel>
                    <FormControl>
                      <Input type="password" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>{t("Settings.password.new")}</FormLabel>
                    <FormControl>
                      <Input type="password" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("Auth.password.requirements")}
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>{t("Settings.password.confirm")}</FormLabel>
                    <FormControl>
                      <Input type="password" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("Settings.password.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 