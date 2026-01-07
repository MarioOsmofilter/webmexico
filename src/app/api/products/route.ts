import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { productSchema } from "@/lib/utils/validators"

// GET /api/products - Listar productos
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: any = {
      companyId: session.user.companyId,
    }

    if (category) where.categoryId = category
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { internalReference: { contains: search, mode: "insensitive" } },
        { manufacturerReference: { contains: search, mode: "insensitive" } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        prices: true,
        _count: {
          select: {
            images: true,
            attributes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    )
  }
}

// POST /api/products - Crear producto
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Solo admin puede crear productos
    if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para crear productos" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar
    const validation = productSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Crear producto
    const product = await prisma.product.create({
      data: {
        companyId: session.user.companyId,
        name: data.name,
        description: data.description || null,
        internalReference: data.internalReference || null,
        manufacturerReference: data.manufacturerReference || null,
        categoryId: data.categoryId || null,
        basePrice: data.basePrice,
        status: "ACTIVE",
        isMaster: false,
        createdBy: session.user.id,
      },
    })

    // Log
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE_PRODUCT",
        entityType: "product",
        entityId: product.id,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    )
  }
}
