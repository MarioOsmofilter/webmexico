import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { renderToBuffer } from "@react-pdf/renderer"
import { ProposalPDF } from "@/lib/pdf/proposal-generator"

// GET /api/proposals/[id]/pdf - Generar PDF de propuesta
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Obtener propuesta completa
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
        lead: {
          select: {
            contactName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        client: {
          select: {
            contactName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: "Propuesta no encontrada" },
        { status: 404 }
      )
    }

    // Obtener empresa
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
    })

    // Obtener plantilla (default o la especificada)
    const template = await prisma.proposalTemplate.findFirst({
      where: {
        companyId: session.user.companyId,
        isDefault: true,
      },
    })

    // Generar PDF
    const pdfBuffer = await renderToBuffer(
      ProposalPDF({ proposal, company, template })
    )

    // Actualizar estado a "enviado" si estaba en borrador
    if (proposal.status === "DRAFT" && !proposal.requiresApproval) {
      await prisma.proposal.update({
        where: { id: params.id },
        data: { status: "SENT" },
      })

      // Timeline
      if (proposal.leadId) {
        await prisma.contactTimeline.create({
          data: {
            leadId: proposal.leadId,
            userId: session.user.id,
            actionType: "PROPOSAL_SENT",
            description: `Propuesta ${proposal.proposalNumber} enviada`,
          },
        })
      }
    }

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "GENERATE_PROPOSAL_PDF",
        entityType: "proposal",
        entityId: proposal.id,
      },
    })

    // Devolver PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Propuesta-${proposal.proposalNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { error: "Error al generar PDF" },
      { status: 500 }
    )
  }
}
