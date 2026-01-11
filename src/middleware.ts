import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth/auth.config"
import { UserRole } from "@/lib/prisma-enums"

// Rutas que requieren roles específicos
const roleBasedRoutes: Record<string, UserRole[]> = {
  "/superadmin": [UserRole.SUPERADMIN],
  "/admin": [UserRole.SUPERADMIN, UserRole.ADMIN],
  "/sales": [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.DIRECTOR_SALES,
    UserRole.SALES,
  ],
  "/technician": [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.DIRECTOR_INSTALLATIONS,
    UserRole.TECHNICIAN,
  ],
  "/marketing": [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.DIRECTOR_MARKETING,
    UserRole.MARKETING,
  ],
  "/warehouse": [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.WAREHOUSE,
  ],
}

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/",
    "/login",
    "/api/auth",
    "/api/public",
    "/manifest.json",
    "/_next",
    "/favicon.ico",
    "/icon-",
  ]

  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return
  }

  // Si no hay sesión, redirigir a login
  if (!session) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", pathname)
    return Response.redirect(url)
  }

  // Si el usuario debe cambiar contraseña y no está en esa página
  if (session.user.forcePasswordChange && pathname !== "/change-password") {
    return Response.redirect(new URL("/change-password", req.url))
  }

  // Verificar permisos basados en rol
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(session.user.role)) {
        // Redirigir a su dashboard correspondiente
        const dashboardRoute = getDashboardRouteByRole(session.user.role)
        return Response.redirect(new URL(dashboardRoute, req.url))
      }
    }
  }
})

function getDashboardRouteByRole(role: UserRole): string {
  switch (role) {
    case UserRole.SUPERADMIN:
      return "/superadmin/dashboard"
    case UserRole.ADMIN:
      return "/admin/dashboard"
    case UserRole.DIRECTOR_SALES:
    case UserRole.SALES:
      return "/sales/dashboard"
    case UserRole.DIRECTOR_INSTALLATIONS:
    case UserRole.TECHNICIAN:
      return "/technician/dashboard"
    case UserRole.DIRECTOR_MARKETING:
    case UserRole.MARKETING:
      return "/marketing/dashboard"
    case UserRole.WAREHOUSE:
      return "/warehouse/dashboard"
    default:
      return "/dashboard"
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
