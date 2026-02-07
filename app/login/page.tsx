import { Logo } from "@/components/common/logo"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="text-center flex flex-col items-center">
          <Logo className="scale-100 mb-2" />
        </div>
        <div className="w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
