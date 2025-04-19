"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Login form schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
})

// Register form schema
const registerSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Type for login values
type LoginValues = z.infer<typeof loginSchema>

// Type for register values
type RegisterValues = z.infer<typeof registerSchema>

// Props interface with generics to handle different form types
interface AuthFormProps {
  type: "login" | "register"
  onSubmit: (values: LoginValues | RegisterValues) => Promise<void> | void
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations("Auth")
  
  // For login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { 
      email: "", 
      password: "" 
    }
  })
  
  // For register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      displayName: "", 
      email: "", 
      password: "", 
      confirmPassword: "" 
    }
  })
  
  // Handle submit for login form
  async function handleLoginSubmit(values: LoginValues) {
    setIsLoading(true)
    try {
      await onSubmit(values)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle submit for register form
  async function handleRegisterSubmit(values: RegisterValues) {
    setIsLoading(true)
    try {
      await onSubmit(values)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
        {type === "login" ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("login.submit")}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("displayName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("displayNamePlaceholder")}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("register.submit")}
              </Button>
            </form>
          </Form>
        )}
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
  )
} 