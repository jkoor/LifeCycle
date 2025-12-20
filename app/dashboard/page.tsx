import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await getServerSession()

    if (!session) {
        redirect("/auth/login")
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="bg-card p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
                <p className="text-muted-foreground">
                    You are logged in as: <strong>{session.user?.email}</strong>
                </p>
                <pre className="mt-4 p-4 bg-muted rounded text-sm overflow-auto">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
        </div>
    )
}
