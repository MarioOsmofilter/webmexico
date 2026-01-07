import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate, formatCurrency, formatPhone } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { LeadActions } from "./LeadActions"
import { TimelineView } from "./TimelineView"

// Mapeo de estados
const STATUS_MAP = {
  NEW: { label: "Nuevo", color: "blue" as const },
  CONTACTED: { label: "Contactado", color: "yellow" as const },
  QUALIFIED: { label: "Calificado", color: "purple" as const },
  PROPOSAL_SENT: { label: "Propuesta Enviada", color: "indigo" as const },
  NEGOTIATION: { label: "Negociación", color: "orange" as const },
  WON: { label: "Ganado", color: "green" as const },
  LOST: { label: "Perdido", color: "red" as const },
}

const SOURCE_MAP = {
  WEB: "Web",
  PHONE: "Teléfono",
  EMAIL: "Email",
  REFERRAL: "Referido",
  SOCIAL_MEDIA: "Redes Sociales",
  EVENT: "Evento",
  OTHER: "Otro",
}

const INTEREST_LEVEL_MAP = {
  LOW: { label: "Bajo", color: "gray" as const },
  MEDIUM: { label: "Medio", color: "yellow" as const },
  HIGH: { label: "Alto", color: "red" as const },
}

// Mapeo de estados de propuestas
const PROPOSAL_STATUS_MAP = {
  DRAFT: { label: "Borrador", color: "gray" as const },
  PENDING_APPROVAL: { label: "Pendiente Aprobación", color: "yellow" as const },
  SENT: { label: "Enviada", color: "blue" as const },
  ACCEPTED: { label: "Aceptada", color: "green" as const },
  REJECTED: { label: "Rechazada", color: "red" as const },
  EXPIRED: { label: "Expirada", color: "gray" as const },
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener lead con todas sus relaciones
  const lead = await prisma.lead.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
    include: {
      assignedUser: {
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
      },
      timeline: {
        include: {
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
      },
    },
  })

  if (!lead) {
    redirect("/sales/leads")
  }

  // Verificar permisos: si no es director, solo puede ver leads asignados
  if (
    !["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role) &&
    lead.assignedTo !== session.user.id &&
    lead.assignedTo !== null
  ) {
    redirect("/sales/leads")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/sales/leads"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Leads
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.contactName}
            </h1>
            {lead.company && (
              <p className="text-gray-500 mt-1">{lead.company}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge color={STATUS_MAP[lead.status].color}>
              {STATUS_MAP[lead.status].label}
            </Badge>
            <LeadActions lead={lead} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Contacto */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Contacto
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {lead.email && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {lead.email}
                  </a>
                </div>
              )}

              {lead.phone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {formatPhone(lead.phone)}
                  </a>
                </div>
              )}

              {lead.position && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cargo</p>
                  <p className="text-gray-900">{lead.position}</p>
                </div>
              )}

              {lead.company && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Empresa</p>
                  <p className="text-gray-900">{lead.company}</p>
                </div>
              )}
            </div>

            {(lead.address || lead.city || lead.state || lead.postalCode) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Dirección</p>
                <p className="text-gray-900">
                  {[lead.address, lead.city, lead.state, lead.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Detalles del Lead */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Lead
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fuente</p>
                <p className="text-gray-900">
                  {SOURCE_MAP[lead.source as keyof typeof SOURCE_MAP] || lead.source}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Nivel de Interés</p>
                <Badge color={INTEREST_LEVEL_MAP[lead.interestLevel].color}>
                  {INTEREST_LEVEL_MAP[lead.interestLevel].label}
                </Badge>
              </div>

              {lead.estimatedValue && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Estimado</p>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(Number(lead.estimatedValue))}
                  </p>
                </div>
              )}

              {lead.assignedUser && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Asignado a</p>
                  <p className="text-gray-900">
                    {lead.assignedUser.firstName} {lead.assignedUser.lastName}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha de Creación</p>
                <p className="text-gray-900">{formatDate(lead.createdAt)}</p>
              </div>

              {lead.lastContactDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Último Contacto</p>
                  <p className="text-gray-900">
                    {formatDate(lead.lastContactDate)}
                  </p>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Notas</p>
                <p className="text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Propuestas Relacionadas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Propuestas ({lead.proposals.length})
              </h2>
              <Link
                href={`/sales/proposals/new?leadId=${lead.id}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Nueva Propuesta
              </Link>
            </div>

            {lead.proposals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay propuestas creadas para este lead
              </p>
            ) : (
              <div className="space-y-3">
                {lead.proposals.map((proposal) => (
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
                        <Badge
                          color={PROPOSAL_STATUS_MAP[proposal.status].color}
                        >
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
        </div>

        {/* Timeline */}
        <div className="lg:col-span-1">
          <TimelineView timeline={lead.timeline} leadId={lead.id} />
        </div>
      </div>
    </div>
  )
}
