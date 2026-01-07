import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distancia en metros
}

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

    // Verificar que no esté ya iniciada
    if (installation.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "La instalación ya fue iniciada o completada" },
        { status: 400 }
      )
    }

    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Se requiere la ubicación GPS" },
        { status: 400 }
      )
    }

    // Verificar proximidad (radio de 100 metros)
    const MAX_DISTANCE = 100 // metros
    if (installation.latitude && installation.longitude) {
      const distance = getDistanceInMeters(
        latitude,
        longitude,
        Number(installation.latitude),
        Number(installation.longitude)
      )

      if (distance > MAX_DISTANCE) {
        return NextResponse.json(
          {
            error: `Estás demasiado lejos del punto de instalación (${Math.round(
              distance
            )}m). Debes estar dentro de ${MAX_DISTANCE}m.`,
            distance: Math.round(distance),
          },
          { status: 400 }
        )
      }
    }

    // Iniciar instalación
    const updated = await prisma.installation.update({
      where: { id: params.id },
      data: {
        status: "IN_PROGRESS",
        actualStartDate: new Date(),
        startLatitude: latitude,
        startLongitude: longitude,
      },
    })

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "START_INSTALLATION",
        entityType: "INSTALLATION",
        entityId: installation.id,
        metadata: {
          latitude,
          longitude,
          timestamp: new Date(),
        },
      },
    })

    return NextResponse.json({ installation: updated })
  } catch (error) {
    console.error("Error al iniciar instalación:", error)
    return NextResponse.json(
      { error: "Error al iniciar instalación" },
      { status: 500 }
    )
  }
}
