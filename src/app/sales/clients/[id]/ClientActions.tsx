"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ClientActionsProps {
  client: {
    id: string
    status: string
  }
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
  { value: "SUSPENDED", label: "Suspendido" },
]

export function ClientActions({ client }: ClientActionsProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === client.status) return

    setLoading(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado")
      }

      router.refresh()
      setShowMenu(false)
    } catch (error) {
      alert("Error al actualizar el estado del cliente")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar")
      }

      router.push("/sales/clients")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        disabled={loading}
      >
        {loading ? "Cargando..." : "Acciones ▼"}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* Editar */}
            <Link
              href={`/sales/clients/${client.id}/edit`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              ✏️ Editar
            </Link>

            {/* Cambiar Estado */}
            <div className="border-t border-gray-200">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Cambiar Estado
              </p>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    client.status === option.value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700"
                  }`}
                  disabled={loading}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Eliminar */}
            <div className="border-t border-gray-200">
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                disabled={loading}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
