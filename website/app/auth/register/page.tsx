"use client"

import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm, RegisterValues } from "@/components/auth/register-form"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  
  async function onSubmit(values: RegisterValues) {
    // TODO: Implement register logic
    console.log(values)
    
    // Wait for 1 second to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success toast
    toast.success("Account created successfully!")
    
    // Redirect to workspace creation
    router.push("/workspace/create")
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <AuthLayout type="register">
          <RegisterForm onSubmit={onSubmit} />
        </AuthLayout>
      </div>
    </div>
  )
} 