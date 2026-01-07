import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth/auth"
import { UserRole } from "@prisma/client"

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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Obtener sesión
  const session = await auth()

  // Si no hay sesión, redirigir a login
  if (!session) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Si el usuario debe cambiar contraseña y no está en esa página
  if (session.user.forcePasswordChange && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", request.url))
  }

  // Verificar permisos basados en rol
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(session.user.role)) {
        // Redirigir a su dashboard correspondiente
        const dashboardRoute = getDashboardRouteByRole(session.user.role)
        return NextResponse.redirect(new URL(dashboardRoute, request.url))
      }
    }
  }

  return NextResponse.next()
}

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
