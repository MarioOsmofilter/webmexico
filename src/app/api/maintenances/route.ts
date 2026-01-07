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
    const clientId = searchParams.get("clientId")
    const assignedTo = searchParams.get("assignedTo")

    const where: any = {
      companyId: session.user.companyId,
    }

    if (status) {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (assignedTo) {
      where.assignedToUserId = assignedTo
    } else if (session.user.role === "TECHNICIAN") {
      // Los técnicos solo ven sus mantenimientos
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
        installation: {
          select: {
            id: true,
            scheduledDate: true,
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
            history: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    })

    return NextResponse.json({ maintenances })
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error)
    return NextResponse.json(
      { error: "Error al obtener mantenimientos" },
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
    if (!data.clientId || !data.assignedToUserId || !data.scheduledDate) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el cliente existe y pertenece a la empresa
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        companyId: session.user.companyId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        companyId: session.user.companyId,
        clientId: data.clientId,
        installationId: data.installationId || null,
        assignedToUserId: data.assignedToUserId,
        maintenanceType: data.maintenanceType || "PERIODIC",
        scheduledDate: new Date(data.scheduledDate),
        status: "SCHEDULED",
        notes: data.notes,
        nextMaintenanceDate: data.nextMaintenanceDate
          ? new Date(data.nextMaintenanceDate)
          : null,
      },
      include: {
        client: {
          select: {
            contactName: true,
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

    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "MAINTENANCE",
        entityId: maintenance.id,
        metadata: {
          clientId: data.clientId,
          type: data.maintenanceType,
        },
      },
    })

    return NextResponse.json({ maintenance }, { status: 201 })
  } catch (error) {
    console.error("Error al crear mantenimiento:", error)
    return NextResponse.json(
      { error: "Error al crear mantenimiento" },
      { status: 500 }
    )
  }
}
