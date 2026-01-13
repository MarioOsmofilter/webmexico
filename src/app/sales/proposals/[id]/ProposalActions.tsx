"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ProposalActionsProps {
  proposal: {
    id: string
    status: string
    requiresApproval: boolean
    approvedBy: string | null
    convertedToSale: boolean
  }
  userRole: string
}

export function ProposalActions({ proposal, userRole }: ProposalActionsProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const isDirector = ["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(userRole)

  const handleApprove = async () => {
    if (!confirm("¿Aprobar esta propuesta?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/approve`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al aprobar")
      }

      router.refresh()
      setShowMenu(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt("Motivo del rechazo:")
    if (!reason) return

    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/approve`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al rechazar")
      }

      router.refresh()
      setShowMenu(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!confirm("¿Enviar esta propuesta al cliente?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "SENT" }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar")
      }

      router.refresh()
      setShowMenu(false)
    } catch (error) {
      alert("Error al enviar la propuesta")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!confirm("¿Marcar esta propuesta como aceptada?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ACCEPTED" }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar")
      }

      router.refresh()
      setShowMenu(false)
    } catch (error) {
      alert("Error al actualizar la propuesta")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer."
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar")
      }

      router.push("/sales/proposals")
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
            {/* Aprobar/Rechazar (solo directores) */}
            {isDirector &&
              proposal.requiresApproval &&
              !proposal.approvedBy &&
              proposal.status === "DRAFT" && (
                <>
                  <button
                    onClick={handleApprove}
                    className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    disabled={loading}
                  >
                    ✅ Aprobar
                  </button>
                  <button
                    onClick={handleReject}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    disabled={loading}
                  >
                    ❌ Rechazar
                  </button>
                  <div className="border-t border-gray-200" />
                </>
              )}

            {/* Enviar (desde borrador aprobado o sin necesidad de aprobación) */}
            {proposal.status === "DRAFT" &&
              (!proposal.requiresApproval || proposal.approvedBy) && (
              <button
                onClick={handleSend}
                className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                disabled={loading}
              >
                📧 Enviar al Cliente
              </button>
            )}

            {/* Marcar como aceptada */}
            {proposal.status === "SENT" && (
              <button
                onClick={handleAccept}
                className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                disabled={loading}
              >
                ✅ Marcar como Aceptada
              </button>
            )}

            {/* Eliminar (solo si no está convertida a venta) */}
            {!proposal.convertedToSale && (
              <>
                {proposal.status !== "DRAFT" && (
                  <div className="border-t border-gray-200" />
                )}
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  disabled={loading}
                >
                  🗑️ Eliminar
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
