import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate, formatPhone } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"

// Mapeo de estados
const STATUS_MAP = {
  ACTIVE: { label: "Activo", variant: "success" as const },
  INACTIVE: { label: "Inactivo", variant: "neutral" as const },
  VIP: { label: "VIP", variant: "primary" as const },
}

const TYPE_MAP = {
  INDIVIDUAL: { label: "Individual", variant: "primary" as const },
  COMPANY: { label: "Empresa", variant: "primary" as const },
}

interface SearchParams {
  status?: string
  type?: string
  search?: string
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { status, type, search } = searchParams

  // Construir filtros
  const where: any = {
    companyId: session.user.companyId,
  }

  // Si no es director/admin, solo ver clientes asignados
  if (!["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)) {
    where.OR = [{ assignedTo: session.user.id }, { assignedTo: null }]
  }

  if (status) {
    where.status = status
  }

  if (type) {
    where.type = type
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { contactName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { taxId: { contains: search } },
    ]
  }

  // Obtener clientes
  const clients = await prisma.client.findMany({
    where,
    include: {
      assignedTo: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          proposals: true,
          sales: true,
          installations: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Estadísticas rápidas
  const stats = await prisma.client.groupBy({
    by: ["status"],
    where: {
      companyId: session.user.companyId,
      ...(["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)
        ? {}
        : {
            OR: [{ assignedTo: session.user.id }, { assignedTo: null }],
          }),
    },
    _count: true,
  })

  const statsByStatus = stats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestiona tu cartera de clientes</p>
        </div>
        <Link
          href="/sales/clients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {clients.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">
            {statsByStatus.ACTIVE || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">VIP</p>
          <p className="text-2xl font-bold text-blue-600">
            {statsByStatus.VIP || 0}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="status"
              defaultValue={status || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              name="type"
              defaultValue={type || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TYPE_MAP).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Nombre, email, teléfono..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>
        </form>

        {(status || type || search) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {status && (
              <Badge variant={STATUS_MAP[status as keyof typeof STATUS_MAP]?.variant || "neutral"}>
                {STATUS_MAP[status as keyof typeof STATUS_MAP]?.label}
              </Badge>
            )}
            {type && (
              <Badge variant={TYPE_MAP[type as keyof typeof TYPE_MAP]?.variant || "neutral"}>
                {TYPE_MAP[type as keyof typeof TYPE_MAP]?.label}
              </Badge>
            )}
            {search && <Badge variant="neutral">Búsqueda: {search}</Badge>}
            <Link
              href="/sales/clients"
              className="text-sm text-blue-600 hover:text-blue-700 ml-2"
            >
              Limpiar filtros
            </Link>
          </div>
        )}
      </div>

      {/* Tabla de Clientes */}
      {clients.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No hay clientes"
          description={
            status || type || search
              ? "No se encontraron clientes con los filtros aplicados"
              : "Comienza creando tu primer cliente o convirtiendo un lead"
          }
          action={
            !status && !type && !search
              ? {
                  label: "Crear Cliente",
                  href: "/sales/clients/new",
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Alta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {client.name}
                        </div>
                        {client.taxId && (
                          <div className="text-sm text-gray-500">
                            {client.taxId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {client.contactName && (
                          <div className="text-gray-900">
                            {client.contactName}
                          </div>
                        )}
                        {client.email && (
                          <div className="text-gray-500">{client.email}</div>
                        )}
                        {client.phone && (
                          <div className="text-gray-500">
                            {formatPhone(client.phone)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={TYPE_MAP[client.type].variant}>
                        {TYPE_MAP[client.type].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={STATUS_MAP[client.status].variant}>
                        {STATUS_MAP[client.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.assignedTo
                        ? `${client.assignedTo.firstName} ${client.assignedTo.lastName}`
                        : "Sin asignar"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-3">
                        {client._count.sales > 0 && (
                          <span title="Ventas">💰 {client._count.sales}</span>
                        )}
                        {client._count.proposals > 0 && (
                          <span title="Propuestas">
                            📄 {client._count.proposals}
                          </span>
                        )}
                        {client._count.installations > 0 && (
                          <span title="Instalaciones">
                            🔧 {client._count.installations}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/sales/clients/${client.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-center text-sm text-gray-500">
        Mostrando {clients.length} cliente{clients.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
