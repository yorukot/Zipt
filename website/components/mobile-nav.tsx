"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Icon } from "@iconify/react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const t = useTranslations("Header")

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Icon icon="lucide:menu" className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
        <div className="flex flex-col h-full mt-5">
          <div className="flex-1 space-y-4 p-6">
            <nav className="grid gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                <Icon icon="lucide:home" className="h-4 w-4" />
                {t("home")}
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                <Icon icon="lucide:info" className="h-4 w-4" />
                {t("about")}
              </Link>
              <Link
                href="/services"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                <Icon icon="lucide:settings" className="h-4 w-4" />
                {t("services")}
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                <Icon icon="lucide:mail" className="h-4 w-4" />
                {t("contact")}
              </Link>
            </nav>
          </div>

          <Separator className="mx-6" />

          <div className="space-y-4 p-6">
            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              <Icon icon="lucide:log-in" className="h-4 w-4" />
              {t("login")}
            </Link>
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Icon icon="lucide:user-plus" className="h-4 w-4" />
              {t("signup")}
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 