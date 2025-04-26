import { ReactNode } from "react"
import { useTranslations } from "next-intl"

interface WorkspaceLayoutProps {
  children: ReactNode
  type: "create" | "invite"
}

export function WorkspaceLayout({ children, type }: WorkspaceLayoutProps) {
  const t = useTranslations("Workspace")

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t(`${type}.title`)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t(`${type}.description`)}
        </p>
      </div>
      {children}
    </div>
  )
} 