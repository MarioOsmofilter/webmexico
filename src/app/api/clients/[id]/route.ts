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

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        proposals: {
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        sales: {
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        installations: {
          orderBy: {
            scheduledDate: "desc",
          },
          take: 10,
        },
        maintenances: {
          orderBy: {
            scheduledDate: "desc",
          },
          take: 10,
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Error al obtener cliente:", error)
    return NextResponse.json(
      { error: "Error al obtener cliente" },
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

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    const data = await request.json()

    // Actualizar cliente
    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name: data.name,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        taxId: data.taxId,
        type: data.type,
        status: data.status,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        assignedToUserId: data.assignedTo,
        notes: data.notes,
      },
      include: {
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
        action: "UPDATE",
        entityType: "CLIENT",
        entityId: client.id,
        metadata: {
          clientName: client.name,
        },
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
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

    // Solo admins pueden eliminar clientes
    if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que el cliente existe
    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        _count: {
          select: {
            sales: true,
            installations: true,
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // No permitir eliminar clientes con ventas o instalaciones
    if (client._count.sales > 0 || client._count.installations > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un cliente con ventas o instalaciones asociadas",
        },
        { status: 400 }
      )
    }

    // Eliminar cliente
    await prisma.client.delete({
      where: { id: params.id },
    })

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "DELETE",
        entityType: "CLIENT",
        entityId: params.id,
        metadata: {
          clientName: client.name,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar cliente:", error)
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    )
  }
}
