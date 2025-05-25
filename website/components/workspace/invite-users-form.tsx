"use client";

import { useState } from "react";
// useForm and zodResolver imports removed as they're not used
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import * as z from "zod";
import API_URLS from "@/lib/api-urls";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
// FormLabel import removed as it's not used
import { Input } from "@/components/ui/input";
// cn import removed as it's not used

// Email validation schema
const emailSchema = z.string().email({
  message: "Please enter a valid email address",
});

// Type for invited user
interface InvitedUser {
  email: string;
}

interface InviteUsersFormProps {
  workspaceId: string;
  onFinish: () => Promise<void> | void;
}

export function InviteUsersForm({ workspaceId, onFinish }: InviteUsersFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const t = useTranslations("Workspace.invite");

  async function handleFinish() {
    setIsLoading(true);
    try {
      // No need to send invitations again since they've already been sent
      // Just call the finish callback
      await onFinish();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("errors.unexpected"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    try {
      const validatedEmail = emailSchema.parse(inviteEmail);

      // Check if email is already in the list
      if (invitedUsers.some((user) => user.email === validatedEmail)) {
        setEmailError(t("errors.alreadyInvited"));
        return;
      }

      setIsInviting(true);
      setEmailError(null);

      try {
        // Step 1: Find user by email using the API endpoint
        const userSearchResponse = await fetch(
          `${API_URLS.USER.SEARCH}?email=${encodeURIComponent(validatedEmail)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!userSearchResponse.ok) {
          // Show error toast and return early
          toast.error(t("errors.userNotFound", { email: validatedEmail }));
          setInviteEmail("");
          return;
        }

        const userResult = await userSearchResponse.json();
        if (!userResult || !userResult.id) {
          // Show error toast and return early
          toast.error(t("errors.userNotFound", { email: validatedEmail }));
          setInviteEmail("");
          return;
        }

        // Step 2: Send invitation directly
        const inviteResponse = await fetch(
          API_URLS.WORKSPACE.INVITE(workspaceId),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userResult.id,
            }),
            credentials: "include",
          }
        );

        if (!inviteResponse.ok) {
          // Show error toast and return early
          toast.error(t("errors.inviteFailed", { email: validatedEmail }));
          setInviteEmail("");
          return;
        }

        // Step 3: Add to list only if successfully invited
        setInvitedUsers((currentUsers) => [
          ...currentUsers,
          {
            email: validatedEmail
          }
        ]);

        toast.success(t("userReady", { email: validatedEmail }));
        setInviteEmail("");
      } catch (error) {
        console.error(t("errors.inviteError"), error);
        toast.error(t("errors.inviteFailed", { email: validatedEmail }));
      } finally {
        setIsInviting(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      }
    }
  }

  return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="email"
            placeholder={t("invitePlaceholder")}
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={isLoading || isInviting}
            className="flex-grow h-10"
          />
          <Button
            type="button"
            onClick={handleInvite}
            disabled={isLoading || isInviting || !inviteEmail}
            variant="outline"
            className="min-w-[80px]"
          >
            {isInviting ? (
              <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("inviteButton")}
          </Button>
        </div>
        {emailError && (
          <p className="text-sm font-medium text-destructive">{emailError}</p>
        )}

        {invitedUsers.length > 0 && (
          <div className="mt-4 border rounded-lg p-4 bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              {t("invitedMembers")}
            </p>
            <div className="space-y-2">
              {invitedUsers.map((user) => (
                <div
                  key={user.email}
                  className="flex items-center justify-between rounded-md border px-4 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      icon="lucide:check-circle"
                      className="h-4 w-4 text-primary"
                    />
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline"
          onClick={onFinish}
          className="flex-1"
        >
          {t("skipButton")}
        </Button>
        <Button 
          onClick={handleFinish}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading && (
            <Icon icon="lucide:loader-2" className="mr-2 h-5 w-5 animate-spin" />
          )}
          {t("finishButton")}
        </Button>
      </div>
    </div>
  );
} 