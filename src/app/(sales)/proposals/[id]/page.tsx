import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate, formatCurrency, formatPhone } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { ProposalActions } from "./ProposalActions"

// Mapeo de estados
const STATUS_MAP = {
  DRAFT: { label: "Borrador", variant: "neutral" as const },
  PENDING_APPROVAL: { label: "Pendiente Aprobación", variant: "warning" as const },
  SENT: { label: "Enviada", variant: "primary" as const },
  ACCEPTED: { label: "Aceptada", variant: "success" as const },
  REJECTED: { label: "Rechazada", variant: "error" as const },
  EXPIRED: { label: "Expirada", variant: "neutral" as const },
}

const PAYMENT_TYPE_MAP = {
  SALE: "Venta",
  RENTAL: "Alquiler",
}

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener propuesta con todas sus relaciones
  const proposal = await prisma.proposal.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
    include: {
      lead: {
        select: {
          id: true,
          contactName: true,
          company: true,
          email: true,
          phone: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          contactName: true,
          email: true,
          phone: true,
        },
      },
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      approver: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      items: {
        include: {
          product: {
            include: {
              images: {
                take: 1,
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      template: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!proposal) {
    redirect("/sales/proposals")
  }

  // Verificar permisos: si no es director/admin, solo puede ver propuestas propias
  if (
    !["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role) &&
    proposal.createdBy !== session.user.id
  ) {
    redirect("/sales/proposals")
  }

  // Calcular totales
  const subtotal = proposal.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unitPrice),
    0
  )
  const totalDiscount = proposal.items.reduce(
    (sum, item) =>
      sum + item.quantity * Number(item.unitPrice) * (Number(item.discount) / 100),
    0
  )

  const customerInfo = proposal.client || proposal.lead

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/sales/proposals"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Propuestas
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Propuesta {proposal.proposalNumber}
            </h1>
            {customerInfo && (
              <p className="text-gray-500 mt-1">
                {"name" in customerInfo
                  ? customerInfo.name
                  : customerInfo.contactName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_MAP[proposal.status].variant}>
              {STATUS_MAP[proposal.status].label}
            </Badge>
            <ProposalActions proposal={proposal} userRole={session.user.role} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Cliente/Lead */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {proposal.client ? "Cliente" : "Lead"}
            </h2>

            {customerInfo && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nombre</p>
                  <p className="text-gray-900">
                    {"name" in customerInfo
                      ? customerInfo.name
                      : customerInfo.contactName}
                  </p>
                </div>

                {customerInfo.email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${customerInfo.email}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {customerInfo.email}
                    </a>
                  </div>
                )}

                {customerInfo.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                    <a
                      href={`tel:${customerInfo.phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {formatPhone(customerInfo.phone)}
                    </a>
                  </div>
                )}

                {proposal.client && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ver Cliente</p>
                    <Link
                      href={`/sales/clients/${proposal.client.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Ver perfil completo →
                    </Link>
                  </div>
                )}

                {proposal.lead && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ver Lead</p>
                    <Link
                      href={`/sales/leads/${proposal.lead.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Ver perfil completo →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Productos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Productos ({proposal.items.length})
            </h2>

            <div className="space-y-4">
              {proposal.items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex gap-4">
                    {/* Imagen */}
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.product.name}
                          </h3>
                          {item.product.reference && (
                            <p className="text-sm text-gray-500">
                              Ref: {item.product.reference}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Cantidad</p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Precio Unit.</p>
                          <p className="font-medium">
                            {formatCurrency(Number(item.unitPrice))}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Descuento</p>
                          <p className="font-medium">{item.discount}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Subtotal</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(
                              item.quantity *
                                Number(item.unitPrice) *
                                (1 - Number(item.discount) / 100)
                            )}
                          </p>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento total:</span>
                  <span className="text-red-600">
                    -{formatCurrency(totalDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span className="text-blue-600">
                  {formatCurrency(Number(proposal.totalAmount))}
                </span>
              </div>

              {proposal.paymentType === "SALE" && proposal.installments > 1 && (
                <div className="bg-blue-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-gray-600">
                    Pago en {proposal.installments} cuotas de{" "}
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(
                        Number(proposal.totalAmount) / proposal.installments
                      )}
                      /mes
                    </span>
                  </p>
                </div>
              )}

              {proposal.paymentType === "RENTAL" && (
                <div className="bg-purple-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Alquiler mensual:</span>{" "}
                    {formatCurrency(Number(proposal.totalAmount))}/mes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {proposal.notes && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Notas Internas
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {proposal.notes}
              </p>
            </div>
          )}
        </div>

        {/* Panel Derecho - Información Adicional */}
        <div className="lg:col-span-1 space-y-6">
          {/* Estado y Fechas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Tipo de Pago</p>
                <p className="font-medium text-gray-900">
                  {PAYMENT_TYPE_MAP[proposal.paymentType]}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Plantilla</p>
                <p className="font-medium text-gray-900">
                  {proposal.template?.name || "Sin plantilla"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Creada por</p>
                <p className="font-medium text-gray-900">
                  {proposal.creator.firstName} {proposal.creator.lastName}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Fecha de Creación</p>
                <p className="font-medium text-gray-900">
                  {formatDate(proposal.createdAt)}
                </p>
              </div>

              {proposal.validUntil && (
                <div>
                  <p className="text-gray-500 mb-1">Válida hasta</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(proposal.validUntil)}
                  </p>
                  {new Date(proposal.validUntil) < new Date() && (
                    <p className="text-xs text-red-600 mt-1">⚠️ Expirada</p>
                  )}
                </div>
              )}

              {proposal.requiresApproval && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800 font-medium">
                    ⚠️ Requiere Aprobación
                  </p>
                  {proposal.approvedBy && proposal.approver && (
                    <div className="mt-2 text-xs">
                      <p className="text-green-700">
                        ✅ Aprobada por {proposal.approver.firstName}{" "}
                        {proposal.approver.lastName}
                      </p>
                      {proposal.approvedAt && (
                        <p className="text-gray-600">
                          {formatDate(proposal.approvedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {proposal.convertedToSale && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-800 font-medium">
                    ✅ Convertida en Venta
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>

            <div className="space-y-2">
              {proposal.status !== "DRAFT" && (
                <a
                  href={`/api/proposals/${proposal.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📄 Descargar PDF
                </a>
              )}

              {!proposal.convertedToSale && proposal.status === "ACCEPTED" && (
                <Link
                  href={`/sales/sales/new?proposalId=${proposal.id}`}
                  className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
                >
                  💰 Convertir en Venta
                </Link>
              )}

              {proposal.status === "DRAFT" && (
                <Link
                  href={`/sales/proposals/${proposal.id}/edit`}
                  className="block w-full px-4 py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ✏️ Editar Propuesta
                </Link>
              )}

              {proposal.lead && !proposal.lead && (
                <Link
                  href={`/sales/leads/${proposal.lead.id}`}
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  🎯 Ver Lead
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
