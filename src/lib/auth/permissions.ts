import { UserRole } from "@prisma/client"

// Definición de módulos del sistema
export const MODULES = {
  DASHBOARD: "dashboard",
  LEADS: "leads",
  CLIENTS: "clients",
  PROPOSALS: "proposals",
  SALES: "sales",
  INSTALLATIONS: "installations",
  MAINTENANCES: "maintenances",
  INCIDENTS: "incidents",
  WAREHOUSE: "warehouse",
  INVENTORY: "inventory",
  WALLET: "wallet",
  PRODUCTS: "products",
  CALENDAR: "calendar",
  ROUTES: "routes",
  TELEMARKETING: "telemarketing",
  MESSAGES: "messages",
  EXPENSES: "expenses",
  REPORTS: "reports",
  SETTINGS: "settings",
  USERS: "users",
  COMPANIES: "companies",
} as const

export type Module = typeof MODULES[keyof typeof MODULES]

// Permisos por defecto según rol
export const DEFAULT_PERMISSIONS: Record<UserRole, Module[]> = {
  SUPERADMIN: Object.values(MODULES), // Acceso total

  ADMIN: [
    MODULES.DASHBOARD,
    MODULES.LEADS,
    MODULES.CLIENTS,
    MODULES.PROPOSALS,
    MODULES.SALES,
    MODULES.INSTALLATIONS,
    MODULES.MAINTENANCES,
    MODULES.INCIDENTS,
    MODULES.WAREHOUSE,
    MODULES.INVENTORY,
    MODULES.WALLET,
    MODULES.PRODUCTS,
    MODULES.CALENDAR,
    MODULES.ROUTES,
    MODULES.TELEMARKETING,
    MODULES.MESSAGES,
    MODULES.EXPENSES,
    MODULES.REPORTS,
    MODULES.SETTINGS,
    MODULES.USERS,
  ],

  DIRECTOR_SALES: [
    MODULES.DASHBOARD,
    MODULES.LEADS,
    MODULES.CLIENTS,
    MODULES.PROPOSALS,
    MODULES.SALES,
    MODULES.CALENDAR,
    MODULES.ROUTES,
    MODULES.WALLET,
    MODULES.MESSAGES,
    MODULES.REPORTS,
  ],

  DIRECTOR_INSTALLATIONS: [
    MODULES.DASHBOARD,
    MODULES.CLIENTS,
    MODULES.INSTALLATIONS,
    MODULES.MAINTENANCES,
    MODULES.INCIDENTS,
    MODULES.WAREHOUSE,
    MODULES.INVENTORY,
    MODULES.CALENDAR,
    MODULES.WALLET,
    MODULES.MESSAGES,
    MODULES.REPORTS,
  ],

  DIRECTOR_MARKETING: [
    MODULES.DASHBOARD,
    MODULES.LEADS,
    MODULES.TELEMARKETING,
    MODULES.CALENDAR,
    MODULES.MESSAGES,
    MODULES.REPORTS,
  ],

  SALES: [
    MODULES.DASHBOARD,
    MODULES.LEADS,
    MODULES.CLIENTS,
    MODULES.PROPOSALS,
    MODULES.CALENDAR,
    MODULES.ROUTES,
    MODULES.WALLET,
    MODULES.MESSAGES,
  ],

  TECHNICIAN: [
    MODULES.DASHBOARD,
    MODULES.CLIENTS,
    MODULES.INSTALLATIONS,
    MODULES.MAINTENANCES,
    MODULES.INCIDENTS,
    MODULES.WAREHOUSE,
    MODULES.CALENDAR,
    MODULES.WALLET,
    MODULES.MESSAGES,
  ],

  MARKETING: [
    MODULES.DASHBOARD,
    MODULES.LEADS,
    MODULES.TELEMARKETING,
    MODULES.CALENDAR,
    MODULES.MESSAGES,
  ],

  WAREHOUSE: [
    MODULES.DASHBOARD,
    MODULES.WAREHOUSE,
    MODULES.INVENTORY,
    MODULES.PRODUCTS,
    MODULES.MESSAGES,
  ],

  CUSTOM: [], // Los permisos se configuran manualmente
}

// Verificar si un rol tiene acceso a un módulo
export function hasModuleAccess(role: UserRole, module: Module): boolean {
  if (role === UserRole.SUPERADMIN) return true
  return DEFAULT_PERMISSIONS[role].includes(module)
}

// Verificar si un rol es director
export function isDirector(role: UserRole): boolean {
  return [
    UserRole.DIRECTOR_SALES,
    UserRole.DIRECTOR_INSTALLATIONS,
    UserRole.DIRECTOR_MARKETING,
  ].includes(role)
}

// Verificar si un rol puede ver todos los datos de su empresa
export function canViewAll(role: UserRole): boolean {
  return [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    ...Object.keys(DEFAULT_PERMISSIONS).filter(r => isDirector(r as UserRole))
  ].includes(role)
}

// Obtener ruta de dashboard según rol
export function getDashboardRoute(role: UserRole): string {
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

// Nombres legibles de roles
export const ROLE_NAMES: Record<UserRole, string> = {
  SUPERADMIN: "Super Administrador",
  ADMIN: "Administrador",
  DIRECTOR_SALES: "Director Comercial",
  DIRECTOR_INSTALLATIONS: "Director de Instalaciones",
  DIRECTOR_MARKETING: "Director de Marketing",
  SALES: "Comercial",
  TECHNICIAN: "Técnico/Instalador",
  MARKETING: "Marketing",
  WAREHOUSE: "Almacén",
  CUSTOM: "Personalizado",
}

// Colores de roles (para UI)
export const ROLE_COLORS: Record<UserRole, "primary" | "success" | "warning" | "error" | "neutral"> = {
  SUPERADMIN: "primary",
  ADMIN: "primary",
  DIRECTOR_SALES: "success",
  DIRECTOR_INSTALLATIONS: "warning",
  DIRECTOR_MARKETING: "primary",
  SALES: "primary",
  TECHNICIAN: "warning",
  MARKETING: "primary",
  WAREHOUSE: "neutral",
  CUSTOM: "neutral",
}
