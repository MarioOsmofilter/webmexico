import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate, formatDateTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"

const STATUS_MAP = {
  SCHEDULED: { label: "Programada", variant: "primary" as const },
  IN_PROGRESS: { label: "En Progreso", variant: "warning" as const },
  COMPLETED: { label: "Completada", variant: "success" as const },
  CANCELLED: { label: "Cancelada", variant: "error" as const },
  POSTPONED: { label: "Postponida", variant: "neutral" as const },
}

export default async function InstallationsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener instalaciones asignadas al técnico
  const installations = await prisma.installation.findMany({
    where: {
      companyId: session.user.companyId,
      assignedToUserId: session.user.id,
      status: {
        in: ["SCHEDULED", "IN_PROGRESS", "POSTPONED"],
      },
    },
    include: {
      client: {
        select: {
          name: true,
          contactName: true,
          phone: true,
          address: true,
          city: true,
        },
      },
      materials: {
        include: {
          product: {
            select: {
              name: true,
              internalReference: true,
            },
          },
        },
      },
      _count: {
        select: {
          photos: true,
        },
      },
    },
    orderBy: {
      scheduledDate: "asc",
    },
  })

  // Separar instalaciones
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayInstallations = installations.filter((i) => {
    const schedDate = new Date(i.scheduledDate)
    schedDate.setHours(0, 0, 0, 0)
    return schedDate.getTime() === today.getTime()
  })

  const inProgress = installations.filter((i) => i.status === "IN_PROGRESS")
  const upcoming = installations.filter((i) => {
    const schedDate = new Date(i.scheduledDate)
    schedDate.setHours(0, 0, 0, 0)
    return schedDate.getTime() > today.getTime() && i.status !== "IN_PROGRESS"
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Mis Instalaciones
        </h1>
        <p className="text-gray-500 mt-1">
          Gestiona tus instalaciones asignadas
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="text-2xl font-bold text-blue-600">
            {todayInstallations.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">En Progreso</p>
          <p className="text-2xl font-bold text-yellow-600">
            {inProgress.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Próximas</p>
          <p className="text-2xl font-bold text-gray-600">
            {upcoming.length}
          </p>
        </div>
      </div>

      {/* En Progreso */}
      {inProgress.length > 0 && (
        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ⚡ Instalación en Progreso
          </h2>
          {inProgress.map((installation) => (
            <Link
              key={installation.id}
              href={`/technician/installations/${installation.id}`}
              className="block bg-white p-4 rounded-lg border border-yellow-300 hover:border-yellow-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {installation.client.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {installation.client.address}, {installation.client.city}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Iniciada:{" "}
                    {installation.actualStartDate &&
                      formatDateTime(installation.actualStartDate)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">
                    ⏱️
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    En curso
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Instalaciones de Hoy */}
      {todayInstallations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📅 Hoy ({formatDate(today)})
          </h2>
          <div className="space-y-3">
            {todayInstallations.map((installation) => {
              const allMaterialsLoaded = installation.materials.every(
                (m) => m.isLoaded
              )
              const hasMaterials = installation.materials.length > 0

              return (
                <div
                  key={installation.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {installation.client.name}
                        </h3>
                        <Badge variant={STATUS_MAP[installation.status].variant}>
                          {STATUS_MAP[installation.status].label}
                        </Badge>
                        {hasMaterials && !allMaterialsLoaded && (
                          <Badge variant="error">⚠️ Sin cargar materiales</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {installation.client.address}, {installation.client.city}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        🕐 {formatDateTime(installation.scheduledDate)} •{" "}
                        {installation.estimatedDuration} min
                      </p>
                    </div>
                  </div>

                  {/* Materiales */}
                  {installation.materials.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Materiales necesarios:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {installation.materials.map((material) => (
                          <div
                            key={material.id}
                            className={`text-sm p-2 rounded ${
                              material.isLoaded
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {material.isLoaded ? "✅" : "❌"}{" "}
                            {material.product.name} x{material.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/technician/installations/${installation.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ver Detalles
                    </Link>
                    {hasMaterials && !allMaterialsLoaded && (
                      <Link
                        href={`/technician/installations/${installation.id}/load`}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white text-center rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Cargar Materiales
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Próximas Instalaciones */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📆 Próximas Instalaciones
          </h2>
          <div className="space-y-3">
            {upcoming.map((installation) => (
              <div
                key={installation.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {installation.client.name}
                      </h3>
                      <Badge variant={STATUS_MAP[installation.status].variant}>
                        {STATUS_MAP[installation.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {installation.client.address}, {installation.client.city}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {formatDateTime(installation.scheduledDate)}
                    </p>
                    {installation.materials.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        📦 {installation.materials.length} material(es)
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/technician/installations/${installation.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin instalaciones */}
      {installations.length === 0 && (
        <EmptyState
          icon="🔧"
          title="No hay instalaciones asignadas"
          description="No tienes instalaciones programadas en este momento"
        />
      )}
    </div>
  )
}
