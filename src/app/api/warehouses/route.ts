import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const warehouses = await prisma.warehouse.findMany({
      where: {
        companyId: session.user.companyId,
      },
      include: {
        _count: {
          select: {
            inventory: true,
            movements: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ warehouses })
  } catch (error) {
    console.error("Error al obtener almacenes:", error)
    return NextResponse.json(
      { error: "Error al obtener almacenes" },
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

    // Solo admins pueden crear almacenes
    if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const data = await request.json()

    if (!data.name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      )
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        companyId: session.user.companyId,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        phone: data.phone,
        managerId: data.managerId,
        isActive: data.isActive ?? true,
      },
    })

    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "WAREHOUSE",
        entityId: warehouse.id,
        metadata: {
          warehouseName: warehouse.name,
        },
      },
    })

    return NextResponse.json({ warehouse }, { status: 201 })
  } catch (error) {
    console.error("Error al crear almacén:", error)
    return NextResponse.json(
      { error: "Error al crear almacén" },
      { status: 500 }
    )
  }
}
