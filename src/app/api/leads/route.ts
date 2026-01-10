import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { leadSchema } from "@/lib/utils/validators"

// GET /api/leads - Listar leads
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const source = searchParams.get("source")
    const assignedTo = searchParams.get("assignedTo")
    const search = searchParams.get("search")

    // Construir filtros
    const where: any = {
      companyId: session.user.companyId,
    }

    // Solo ver leads asignados si no es admin/director
    if (
      !["SUPERADMIN", "ADMIN", "DIRECTOR_SALES", "DIRECTOR_MARKETING"].includes(
        session.user.role
      )
    ) {
      where.assignedToUserId = session.user.id
    }

    if (status) where.status = status
    if (source) where.source = source
    if (assignedTo) where.assignedToUserId = assignedTo

    if (search) {
      where.OR = [
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { businessName: { contains: search, mode: "insensitive" } },
      ]
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { error: "Error al obtener leads" },
      { status: 500 }
    )
  }
}

// POST /api/leads - Crear lead
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar con Zod
    const validation = leadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Crear lead
    const lead = await prisma.lead.create({
      data: {
        companyId: session.user.companyId,
        source: body.source || "MANUAL",
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
        assignedToUserId: body.assignedToUserId || session.user.id,
        createdBy: session.user.id,
      },
      include: {
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Crear entrada en timeline
    await prisma.contactTimeline.create({
      data: {
        entityType: "lead",
        leadId: lead.id,
        actionType: "CREATED",
        description: `Lead creado por ${session.user.name}`,
        userId: session.user.id,
      },
    })

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE_LEAD",
        entityType: "lead",
        entityId: lead.id,
      },
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json(
      { error: "Error al crear lead" },
      { status: 500 }
    )
  }
}
