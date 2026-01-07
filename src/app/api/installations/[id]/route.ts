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

    const installation = await prisma.installation.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        client: true,
        sale: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        photos: {
          orderBy: {
            createdAt: "asc",
          },
        },
        materials: {
          include: {
            product: {
              select: {
                name: true,
                reference: true,
              },
            },
          },
        },
      },
    })

    if (!installation) {
      return NextResponse.json(
        { error: "Instalación no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ installation })
  } catch (error) {
    console.error("Error al obtener instalación:", error)
    return NextResponse.json(
      { error: "Error al obtener instalación" },
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

    const existingInstallation = await prisma.installation.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!existingInstallation) {
      return NextResponse.json(
        { error: "Instalación no encontrada" },
        { status: 404 }
      )
    }

    const data = await request.json()

    const installation = await prisma.installation.update({
      where: { id: params.id },
      data: {
        scheduledDate: data.scheduledDate
          ? new Date(data.scheduledDate)
          : undefined,
        estimatedDuration: data.estimatedDuration,
        status: data.status,
        assignedTo: data.assignedTo,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes,
        metadata: data.metadata,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        assignedUser: {
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
        action: "UPDATE",
        entityType: "INSTALLATION",
        entityId: installation.id,
        metadata: {
          clientName: installation.client.name,
          changes: data,
        },
      },
    })

    return NextResponse.json({ installation })
  } catch (error) {
    console.error("Error al actualizar instalación:", error)
    return NextResponse.json(
      { error: "Error al actualizar instalación" },
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

    // Solo admins pueden eliminar instalaciones
    if (!["SUPERADMIN", "ADMIN", "DIRECTOR_INSTALLATIONS"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const installation = await prisma.installation.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!installation) {
      return NextResponse.json(
        { error: "Instalación no encontrada" },
        { status: 404 }
      )
    }

    // No permitir eliminar instalaciones completadas
    if (installation.status === "COMPLETED") {
      return NextResponse.json(
        { error: "No se pueden eliminar instalaciones completadas" },
        { status: 400 }
      )
    }

    await prisma.installation.delete({
      where: { id: params.id },
    })

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "DELETE",
        entityType: "INSTALLATION",
        entityId: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar instalación:", error)
    return NextResponse.json(
      { error: "Error al eliminar instalación" },
      { status: 500 }
    )
  }
}
