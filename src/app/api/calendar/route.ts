import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")
    const userId = searchParams.get("userId")

    const where: any = {
      companyId: session.user.companyId,
    }

    // Filtrar por usuario si se especifica
    if (userId) {
      where.userId = userId
    } else {
      // Por defecto, mostrar eventos del usuario actual
      where.userId = session.user.id
    }

    // Filtrar por rango de fechas
    if (start && end) {
      where.startDatetime = {
        gte: new Date(start),
        lte: new Date(end),
      }
    }

    const events = await prisma.calendarEvent.findMany({
      where,
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
            address: true,
            city: true,
          },
        },
      },
      orderBy: {
        startDatetime: "asc",
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error al obtener eventos:", error)
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Validaciones
    if (!data.title || !data.startDatetime || !data.endDatetime) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (new Date(data.endDatetime) <= new Date(data.startDatetime)) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la de inicio" },
        { status: 400 }
      )
    }

    const event = await prisma.calendarEvent.create({
      data: {
        companyId: session.user.companyId,
        userId: data.userId || session.user.id,
        eventType: data.eventType || "OTHER",
        title: data.title,
        description: data.description,
        startDatetime: new Date(data.startDatetime),
        endDatetime: new Date(data.endDatetime),
        location: data.location,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        leadId: data.leadId || null,
        clientId: data.clientId || null,
        relatedEntityType: data.leadId
          ? "lead"
          : data.clientId
          ? "client"
          : null,
        status: data.status || "SCHEDULED",
        createdBy: session.user.id,
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

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "CALENDAR_EVENT",
        entityId: event.id,
        metadata: {
          title: event.title,
          eventType: event.eventType,
        },
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Error al crear evento:", error)
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    )
  }
}
