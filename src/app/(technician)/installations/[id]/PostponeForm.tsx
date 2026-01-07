"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

interface PostponeFormProps {
  installationId: string
  onCancel: () => void
  onSuccess: () => void
}

export function PostponeForm({
  installationId,
  onCancel,
  onSuccess,
}: PostponeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [reason, setReason] = useState("")
  const [newDate, setNewDate] = useState("")

  const handlePostpone = async () => {
    setLoading(true)
    setError("")

    try {
      if (!reason.trim()) {
        throw new Error("Debes especificar un motivo para postponer")
      }

      const response = await fetch(
        `/api/installations/${installationId}/postpone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: reason.trim(),
            newScheduledDate: newDate || undefined,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al postponer instalación")
      }

      alert(`✅ ${data.message}`)
      onSuccess()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">
          ⏸️ Postponer Instalación
        </h3>
        <p className="text-sm text-gray-600">
          Si no puedes completar la instalación ahora, puedes postponerla. Los
          materiales reservados se liberarán automáticamente.
        </p>
      </div>

      {/* Motivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motivo <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Ej: Cliente no disponible, falta material adicional, condiciones climáticas adversas..."
          required
        />
      </div>

      {/* Nueva Fecha (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nueva Fecha/Hora (opcional)
        </label>
        <input
          type="datetime-local"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Si conoces la nueva fecha, puedes indicarla aquí. Si no, se
          reprogramará más tarde.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Al postponer:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Los materiales reservados se devolverán al almacén</li>
          <li>Tendrás que volver a cargar los materiales para la nueva fecha</li>
          <li>El cronómetro se detendrá si estaba en progreso</li>
          <li>Se registrará el motivo en el historial</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          Cancelar
        </button>
        <Button
          onClick={handlePostpone}
          loading={loading}
          className="flex-1 bg-orange-600 hover:bg-orange-700"
        >
          Postponer Instalación
        </Button>
      </div>
    </div>
  )
}
