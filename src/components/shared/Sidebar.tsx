"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { MODULES, hasModuleAccess } from "@/lib/auth/permissions"

interface SidebarProps {
  userRole: UserRole
  userName: string
  companyName: string
}

interface NavItem {
  label: string
  href: string
  icon: string
  module: string
}

export function Sidebar({ userRole, userName, companyName }: SidebarProps) {
  const pathname = usePathname()

  // Navegación según rol
  const getNavItems = (): NavItem[] => {
    const baseRole = userRole.replace("DIRECTOR_", "") as string
    const prefix = baseRole.toLowerCase()

    const items: NavItem[] = [
      { label: "Dashboard", href: `/${prefix}/dashboard`, icon: "📊", module: MODULES.DASHBOARD },
    ]

    // Items comunes según permisos
    if (hasModuleAccess(userRole, MODULES.LEADS)) {
      items.push({ label: "Leads", href: `/${prefix}/leads`, icon: "🎯", module: MODULES.LEADS })
    }

    if (hasModuleAccess(userRole, MODULES.CLIENTS)) {
      items.push({ label: "Clientes", href: `/${prefix}/clients`, icon: "👥", module: MODULES.CLIENTS })
    }

    if (hasModuleAccess(userRole, MODULES.PROPOSALS)) {
      items.push({ label: "Propuestas", href: `/${prefix}/proposals`, icon: "📄", module: MODULES.PROPOSALS })
    }

    if (hasModuleAccess(userRole, MODULES.SALES)) {
      items.push({ label: "Ventas", href: `/${prefix}/sales`, icon: "💰", module: MODULES.SALES })
    }

    if (hasModuleAccess(userRole, MODULES.INSTALLATIONS)) {
      items.push({ label: "Instalaciones", href: `/${prefix}/installations`, icon: "🔧", module: MODULES.INSTALLATIONS })
    }

    if (hasModuleAccess(userRole, MODULES.MAINTENANCES)) {
      items.push({ label: "Mantenimientos", href: `/${prefix}/maintenances`, icon: "🛠️", module: MODULES.MAINTENANCES })
    }

    if (hasModuleAccess(userRole, MODULES.INCIDENTS)) {
      items.push({ label: "Incidencias", href: `/${prefix}/incidents`, icon: "⚠️", module: MODULES.INCIDENTS })
    }

    if (hasModuleAccess(userRole, MODULES.WAREHOUSE)) {
      items.push({ label: "Almacén", href: `/${prefix}/warehouse`, icon: "📦", module: MODULES.WAREHOUSE })
    }

    if (hasModuleAccess(userRole, MODULES.PRODUCTS)) {
      items.push({ label: "Productos", href: `/${prefix}/products`, icon: "🏷️", module: MODULES.PRODUCTS })
    }

    if (hasModuleAccess(userRole, MODULES.CALENDAR)) {
      items.push({ label: "Agenda", href: `/${prefix}/calendar`, icon: "📅", module: MODULES.CALENDAR })
    }

    if (hasModuleAccess(userRole, MODULES.ROUTES)) {
      items.push({ label: "Rutas", href: `/${prefix}/routes`, icon: "🗺️", module: MODULES.ROUTES })
    }

    if (hasModuleAccess(userRole, MODULES.TELEMARKETING)) {
      items.push({ label: "Telemarketing", href: `/${prefix}/telemarketing`, icon: "📞", module: MODULES.TELEMARKETING })
    }

    if (hasModuleAccess(userRole, MODULES.WALLET)) {
      items.push({ label: "Wallet", href: `/${prefix}/wallet`, icon: "💳", module: MODULES.WALLET })
    }

    if (hasModuleAccess(userRole, MODULES.EXPENSES)) {
      items.push({ label: "Gastos", href: `/${prefix}/expenses`, icon: "💸", module: MODULES.EXPENSES })
    }

    if (hasModuleAccess(userRole, MODULES.MESSAGES)) {
      items.push({ label: "Mensajes", href: `/${prefix}/messages`, icon: "💬", module: MODULES.MESSAGES })
    }

    if (hasModuleAccess(userRole, MODULES.REPORTS)) {
      items.push({ label: "Informes", href: `/${prefix}/reports`, icon: "📈", module: MODULES.REPORTS })
    }

    if (hasModuleAccess(userRole, MODULES.USERS)) {
      items.push({ label: "Usuarios", href: `/${prefix}/users`, icon: "👤", module: MODULES.USERS })
    }

    if (hasModuleAccess(userRole, MODULES.SETTINGS)) {
      items.push({ label: "Configuración", href: `/${prefix}/settings`, icon: "⚙️", module: MODULES.SETTINGS })
    }

    if (hasModuleAccess(userRole, MODULES.COMPANIES)) {
      items.push({ label: "Empresas", href: `/${prefix}/companies`, icon: "🏢", module: MODULES.COMPANIES })
    }

    return items
  }

  const navItems = getNavItems()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <aside className="w-64 bg-neutral-900 text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-neutral-700">
        <h1 className="text-2xl font-bold">💧 Water CRM</h1>
        <p className="text-sm text-neutral-400 mt-1">{companyName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-neutral-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{userName}</p>
            <p className="text-xs text-neutral-400">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
