"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"

interface AuthLayoutProps {
  children: React.ReactNode
  type: "login" | "register"
}

export function AuthLayout({ children, type }: AuthLayoutProps) {
  const t = useTranslations("Auth")

  return (
    <>
      <div className="flex items-center justify-center mb-8">
        <Logo 
          iconClassName="h-10 w-10" 
          textClassName="text-2xl"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {type === "login" ? t("login.title") : t("register.title")}
          </CardTitle>
          <CardDescription>
            {type === "login" ? t("login.description") : t("register.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <div className="text-sm text-muted-foreground text-center">
            {type === "login" ? (
              <>
                {t("login.noAccount")}{" "}
                <a href="/auth/register" className="text-primary hover:underline">
                  {t("login.createAccount")}
                </a>
              </>
            ) : (
              <>
                {t("register.haveAccount")}{" "}
                <a href="/auth/login" className="text-primary hover:underline">
                  {t("register.login")}
                </a>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  )
} 