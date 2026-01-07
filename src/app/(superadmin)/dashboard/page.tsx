import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/shared/DashboardLayout"
import { Card } from "@/components/ui"
import prisma from "@/lib/prisma/client"

export default async function SuperadminDashboardPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "SUPERADMIN") {
    redirect("/login")
  }

  // Obtener estadísticas
  const [companiesCount, usersCount, productsCount] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.product.count({ where: { isMaster: true } }),
  ])

  return (
    <DashboardLayout
      userRole={session.user.role}
      userName={session.user.name}
      companyName="Water CRM Central"
      title="Dashboard Superadmin"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tarjetas de estadísticas */}
        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Empresas</p>
            <p className="text-4xl font-bold text-primary-600">{companiesCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Usuarios Totales</p>
            <p className="text-4xl font-bold text-primary-600">{usersCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Productos Maestros</p>
            <p className="text-4xl font-bold text-primary-600">{productsCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Sistema</p>
            <p className="text-4xl font-bold text-success">✓</p>
            <p className="text-xs text-neutral-500 mt-1">Operativo</p>
          </div>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Accesos Rápidos" padding="md">
          <div className="space-y-3">
            <a
              href="/superadmin/companies"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="font-medium">Gestionar Empresas</p>
                  <p className="text-sm text-neutral-600">
                    Crear y configurar empresas
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/superadmin/products"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="font-medium">Productos Maestros</p>
                  <p className="text-sm text-neutral-600">
                    Catálogo global de productos
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/superadmin/settings"
              className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="font-medium">Configuración Global</p>
                  <p className="text-sm text-neutral-600">
                    Ajustes del sistema
                  </p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        <Card title="Actividad Reciente" padding="md">
          <p className="text-neutral-600 text-sm">
            Sin actividad reciente para mostrar
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
