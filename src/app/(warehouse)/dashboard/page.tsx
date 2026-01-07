import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/shared/DashboardLayout"
import { Card } from "@/components/ui"
import prisma from "@/lib/prisma/client"

export default async function WarehouseDashboardPage() {
  const session = await auth()

  if (
    !session?.user ||
    !["WAREHOUSE", "ADMIN", "SUPERADMIN"].includes(session.user.role)
  ) {
    redirect("/login")
  }

  const [warehousesCount, productsCount, lowStockCount] = await Promise.all([
    prisma.warehouse.count({
      where: { companyId: session.user.companyId },
    }),
    prisma.product.count({
      where: { companyId: session.user.companyId },
    }),
    prisma.stockAlert.count({
      where: {
        warehouse: { companyId: session.user.companyId },
        resolvedAt: null,
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
      title="Dashboard Almacén"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Almacenes</p>
            <p className="text-3xl font-bold text-primary-600">{warehousesCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Productos</p>
            <p className="text-3xl font-bold text-success">{productsCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-neutral-600 text-sm mb-2">Alertas Stock Bajo</p>
            <p className="text-3xl font-bold text-error">{lowStockCount}</p>
          </div>
        </Card>
      </div>

      <Card title="Accesos Rápidos" padding="md">
        <div className="space-y-3">
          <a
            href="/warehouse/inventory"
            className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium">Inventario</p>
                <p className="text-sm text-neutral-600">
                  {productsCount} productos
                </p>
              </div>
            </div>
          </a>

          <a
            href="/warehouse/movements"
            className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-medium">Movimientos</p>
                <p className="text-sm text-neutral-600">Traspasos y ajustes</p>
              </div>
            </div>
          </a>

          <a
            href="/warehouse/loading-orders"
            className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="font-medium">Órdenes de Carga</p>
                <p className="text-sm text-neutral-600">Para técnicos</p>
              </div>
            </div>
          </a>

          {lowStockCount > 0 && (
            <a
              href="/warehouse/alerts"
              className="block p-4 bg-error-light/10 hover:bg-error-light/20 rounded-lg transition-colors border border-error-light"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-error-dark">
                    Alertas de Stock
                  </p>
                  <p className="text-sm text-error">{lowStockCount} productos con stock bajo</p>
                </div>
              </div>
            </a>
          )}
        </div>
      </Card>
    </DashboardLayout>
  )
}
