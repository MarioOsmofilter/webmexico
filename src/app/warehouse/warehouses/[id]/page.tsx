import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { Badge } from "@/components/ui/Badge"
import { formatDate } from "@/lib/utils/format"

export default async function WarehouseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const warehouse = await prisma.warehouse.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
    include: {
      manager: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      inventory: {
        include: {
          product: {
            include: {
              images: {
                take: 1,
                orderBy: { order: "asc" },
              },
            },
          },
        },
        orderBy: {
          product: {
            name: "asc",
          },
        },
      },
      movements: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
    },
  })

  if (!warehouse) {
    redirect("/warehouse/warehouses")
  }

  const lowStockItems = warehouse.inventory.filter(
    (inv) => inv.quantity <= inv.minStock
  )
  const totalValue = warehouse.inventory.reduce(
    (sum, inv) => sum + inv.quantity,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/warehouse/warehouses"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Almacenes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {warehouse.name}
            </h1>
            {warehouse.address && (
              <p className="text-gray-500 mt-1">
                {warehouse.address}, {warehouse.city}
              </p>
            )}
          </div>
          <Badge variant={warehouse.isActive ? "success" : "neutral"}>
            {warehouse.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Productos</p>
          <p className="text-2xl font-bold text-gray-900">
            {warehouse.inventory.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Unidades Totales</p>
          <p className="text-2xl font-bold text-blue-600">{totalValue}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Stock Bajo</p>
          <p className="text-2xl font-bold text-red-600">
            {lowStockItems.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Movimientos Hoy</p>
          <p className="text-2xl font-bold text-purple-600">
            {
              warehouse.movements.filter(
                (m) =>
                  m.createdAt.toDateString() === new Date().toDateString()
              ).length
            }
          </p>
        </div>
      </div>

      {/* Alertas Stock Bajo */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-900 mb-2">
            ⚠️ Productos con Stock Bajo ({lowStockItems.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="text-sm text-red-700 bg-white p-2 rounded"
              >
                {item.product.name}: {item.quantity} / {item.minStock} unidades
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventario */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Inventario</h2>
            {["SUPERADMIN", "ADMIN", "WAREHOUSE"].includes(
              session.user.role
            ) && (
              <Link
                href={`/warehouse/warehouses/${warehouse.id}/add-product`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Agregar Producto
              </Link>
            )}
          </div>

          {warehouse.inventory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay productos en este almacén
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reservado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Disponible
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Min/Max
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {warehouse.inventory.map((item) => {
                    const available = item.quantity - item.reservedQuantity
                    const isLow = item.quantity <= item.minStock

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.product.images[0] && (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.product.name}
                              </p>
                              {item.product.internalReference && (
                                <p className="text-xs text-gray-500">
                                  {item.product.internalReference}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.reservedQuantity}
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-600">
                          {available}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.minStock} / {item.maxStock}
                        </td>
                        <td className="px-4 py-3">
                          {isLow ? (
                            <Badge variant="error">Stock Bajo</Badge>
                          ) : (
                            <Badge variant="success">Normal</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Movimientos Recientes */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Movimientos Recientes
          </h2>

          {warehouse.movements.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">
              No hay movimientos
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {warehouse.movements.map((movement) => (
                <div
                  key={movement.id}
                  className="pb-3 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {movement.type === "IN"
                          ? "📥 Entrada"
                          : movement.type === "OUT"
                          ? "📤 Salida"
                          : movement.type === "TRANSFER"
                          ? "🔄 Transferencia"
                          : "⚙️ Ajuste"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {movement.product.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {movement.reason}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${
                        movement.type === "IN"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {movement.type === "IN" ? "+" : "-"}
                      {movement.quantity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(movement.createdAt)} •{" "}
                    {movement.user.firstName} {movement.user.lastName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
