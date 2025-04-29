"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import * as z from "zod"
import API_URLS from "@/lib/api-urls"
import { toast } from "sonner"

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

// Workspace creation schema
const workspaceSchema = z.object({
  name: z.string().min(2, {
    message: "Workspace name must be at least 2 characters",
  }),
})

// Type for workspace creation values
export type WorkspaceValues = z.infer<typeof workspaceSchema>

interface CreateWorkspaceFormProps {
  onSuccess: (workspaceId: string) => Promise<void> | void
}

export function CreateWorkspaceForm({ onSuccess }: CreateWorkspaceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations("Workspace.create")
  
  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { 
      name: "", 
    }
  })
  
  async function handleSubmit(values: WorkspaceValues) {
    setIsLoading(true)
    try {
      // Create the workspace
      const response = await fetch(API_URLS.WORKSPACE.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t("errors.createFailed"))
      }

      const workspace = await response.json()
      // Call the success callback with the new workspace ID
      await onSuccess(workspace.id)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(t("errors.unexpected"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">{t("nameLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("namePlaceholder")}
                  disabled={isLoading}
                  className="h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full h-11 text-base"
            disabled={isLoading}
          >
            {isLoading && (
              <Icon icon="lucide:loader-2" className="mr-2 h-5 w-5 animate-spin" />
            )}
            {isLoading ? t("creating") : t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  )
} 