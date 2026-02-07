import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SettingsPage } from "@/components/features/me/settings-page"

export default async function MePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return <SettingsPage user={session.user} />
}
