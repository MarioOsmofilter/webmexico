"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

const SOURCES = [
  { value: "WEB", label: "Web" },
  { value: "TELEMARKETING", label: "Telemarketing" },
  { value: "MANUAL", label: "Manual" },
  { value: "REFERRAL", label: "Referido" },
  { value: "OTHER", label: "Otro" },
]

const INTEREST_LEVELS = [
  { value: "LOW", label: "Bajo" },
  { value: "MEDIUM", label: "Medio" },
  { value: "HIGH", label: "Alto" },
]

interface Lead {
  id: string
  contactName: string
  email: string | null
  phone: string | null
  businessName: string | null
  position: string | null
  source: string
  interestLevel: string | null
  estimatedValue: any
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  notes: string | null
  assignedToUserId: string | null
}

interface User {
  id: string
  firstName: string
  lastName: string
}

interface EditLeadFormProps {
  lead: Lead
  availableUsers: User[]
}

export function EditLeadForm({ lead, availableUsers }: EditLeadFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      contactName: formData.get("contactName"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      businessName: formData.get("businessName") || undefined,
      position: formData.get("position") || undefined,
      source: formData.get("source"),
      interestLevel: formData.get("interestLevel"),
      estimatedValue: formData.get("estimatedValue")
        ? parseFloat(formData.get("estimatedValue") as string)
        : undefined,
      address: formData.get("address") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      postalCode: formData.get("postalCode") || undefined,
      notes: formData.get("notes") || undefined,
      assignedToUserId: formData.get("assignedToUserId") || undefined,
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el lead")
      }

      router.push(`/sales/leads/${lead.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/sales/leads/${lead.id}`}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver al Lead
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Lead</h1>
        <p className="text-gray-500 mt-1">{lead.contactName}</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de Contacto */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información de Contacto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="contactName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                required
                defaultValue={lead.contactName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={lead.email || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={lead.phone || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Empresa
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                defaultValue={lead.businessName || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cargo
              </label>
              <input
                type="text"
                id="position"
                name="position"
                defaultValue={lead.position || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Información del Lead */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Lead
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="source"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fuente <span className="text-red-500">*</span>
              </label>
              <select
                id="source"
                name="source"
                required
                defaultValue={lead.source}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="interestLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nivel de Interés
              </label>
              <select
                id="interestLevel"
                name="interestLevel"
                defaultValue={lead.interestLevel || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar...</option>
                {INTEREST_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="estimatedValue"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Valor Estimado (€)
              </label>
              <input
                type="number"
                id="estimatedValue"
                name="estimatedValue"
                step="0.01"
                min="0"
                defaultValue={
                  lead.estimatedValue ? Number(lead.estimatedValue) : ""
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {availableUsers.length > 0 && (
              <div>
                <label
                  htmlFor="assignedToUserId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Asignado a
                </label>
                <select
                  id="assignedToUserId"
                  name="assignedToUserId"
                  defaultValue={lead.assignedToUserId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sin asignar</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notas
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={lead.notes || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dirección (Opcional)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Dirección
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={lead.address || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={lead.city || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Provincia
              </label>
              <input
                type="text"
                id="state"
                name="state"
                defaultValue={lead.state || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Código Postal
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                defaultValue={lead.postalCode || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/sales/leads/${lead.id}`}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </Link>
          <Button type="submit" isLoading={loading}>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
