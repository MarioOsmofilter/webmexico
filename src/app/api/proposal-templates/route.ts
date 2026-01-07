import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { z } from "zod"

// Schema para plantilla
const templateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  headerHtml: z.string().optional(),
  footerHtml: z.string().optional(),
  stylesJson: z.any().optional(),
  isDefault: z.boolean().optional(),
})

// GET /api/proposal-templates - Listar plantillas
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const templates = await prisma.proposalTemplate.findMany({
      where: {
        companyId: session.user.companyId,
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Error al obtener plantillas" },
      { status: 500 }
    )
  }
}

// POST /api/proposal-templates - Crear plantilla
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Solo admin puede crear plantillas
    if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para crear plantillas" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar
    const validation = templateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Si se marca como default, quitar default de otras
    if (data.isDefault) {
      await prisma.proposalTemplate.updateMany({
        where: {
          companyId: session.user.companyId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Crear plantilla
    const template = await prisma.proposalTemplate.create({
      data: {
        companyId: session.user.companyId,
        name: data.name,
        headerHtml: data.headerHtml || null,
        footerHtml: data.footerHtml || null,
        stylesJson: data.stylesJson || null,
        isDefault: data.isDefault || false,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Error al crear plantilla" },
      { status: 500 }
    )
  }
}

// PUT /api/proposal-templates/[id] - Actualizar plantilla
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...data } = body

    // Si se marca como default, quitar de otras
    if (data.isDefault) {
      await prisma.proposalTemplate.updateMany({
        where: {
          companyId: session.user.companyId,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      })
    }

    const template = await prisma.proposalTemplate.update({
      where: { id },
      data,
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Error al actualizar plantilla" },
      { status: 500 }
    )
  }
}

// DELETE /api/proposal-templates/[id] - Eliminar plantilla
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      )
    }

    await prisma.proposalTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "Error al eliminar plantilla" },
      { status: 500 }
    )
  }
}
