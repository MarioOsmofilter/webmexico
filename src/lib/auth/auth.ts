import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma/client"
import { UserRole, UserStatus } from "@prisma/client"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
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
            permissions: true,
          }
        })

        if (!user) {
          throw new Error("Credenciales inválidas")
        }

        // Verificar estado del usuario
        if (user.status !== UserStatus.ACTIVE) {
          throw new Error("Usuario inactivo o suspendido")
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.companySlug = user.companySlug
        token.forcePasswordChange = user.forcePasswordChange
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.companyId = token.companyId as string
        session.user.companySlug = token.companySlug as string
        session.user.forcePasswordChange = token.forcePasswordChange as boolean
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
