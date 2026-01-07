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

    const { searchParams } = new URL(request.url)
    const lowStock = searchParams.get("lowStock") === "true"

    const where: any = {
      warehouseId: params.id,
      warehouse: {
        companyId: session.user.companyId,
      },
    }

    if (lowStock) {
      where.quantity = {
        lte: prisma.inventory.fields.minStock,
      }
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    })

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error("Error al obtener inventario:", error)
    return NextResponse.json(
      { error: "Error al obtener inventario" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!warehouse) {
      return NextResponse.json(
        { error: "Almacén no encontrado" },
        { status: 404 }
      )
    }

    const { productId, quantity, minStock, maxStock } = await request.json()

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Verificar si ya existe inventario para este producto
    const existing = await prisma.inventory.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: params.id,
          productId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Este producto ya existe en el inventario" },
        { status: 400 }
      )
    }

    const inventory = await prisma.inventory.create({
      data: {
        warehouseId: params.id,
        productId,
        quantity,
        minStock: minStock || 0,
        maxStock: maxStock || 9999,
        reservedQuantity: 0,
      },
      include: {
        product: true,
      },
    })

    // Registrar movimiento
    await prisma.warehouseMovement.create({
      data: {
        warehouseId: params.id,
        productId,
        type: "IN",
        quantity,
        reason: "Stock inicial",
        userId: session.user.id,
        metadata: {},
      },
    })

    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "ADD_INVENTORY",
        entityType: "WAREHOUSE",
        entityId: params.id,
        metadata: {
          productId,
          quantity,
        },
      },
    })

    return NextResponse.json({ inventory }, { status: 201 })
  } catch (error) {
    console.error("Error al agregar inventario:", error)
    return NextResponse.json(
      { error: "Error al agregar inventario" },
      { status: 500 }
    )
  }
}
