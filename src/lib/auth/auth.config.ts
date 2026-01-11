import type { NextAuthConfig } from "next-auth"
import { UserRole } from "@/lib/prisma-enums"

// Configuración de NextAuth para usar en Edge Runtime (middleware)
// No incluye el adapter de Prisma ni los providers que acceden a la base de datos
export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith('/login')

      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
        return true // Allow access to login page
      }

      return isLoggedIn // Redirect unauthenticated users to login page
    },
  },
}
