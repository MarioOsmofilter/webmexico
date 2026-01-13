import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { CalendarEventForm } from "./CalendarEventForm"

export default async function NewCalendarEventPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener leads y clientes para el formulario
  const [leads, clients, users] = await Promise.all([
    prisma.lead.findMany({
      where: {
        companyId: session.user.companyId,
        status: { not: "CONVERTED" },
      },
      select: {
        id: true,
        contactName: true,
        phone: true,
      },
      orderBy: {
        contactName: "asc",
      },
    }),
    prisma.client.findMany({
      where: {
        companyId: session.user.companyId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        contactName: true,
        name: true,
        phone: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        firstName: "asc",
      },
    }),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/calendar"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Agenda
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Evento</h1>
        <p className="text-gray-500 mt-1">Crea un nuevo evento en el calendario</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <CalendarEventForm leads={leads} clients={clients} users={users} />
      </div>
    </div>
  )
}
