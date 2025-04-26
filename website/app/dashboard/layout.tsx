"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { WorkspaceProvider, useWorkspace } from "@/lib/context/workspace-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { workspaces, isLoading, error } = useWorkspace();

  console.log(workspaces);

  // Simple redirect when no workspaces
  useEffect(() => {
    if (!isLoading && (!workspaces || workspaces.length === 0)) {
      redirect("/workspace/create");
    }
  }, [isLoading, workspaces]);

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
