import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma/client"

// GET /api/public/products/[id] - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Obtener producto
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: apiKeyRecord.companyId,
        status: "ACTIVE",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
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
        datasheets: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Formatear respuesta
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      reference: product.internalReference,
      manufacturerReference: product.manufacturerReference,
      basePrice: product.basePrice,
      category: product.category?.name || null,
      images: product.images.map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary,
      })),
      prices: product.prices
        ? {
            sale: {
              1: product.prices.salePrice1,
              12: product.prices.salePrice12,
              24: product.prices.salePrice24,
              36: product.prices.salePrice36,
              48: product.prices.salePrice48,
              60: product.prices.salePrice60,
            },
            rental: {
              12: product.prices.rentalPrice12,
              24: product.prices.rentalPrice24,
              36: product.prices.rentalPrice36,
              48: product.prices.rentalPrice48,
              60: product.prices.rentalPrice60,
            },
          }
        : null,
      attributes: product.attributes.map((attr) => ({
        name: attr.attribute.name,
        type: attr.attribute.type,
        value: attr.value,
      })),
      datasheets: product.datasheets.map((ds) => ({
        language: ds.language,
        pdfUrl: ds.pdfUrl,
      })),
    }

    // Actualizar último uso de API Key
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })

    return NextResponse.json({ product: formattedProduct })
  } catch (error) {
    console.error("Error fetching public product:", error)
    return NextResponse.json(
      { error: "Error al obtener producto" },
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
