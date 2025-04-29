"use client";

import { useEffect } from "react";
import { useRouter, useParams, redirect } from "next/navigation";
import { toast } from "sonner";
import {
  WorkspaceProvider,
  useWorkspace,
} from "@/lib/context/workspace-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { workspaces, isLoading, error } = useWorkspace();
  const router = useRouter();
  const params = useParams();
  const currentWorkspaceId = params.workspaceId as string;

  // Handle workspaces loading, validation and redirects
  useEffect(() => {
    if (isLoading) return;
  
    // Case 1: No workspaces available - redirect to create workspace page
    if (!workspaces || workspaces.length === 0) {
      redirect("/workspace/create");
      return;
    }

    // Case 2: No workspaceID in URL but workspaces exist - redirect to first workspace
    if (!currentWorkspaceId && workspaces.length > 0) {
      router.push(`/dashboard/${workspaces[0].id}`);
      return;
    }

    // Case 3: WorkspaceID provided but doesn't exist in user's workspaces - redirect to first valid workspace
    if (currentWorkspaceId) {
      const workspaceExists = workspaces.some(workspace => workspace.id === currentWorkspaceId);
      if (!workspaceExists) {
        toast.error("Workspace not found or you don't have access to it");
        router.push(`/dashboard/${workspaces[0].id}`);
        return;
      }
    }
  }, [isLoading, workspaces, currentWorkspaceId, router]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error("Error loading workspaces");
    }
  }, [error]);

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WorkspaceProvider>
      <DashboardContent>{children}</DashboardContent>
    </WorkspaceProvider>
  );
}
