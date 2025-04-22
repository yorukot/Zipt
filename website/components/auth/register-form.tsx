"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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

// Type for register values
export type RegisterValues = z.infer<typeof registerSchema>

export type RegisterFormErrors = {
  email?: string;
  password?: string;
  displayName?: string;
  confirmPassword?: string;
  general?: string;
}

interface RegisterFormProps {
  onSuccessRedirect?: string;
  onRegisterSuccess?: () => void;
}

export function RegisterForm({ 
  onSuccessRedirect = "/workspace/create",
  onRegisterSuccess 
}: RegisterFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations("Auth")
  
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      displayName: "", 
      email: "", 
      password: "", 
      confirmPassword: "" 
    }
  })
  
  async function handleSubmit(values: RegisterValues) {
    if (isSubmitting) return // Prevent multiple submissions
    
    setIsSubmitting(true)
    // Clear any existing errors
    form.clearErrors()

    try {
      const response = await fetch(API_URLS.AUTH.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          display_name: values.displayName,
        }),
        credentials: "include", // Important to include cookies
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific API error responses
        if (data.error === "ErrEmailAlreadyUsed") {
          form.setError("email", {
            type: "server",
            message: t("errors.emailAlreadyUsed")
          })
          return
        } 
        
        if (data.error === "ErrBadRequest" && data.data?.details) {
          // Try to parse validation errors and map them to fields
          let hasSetError = false
          
          // This assumes the API returns details about which field failed validation
          if (data.data.details.includes("email")) {
            form.setError("email", {
              type: "server",
              message: t("errors.invalidEmail")
            })
            hasSetError = true
          }
          if (data.data.details.includes("password")) {
            form.setError("password", {
              type: "server",
              message: t("errors.invalidPassword")
            })
            hasSetError = true
          }
          if (data.data.details.includes("display_name")) {
            form.setError("displayName", {
              type: "server",
              message: t("errors.invalidDisplayName")
            })
            hasSetError = true
          }

          // If we couldn't map to specific fields, set a general error
          if (!hasSetError) {
            form.setError("root", {
              message: data.message || t("errors.invalidRegistration")
            })
          }
          
          return
        }
        
        // For any other errors, show a toast and set general error
        toast.error(data.message || t("errors.registrationFailed"))
        form.setError("root", {
          message: data.message || t("errors.registrationFailed")
        })
        return
      }

      // Registration successful
      toast.success(t("register.success"))
      
      // Call the success callback if provided
      if (onRegisterSuccess) {
        onRegisterSuccess()
      }
      
      // Redirect to workspace creation or specified path
      router.push(onSuccessRedirect)
    } catch (err) {
      console.error("Registration error:", err)
      toast.error(t("errors.unexpectedError"))
      form.setError("root", {
        message: t("errors.unexpectedError")
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("displayName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("displayNamePlaceholder")}
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("confirmPassword")}</FormLabel>
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
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t("register.submit")}
        </Button>
      </form>
    </Form>
  )
} 