import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/shared/DashboardLayout"
import { Card, Badge } from "@/components/ui"
import prisma from "@/lib/prisma/client"

export default async function TechnicianDashboardPage() {
  const session = await auth()

  if (
    !session?.user ||
    !["TECHNICIAN", "DIRECTOR_INSTALLATIONS", "ADMIN", "SUPERADMIN"].includes(
      session.user.role
    )
  ) {
    redirect("/login")
  }

  const userId = session.user.id
  const isDirector = session.user.role === "DIRECTOR_INSTALLATIONS"

  const [myInstallations, myMaintenances, pendingIncidents] = await Promise.all([
    prisma.installation.count({
      where: {
        companyId: session.user.companyId,
        ...(isDirector ? {} : { assignedToUserId: userId }),
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    }),
    prisma.maintenance.count({
      where: {
        companyId: session.user.companyId,
        ...(isDirector ? {} : { assignedToUserId: userId }),
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    }),
    prisma.incident.count({
      where: {
        companyId: session.user.companyId,
        ...(isDirector ? {} : { assignedToUserId: userId }),
        status: { in: ["OPEN", "IN_PROGRESS"] },
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
      title={isDirector ? "Dashboard Técnico - Director" : "Mi Dashboard"}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Instalaciones Pendientes</p>
            <p className="text-3xl font-bold text-primary-600">{myInstallations}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Mantenimientos</p>
            <p className="text-3xl font-bold text-warning">{myMaintenances}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Incidencias</p>
            <p className="text-3xl font-bold text-error">{pendingIncidents}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Acciones Rápidas" padding="md">
          <div className="space-y-3">
            <a
              href="/technician/installations"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <p className="font-medium">Mis Instalaciones</p>
                    <p className="text-sm text-neutral-600">{myInstallations} pendientes</p>
                  </div>
                </div>
                <Badge variant="primary">{myInstallations}</Badge>
              </div>
            </a>

            <a
              href="/technician/maintenances"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛠️</span>
                  <div>
                    <p className="font-medium">Mantenimientos</p>
                    <p className="text-sm text-neutral-600">{myMaintenances} programados</p>
                  </div>
                </div>
                <Badge variant="warning">{myMaintenances}</Badge>
              </div>
            </a>

            <a
              href="/technician/incidents"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-medium">Incidencias</p>
                    <p className="text-sm text-neutral-600">{pendingIncidents} abiertas</p>
                  </div>
                </div>
                <Badge variant="error">{pendingIncidents}</Badge>
              </div>
            </a>

            <a
              href="/technician/warehouse"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-medium">Mi Carga</p>
                  <p className="text-sm text-neutral-600">Material en furgoneta</p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        <Card title="Agenda de Hoy" padding="md">
          <p className="text-neutral-600 text-sm">
            Sin eventos programados para hoy
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
