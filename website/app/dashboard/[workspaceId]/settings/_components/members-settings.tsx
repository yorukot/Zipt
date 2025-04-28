"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Member {
  name: string;
  email: string;
  role: string;
}

interface MembersSettingsProps {
  workspaceSettings: {
    members: Member[];
  }
}

export function MembersSettings({ workspaceSettings }: MembersSettingsProps) {
  const t = useTranslations("Dashboard")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.teamMembers")}</CardTitle>
        <CardDescription>
          {t("settings.teamMembersDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Input 
              placeholder={t("settings.inviteEmail")}
              className="max-w-sm"
            />
            <Button>
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              {t("settings.inviteMember")}
            </Button>
          </div>
          
          <div className="rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 font-medium">
                <div>{t("settings.name")}</div>
                <div>{t("settings.email")}</div>
                <div>{t("settings.role")}</div>
              </div>
            </div>
            <div className="divide-y">
              {workspaceSettings.members.map((member, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 p-4">
                  <div>{member.name}</div>
                  <div className="text-muted-foreground">{member.email}</div>
                  <div className="flex items-center justify-between">
                    <span>{member.role}</span>
                    {member.role !== "Owner" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icon icon="lucide:more-horizontal" className="h-4 w-4" />
                        <span className="sr-only">{t("settings.memberOptions")}</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 