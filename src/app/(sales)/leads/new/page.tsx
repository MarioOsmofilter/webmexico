"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

const SOURCES = [
  { value: "WEB", label: "Web" },
  { value: "PHONE", label: "Teléfono" },
  { value: "EMAIL", label: "Email" },
  { value: "REFERRAL", label: "Referido" },
  { value: "SOCIAL_MEDIA", label: "Redes Sociales" },
  { value: "EVENT", label: "Evento" },
  { value: "OTHER", label: "Otro" },
]

const INTEREST_LEVELS = [
  { value: "LOW", label: "Bajo" },
  { value: "MEDIUM", label: "Medio" },
  { value: "HIGH", label: "Alto" },
]

export default function NewLeadPage() {
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
      company: formData.get("company") || undefined,
      position: formData.get("position") || undefined,
      source: formData.get("source"),
      interestLevel: formData.get("interestLevel") || "MEDIUM",
      estimatedValue: formData.get("estimatedValue")
        ? parseFloat(formData.get("estimatedValue") as string)
        : undefined,
      address: formData.get("address") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      postalCode: formData.get("postalCode") || undefined,
      notes: formData.get("notes") || undefined,
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear el lead")
      }

      const result = await response.json()
      router.push(`/sales/leads/${result.lead.id}`)
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
          href="/sales/leads"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Leads
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Lead</h1>
        <p className="text-gray-500 mt-1">
          Registra una nueva oportunidad de venta
        </p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Juan Pérez"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="correo@ejemplo.com"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+34 600 000 000"
              />
            </div>

            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Empresa
              </label>
              <input
                type="text"
                id="company"
                name="company"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre de la empresa"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Gerente de Compras"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona una fuente</option>
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
                defaultValue="MEDIUM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {INTEREST_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Información adicional sobre el lead..."
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Calle, número, piso..."
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Madrid"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Madrid"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="28001"
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
            href="/sales/leads"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </Link>
          <Button type="submit" isLoading={loading}>
            Crear Lead
          </Button>
        </div>
      </form>
    </div>
  )
}
