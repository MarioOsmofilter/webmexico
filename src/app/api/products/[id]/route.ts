import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        prices: true,
        attributes: {
          include: {
            attribute: true,
          },
        },
        datasheets: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Verificar que existe
    const existing = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Actualizar
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name || existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        internalReference: body.internalReference !== undefined ? body.internalReference : existing.internalReference,
        manufacturerReference: body.manufacturerReference !== undefined ? body.manufacturerReference : existing.manufacturerReference,
        categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
        basePrice: body.basePrice !== undefined ? body.basePrice : existing.basePrice,
        status: body.status || existing.status,
      },
      include: {
        category: true,
        images: true,
        prices: true,
      },
    })

    // Log
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "UPDATE_PRODUCT",
        entityType: "product",
        entityId: product.id,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos" },
        { status: 403 }
      )
    }

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Eliminar (cascade eliminará imágenes, precios, atributos)
    await prisma.product.delete({
      where: { id: params.id },
    })

    // Log
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "DELETE_PRODUCT",
        entityType: "product",
        entityId: params.id,
        metadata: { productName: product.name },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    )
  }
}
