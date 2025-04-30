"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SettingsRedirect() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  useEffect(() => {
    router.replace(`/dashboard/${workspaceId}/settings/general-setting`);
  }, [router, workspaceId]);

  return null;
}
