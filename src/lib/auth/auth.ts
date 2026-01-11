import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma/client"
import { authConfig as baseConfig } from "./auth.config"

// Configuración completa de NextAuth con Prisma (para uso en servidor, no en middleware)
const authConfigServer: NextAuthConfig = {
  ...baseConfig,
  // @ts-ignore - Type mismatch between @auth/prisma-adapter and next-auth versions
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          },
          include: {
            company: true,
          }
        })

        if (!user) {
          throw new Error("Credenciales inválidas")
        }

        // Verificar estado del usuario
        if (!user.isActive) {
          throw new Error("Usuario inactivo o suspendido")
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Credenciales inválidas")
        }

        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          companyId: user.companyId,
          companySlug: user.company.slug,
          forcePasswordChange: user.forcePasswordChange,
          avatar: user.avatar,
        }
      }
    })
  ],
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfigServer)
