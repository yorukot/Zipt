"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import useSWR from "swr"
import { Icon } from "@iconify/react"

import API_URLS from "@/lib/api-urls"
import { Button } from "@/components/ui/button"

// Invitation interface matching API response
export interface Invitation {
  id: string;
  workspace_id: string;
  user_id: string;
  inviter_id: string;
  status: string;
  workspace_name: string;
  inviter_name: string;
}

// API response interface
export interface ApiResponse<T> {
  result: T;
  success: boolean;
  message?: string;
}

// Fetch invitations from API
const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch invitations');
  }
  
  return response.json();
};

export function InvitationsPanel() {
  const t = useTranslations("Dashboard")
  
  // Fetch invitations with SWR and 10s polling
  const { data, mutate } = useSWR<ApiResponse<Invitation[]>>(
    API_URLS.WORKSPACE.USER_INVITATIONS,
    fetcher,
    { 
      refreshInterval: 10000, // 10 seconds
      fallbackData: { result: [], success: true } 
    }
  )

  // Extract invitations from the response
  const invitations = data?.result || []

  const handleAcceptInvite = async (inviteId: string, workspaceId: string) => {
    try {
      const response = await fetch(API_URLS.WORKSPACE.INVITATION_PROCESS(inviteId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      toast.success(t("account.inviteAccepted"))
      
      // Redirect to the new workspace
      window.location.href = `/dashboard/${workspaceId}`;
    } catch (error) {
      toast.error(t("account.inviteAcceptError"));
      console.error('Error accepting invitation:', error);
    }
  }

  const handleRejectInvite = async (inviteId: string) => {
    try {
      const response = await fetch(API_URLS.WORKSPACE.INVITATION_PROCESS(inviteId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!response.ok) {
        throw new Error('Failed to reject invitation');
      }

      toast.success(t("account.inviteRejected"))
      // Refresh invitations data
      mutate();
    } catch (error) {
      toast.error(t("account.inviteRejectError"));
      console.error('Error rejecting invitation:', error);
    }
  }

  // If there are no invitations, don't render anything
  if (invitations.length === 0) {
    return null
  }

  return (
    <div className="mb-4 px-3">
      <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">
        {t("account.pendingInvitations")}
      </h3>
      <div className="space-y-2">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="rounded-md border bg-card p-3 text-sm">
            <div className="mb-1 font-medium">{invitation.workspace_name}</div>
            <div className="text-xs text-muted-foreground">
              {t("account.invitedBy")}: {invitation.inviter_name}
            </div>
            <div className="mt-3 flex justify-end space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleRejectInvite(invitation.id)}
              >
                {t("account.reject")}
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleAcceptInvite(invitation.id, invitation.workspace_id)}
              >
                {t("account.accept")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Component that just returns count of invitations
export function InvitationCount() {
  const { data } = useSWR<ApiResponse<Invitation[]>>(
    API_URLS.WORKSPACE.USER_INVITATIONS,
    fetcher,
    { 
      refreshInterval: 10000,
      fallbackData: { result: [], success: true } 
    }
  )

  const invitations = data?.result || []
  const count = invitations.length
  
  if (count === 0) {
    return null
  }
  
  return (
    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
      {count}
    </span>
  )
} 