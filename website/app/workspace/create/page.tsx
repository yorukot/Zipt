"use client";

import { useRouter } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const t = useTranslations("Workspace.create");

  async function handleWorkspaceCreated(workspaceId: string) {
    toast.success(t("success"));
    // Navigate to the invite page for this workspace
    router.push(`/workspace/${workspaceId}/invite`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <WorkspaceLayout type="create">
          <CreateWorkspaceForm onSuccess={handleWorkspaceCreated} />
        </WorkspaceLayout>
      </div>
    </div>
  );
}
