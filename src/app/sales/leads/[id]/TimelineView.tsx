"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils/format"
import { Button } from "@/components/ui/Button"

interface TimelineEntry {
  id: string
  actionType: string
  description: string
  createdAt: Date
}

interface TimelineViewProps {
  timeline: TimelineEntry[]
  leadId: string
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  NOTE_ADDED: "📝",
  CALL_MADE: "📞",
  EMAIL_SENT: "📧",
  MEETING_SCHEDULED: "🤝",
  STATUS_CHANGED: "🔄",
  PROPOSAL_SENT: "📄",
  CONTACTED: "📞",
  CREATED: "✨",
  CONVERTED: "✅",
  PROPOSAL_VIEWED: "👁️",
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  NOTE_ADDED: "Nota",
  CALL_MADE: "Llamada",
  EMAIL_SENT: "Email",
  MEETING_SCHEDULED: "Reunión",
  STATUS_CHANGED: "Cambio de Estado",
  PROPOSAL_SENT: "Propuesta Enviada",
  CONTACTED: "Contactado",
  CREATED: "Creado",
  CONVERTED: "Convertido",
  PROPOSAL_VIEWED: "Propuesta Vista",
}

export function TimelineView({ timeline, leadId }: TimelineViewProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eventType, setEventType] = useState("NOTE_ADDED")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/leads/${leadId}/timeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          description,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar entrada")
      }

      setDescription("")
      setEventType("NOTE_ADDED")
      setShowForm(false)
      router.refresh()
    } catch (error) {
      alert("Error al agregar entrada al timeline")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showForm ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {/* Formulario para agregar entrada */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Describe la actividad..."
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Agregar
            </Button>
          </div>
        </form>
      )}

      {/* Timeline entries */}
      {timeline.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-sm">
          No hay actividades registradas
        </p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {timeline.map((entry, index) => (
            <div
              key={entry.id}
              className={`relative ${
                index !== timeline.length - 1 ? "pb-4" : ""
              }`}
            >
              {index !== timeline.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
              )}

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                  {EVENT_TYPE_ICONS[entry.actionType] || "📌"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {EVENT_TYPE_LABELS[entry.actionType] || entry.actionType}
                    </p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {entry.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
