import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SettingsPage } from "@/components/features/me/settings-page"

export default async function MePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/login")
  }

  return <SettingsPage user={session.user} />
}
