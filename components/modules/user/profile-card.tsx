import { User } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "./logout-button"

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <Card className="w-full max-w-md overflow-hidden border-zinc-200/50 bg-white/50 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/50">
      <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-8">
        <div className="relative">
          <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-tr from-indigo-500/20 to-rose-500/20 blur-xl" />
          <Avatar className="h-24 w-24 border-4 border-white shadow-xl dark:border-zinc-950">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-zinc-100 text-2xl font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {user.name || "未命名用户"}
          </h2>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-6">
        <Separator className="bg-zinc-200/50 dark:bg-zinc-800/50" />
        <div className="grid gap-1 py-2">
          <div className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              用户 ID
            </span>
            <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
              {user.id}
            </span>
          </div>
        </div>
        <Simulator />
        <LogoutButton />
      </CardContent>
    </Card>
  )
}

function Simulator() {
  return null
}
