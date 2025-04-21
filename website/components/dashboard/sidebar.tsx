"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data for workspaces - replace with API call later
const mockWorkspaces = [
  { id: "workspace-1", name: "My Personal Workspace" },
  { id: "workspace-2", name: "Marketing Team" },
  { id: "workspace-3", name: "Development" },
]

// Mock data for invitations
const mockInvitations = [
  { 
    id: "inv-1",
    workspaceName: "Design Team", 
    inviter: "Jane Smith", 
    inviterEmail: "jane@example.com"
  },
  { 
    id: "inv-2", 
    workspaceName: "Sales Department", 
    inviter: "Mike Johnson", 
    inviterEmail: "mike@example.com"
  }
]

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onClose?: () => void;
}

export function Sidebar({ user, onClose }: SidebarProps) {
  const t = useTranslations("Dashboard")
  const pathname = usePathname()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [invitations, setInvitations] = React.useState(mockInvitations)

  const routes = [
    {
      label: t("sidebar.links"),
      icon: "lucide:link",
      href: `/dashboard/${workspaceId}`,
      strict: true
    },
    {
      label: t("sidebar.analytics"),
      icon: "lucide:bar-chart-2",
      href: `/dashboard/${workspaceId}/analytics`,
    },
    {
      label: t("sidebar.settings"),
      icon: "lucide:settings",
      href: `/dashboard/${workspaceId}/settings`,
    },
  ]

  const handleAcceptInvite = (inviteId: string) => {
    // Mock API call to accept invitation
    toast.success(t("account.inviteAccepted"))
    setInvitations(invitations.filter(inv => inv.id !== inviteId))
  }

  const handleRejectInvite = (inviteId: string) => {
    // Mock API call to reject invitation
    toast.success(t("account.inviteRejected"))
    setInvitations(invitations.filter(inv => inv.id !== inviteId))
  }

  return (
    <aside className="flex h-full flex-col border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Fixed header section with close button on mobile */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Icon icon="lucide:scissors" className="h-6 w-6" />
              <span className="text-xl font-bold">Zipt</span>
            </Link>
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <LanguageSelector variant="icon-only" />
              
              {/* Theme toggle */}
              <ThemeToggle />
              
              {/* Close button on mobile */}
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="md:hidden"
                >
                  <Icon icon="lucide:x" className="h-5 w-5" />
                  <span className="sr-only">Close sidebar</span>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Select 
              defaultValue={workspaceId}
              onValueChange={(value) => {
                window.location.href = `/dashboard/${value}`;
              }}
            >
              <SelectTrigger className="w-full select-none">
                <SelectValue placeholder={t("sidebar.selectWorkspace")} />
              </SelectTrigger>
              <SelectContent>
                {mockWorkspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id} className="select-none">
                    {workspace.name}
                  </SelectItem>
                ))}
                <SelectItem value="new" className="text-primary select-none">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:plus" className="h-4 w-4" />
                    {t("sidebar.newWorkspace")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Show pending invitations if any */}
          {invitations.length > 0 && (
            <div className="mb-4 px-3">
              <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">
                {t("account.pendingInvitations")}
              </h3>
              <div className="space-y-2">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="rounded-md border bg-card p-3 text-sm">
                    <div className="mb-1 font-medium">{invitation.workspaceName}</div>
                    <div className="text-xs text-muted-foreground">
                      {t("account.invitedBy")}: {invitation.inviter}
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
                        onClick={() => handleAcceptInvite(invitation.id)}
                      >
                        {t("account.accept")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  {
                    "bg-accent": route.strict 
                      ? pathname === route.href 
                      : pathname.startsWith(route.href),
                  }
                )}
              >
                <Icon icon={route.icon} className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Fixed footer section */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-6 w-6 rounded-full" 
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                <Icon icon="lucide:chevron-up" className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("account.title")}</DropdownMenuLabel>
              <DropdownMenuItem>
                <Icon icon="lucide:user" className="mr-2 h-4 w-4" />
                {t("account.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon="lucide:settings" className="mr-2 h-4 w-4" />
                {t("account.settings")}
              </DropdownMenuItem>
              {invitations.length > 0 && (
                <DropdownMenuItem>
                  <Icon icon="lucide:mail" className="mr-2 h-4 w-4" />
                  {t("account.invitations")}
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {invitations.length}
                  </span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon icon="lucide:log-out" className="mr-2 h-4 w-4" />
                {t("account.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
} 