import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"

const TYPE_LABELS: Record<string, string> = {
  PERIODIC: "Periódico",
  INCIDENT: "Incidencia",
  EMERGENCY: "Emergencia",
}

const TYPE_COLORS: Record<string, string> = {
  PERIODIC: "blue",
  INCIDENT: "orange",
  EMERGENCY: "red",
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programado",
  IN_PROGRESS: "En Curso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "blue",
  IN_PROGRESS: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
}

export default async function MaintenancesPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const where: any = {
    companyId: session.user.companyId,
  }

  // Los técnicos solo ven sus mantenimientos
  if (session.user.role === "TECHNICIAN") {
    where.assignedToUserId = session.user.id
  }

  const maintenances = await prisma.maintenance.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          contactName: true,
          name: true,
          phone: true,
          address: true,
          city: true,
        },
      },
      assignedTo: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          materials: true,
          history: true,
        },
      },
    },
    orderBy: {
      scheduledDate: "asc",
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayMaintenances = maintenances.filter((m) => {
    const schedDate = new Date(m.scheduledDate)
    schedDate.setHours(0, 0, 0, 0)
    return schedDate.getTime() === today.getTime()
  })

  const upcomingMaintenances = maintenances.filter((m) => {
    const schedDate = new Date(m.scheduledDate)
    schedDate.setHours(0, 0, 0, 0)
    return schedDate.getTime() > today.getTime()
  })

  const overdueMaintenances = maintenances.filter((m) => {
    const schedDate = new Date(m.scheduledDate)
    schedDate.setHours(0, 0, 0, 0)
    return (
      schedDate.getTime() < today.getTime() &&
      m.status !== "COMPLETED" &&
      m.status !== "CANCELLED"
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimientos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los mantenimientos programados
          </p>
        </div>
        {["SUPERADMIN", "ADMIN", "DIRECTOR_INSTALLATIONS"].includes(
          session.user.role
        ) && (
          <Link
            href="/technician/maintenances/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nuevo Mantenimiento
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {maintenances.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="text-2xl font-bold text-blue-600">
            {todayMaintenances.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Próximos</p>
          <p className="text-2xl font-bold text-green-600">
            {upcomingMaintenances.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Atrasados</p>
          <p className="text-2xl font-bold text-red-600">
            {overdueMaintenances.length}
          </p>
        </div>
      </div>

      {/* Atrasados */}
      {overdueMaintenances.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ⚠️ Mantenimientos Atrasados ({overdueMaintenances.length})
          </h2>
          <div className="space-y-3">
            {overdueMaintenances.map((maintenance) => (
              <Link
                key={maintenance.id}
                href={`/technician/maintenances/${maintenance.id}`}
                className="block p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {maintenance.client.name || maintenance.client.contactName}
                      </h3>
                      <Badge
                        variant={
                          TYPE_COLORS[
                            maintenance.maintenanceType as keyof typeof TYPE_COLORS
                          ]
                        }
                      >
                        {
                          TYPE_LABELS[
                            maintenance.maintenanceType as keyof typeof TYPE_LABELS
                          ]
                        }
                      </Badge>
                      <Badge
                        variant={
                          STATUS_COLORS[
                            maintenance.status as keyof typeof STATUS_COLORS
                          ]
                        }
                      >
                        {
                          STATUS_LABELS[
                            maintenance.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>📅 {formatDate(maintenance.scheduledDate)}</span>
                      {maintenance.client.address && (
                        <span>
                          📍 {maintenance.client.address}, {maintenance.client.city}
                        </span>
                      )}
                      <span>
                        👤 {maintenance.assignedTo.firstName}{" "}
                        {maintenance.assignedTo.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hoy */}
      {todayMaintenances.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mantenimientos de Hoy ({todayMaintenances.length})
          </h2>
          <div className="space-y-3">
            {todayMaintenances.map((maintenance) => (
              <Link
                key={maintenance.id}
                href={`/technician/maintenances/${maintenance.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {maintenance.client.name || maintenance.client.contactName}
                      </h3>
                      <Badge
                        variant={
                          TYPE_COLORS[
                            maintenance.maintenanceType as keyof typeof TYPE_COLORS
                          ]
                        }
                      >
                        {
                          TYPE_LABELS[
                            maintenance.maintenanceType as keyof typeof TYPE_LABELS
                          ]
                        }
                      </Badge>
                      <Badge
                        variant={
                          STATUS_COLORS[
                            maintenance.status as keyof typeof STATUS_COLORS
                          ]
                        }
                      >
                        {
                          STATUS_LABELS[
                            maintenance.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </div>
                    {maintenance.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {maintenance.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {maintenance.client.phone && (
                        <span>📞 {maintenance.client.phone}</span>
                      )}
                      {maintenance.client.address && (
                        <span>
                          📍 {maintenance.client.address}, {maintenance.client.city}
                        </span>
                      )}
                      {maintenance._count.materials > 0 && (
                        <span>🔧 {maintenance._count.materials} materiales</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Próximos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Próximos Mantenimientos
        </h2>

        {upcomingMaintenances.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay mantenimientos próximos
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Técnico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingMaintenances.map((maintenance) => (
                  <tr key={maintenance.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {maintenance.client.name || maintenance.client.contactName}
                        </p>
                        {maintenance.client.phone && (
                          <p className="text-sm text-gray-500">
                            {maintenance.client.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          TYPE_COLORS[
                            maintenance.maintenanceType as keyof typeof TYPE_COLORS
                          ]
                        }
                      >
                        {
                          TYPE_LABELS[
                            maintenance.maintenanceType as keyof typeof TYPE_LABELS
                          ]
                        }
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(maintenance.scheduledDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {maintenance.assignedTo.firstName}{" "}
                      {maintenance.assignedTo.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          STATUS_COLORS[
                            maintenance.status as keyof typeof STATUS_COLORS
                          ]
                        }
                      >
                        {
                          STATUS_LABELS[
                            maintenance.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/technician/maintenances/${maintenance.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
