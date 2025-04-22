"use client"

import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <AuthLayout type="register">
          <RegisterForm onSuccessRedirect="/workspace/create" />
        </AuthLayout>
      </div>
    </div>
  )
} 