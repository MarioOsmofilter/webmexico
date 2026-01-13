import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/shared/DashboardLayout"
import { Card } from "@/components/ui"
import prisma from "@/lib/prisma/client"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  // Obtener estadísticas de la empresa
  const [
    usersCount,
    leadsCount,
    clientsCount,
    salesCount,
    installationsCount,
  ] = await Promise.all([
    prisma.user.count({ where: { companyId: session.user.companyId } }),
    prisma.lead.count({ where: { companyId: session.user.companyId } }),
    prisma.client.count({ where: { companyId: session.user.companyId } }),
    prisma.sale.count({ where: { companyId: session.user.companyId } }),
    prisma.installation.count({ where: { companyId: session.user.companyId } }),
  ])

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  })

  return (
    <DashboardLayout
      userRole={session.user.role}
      userName={session.user.name}
      companyName={company?.name || "Mi Empresa"}
      title="Dashboard Administrador"
    >
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Usuarios</p>
            <p className="text-3xl font-bold text-primary-600">{usersCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Leads</p>
            <p className="text-3xl font-bold text-warning">{leadsCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Clientes</p>
            <p className="text-3xl font-bold text-success">{clientsCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Ventas</p>
            <p className="text-3xl font-bold text-primary-600">{salesCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Instalaciones</p>
            <p className="text-3xl font-bold text-primary-600">{installationsCount}</p>
          </div>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Accesos Rápidos" padding="md">
          <div className="space-y-3">
            <a
              href="/admin/users"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-medium">Gestionar Usuarios</p>
                  <p className="text-sm text-neutral-600">
                    {usersCount} usuarios activos
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/admin/products"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="font-medium">Catálogo de Productos</p>
                  <p className="text-sm text-neutral-600">
                    Gestionar precios y stock
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/admin/settings"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="font-medium">Configuración</p>
                  <p className="text-sm text-neutral-600">
                    Ajustes de la empresa
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/admin/reports"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-medium">Informes</p>
                  <p className="text-sm text-neutral-600">
                    Análisis y reportes
                  </p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        <Card title="Resumen del Mes" padding="md">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Leads nuevos</span>
              <span className="font-bold text-warning">{leadsCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Clientes convertidos</span>
              <span className="font-bold text-success">{clientsCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Ventas realizadas</span>
              <span className="font-bold text-primary-600">{salesCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Instalaciones</span>
              <span className="font-bold">{installationsCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
