import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

// Obtener materiales de la instalación
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
        materials: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { order: "asc" },
                },
              },
            },
            warehouse: {
              select: {
                name: true,
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

    return NextResponse.json({ materials: installation.materials })
  } catch (error) {
    console.error("Error al obtener materiales:", error)
    return NextResponse.json(
      { error: "Error al obtener materiales" },
      { status: 500 }
    )
  }
}

// Agregar materiales a la instalación y bloquear stock
export async function POST(
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
    })

    if (!installation) {
      return NextResponse.json(
        { error: "Instalación no encontrada" },
        { status: 404 }
      )
    }

    const { productId, quantity, warehouseId } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Verificar stock disponible
    const inventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId: warehouseId || undefined,
        warehouse: {
          companyId: session.user.companyId,
        },
      },
    })

    if (!inventory || inventory.quantity < quantity) {
      return NextResponse.json(
        {
          error: `Stock insuficiente. Disponible: ${
            inventory?.quantity || 0
          }, Solicitado: ${quantity}`,
        },
        { status: 400 }
      )
    }

    // Crear material de instalación
    const material = await prisma.installationMaterial.create({
      data: {
        installationId: params.id,
        productId,
        warehouseId: warehouseId || inventory.warehouseId,
        quantity,
        isLoaded: false,
        isReserved: true,
      },
      include: {
        product: {
          include: {
            images: {
              take: 1,
            },
          },
        },
      },
    })

    // Bloquear stock (restar de inventario disponible)
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: {
          decrement: quantity,
        },
        reservedQuantity: {
          increment: quantity,
        },
      },
    })

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "RESERVE_STOCK",
        entityType: "INSTALLATION",
        entityId: params.id,
        metadata: {
          productId,
          quantity,
          warehouseId: inventory.warehouseId,
        },
      },
    })

    return NextResponse.json({ material }, { status: 201 })
  } catch (error) {
    console.error("Error al agregar material:", error)
    return NextResponse.json(
      { error: "Error al agregar material" },
      { status: 500 }
    )
  }
}
