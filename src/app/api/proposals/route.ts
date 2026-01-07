import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { proposalSchema } from "@/lib/utils/validators"

// GET /api/proposals - Listar propuestas
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const createdBy = searchParams.get("createdBy")
    const clientId = searchParams.get("clientId")
    const leadId = searchParams.get("leadId")

    // Construir filtros
    const where: any = {
      companyId: session.user.companyId,
    }

    // Solo ver propuestas creadas por el usuario si no es admin/director
    if (
      !["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)
    ) {
      where.createdBy = session.user.id
    }

    if (status) where.status = status
    if (createdBy) where.createdBy = createdBy
    if (clientId) where.clientId = clientId
    if (leadId) where.leadId = leadId

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        approver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        lead: {
          select: {
            contactName: true,
          },
        },
        client: {
          select: {
            contactName: true,
          },
        },
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
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json({ proposals })
  } catch (error) {
    console.error("Error fetching proposals:", error)
    return NextResponse.json(
      { error: "Error al obtener propuestas" },
      { status: 500 }
    )
  }
}

// POST /api/proposals - Crear propuesta
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar con Zod
    const validation = proposalSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Generar número de propuesta
    const lastProposal = await prisma.proposal.findFirst({
      where: { companyId: session.user.companyId },
      orderBy: { createdAt: "desc" },
    })

    const proposalNumber = `PROP-${new Date().getFullYear()}-${
      lastProposal ? parseInt(lastProposal.proposalNumber.split("-")[2]) + 1 : 1
    }`.padEnd(12, "0")

    // Calcular total y verificar si requiere aprobación
    let totalAmount = 0
    let requiresApproval = false

    // Verificar precios de productos
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { prices: true },
      })

      if (!product || !product.prices) {
        return NextResponse.json(
          { error: `Producto ${item.productId} no encontrado o sin precios` },
          { status: 400 }
        )
      }

      // Verificar si el precio está por debajo del umbral
      if (
        product.prices.minPriceThreshold &&
        item.unitPrice < Number(product.prices.minPriceThreshold)
      ) {
        requiresApproval = true
      }

      const itemTotal = item.unitPrice * item.quantity
      const discount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0
      totalAmount += itemTotal - discount
    }

    // Crear propuesta
    const proposal = await prisma.proposal.create({
      data: {
        companyId: session.user.companyId,
        proposalNumber,
        leadId: data.leadId || null,
        clientId: data.clientId || null,
        createdBy: session.user.id,
        status: requiresApproval ? "DRAFT" : "DRAFT",
        totalAmount,
        paymentType: data.paymentType,
        installments: data.installments,
        requiresApproval,
        validUntil: data.validUntil || null,
      },
    })

    // Crear items
    for (const item of data.items) {
      const itemTotal = item.unitPrice * item.quantity
      const discount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0

      await prisma.proposalItem.create({
        data: {
          proposalId: proposal.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          totalPrice: itemTotal - discount,
        },
      })
    }

    // Crear timeline si es de un lead
    if (data.leadId) {
      await prisma.contactTimeline.create({
        data: {
          leadId: data.leadId,
          userId: session.user.id,
          actionType: "PROPOSAL_SENT",
          description: `Propuesta ${proposalNumber} creada`,
        },
      })
    }

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE_PROPOSAL",
        entityType: "proposal",
        entityId: proposal.id,
        metadata: {
          proposalNumber,
          requiresApproval,
        },
      },
    })

    // Obtener propuesta completa
    const fullProposal = await prisma.proposal.findUnique({
      where: { id: proposal.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        lead: true,
        client: true,
      },
    })

    return NextResponse.json({ proposal: fullProposal }, { status: 201 })
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json(
      { error: "Error al crear propuesta" },
      { status: 500 }
    )
  }
}
