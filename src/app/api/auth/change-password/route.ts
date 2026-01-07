import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import bcrypt from "bcryptjs"
import { changePasswordSchema } from "@/lib/utils/validators"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Parsear body
    const body = await request.json()

    // Validar con Zod
    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 400 }
      )
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña y quitar flag de cambio forzado
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        forcePasswordChange: false,
      },
    })

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "CHANGE_PASSWORD",
        entityType: "user",
        entityId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Error al cambiar la contraseña" },
      { status: 500 }
    )
  }
}
