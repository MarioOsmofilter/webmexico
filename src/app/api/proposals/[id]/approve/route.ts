import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

// POST /api/proposals/[id]/approve - Aprobar propuesta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Solo directores y admin pueden aprobar
    if (!["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para aprobar propuestas" },
        { status: 403 }
      )
    }

    // Obtener propuesta
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

    if (!proposal.requiresApproval) {
      return NextResponse.json(
        { error: "Esta propuesta no requiere aprobación" },
        { status: 400 }
      )
    }

    if (proposal.approvedBy) {
      return NextResponse.json(
        { error: "Esta propuesta ya fue aprobada" },
        { status: 400 }
      )
    }

    // Aprobar propuesta
    const updated = await prisma.proposal.update({
      where: { id: params.id },
      data: {
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
      include: {
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
      },
    })

    // Timeline si es de un lead
    if (proposal.leadId) {
      await prisma.contactTimeline.create({
        data: {
          entityType: "lead",
          leadId: proposal.leadId,
          userId: session.user.id,
          actionType: "OTHER",
          description: `Propuesta ${proposal.proposalNumber} aprobada por ${session.user.name}`,
        },
      })
    }

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "APPROVE_PROPOSAL",
        entityType: "proposal",
        entityId: proposal.id,
        metadata: {
          proposalNumber: proposal.proposalNumber,
        },
      },
    })

    return NextResponse.json({
      success: true,
      proposal: updated,
      message: "Propuesta aprobada correctamente",
    })
  } catch (error) {
    console.error("Error approving proposal:", error)
    return NextResponse.json(
      { error: "Error al aprobar propuesta" },
      { status: 500 }
    )
  }
}

// POST /api/proposals/[id]/reject - Rechazar propuesta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Solo directores y admin pueden rechazar
    if (!["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para rechazar propuestas" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const reason = body.reason || "Sin especificar"

    // Obtener propuesta
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

    // Marcar como rechazada
    await prisma.proposal.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
      },
    })

    // Timeline
    if (proposal.leadId) {
      await prisma.contactTimeline.create({
        data: {
          entityType: "lead",
          leadId: proposal.leadId,
          userId: session.user.id,
          actionType: "OTHER",
          description: `Propuesta ${proposal.proposalNumber} rechazada: ${reason}`,
        },
      })
    }

    // Log
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "REJECT_PROPOSAL",
        entityType: "proposal",
        entityId: proposal.id,
        metadata: {
          proposalNumber: proposal.proposalNumber,
          reason,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Propuesta rechazada",
    })
  } catch (error) {
    console.error("Error rejecting proposal:", error)
    return NextResponse.json(
      { error: "Error al rechazar propuesta" },
      { status: 500 }
    )
  }
}
