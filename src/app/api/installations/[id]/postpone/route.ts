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
    if (installation.assignedToUserId !== session.user.id) {
      return NextResponse.json(
        { error: "No estás asignado a esta instalación" },
        { status: 403 }
      )
    }

    const { reason, newScheduledDate } = await request.json()

    if (!reason) {
      return NextResponse.json(
        { error: "Debes especificar un motivo para postponer" },
        { status: 400 }
      )
    }

    // Si la instalación estaba en progreso, registrar el tiempo parcial
    let partialDuration = null
    if (installation.status === "IN_PROGRESS" && installation.actualStartDate) {
      partialDuration = Math.floor(
        (new Date().getTime() - installation.actualStartDate.getTime()) / 60000
      )
    }

    // Liberar materiales reservados (devolver a stock)
    for (const material of installation.materials) {
      if (material.isReserved && !material.isUsed) {
        await prisma.inventory.updateMany({
          where: {
            productId: material.productId,
            warehouseId: material.warehouseId,
          },
          data: {
            quantity: {
              increment: material.quantity,
            },
            reservedQuantity: {
              decrement: material.quantity,
            },
          },
        })
      }
    }

    // Eliminar materiales de la instalación (se volverán a asignar en la nueva fecha)
    await prisma.installationMaterial.deleteMany({
      where: { installationId: params.id },
    })

    // Actualizar instalación
    const updated = await prisma.installation.update({
      where: { id: params.id },
      data: {
        status: "POSTPONED",
        scheduledDate: newScheduledDate ? new Date(newScheduledDate) : undefined,
        materialsLoaded: false,
        materialsLoadedAt: null,
        actualStartDate: null,
        actualEndDate: null,
        actualDuration: null,
        startLatitude: null,
        startLongitude: null,
        endLatitude: null,
        endLongitude: null,
        notes: installation.notes
          ? `${installation.notes}\n\n[POSTPONED] ${reason}${
              partialDuration ? ` - Tiempo parcial: ${partialDuration} min` : ""
            }`
          : `[POSTPONED] ${reason}${
              partialDuration ? ` - Tiempo parcial: ${partialDuration} min` : ""
            }`,
      },
    })

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "POSTPONE_INSTALLATION",
        entityType: "INSTALLATION",
        entityId: installation.id,
        metadata: {
          reason,
          newScheduledDate,
          partialDuration,
          previousStatus: installation.status,
        },
      },
    })

    return NextResponse.json({
      installation: updated,
      message: "Instalación postponida correctamente. Los materiales han sido liberados.",
    })
  } catch (error) {
    console.error("Error al postponer instalación:", error)
    return NextResponse.json(
      { error: "Error al postponer instalación" },
      { status: 500 }
    )
  }
}
