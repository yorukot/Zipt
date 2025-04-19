"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const t = useTranslations("Header.theme")
  const [mounted, setMounted] = React.useState(false)
  
  // Avoid hydration mismatch by rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // If not mounted yet, use a placeholder that takes the same space
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <span className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Theme</span>
      </Button>
    )
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Icon
            icon="lucide:sun"
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Icon
            icon="lucide:moon"
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span className="sr-only">
            {currentTheme === 'dark' ? t("light") : t("dark")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Icon icon="lucide:sun" className="mr-2 h-4 w-4" />
          <span>{t("light")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Icon icon="lucide:moon" className="mr-2 h-4 w-4" />
          <span>{t("dark")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Icon icon="lucide:laptop" className="mr-2 h-4 w-4" />
          <span>{t("system")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 