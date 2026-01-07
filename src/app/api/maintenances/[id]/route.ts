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

    const maintenance = await prisma.maintenance.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: {
            id: true,
            contactName: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
          },
        },
        installation: {
          select: {
            id: true,
            scheduledDate: true,
            address: true,
            city: true,
          },
        },
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        materials: {
          include: {
            product: {
              select: {
                name: true,
                internalReference: true,
                images: {
                  take: 1,
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
        history: {
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!maintenance) {
      return NextResponse.json(
        { error: "Mantenimiento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ maintenance })
  } catch (error) {
    console.error("Error al obtener mantenimiento:", error)
    return NextResponse.json(
      { error: "Error al obtener mantenimiento" },
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

    const maintenance = await prisma.maintenance.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!maintenance) {
      return NextResponse.json(
        { error: "Mantenimiento no encontrado" },
        { status: 404 }
      )
    }

    const data = await request.json()

    const updated = await prisma.maintenance.update({
      where: { id: params.id },
      data: {
        scheduledDate: data.scheduledDate
          ? new Date(data.scheduledDate)
          : undefined,
        status: data.status,
        maintenanceType: data.maintenanceType,
        notes: data.notes,
        nextMaintenanceDate: data.nextMaintenanceDate
          ? new Date(data.nextMaintenanceDate)
          : undefined,
        assignedToUserId: data.assignedToUserId,
        completedAt:
          data.status === "COMPLETED" ? new Date() : undefined,
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
        action: "UPDATE",
        entityType: "MAINTENANCE",
        entityId: params.id,
        metadata: {
          changes: data,
        },
      },
    })

    return NextResponse.json({ maintenance: updated })
  } catch (error) {
    console.error("Error al actualizar mantenimiento:", error)
    return NextResponse.json(
      { error: "Error al actualizar mantenimiento" },
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

    if (![" SUPERADMIN", "ADMIN", "DIRECTOR_INSTALLATIONS"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const maintenance = await prisma.maintenance.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!maintenance) {
      return NextResponse.json(
        { error: "Mantenimiento no encontrado" },
        { status: 404 }
      )
    }

    await prisma.maintenance.delete({
      where: { id: params.id },
    })

    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "DELETE",
        entityType: "MAINTENANCE",
        entityId: params.id,
        metadata: {
          clientId: maintenance.clientId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error)
    return NextResponse.json(
      { error: "Error al eliminar mantenimiento" },
      { status: 500 }
    )
  }
}
