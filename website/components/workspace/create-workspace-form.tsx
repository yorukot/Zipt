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

// Workspace creation schema
const workspaceSchema = z.object({
  name: z.string().min(2, {
    message: "Workspace name must be at least 2 characters",
  }),
})

// Email validation schema
const emailSchema = z.string().email({
  message: "Please enter a valid email address",
})

// Type for workspace creation values
export type WorkspaceValues = z.infer<typeof workspaceSchema>

interface CreateWorkspaceFormProps {
  onSubmit: (values: WorkspaceValues & { invitedEmails: string[] }) => Promise<void> | void
}

export function CreateWorkspaceForm({ onSubmit }: CreateWorkspaceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitedEmails, setInvitedEmails] = useState<string[]>([])
  const [emailError, setEmailError] = useState<string | null>(null)
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
      await onSubmit({
        ...values,
        invitedEmails
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const validatedEmail = emailSchema.parse(inviteEmail)
      
      // Check if email is already in the list
      if (invitedEmails.includes(validatedEmail)) {
        setEmailError("This email has already been invited")
        return
      }
      
      // Add email to the list
      setInvitedEmails([...invitedEmails, validatedEmail])
      setInviteEmail("")
      setEmailError(null)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message)
      }
    }
  }

  function removeInvitedEmail(email: string) {
    setInvitedEmails(invitedEmails.filter(e => e !== email))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("nameLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("namePlaceholder")}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-3">
          <FormLabel>{t("inviteLabel")}</FormLabel>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder={t("invitePlaceholder")}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button 
              type="button" 
              onClick={handleInvite} 
              disabled={isLoading || !inviteEmail}
              variant="secondary"
            >
              Invite
            </Button>
          </div>
          {emailError && (
            <p className="text-sm font-medium text-destructive">{emailError}</p>
          )}
          
          {invitedEmails.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-2">Invited team members:</p>
              <div className="space-y-2">
                {invitedEmails.map((email) => (
                  <div 
                    key={email} 
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span>{email}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInvitedEmail(email)}
                      className="h-6 w-6"
                    >
                      <Icon icon="lucide:x" className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  )
} 