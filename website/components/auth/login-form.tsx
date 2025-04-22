"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import API_URLS from "@/lib/api-urls"

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

// Login form schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
})

// Type for login values
export type LoginValues = z.infer<typeof loginSchema>

export type LoginFormErrors = {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginFormProps {
  onSuccessRedirect?: string;
  onLoginSuccess?: () => void;
}

export function LoginForm({ onSuccessRedirect, onLoginSuccess }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = onSuccessRedirect || searchParams.get("returnUrl") || "/dashboard"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations("Auth")
  
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { 
      email: "", 
      password: "" 
    }
  })

  async function handleSubmit(values: LoginValues) {
    if (isSubmitting) return // Prevent multiple submissions
    
    setIsSubmitting(true)

    try {
      const response = await fetch(API_URLS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        credentials: "include", // Important to include cookies
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle API error responses
        if (data.error === "ErrInvalidCredentials") {
          form.setError("root", {
            message: t("errors.invalidCredentials")
          })
        } else {
          form.setError("root", {
            message: data.message || t("errors.loginFailed")
          })
        }
        return
      }

      // Login successful - redirect to returnUrl or dashboard
      if (onLoginSuccess) {
        onLoginSuccess()
      }
      
      router.push(returnUrl)
      router.refresh() // Refresh to ensure auth state is updated
    } catch (err) {
      console.error("Login error:", err)
      form.setError("root", {
        message: t("errors.unexpectedError")
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root && (
            <div className="text-sm text-destructive">{form.formState.errors.root.message}</div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("login.submit")}
          </Button>
        </form>
      </Form>
    </div>
  )
} 