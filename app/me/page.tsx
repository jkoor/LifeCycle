import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ProfileCard } from "@/components/modules/user/profile-card"

export default async function MePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            个人中心
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            管理您的账户信息和偏好设置
          </p>
        </div>
        <ProfileCard user={session.user} />
      </div>
    </div>
  )
}
