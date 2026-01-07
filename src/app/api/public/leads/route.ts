import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma/client"
import { z } from "zod"

// Schema simplificado para formulario público
const publicLeadSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(9, "Teléfono inválido"),
  message: z.string().optional(),
  company: z.string().optional(),
})

// POST /api/public/leads - Crear lead desde formulario web
export async function POST(request: NextRequest) {
  try {
    // Verificar API Key
    const apiKey = request.headers.get("X-API-Key")

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key requerida" },
        { status: 401 }
      )
    }

    // Buscar API Key en la base de datos
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        isActive: true,
      },
      include: {
        company: true,
      },
    })

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: "API Key inválida" },
        { status: 401 }
      )
    }

    // Verificar permisos de la API Key
    const permissions = apiKeyRecord.permissions as any
    if (!permissions?.leads?.includes("create")) {
      return NextResponse.json(
        { error: "Esta API Key no tiene permisos para crear leads" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar datos
    const validation = publicLeadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Crear lead
    const lead = await prisma.lead.create({
      data: {
        companyId: apiKeyRecord.companyId,
        source: "WEB",
        contactType: data.company ? "BUSINESS" : "INDIVIDUAL",
        contactName: data.name,
        email: data.email || null,
        phone: data.phone,
        businessName: data.company || null,
        notes: data.message || null,
        status: "NEW",
      },
    })

    // Crear entrada en timeline
    await prisma.contactTimeline.create({
      data: {
        leadId: lead.id,
        actionType: "CREATED",
        description: "Lead recibido desde formulario web",
      },
    })

    // Actualizar último uso de API Key
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Gracias por tu interés. Te contactaremos pronto.",
        leadId: lead.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating public lead:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  })
}
