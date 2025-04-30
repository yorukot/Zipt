"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import API_URLS from "@/lib/api-urls";

// Zod schema for display name form
const displayNameSchema = z.object({
  displayName: z
    .string()
    .min(3, {
      message: "Display name must be at least 3 characters",
    })
    .max(50, {
      message: "Display name cannot exceed 50 characters",
    }),
});

// Zod schema for email form
const emailSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

// Zod schema for password form
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current password is required",
    }),
    newPassword: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters",
      })
      .max(128, {
        message: "Password cannot exceed 128 characters",
      }),
    confirmPassword: z.string().min(8, {
      message: "Please confirm your password",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type DisplayNameFormValues = z.infer<typeof displayNameSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations("Profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingDisplayName, setIsUpdatingDisplayName] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Initialize forms
  const displayNameForm = useForm<DisplayNameFormValues>({
    resolver: zodResolver(displayNameSchema),
    defaultValues: {
      displayName: "",
    },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Load user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true);
        const response = await fetch(API_URLS.USER.PROFILE, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUserProfile(data);

        // Set initial values for the forms
        displayNameForm.setValue("displayName", data.display_name);
        emailForm.setValue("email", data.email);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [router]);

  // Handle display name update
  const onSubmitDisplayName = async (values: DisplayNameFormValues) => {
    try {
      setIsUpdatingDisplayName(true);
      const response = await fetch(API_URLS.USER.PROFILE + "/display-name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: values.displayName,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update display name");
      }

      toast.success("Display name updated successfully");
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          display_name: values.displayName,
        });
      }
    } catch (error) {
      console.error("Error updating display name:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update display name");
      }
    } finally {
      setIsUpdatingDisplayName(false);
    }
  };

  // Handle email update
  const onSubmitEmail = async (values: EmailFormValues) => {
    try {
      setIsUpdatingEmail(true);
      const response = await fetch(API_URLS.USER.PROFILE + "/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update email");
      }

      toast.success("Email updated successfully");
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          email: values.email,
        });
      }
    } catch (error) {
      console.error("Error updating email:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update email");
      }
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Handle password update
  const onSubmitPassword = async (values: PasswordFormValues) => {
    try {
      setIsUpdatingPassword(true);
      const response = await fetch(API_URLS.AUTH.CHANGE_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: values.currentPassword,
          new_password: values.newPassword,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }

      toast.success("Password updated successfully");
      // Clear password fields
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-10">
        <div className="flex flex-col items-center gap-2">
          <Icon
            icon="lucide:loader-2"
            className="h-8 w-8 animate-spin text-primary"
          />
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="container py-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <Button variant="outline" onClick={handleBackToDashboard}>
            <Icon icon="lucide:chevron-left" className="mr-2 h-4 w-4" />
            {t("backToDashboard")}
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Display Name Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t("displayName.title")}</CardTitle>
              <CardDescription>{t("displayName.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...displayNameForm}>
                <form
                  onSubmit={displayNameForm.handleSubmit(onSubmitDisplayName)}
                  className="space-y-4"
                >
                  <FormField
                    control={displayNameForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("displayName.label")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("displayName.placeholder")}
                            {...field}
                            autoComplete="name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={
                      isUpdatingDisplayName ||
                      !displayNameForm.formState.isDirty
                    }
                  >
                    {isUpdatingDisplayName && (
                      <Icon
                        icon="lucide:loader-2"
                        className="mr-2 h-4 w-4 animate-spin"
                      />
                    )}
                    {t("displayName.submit")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t("email.title")}</CardTitle>
              <CardDescription>{t("email.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("email.label")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("email.placeholder")}
                            type="email"
                            {...field}
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isUpdatingEmail || !emailForm.formState.isDirty}
                  >
                    {isUpdatingEmail && (
                      <Icon
                        icon="lucide:loader-2"
                        className="mr-2 h-4 w-4 animate-spin"
                      />
                    )}
                    {t("email.submit")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t("password.title")}</CardTitle>
              <CardDescription>{t("password.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("password.current")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("password.new")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("password.confirm")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={
                      isUpdatingPassword || !passwordForm.formState.isDirty
                    }
                  >
                    {isUpdatingPassword && (
                      <Icon
                        icon="lucide:loader-2"
                        className="mr-2 h-4 w-4 animate-spin"
                      />
                    )}
                    {t("password.submit")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
