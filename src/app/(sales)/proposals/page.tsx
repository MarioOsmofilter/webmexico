import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate, formatCurrency } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"

// Mapeo de estados
const STATUS_MAP = {
  DRAFT: { label: "Borrador", color: "gray" as const },
  PENDING_APPROVAL: { label: "Pendiente Aprobación", color: "yellow" as const },
  SENT: { label: "Enviada", color: "blue" as const },
  ACCEPTED: { label: "Aceptada", color: "green" as const },
  REJECTED: { label: "Rechazada", color: "red" as const },
  EXPIRED: { label: "Expirada", color: "gray" as const },
}

const PAYMENT_TYPE_MAP = {
  SALE: "Venta",
  RENTAL: "Alquiler",
}

interface SearchParams {
  status?: string
  search?: string
}

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { status, search } = searchParams

  // Construir filtros
  const where: any = {
    companyId: session.user.companyId,
  }

  // Si no es director/admin, solo ver propuestas propias
  if (!["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)) {
    where.createdBy = session.user.id
  }

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { proposalNumber: { contains: search, mode: "insensitive" } },
      { lead: { contactName: { contains: search, mode: "insensitive" } } },
      { client: { name: { contains: search, mode: "insensitive" } } },
    ]
  }

  // Obtener propuestas
  const proposals = await prisma.proposal.findMany({
    where,
    include: {
      lead: {
        select: {
          contactName: true,
        },
      },
      client: {
        select: {
          name: true,
        },
      },
      creator: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Estadísticas rápidas
  const stats = await prisma.proposal.groupBy({
    by: ["status"],
    where: {
      companyId: session.user.companyId,
      ...(["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)
        ? {}
        : { createdBy: session.user.id }),
    },
    _count: true,
    _sum: {
      totalAmount: true,
    },
  })

  const statsByStatus = stats.reduce(
    (acc, stat) => {
      acc[stat.status] = {
        count: stat._count,
        total: stat._sum.totalAmount || 0,
      }
      return acc
    },
    {} as Record<string, { count: number; total: any }>
  )

  // Total general
  const totalValue = stats.reduce(
    (sum, stat) => sum + Number(stat._sum.totalAmount || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propuestas</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus propuestas comerciales
          </p>
        </div>
        <Link
          href="/sales/proposals/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva Propuesta
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Borradores</p>
          <p className="text-2xl font-bold text-gray-600">
            {statsByStatus.DRAFT?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {statsByStatus.PENDING_APPROVAL?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Enviadas</p>
          <p className="text-2xl font-bold text-blue-600">
            {statsByStatus.SENT?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Aceptadas</p>
          <p className="text-2xl font-bold text-green-600">
            {statsByStatus.ACCEPTED?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Valor Total</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Buscar
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Número, cliente..."
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

        {(status || search) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {status && (
              <Badge color={STATUS_MAP[status as keyof typeof STATUS_MAP]?.color || "gray"}>
                {STATUS_MAP[status as keyof typeof STATUS_MAP]?.label}
              </Badge>
            )}
            {search && <Badge color="gray">Búsqueda: {search}</Badge>}
            <Link
              href="/sales/proposals"
              className="text-sm text-blue-600 hover:text-blue-700 ml-2"
            >
              Limpiar filtros
            </Link>
          </div>
        )}
      </div>

      {/* Tabla de Propuestas */}
      {proposals.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No hay propuestas"
          description={
            status || search
              ? "No se encontraron propuestas con los filtros aplicados"
              : "Comienza creando tu primera propuesta"
          }
          action={
            !status && !search
              ? {
                  label: "Crear Propuesta",
                  href: "/sales/proposals/new",
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
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente/Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado por
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
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {proposal.proposalNumber}
                      </div>
                      {proposal.requiresApproval && (
                        <div className="text-xs text-yellow-600">
                          ⚠️ Requiere aprobación
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {proposal.client?.name || proposal.lead?.contactName || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {proposal.items.length} producto{proposal.items.length !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge color={STATUS_MAP[proposal.status].color}>
                        {STATUS_MAP[proposal.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {PAYMENT_TYPE_MAP[proposal.paymentType]}
                      {proposal.installments > 1 && ` (${proposal.installments}x)`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(Number(proposal.totalAmount))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.creator.firstName} {proposal.creator.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(proposal.createdAt)}
                      {proposal.validUntil && (
                        <div className="text-xs text-gray-400">
                          Válida hasta: {formatDate(proposal.validUntil)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/sales/proposals/${proposal.id}`}
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
        Mostrando {proposals.length} propuesta{proposals.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
