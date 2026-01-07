import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate, formatTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"

const EVENT_TYPE_LABELS: Record<string, string> = {
  VISIT: "Visita",
  INSTALLATION: "Instalación",
  MAINTENANCE: "Mantenimiento",
  CALL: "Llamada",
  MEETING: "Reunión",
  OTHER: "Otro",
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  VISIT: "blue",
  INSTALLATION: "purple",
  MAINTENANCE: "orange",
  CALL: "green",
  MEETING: "indigo",
  OTHER: "gray",
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  RESCHEDULED: "Reprogramado",
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  RESCHEDULED: "yellow",
}

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener eventos del mes actual
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const events = await prisma.calendarEvent.findMany({
    where: {
      companyId: session.user.companyId,
      startDatetime: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      lead: {
        select: {
          contactName: true,
        },
      },
      client: {
        select: {
          contactName: true,
          name: true,
        },
      },
    },
    orderBy: {
      startDatetime: "asc",
    },
  })

  // Agrupar eventos por fecha
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = event.startDatetime.toISOString().split("T")[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, typeof events>)

  // Generar días del mes
  const daysInMonth = endOfMonth.getDate()
  const firstDayOfWeek = startOfMonth.getDay()

  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.startDatetime)
    eventDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return eventDate.getTime() === today.getTime()
  })

  const upcomingEvents = events.filter((e) => {
    const eventDate = new Date(e.startDatetime)
    const today = new Date()
    return eventDate > today
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus eventos y citas
          </p>
        </div>
        <Link
          href="/admin/calendar/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nuevo Evento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Total Eventos</p>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="text-2xl font-bold text-blue-600">
            {todayEvents.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Próximos</p>
          <p className="text-2xl font-bold text-green-600">
            {upcomingEvents.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {now.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </h2>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Días de la semana */}
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-500 pb-2"
              >
                {day}
              </div>
            ))}

            {/* Días vacíos antes del primer día */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = new Date(now.getFullYear(), now.getMonth(), day)
              const dateKey = date.toISOString().split("T")[0]
              const dayEvents = eventsByDate[dateKey] || []
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-lg p-1 ${
                    isToday ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`text-xs font-medium ${
                      isToday ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1">
                      <div className="text-xs text-blue-600 font-medium">
                        {dayEvents.length} evento{dayEvents.length > 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Próximos Eventos
          </h2>

          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">
              No hay eventos próximos
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {upcomingEvents.slice(0, 10).map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/calendar/${event.id}`}
                  className="block pb-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 rounded p-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          color={
                            EVENT_TYPE_COLORS[
                              event.eventType as keyof typeof EVENT_TYPE_COLORS
                            ]
                          }
                        >
                          {
                            EVENT_TYPE_LABELS[
                              event.eventType as keyof typeof EVENT_TYPE_LABELS
                            ]
                          }
                        </Badge>
                        <Badge
                          color={
                            STATUS_COLORS[
                              event.status as keyof typeof STATUS_COLORS
                            ]
                          }
                        >
                          {
                            STATUS_LABELS[
                              event.status as keyof typeof STATUS_LABELS
                            ]
                          }
                        </Badge>
                      </div>
                      {(event.lead || event.client) && (
                        <p className="text-xs text-gray-600 mt-1">
                          {event.lead
                            ? event.lead.contactName
                            : event.client?.name || event.client?.contactName}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(event.startDatetime)} •{" "}
                    {formatTime(event.startDatetime)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de eventos de hoy */}
      {todayEvents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Eventos de Hoy
          </h2>

          <div className="space-y-3">
            {todayEvents.map((event) => (
              <Link
                key={event.id}
                href={`/admin/calendar/${event.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <Badge
                        color={
                          EVENT_TYPE_COLORS[
                            event.eventType as keyof typeof EVENT_TYPE_COLORS
                          ]
                        }
                      >
                        {
                          EVENT_TYPE_LABELS[
                            event.eventType as keyof typeof EVENT_TYPE_LABELS
                          ]
                        }
                      </Badge>
                      <Badge
                        color={
                          STATUS_COLORS[
                            event.status as keyof typeof STATUS_COLORS
                          ]
                        }
                      >
                        {
                          STATUS_LABELS[
                            event.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>
                        ⏰ {formatTime(event.startDatetime)} -{" "}
                        {formatTime(event.endDatetime)}
                      </span>
                      {event.location && <span>📍 {event.location}</span>}
                      {(event.lead || event.client) && (
                        <span>
                          👤{" "}
                          {event.lead
                            ? event.lead.contactName
                            : event.client?.name || event.client?.contactName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
