import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/shared/DashboardLayout"
import { Card } from "@/components/ui"
import prisma from "@/lib/prisma/client"

export default async function MarketingDashboardPage() {
  const session = await auth()

  if (
    !session?.user ||
    !["MARKETING", "DIRECTOR_MARKETING", "ADMIN", "SUPERADMIN"].includes(
      session.user.role
    )
  ) {
    redirect("/login")
  }

  const [leadsCount, campaignsCount, callsCount] = await Promise.all([
    prisma.lead.count({
      where: {
        companyId: session.user.companyId,
        source: "TELEMARKETING",
      },
    }),
    prisma.tmkCampaign.count({
      where: { companyId: session.user.companyId },
    }),
    prisma.tmkCall.count({
      where: {
        companyId: session.user.companyId,
        userId: session.user.id,
      },
    }),
  ])

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  })

  return (
    <DashboardLayout
      userRole={session.user.role}
      userName={session.user.name}
      companyName={company?.name || "Mi Empresa"}
      title="Dashboard Marketing"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Leads Generados</p>
            <p className="text-3xl font-bold text-primary-600">{leadsCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Campañas Activas</p>
            <p className="text-3xl font-bold text-warning">{campaignsCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Llamadas Realizadas</p>
            <p className="text-3xl font-bold text-success">{callsCount}</p>
          </div>
        </Card>
      </div>

      <Card title="Accesos Rápidos" padding="md">
        <div className="space-y-3">
          <a
            href="/marketing/leads"
            className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium">Gestionar Leads</p>
                <p className="text-sm text-neutral-600">{leadsCount} leads</p>
              </div>
            </div>
          </a>

          <a
            href="/marketing/telemarketing"
            className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-medium">Campañas y Llamadas</p>
                <p className="text-sm text-neutral-600">
                  {campaignsCount} campañas
                </p>
              </div>
            </div>
          </a>

          <a
            href="/marketing/calendar"
            className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-medium">Mi Agenda</p>
                <p className="text-sm text-neutral-600">Ver visitas programadas</p>
              </div>
            </div>
          </a>
        </div>
      </Card>
    </DashboardLayout>
  )
}
