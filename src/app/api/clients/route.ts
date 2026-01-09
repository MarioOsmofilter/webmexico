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
    const type = searchParams.get("type")
    const assignedTo = searchParams.get("assignedTo")
    const search = searchParams.get("search")

    // Construir filtros
    const where: any = {
      companyId: session.user.companyId,
    }

    // Si no es director/admin, solo ver clientes asignados
    if (
      !["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)
    ) {
      where.OR = [{ assignedTo: session.user.id }, { assignedTo: null }]
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (assignedTo) {
      where.assignedTo = assignedTo
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { taxId: { contains: search } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            proposals: true,
            sales: true,
            installations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
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
    if (!data.name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      )
    }

    if (!data.email && !data.phone) {
      return NextResponse.json(
        { error: "Se requiere al menos un email o teléfono" },
        { status: 400 }
      )
    }

    // Crear cliente
    const client = await prisma.client.create({
      data: {
        companyId: session.user.companyId,
        name: data.name,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        taxId: data.taxId,
        type: data.type || "INDIVIDUAL",
        status: data.status || "ACTIVE",
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || "España",
        assignedToUserId: data.assignedTo || session.user.id,
        notes: data.notes,
        metadata: data.metadata || {},
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
        action: "CREATE",
        entityType: "CLIENT",
        entityId: client.id,
        metadata: {
          clientName: client.name,
        },
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    )
  }
}
