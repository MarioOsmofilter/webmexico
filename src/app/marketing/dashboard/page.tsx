import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function MarketingDashboardPage() {
  const session = await auth()

  if (!session?.user || !["MARKETING", "DIRECTOR_MARKETING", "ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Dashboard de Marketing
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-neutral-600">
          Panel de marketing en desarrollo...
        </p>
      </div>
    </div>
  )
}
