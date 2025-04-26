"use client";

import { useParams, useRouter } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { InviteUsersForm } from "@/components/workspace/invite-users-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";


export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>()
  const t = useTranslations("Workspace.invite");
  const workspaceId = params.id;

  async function handleFinish() {
    toast.success(t("finishSuccess"));
    // Navigate to the dashboard
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <WorkspaceLayout type="invite">
          <InviteUsersForm workspaceId={workspaceId} onFinish={handleFinish} />
        </WorkspaceLayout>
      </div>
    </div>
  );
} 