import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

// Confirmar carga de materiales en furgoneta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const installation = await prisma.installation.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        materials: true,
      },
    })

    if (!installation) {
      return NextResponse.json(
        { error: "Instalación no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el asignado
    if (installation.assignedTo !== session.user.id) {
      return NextResponse.json(
        { error: "No estás asignado a esta instalación" },
        { status: 403 }
      )
    }

    const { materialIds } = await request.json()

    if (!materialIds || !Array.isArray(materialIds)) {
      return NextResponse.json(
        { error: "Se requiere un array de materialIds" },
        { status: 400 }
      )
    }

    // Marcar materiales como cargados
    await prisma.installationMaterial.updateMany({
      where: {
        id: { in: materialIds },
        installationId: params.id,
      },
      data: {
        isLoaded: true,
        loadedAt: new Date(),
      },
    })

    // Verificar si todos los materiales están cargados
    const allMaterials = await prisma.installationMaterial.findMany({
      where: { installationId: params.id },
    })

    const allLoaded = allMaterials.every((m) => m.isLoaded)

    // Si todos están cargados, actualizar instalación
    if (allLoaded) {
      await prisma.installation.update({
        where: { id: params.id },
        data: {
          materialsLoaded: true,
          materialsLoadedAt: new Date(),
        },
      })
    }

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "LOAD_MATERIALS",
        entityType: "INSTALLATION",
        entityId: params.id,
        metadata: {
          materialIds,
          allLoaded,
        },
      },
    })

    return NextResponse.json({
      success: true,
      allLoaded,
      loadedCount: materialIds.length,
      totalCount: allMaterials.length,
    })
  } catch (error) {
    console.error("Error al confirmar carga:", error)
    return NextResponse.json(
      { error: "Error al confirmar carga de materiales" },
      { status: 500 }
    )
  }
}
