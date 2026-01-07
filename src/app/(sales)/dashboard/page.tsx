import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/shared/DashboardLayout"
import { Card, Badge } from "@/components/ui"
import prisma from "@/lib/prisma/client"
import { formatCurrency } from "@/lib/utils/format"

export default async function SalesDashboardPage() {
  const session = await auth()

  if (
    !session?.user ||
    !["SALES", "DIRECTOR_SALES", "ADMIN", "SUPERADMIN"].includes(session.user.role)
  ) {
    redirect("/login")
  }

  // Obtener estadísticas del usuario/equipo
  const userId = session.user.id
  const isDirector = session.user.role === "DIRECTOR_SALES"

  const whereCondition = isDirector
    ? { companyId: session.user.companyId }
    : { companyId: session.user.companyId, assignedToUserId: userId }

  const [myLeads, myClients, myProposals, mySales] = await Promise.all([
    prisma.lead.count({
      where: {
        ...whereCondition,
        ...(isDirector ? {} : { assignedToUserId: userId }),
      },
    }),
    prisma.client.count({
      where: {
        ...whereCondition,
        ...(isDirector ? {} : { assignedToUserId: userId }),
      },
    }),
    prisma.proposal.count({
      where: {
        companyId: session.user.companyId,
        ...(isDirector ? {} : { createdBy: userId }),
      },
    }),
    prisma.sale.count({
      where: {
        companyId: session.user.companyId,
        ...(isDirector ? {} : { createdBy: userId }),
      },
    }),
  ])

  // Calcular facturación total
  const salesData = await prisma.sale.aggregate({
    where: {
      companyId: session.user.companyId,
      ...(isDirector ? {} : { createdBy: userId }),
    },
    _sum: {
      totalAmount: true,
    },
  })

  const totalRevenue = salesData._sum.totalAmount || 0

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  })

  return (
    <DashboardLayout
      userRole={session.user.role}
      userName={session.user.name}
      companyName={company?.name || "Mi Empresa"}
      title={isDirector ? "Dashboard Comercial - Director" : "Mi Dashboard"}
    >
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Mis Leads</p>
            <p className="text-3xl font-bold text-warning">{myLeads}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Mis Clientes</p>
            <p className="text-3xl font-bold text-success">{myClients}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Propuestas</p>
            <p className="text-3xl font-bold text-primary-600">{myProposals}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Ventas</p>
            <p className="text-3xl font-bold text-success">{mySales}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Facturación</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(Number(totalRevenue))}
            </p>
          </div>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Acciones Rápidas" padding="md">
          <div className="space-y-3">
            <a
              href="/sales/leads"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-medium">Mis Leads</p>
                    <p className="text-sm text-neutral-600">{myLeads} activos</p>
                  </div>
                </div>
                <Badge variant="warning">{myLeads}</Badge>
              </div>
            </a>

            <a
              href="/sales/clients"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-medium">Mis Clientes</p>
                    <p className="text-sm text-neutral-600">{myClients} clientes</p>
                  </div>
                </div>
                <Badge variant="success">{myClients}</Badge>
              </div>
            </a>

            <a
              href="/sales/proposals"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium">Crear Propuesta</p>
                  <p className="text-sm text-neutral-600">Nueva propuesta</p>
                </div>
              </div>
            </a>

            <a
              href="/sales/calendar"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-medium">Mi Agenda</p>
                  <p className="text-sm text-neutral-600">Ver visitas</p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        <Card title="Objetivos del Mes" padding="md">
          <div className="space-y-6">
            {/* Objetivo de ventas */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Ventas</span>
                <span className="text-sm text-neutral-600">
                  {mySales} / 10
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((mySales / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Objetivo de facturación */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Facturación</span>
                <span className="text-sm text-neutral-600">
                  {formatCurrency(Number(totalRevenue))} / {formatCurrency(10000)}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((Number(totalRevenue) / 10000) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Ratio de conversión */}
            <div className="pt-4 border-t">
              <p className="text-sm text-neutral-600 mb-2">Ratio de Conversión</p>
              <p className="text-3xl font-bold text-primary-600">
                {myLeads > 0
                  ? `${Math.round((myClients / myLeads) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
