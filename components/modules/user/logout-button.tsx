"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button
      variant="destructive"
      size="lg"
      className="w-full gap-2 transition-all hover:gap-3"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-4 w-4" />
      退出登录
    </Button>
  )
}
