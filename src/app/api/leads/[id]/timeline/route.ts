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

    const { eventType, description } = await request.json()

    if (!eventType || !description) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      )
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

    // Crear entrada en timeline
    const timelineEntry = await prisma.leadTimeline.create({
      data: {
        leadId: params.id,
        eventType,
        description,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Actualizar lastContactDate del lead si es relevante
    if (["CALL", "EMAIL", "MEETING"].includes(eventType)) {
      await prisma.lead.update({
        where: { id: params.id },
        data: { lastContactDate: new Date() },
      })
    }

    return NextResponse.json({ timeline: timelineEntry })
  } catch (error) {
    console.error("Error al crear entrada de timeline:", error)
    return NextResponse.json(
      { error: "Error al crear entrada de timeline" },
      { status: 500 }
    )
  }
}
