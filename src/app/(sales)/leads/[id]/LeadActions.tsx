"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LeadActionsProps {
  lead: {
    id: string
    status: string
    convertedToClient: boolean
  }
}

const STATUS_OPTIONS = [
  { value: "NEW", label: "Nuevo" },
  { value: "CONTACTED", label: "Contactado" },
  { value: "QUALIFIED", label: "Calificado" },
  { value: "PROPOSAL_SENT", label: "Propuesta Enviada" },
  { value: "NEGOTIATION", label: "Negociación" },
  { value: "WON", label: "Ganado" },
  { value: "LOST", label: "Perdido" },
]

export function LeadActions({ lead }: LeadActionsProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === lead.status) return

    setLoading(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
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
      alert("Error al actualizar el estado del lead")
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToClient = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres convertir este lead en cliente? Esta acción no se puede deshacer."
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al convertir a cliente")
      }

      const result = await response.json()
      router.push(`/sales/clients/${result.client.id}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este lead? Esta acción no se puede deshacer."
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el lead")
      }

      router.push("/sales/leads")
    } catch (error) {
      alert("Error al eliminar el lead")
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
              href={`/sales/leads/${lead.id}/edit`}
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
                    lead.status === option.value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700"
                  }`}
                  disabled={loading}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Convertir a Cliente */}
            {!lead.convertedToClient && lead.status === "WON" && (
              <div className="border-t border-gray-200">
                <button
                  onClick={handleConvertToClient}
                  className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  disabled={loading}
                >
                  ✅ Convertir en Cliente
                </button>
              </div>
            )}

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
