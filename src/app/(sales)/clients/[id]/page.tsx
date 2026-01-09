import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate, formatCurrency, formatPhone } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { ClientActions } from "./ClientActions"

const STATUS_MAP = {
  ACTIVE: { label: "Activo", variant: "success" as const },
  INACTIVE: { label: "Inactivo", variant: "neutral" as const },
  SUSPENDED: { label: "Suspendido", variant: "error" as const },
}

const TYPE_MAP = {
  INDIVIDUAL: { label: "Individual", variant: "primary" as const },
  COMPANY: { label: "Empresa", variant: "primary" as const },
}

const PROPOSAL_STATUS_MAP = {
  DRAFT: { label: "Borrador", variant: "neutral" as const },
  PENDING_APPROVAL: { label: "Pendiente", variant: "warning" as const },
  SENT: { label: "Enviada", variant: "primary" as const },
  ACCEPTED: { label: "Aceptada", variant: "success" as const },
  REJECTED: { label: "Rechazada", variant: "error" as const },
  EXPIRED: { label: "Expirada", variant: "neutral" as const },
}

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener cliente con todas sus relaciones
  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      proposals: {
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      sales: {
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      installations: {
        orderBy: {
          scheduledDate: "desc",
        },
        take: 5,
      },
      maintenances: {
        orderBy: {
          scheduledDate: "desc",
        },
        take: 5,
      },
    },
  })

  if (!client) {
    redirect("/sales/clients")
  }

  // Verificar permisos
  if (
    !["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role) &&
    client.assignedToUserId !== session.user.id &&
    client.assignedToUserId !== null
  ) {
    redirect("/sales/clients")
  }

  // Calcular totales de ventas
  const totalSales = client.sales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/sales/clients"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Clientes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {client.name}
              </h1>
              <Badge variant={TYPE_MAP[client.type].variant}>
                {TYPE_MAP[client.type].label}
              </Badge>
            </div>
            {client.contactName && client.type === "COMPANY" && (
              <p className="text-gray-500 mt-1">
                Contacto: {client.contactName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_MAP[client.status].variant}>
              {STATUS_MAP[client.status].label}
            </Badge>
            <ClientActions client={client} />
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Propuestas</p>
          <p className="text-2xl font-bold text-blue-600">
            {client.proposals.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Ventas</p>
          <p className="text-2xl font-bold text-green-600">
            {client.sales.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Facturado</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(totalSales)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Instalaciones</p>
          <p className="text-2xl font-bold text-orange-600">
            {client.installations.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Cliente */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {client.email && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {client.email}
                  </a>
                </div>
              )}

              {client.phone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                  <a
                    href={`tel:${client.phone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {formatPhone(client.phone)}
                  </a>
                </div>
              )}

              {client.taxId && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {client.type === "COMPANY" ? "CIF" : "DNI/NIE"}
                  </p>
                  <p className="text-gray-900">{client.taxId}</p>
                </div>
              )}

              {client.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Asignado a</p>
                  <p className="text-gray-900">
                    {client.assignedTo.firstName}{" "}
                    {client.assignedTo.lastName}
                  </p>
                </div>
              )}

              {(client.address || client.city || client.state || client.postalCode) && (
                <div className="col-span-2 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Dirección</p>
                  <p className="text-gray-900">
                    {[
                      client.address,
                      client.city,
                      client.state,
                      client.postalCode,
                      client.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}
            </div>

            {client.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Notas</p>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {client.notes}
                </p>
              </div>
            )}
          </div>

          {/* Propuestas Recientes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Propuestas Recientes ({client.proposals.length})
              </h2>
              <Link
                href={`/sales/proposals/new?clientId=${client.id}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Nueva Propuesta
              </Link>
            </div>

            {client.proposals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay propuestas para este cliente
              </p>
            ) : (
              <div className="space-y-3">
                {client.proposals.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`/sales/proposals/${proposal.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {proposal.proposalNumber}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {proposal.items.length} producto
                          {proposal.items.length !== 1 ? "s" : ""} •{" "}
                          {formatCurrency(Number(proposal.totalAmount))}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={PROPOSAL_STATUS_MAP[proposal.status].variant}>
                          {PROPOSAL_STATUS_MAP[proposal.status].label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(proposal.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Ventas Recientes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Ventas Recientes ({client.sales.length})
              </h2>
            </div>

            {client.sales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay ventas para este cliente
              </p>
            ) : (
              <div className="space-y-3">
                {client.sales.map((sale) => (
                  <Link
                    key={sale.id}
                    href={`/sales/sales/${sale.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Venta #{sale.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {sale.items.length} producto
                          {sale.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(Number(sale.totalAmount))}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(sale.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Instalaciones */}
          {client.installations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Instalaciones ({client.installations.length})
              </h2>

              <div className="space-y-3">
                {client.installations.map((installation) => (
                  <div
                    key={installation.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Instalación #{installation.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(installation.scheduledDate)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          installation.status === "COMPLETED"
                            ? "success"
                            : installation.status === "IN_PROGRESS"
                            ? "primary"
                            : "warning"
                        }
                      >
                        {installation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel Derecho - Info Adicional */}
        <div className="lg:col-span-1 space-y-6">
          {/* Información General */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información General
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Fecha de Alta</p>
                <p className="font-medium text-gray-900">
                  {formatDate(client.createdAt)}
                </p>
              </div>

              {client.updatedAt.getTime() !== client.createdAt.getTime() && (
                <div>
                  <p className="text-gray-500 mb-1">Última Actualización</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(client.updatedAt)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-gray-500 mb-1">ID del Cliente</p>
                <p className="font-mono text-xs text-gray-900">
                  {client.id}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>

            <div className="space-y-2">
              <Link
                href={`/sales/proposals/new?clientId=${client.id}`}
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
              >
                📄 Nueva Propuesta
              </Link>

              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ✉️ Enviar Email
                </a>
              )}

              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  📞 Llamar
                </a>
              )}

              <Link
                href={`/sales/clients/${client.id}/edit`}
                className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
              >
                ✏️ Editar Datos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
