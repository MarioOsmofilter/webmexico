import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function WarehousesPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const warehouses = await prisma.warehouse.findMany({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      manager: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          inventory: true,
        },
      },
      inventory: {
        select: {
          quantity: true,
          minStock: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  // Calcular estadísticas
  const totalProducts = warehouses.reduce(
    (sum, w) => sum + w._count.inventory,
    0
  )
  const activeWarehouses = warehouses.filter((w) => w.isActive).length

  // Calcular productos con stock bajo
  const lowStockCount = warehouses.reduce((count, warehouse) => {
    const lowStock = warehouse.inventory.filter(
      (inv) => inv.quantity <= inv.minStock
    ).length
    return count + lowStock
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Almacenes</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus almacenes e inventario
          </p>
        </div>
        {["SUPERADMIN", "ADMIN"].includes(session.user.role) && (
          <Link
            href="/warehouse/warehouses/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nuevo Almacén
          </Link>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Almacenes</p>
          <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Productos en Stock</p>
          <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Stock Bajo</p>
          <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
        </div>
      </div>

      {/* Lista de Almacenes */}
      {warehouses.length === 0 ? (
        <EmptyState
          icon="🏭"
          title="No hay almacenes"
          description="Comienza creando tu primer almacén"
          action={
            ["SUPERADMIN", "ADMIN"].includes(session.user.role)
              ? {
                  label: "Crear Almacén",
                  href: "/warehouse/warehouses/new",
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => {
            const lowStock = warehouse.inventory.filter(
              (inv) => inv.quantity <= inv.minStock
            ).length
            const totalStock = warehouse.inventory.reduce(
              (sum, inv) => sum + inv.quantity,
              0
            )

            return (
              <Link
                key={warehouse.id}
                href={`/warehouse/warehouses/${warehouse.id}`}
                className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {warehouse.name}
                    </h3>
                    {warehouse.city && (
                      <p className="text-sm text-gray-500 mt-1">
                        {warehouse.city}
                      </p>
                    )}
                  </div>
                  <Badge color={warehouse.isActive ? "green" : "gray"}>
                    {warehouse.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Productos:</span>
                    <span className="font-medium text-gray-900">
                      {warehouse._count.inventory}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock Total:</span>
                    <span className="font-medium text-gray-900">
                      {totalStock} unidades
                    </span>
                  </div>

                  {lowStock > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Stock Bajo:</span>
                      <span className="font-medium text-red-600">
                        ⚠️ {lowStock}
                      </span>
                    </div>
                  )}

                  {warehouse.manager && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Responsable:</span>
                      <span className="font-medium text-gray-900">
                        {warehouse.manager.firstName}{" "}
                        {warehouse.manager.lastName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                  Ver inventario →
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
