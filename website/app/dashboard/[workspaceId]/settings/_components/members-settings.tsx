"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import API_URLS from "@/lib/api-urls";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Invitation {
  id: string;
  user_id: string;
  workspace_id: string;
  inviter_id: string;
  status: string;
  user_email?: string;
  user: User;
}

interface User {
  id: string;
  created_at: string;
  display_name: string;
  email: string;
}

interface MembersSettingsProps {
  workspaceSettings: {
    members: Member[];
  };
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function MembersSettings({ workspaceSettings }: MembersSettingsProps) {
  const t = useTranslations("Dashboard");
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [members, setMembers] = React.useState<Member[]>(
    workspaceSettings.members
  );
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  // const [isFetching, setIsFetching] = React.useState(false); // Unused for now
  // const [isSearching, setIsSearching] = React.useState(false); // Unused for now
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<Member | null>(
    null
  );
  const [currentUser, setCurrentUser] = React.useState<{ id: string } | null>(
    null
  );

  // Fetch current user profile on component mount
  React.useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch current user profile
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(API_URLS.USER.PROFILE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCurrentUser({ id: data.id });
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch workspace invitations
  const fetchWorkspaceInvitations = React.useCallback(async () => {
    try {
      // setIsFetching(true); // Commented out since setIsFetching is unused
      const response = await fetch(
        API_URLS.WORKSPACE.WORKSPACE_INVITATIONS(workspaceId),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invitations");
      }

      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast.error(t("settings.error"));
    } finally {
      // setIsFetching(false); // Commented out since setIsFetching is unused
    }
  }, [workspaceId, t]);

  // Fetch all users
  const fetchUsers = React.useCallback(async () => {
    try {
      // setIsSearching(true); // Commented out since setIsSearching is unused
      const response = await fetch(API_URLS.WORKSPACE.LIST_USERS(workspaceId), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspace users");
      }

      const data = await response.json();
      if (data) {
        // Map the response to the expected format with proper field names
        const workspaceUsers = data.map((user: {
          id: string;
          display_name?: string;
          name?: string;
          email?: string;
          role?: string;
          avatar?: string;
        }) => ({
          id: user.id,
          name: user.display_name || user.name || "Unknown User",
          email: user.email || "",
          role: user.role || "member",
          avatar: user.avatar,
        }));

        setMembers(workspaceUsers);
        setInviteEmail("");
      }
    } catch (error) {
      console.error("Error fetching workspace users:", error);
      toast.error(t("settings.failedToFetchUsers"));
    } finally {
      // setIsSearching(false); // Commented out since setIsSearching is unused
    }
  }, [workspaceId, t]);

  // Fetch invitations and users on component mount
  React.useEffect(() => {
    fetchWorkspaceInvitations();
    fetchUsers();
  }, [workspaceId, fetchWorkspaceInvitations, fetchUsers]);

  // Handle sending an invitation
  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      setIsLoading(true);

      // Search for the user first by email
      const userSearchResponse = await fetch(
        `${API_URLS.USER.SEARCH}?email=${encodeURIComponent(inviteEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      let userIdToInvite = null;

      // If we found the user, use their ID
      if (userSearchResponse.ok) {
        const userResult = await userSearchResponse.json();
        if (userResult && userResult.id) {
          userIdToInvite = userResult.id;
        }
      }

      // If we couldn't find a user, try inviting by email directly
      if (!userIdToInvite) {
        userIdToInvite = inviteEmail;
      }

      // Send the invitation with the user ID
      const response = await fetch(API_URLS.WORKSPACE.INVITE(workspaceId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userIdToInvite,
          email: inviteEmail,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invitation");
      }

      toast.success(t("settings.invitationSent"));
      setInviteEmail("");

      // Refresh invitations list
      fetchWorkspaceInvitations();
    } catch (error) {
      console.error("Error inviting member:", error);
      const errorMessage = error instanceof Error ? error.message : t("settings.error");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing a member
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    console.log(memberToRemove.id)
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URLS.WORKSPACE.GET(workspaceId)}/user/${memberToRemove.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove member");
      }

      toast.success(t("settings.memberRemoved"));

      // Update local state
      setMembers(members.filter((member) => member.id !== memberToRemove.id));
      setRemoveDialogOpen(false);
      setMemberToRemove(null);

      // Refresh available users as this member can now be invited again
      fetchUsers();
    } catch (error) {
      console.error("Error removing member:", error);
      const errorMessage = error instanceof Error ? error.message : t("settings.error");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle canceling an invitation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(
        `${API_URLS.WORKSPACE.GET(workspaceId)}/invitation/${invitationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success(t("settings.invitationCanceled"));

        // Update local state
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));

        // Refresh available users as this user can now be invited again
        fetchUsers();
      } else {
        throw new Error("Failed to cancel invitation");
      }
    } catch (error) {
      console.error("Error canceling invitation:", error);
      toast.error(t("settings.error"));
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.teamMembers")}</CardTitle>
          <CardDescription>
            {t("settings.teamMembersDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 max-w-sm">
                <Input
                  type="email"
                  placeholder={t("settings.inviteEmail")}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button
                onClick={handleInvite}
                disabled={isLoading || !inviteEmail}
                className="shrink-0"
              >
                {isLoading ? (
                  <Icon
                    icon="lucide:loader-2"
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                ) : (
                  <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
                )}
                {t("settings.inviteMember")}
              </Button>
            </div>

            <div className="rounded-lg border">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-3 gap-4 font-medium">
                  <div>{t("settings.name")}</div>
                  <div>{t("settings.email")}</div>
                  <div>{t("settings.role")}</div>
                </div>
              </div>
              <div className="divide-y">
                {members.map((member, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-4 p-4 items-center"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                    <div className="text-muted-foreground">{member.email}</div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          member.role === "owner" ? "default" : "secondary"
                        }
                      >
                        {member.role}
                      </Badge>
                      {member.role !== "owner" &&
                        currentUser?.id !== member.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Icon
                                  icon="lucide:more-horizontal"
                                  className="h-4 w-4"
                                />
                                <span className="sr-only">
                                  {t("settings.memberOptions")}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  console.log(member)
                                  setMemberToRemove(member);
                                  setRemoveDialogOpen(true);
                                }}
                              >
                                <Icon
                                  icon="lucide:user-minus"
                                  className="mr-2 h-4 w-4"
                                />
                                <span>{t("settings.removeMember")}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {invitations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-3">
                  {t("settings.pendingInvitations")}
                </h3>
                <div className="rounded-lg border">
                  <div className="divide-y">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {invitation.user?.display_name?.charAt(0) ||
                                (invitation.user_email &&
                                isValidEmail(invitation.user_email)
                                  ? invitation.user_email.charAt(0)
                                  : "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {invitation.user?.display_name ||
                                (invitation.user_email &&
                                isValidEmail(invitation.user_email)
                                  ? invitation.user_email
                                  : t("settings.unknownUser"))}
                            </span>
                            {invitation.user_email &&
                              isValidEmail(invitation.user_email) && (
                                <span className="text-sm text-muted-foreground">
                                  {invitation.user_email}
                                </span>
                              )}
                            <span className="text-xs text-muted-foreground">
                              ({invitation.status})
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <Icon icon="lucide:x" className="mr-1 h-4 w-4" />
                          {t("settings.cancel")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.removeMemberTitle")}</DialogTitle>
            <DialogDescription>
              {t("settings.removeMemberDescription")}
            </DialogDescription>
          </DialogHeader>
          <p className="py-4">
            {t("settings.removeMemberConfirm", {
              name: memberToRemove?.name || "",
            })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={isLoading}
            >
              {t("settings.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icon
                  icon="lucide:loader-2"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              ) : (
                <Icon icon="lucide:user-minus" className="mr-2 h-4 w-4" />
              )}
              {t("settings.removeMember")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
