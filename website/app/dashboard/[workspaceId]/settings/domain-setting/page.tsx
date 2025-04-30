"use client";

import { useParams } from "next/navigation";

import { DomainSettings } from "../_components";

export default function DomainSettingsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return <DomainSettings workspaceId={workspaceId} />;
} 