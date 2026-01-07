import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el lead existe y pertenece a la empresa del usuario
    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    // Verificar que el lead no ha sido convertido ya
    if (lead.convertedToClient) {
      return NextResponse.json(
        { error: "Este lead ya ha sido convertido a cliente" },
        { status: 400 }
      )
    }

    // Verificar que el lead está en estado WON
    if (lead.status !== "WON") {
      return NextResponse.json(
        { error: "Solo se pueden convertir leads en estado 'Ganado'" },
        { status: 400 }
      )
    }

    // Verificar que hay email o teléfono
    if (!lead.email && !lead.phone) {
      return NextResponse.json(
        { error: "El lead debe tener al menos un email o teléfono" },
        { status: 400 }
      )
    }

    // Crear cliente
    const client = await prisma.client.create({
      data: {
        companyId: lead.companyId,
        name: lead.company || lead.contactName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        postalCode: lead.postalCode,
        assignedTo: lead.assignedTo,
        notes: lead.notes,
        status: "ACTIVE",
        type: "INDIVIDUAL", // O "COMPANY" si tiene empresa
      },
    })

    // Actualizar lead
    await prisma.lead.update({
      where: { id: params.id },
      data: {
        convertedToClient: true,
        clientId: client.id,
      },
    })

    // Agregar entrada al timeline del lead
    await prisma.leadTimeline.create({
      data: {
        leadId: params.id,
        eventType: "STATUS_CHANGE",
        description: `Lead convertido a cliente: ${client.name}`,
        userId: session.user.id,
      },
    })

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CONVERT_LEAD",
        entityType: "LEAD",
        entityId: params.id,
        metadata: {
          leadId: params.id,
          clientId: client.id,
          clientName: client.name,
        },
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Error al convertir lead a cliente:", error)
    return NextResponse.json(
      { error: "Error al convertir lead a cliente" },
      { status: 500 }
    )
  }
}
