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
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Construir filtros
    const where: any = {
      companyId: session.user.companyId,
    }

    // Si es técnico, solo ver instalaciones asignadas
    if (session.user.role === "TECHNICIAN") {
      where.assignedTo = session.user.id
    }

    if (status) {
      where.status = status
    }

    if (assignedTo) {
      where.assignedTo = assignedTo
    }

    if (startDate || endDate) {
      where.scheduledDate = {}
      if (startDate) {
        where.scheduledDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.scheduledDate.lte = new Date(endDate)
      }
    }

    const installations = await prisma.installation.findMany({
      where,
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
        sale: {
          select: {
            id: true,
            totalAmount: true,
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
            photos: true,
            materials: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    })

    return NextResponse.json({ installations })
  } catch (error) {
    console.error("Error al obtener instalaciones:", error)
    return NextResponse.json(
      { error: "Error al obtener instalaciones" },
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

    // Validar datos requeridos
    if (!data.clientId || !data.scheduledDate) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Crear instalación
    const installation = await prisma.installation.create({
      data: {
        companyId: session.user.companyId,
        clientId: data.clientId,
        saleId: data.saleId,
        assignedToUserId: data.assignedTo || session.user.id,
        scheduledDate: new Date(data.scheduledDate),
        estimatedDuration: data.estimatedDuration || 120,
        status: "SCHEDULED",
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes,
        metadata: data.metadata || {},
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "INSTALLATION",
        entityId: installation.id,
        metadata: {
          clientName: installation.client.name,
          scheduledDate: installation.scheduledDate,
        },
      },
    })

    return NextResponse.json({ installation }, { status: 201 })
  } catch (error) {
    console.error("Error al crear instalación:", error)
    return NextResponse.json(
      { error: "Error al crear instalación" },
      { status: 500 }
    )
  }
}
