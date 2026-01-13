import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate, formatPhone } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"

// Mapeo de estados
const STATUS_MAP = {
  NEW: { label: "Nuevo", variant: "primary" as const },
  CONTACTED: { label: "Contactado", variant: "warning" as const },
  QUALIFIED: { label: "Calificado", variant: "primary" as const },
  PROPOSAL_SENT: { label: "Propuesta Enviada", variant: "primary" as const },
  NEGOTIATION: { label: "Negociación", variant: "warning" as const },
  CONVERTED: { label: "Convertido", variant: "success" as const },
  LOST: { label: "Perdido", variant: "error" as const },
}

// Mapeo de fuentes
const SOURCE_MAP = {
  WEB: "Web",
  TELEMARKETING: "Telemarketing",
  MANUAL: "Manual",
  REFERRAL: "Referido",
  OTHER: "Otro",
}

interface SearchParams {
  status?: string
  source?: string
  search?: string
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { status, source, search } = searchParams

  // Construir filtros
  const where: any = {
    companyId: session.user.companyId,
  }

  // Si no es director, solo ver leads asignados o sin asignar
  if (!["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)) {
    where.OR = [
      { assignedTo: session.user.id },
      { assignedTo: null },
    ]
  }

  if (status) {
    where.status = status
  }

  if (source) {
    where.source = source
  }

  if (search) {
    where.OR = [
      { contactName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { company: { contains: search, mode: "insensitive" } },
    ]
  }

  // Obtener leads
  const leads = await prisma.lead.findMany({
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
          timeline: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Estadísticas rápidas
  const stats = await prisma.lead.groupBy({
    by: ["status"],
    where: {
      companyId: session.user.companyId,
      ...(["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)
        ? {}
        : {
            OR: [
              { assignedToUserId: session.user.id },
              { assignedToUserId: null },
            ],
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
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus oportunidades de venta
          </p>
        </div>
        <Link
          href="/sales/leads/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Lead
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Nuevos</p>
          <p className="text-2xl font-bold text-blue-600">
            {statsByStatus.NEW || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Calificados</p>
          <p className="text-2xl font-bold text-purple-600">
            {statsByStatus.QUALIFIED || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">En Negociación</p>
          <p className="text-2xl font-bold text-orange-600">
            {statsByStatus.NEGOTIATION || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Convertidos</p>
          <p className="text-2xl font-bold text-green-600">
            {statsByStatus.CONVERTED || 0}
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
              Fuente
            </label>
            <select
              name="source"
              defaultValue={source || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las fuentes</option>
              {Object.entries(SOURCE_MAP).map(([key, label]) => (
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

        {(status || source || search) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {status && (
              <Badge variant={STATUS_MAP[status as keyof typeof STATUS_MAP]?.variant || "neutral"}>
                {STATUS_MAP[status as keyof typeof STATUS_MAP]?.label}
              </Badge>
            )}
            {source && (
              <Badge variant="neutral">
                {SOURCE_MAP[source as keyof typeof SOURCE_MAP]}
              </Badge>
            )}
            {search && <Badge variant="neutral">Búsqueda: {search}</Badge>}
            <Link
              href="/sales/leads"
              className="text-sm text-blue-600 hover:text-blue-700 ml-2"
            >
              Limpiar filtros
            </Link>
          </div>
        )}
      </div>

      {/* Tabla de Leads */}
      {leads.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No hay leads"
          description={
            status || source || search
              ? "No se encontraron leads con los filtros aplicados"
              : "Comienza creando tu primer lead"
          }
          action={
            !status && !source && !search
              ? {
                  label: "Crear Lead",
                  href: "/sales/leads/new",
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
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propuestas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {lead.contactName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="text-sm text-gray-500">
                            {formatPhone(lead.phone)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.businessName || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={STATUS_MAP[lead.status].variant}>
                        {STATUS_MAP[lead.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {SOURCE_MAP[lead.source as keyof typeof SOURCE_MAP] || lead.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.assignedTo
                        ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                        : "Sin asignar"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead._count.proposals > 0 ? (
                        <span className="text-sm font-medium text-blue-600">
                          {lead._count.proposals}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/sales/leads/${lead.id}`}
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
        Mostrando {leads.length} lead{leads.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
