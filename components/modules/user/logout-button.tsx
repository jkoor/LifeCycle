"use client"

import { LogOut } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()
  return (
    <Button
      variant="destructive"
      size="lg"
      className="w-full gap-2 transition-all hover:gap-3"
      onClick={async () => {
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/login")
            },
          },
        })
      }}
    >
      <LogOut className="h-4 w-4" />
      退出登录
    </Button>
  )
}
