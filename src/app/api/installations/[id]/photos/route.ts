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
    })

    if (!installation) {
      return NextResponse.json(
        { error: "Instalación no encontrada" },
        { status: 404 }
      )
    }

    const { url, description, type } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "La URL de la foto es requerida" },
        { status: 400 }
      )
    }

    // Crear foto
    const photo = await prisma.installationPhoto.create({
      data: {
        installationId: params.id,
        url,
        description: description || "",
        photoType: type || "DURING",
        uploadedBy: session.user.id,
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error("Error al subir foto:", error)
    return NextResponse.json(
      { error: "Error al subir foto" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const photos = await prisma.installationPhoto.findMany({
      where: {
        installationId: params.id,
        installation: {
          companyId: session.user.companyId,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Error al obtener fotos:", error)
    return NextResponse.json(
      { error: "Error al obtener fotos" },
      { status: 500 }
    )
  }
}
