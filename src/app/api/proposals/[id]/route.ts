import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

// GET /api/proposals/[id] - Obtener propuesta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const proposal = await prisma.proposal.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                prices: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        lead: true,
        client: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        rating: true,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: "Propuesta no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error("Error fetching proposal:", error)
    return NextResponse.json(
      { error: "Error al obtener propuesta" },
      { status: 500 }
    )
  }
}

// PUT /api/proposals/[id] - Actualizar propuesta
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

    // Verificar que existe
    const existing = await prisma.proposal.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Propuesta no encontrada" },
        { status: 404 }
      )
    }

    // No se puede editar si ya está aceptada o convertida
    if (existing.status === "ACCEPTED" || existing.convertedToSale) {
      return NextResponse.json(
        { error: "No se puede editar una propuesta aceptada o convertida" },
        { status: 400 }
      )
    }

    // Actualizar
    const proposal = await prisma.proposal.update({
      where: { id: params.id },
      data: {
        status: body.status || existing.status,
        validUntil: body.validUntil || existing.validUntil,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Log
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "UPDATE_PROPOSAL",
        entityType: "proposal",
        entityId: proposal.id,
      },
    })

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error("Error updating proposal:", error)
    return NextResponse.json(
      { error: "Error al actualizar propuesta" },
      { status: 500 }
    )
  }
}

// DELETE /api/proposals/[id] - Eliminar propuesta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Solo director y admin pueden eliminar
    if (!["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar propuestas" },
        { status: 403 }
      )
    }

    // Verificar que existe
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: "Propuesta no encontrada" },
        { status: 404 }
      )
    }

    // No se puede eliminar si está convertida a venta
    if (proposal.convertedToSale) {
      return NextResponse.json(
        { error: "No se puede eliminar una propuesta convertida a venta" },
        { status: 400 }
      )
    }

    // Eliminar (cascade eliminará items)
    await prisma.proposal.delete({
      where: { id: params.id },
    })

    // Log
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "DELETE_PROPOSAL",
        entityType: "proposal",
        entityId: params.id,
        metadata: { proposalNumber: proposal.proposalNumber },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting proposal:", error)
    return NextResponse.json(
      { error: "Error al eliminar propuesta" },
      { status: 500 }
    )
  }
}
