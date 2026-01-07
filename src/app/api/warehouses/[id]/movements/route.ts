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

    const movements = await prisma.warehouseMovement.findMany({
      where: {
        warehouseId: params.id,
        warehouse: {
          companyId: session.user.companyId,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            reference: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    })

    return NextResponse.json({ movements })
  } catch (error) {
    console.error("Error al obtener movimientos:", error)
    return NextResponse.json(
      { error: "Error al obtener movimientos" },
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

    const { productId, type, quantity, reason } = await request.json()

    if (!productId || !type || !quantity || !reason) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    if (!["IN", "OUT", "ADJUSTMENT", "TRANSFER"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    // Obtener inventario actual
    const inventory = await prisma.inventory.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: params.id,
          productId,
        },
      },
    })

    if (!inventory) {
      return NextResponse.json(
        { error: "Producto no encontrado en inventario" },
        { status: 404 }
      )
    }

    // Calcular nueva cantidad
    let newQuantity = inventory.quantity
    if (type === "IN") {
      newQuantity += quantity
    } else if (type === "OUT" || type === "TRANSFER") {
      if (inventory.quantity < quantity) {
        return NextResponse.json(
          { error: "Stock insuficiente" },
          { status: 400 }
        )
      }
      newQuantity -= quantity
    } else if (type === "ADJUSTMENT") {
      newQuantity = quantity
    }

    // Actualizar inventario
    await prisma.inventory.update({
      where: {
        warehouseId_productId: {
          warehouseId: params.id,
          productId,
        },
      },
      data: {
        quantity: newQuantity,
      },
    })

    // Registrar movimiento
    const movement = await prisma.warehouseMovement.create({
      data: {
        warehouseId: params.id,
        productId,
        type,
        quantity,
        reason,
        userId: session.user.id,
        metadata: {},
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    })

    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "WAREHOUSE_MOVEMENT",
        entityType: "WAREHOUSE",
        entityId: params.id,
        metadata: {
          productId,
          type,
          quantity,
          reason,
        },
      },
    })

    return NextResponse.json({ movement }, { status: 201 })
  } catch (error) {
    console.error("Error al registrar movimiento:", error)
    return NextResponse.json(
      { error: "Error al registrar movimiento" },
      { status: 500 }
    )
  }
}
