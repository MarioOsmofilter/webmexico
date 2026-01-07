import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { formatDate } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { ROLE_NAMES, ROLE_COLORS } from "@/lib/auth/permissions"

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  if (!["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/admin/dashboard")
  }

  const users = await prisma.user.findMany({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      _count: {
        select: {
          assignedLeads: true,
          assignedClients: true,
          assignedInstallations: true,
        },
      },
    },
    orderBy: {
      firstName: "asc",
    },
  })

  const activeUsers = users.filter((u) => u.isActive).length
  const byRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 mt-1">
            Administra los usuarios de tu empresa
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nuevo Usuario
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Total Usuarios</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Inactivos</p>
          <p className="text-2xl font-bold text-red-600">
            {users.length - activeUsers}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Roles</p>
          <p className="text-2xl font-bold text-purple-600">
            {Object.keys(byRole).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha Alta
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      color={
                        ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]
                      }
                    >
                      {ROLE_NAMES[user.role as keyof typeof ROLE_NAMES]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={user.isActive ? "green" : "red"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    {user.forcePasswordChange && (
                      <p className="text-xs text-yellow-600 mt-1">
                        ⚠️ Debe cambiar contraseña
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {user._count.assignedLeads > 0 && (
                        <span title="Leads">
                          🎯 {user._count.assignedLeads}
                        </span>
                      )}
                      {user._count.assignedClients > 0 && (
                        <span title="Clientes">
                          👥 {user._count.assignedClients}
                        </span>
                      )}
                      {user._count.assignedInstallations > 0 && (
                        <span title="Instalaciones">
                          🔧 {user._count.assignedInstallations}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
