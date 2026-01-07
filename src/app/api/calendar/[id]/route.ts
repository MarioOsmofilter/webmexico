import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            contactName: true,
            phone: true,
            email: true,
            address: true,
            city: true,
          },
        },
        client: {
          select: {
            id: true,
            contactName: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error al obtener evento:", error)
    return NextResponse.json(
      { error: "Error al obtener evento" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    const data = await request.json()

    // Validar fechas si se proporcionan
    if (data.startDatetime && data.endDatetime) {
      if (new Date(data.endDatetime) <= new Date(data.startDatetime)) {
        return NextResponse.json(
          { error: "La fecha de fin debe ser posterior a la de inicio" },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.calendarEvent.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        startDatetime: data.startDatetime
          ? new Date(data.startDatetime)
          : undefined,
        endDatetime: data.endDatetime ? new Date(data.endDatetime) : undefined,
        location: data.location,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        status: data.status,
        leadId: data.leadId !== undefined ? data.leadId : undefined,
        clientId: data.clientId !== undefined ? data.clientId : undefined,
        relatedEntityType:
          data.leadId !== undefined || data.clientId !== undefined
            ? data.leadId
              ? "lead"
              : data.clientId
              ? "client"
              : null
            : undefined,
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
    })

    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "UPDATE",
        entityType: "CALENDAR_EVENT",
        entityId: params.id,
        metadata: {
          changes: data,
        },
      },
    })

    return NextResponse.json({ event: updated })
  } catch (error) {
    console.error("Error al actualizar evento:", error)
    return NextResponse.json(
      { error: "Error al actualizar evento" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    await prisma.calendarEvent.delete({
      where: { id: params.id },
    })

    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "DELETE",
        entityType: "CALENDAR_EVENT",
        entityId: params.id,
        metadata: {
          title: event.title,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar evento:", error)
    return NextResponse.json(
      { error: "Error al eliminar evento" },
      { status: 500 }
    )
  }
}
