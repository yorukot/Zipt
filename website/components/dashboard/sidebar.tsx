"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
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

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  }
}

export function Sidebar({ user }: SidebarProps) {
  const t = useTranslations("Dashboard")
  const pathname = usePathname()
  const params = useParams()
  const workspaceId = params.workspaceId as string

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

  return (
    <aside className="flex h-screen border-r">
      <div className="flex w-64 flex-col gap-2">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Icon icon="lucide:scissors" className="h-6 w-6" />
              <span className="text-xl font-bold">Zipt</span>
            </Link>
            <ThemeToggle />
          </div>
          <div className="mt-4">
            <Select 
              defaultValue={workspaceId}
              onValueChange={(value) => {
                window.location.href = `/dashboard/${value}`;
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("sidebar.selectWorkspace")} />
              </SelectTrigger>
              <SelectContent>
                {mockWorkspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
                <SelectItem value="new" className="text-primary">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:plus" className="h-4 w-4" />
                    {t("sidebar.newWorkspace")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
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
        <div className="mt-auto border-t p-4">
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