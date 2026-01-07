import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma/client"

// GET /api/public/products - Listar productos públicos
export async function GET(request: NextRequest) {
  try {
    // Verificar API Key
    const apiKey = request.headers.get("X-API-Key")

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key requerida" },
        { status: 401 }
      )
    }

    // Buscar API Key
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        isActive: true,
      },
    })

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: "API Key inválida" },
        { status: 401 }
      )
    }

    // Verificar permisos
    const permissions = apiKeyRecord.permissions as any
    if (!permissions?.products?.includes("read")) {
      return NextResponse.json(
        { error: "Esta API Key no tiene permisos para leer productos" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Construir filtros
    const where: any = {
      companyId: apiKeyRecord.companyId,
      status: "ACTIVE",
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { internalReference: { contains: search, mode: "insensitive" } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        prices: true,
        attributes: {
          include: {
            attribute: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
      take: Math.min(limit, 100),
      orderBy: { name: "asc" },
    })

    // Formatear respuesta
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      reference: product.internalReference,
      basePrice: product.basePrice,
      category: product.category?.name,
      image: product.images[0]?.url || null,
      prices: product.prices,
      attributes: product.attributes.map((attr) => ({
        name: attr.attribute.name,
        value: attr.value,
      })),
    }))

    // Actualizar último uso de API Key
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length,
    })
  } catch (error) {
    console.error("Error fetching public products:", error)
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    )
  }
}

// OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  })
}
