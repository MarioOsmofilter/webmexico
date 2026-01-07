import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { leadSchema } from "@/lib/utils/validators"

// GET /api/leads/[id] - Obtener lead por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        proposals: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json(
      { error: "Error al obtener lead" },
      { status: 500 }
    )
  }
}

// PUT /api/leads/[id] - Actualizar lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()

    // Verificar que el lead existe y pertenece a la empresa
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!existingLead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    // Validar con Zod
    const validation = leadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Actualizar lead
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        contactType: data.contactType,
        contactName: data.contactName,
        email: data.email || null,
        phone: data.phone,
        businessName: data.businessName || null,
        businessContact: data.businessContact || null,
        businessEmail: data.businessEmail || null,
        businessPhone: data.businessPhone || null,
        address: data.address || null,
        city: data.city || null,
        postalCode: data.postalCode || null,
        notes: data.notes || null,
        status: body.status || existingLead.status,
        assignedToUserId: body.assignedToUserId || existingLead.assignedToUserId,
      },
    })

    // Crear entrada en timeline
    await prisma.contactTimeline.create({
      data: {
        leadId: lead.id,
        actionType: "STATUS_CHANGED",
        description: `Lead actualizado por ${session.user.name}`,
        userId: session.user.id,
      },
    })

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "UPDATE_LEAD",
        entityType: "lead",
        entityId: lead.id,
      },
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      { error: "Error al actualizar lead" },
      { status: 500 }
    )
  }
}

// DELETE /api/leads/[id] - Eliminar lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar permisos (solo admin puede eliminar)
    if (!["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar leads" },
        { status: 403 }
      )
    }

    // Verificar que el lead existe
    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    // Eliminar lead (cascade eliminará timeline y propuestas)
    await prisma.lead.delete({
      where: { id: params.id },
    })

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "DELETE_LEAD",
        entityType: "lead",
        entityId: params.id,
        metadata: { leadName: lead.contactName },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json(
      { error: "Error al eliminar lead" },
      { status: 500 }
    )
  }
}
