"use client"

import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm, LoginValues } from "@/components/auth/login-form"

export default function LoginPage() {
  async function onSubmit(values: LoginValues) {
    // TODO: Implement login logic
    console.log(values)
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <AuthLayout type="login">
          <LoginForm onSubmit={onSubmit} />
        </AuthLayout>
      </div>
    </div>
  )
} 