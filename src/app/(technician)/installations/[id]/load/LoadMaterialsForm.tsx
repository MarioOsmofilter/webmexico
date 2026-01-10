"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { formatDateTime } from "@/lib/utils/format"

interface Material {
  id: string
  quantity: number
  isLoaded: boolean
  product: {
    name: string
    internalReference: string | null
    images: { url: string }[]
  }
  warehouse: {
    name: string
  } | null
}

interface Installation {
  id: string
  scheduledDate: Date
  client: {
    name: string
    address: string | null
    city: string | null
  }
  materials: Material[]
}

interface LoadMaterialsFormProps {
  installation: Installation
}

export function LoadMaterialsForm({ installation }: LoadMaterialsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(
    new Set(installation.materials.filter((m) => m.isLoaded).map((m) => m.id))
  )

  const toggleMaterial = (materialId: string) => {
    const newSelected = new Set(selectedMaterials)
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId)
    } else {
      newSelected.add(materialId)
    }
    setSelectedMaterials(newSelected)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `/api/installations/${installation.id}/load-materials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            materialIds: Array.from(selectedMaterials),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al confirmar carga")
      }

      const result = await response.json()

      if (result.allLoaded) {
        alert("✅ Todos los materiales han sido cargados correctamente")
      } else {
        alert(
          `✅ Materiales confirmados: ${result.loadedCount}/${result.totalCount}`
        )
      }

      router.push(`/technician/installations/${installation.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const allSelected = selectedMaterials.size === installation.materials.length
  const noneSelected = selectedMaterials.size === 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/technician/installations/${installation.id}`}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a la Instalación
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Cargar Materiales en Furgoneta
        </h1>
        <p className="text-gray-500 mt-1">
          Confirma que has cargado estos materiales
        </p>
      </div>

      {/* Información de la Instalación */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 className="font-semibold text-gray-900">
          {installation.client.name}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {installation.client.address}, {installation.client.city}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          📅 {formatDateTime(installation.scheduledDate)}
        </p>
      </div>

      {/* Lista de Materiales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Materiales ({installation.materials.length})
          </h2>
          <button
            onClick={() => {
              if (allSelected) {
                setSelectedMaterials(new Set())
              } else {
                setSelectedMaterials(
                  new Set(installation.materials.map((m) => m.id))
                )
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {allSelected ? "Desmarcar todos" : "Marcar todos"}
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {installation.materials.map((material) => {
            const isSelected = selectedMaterials.has(material.id)

            return (
              <div
                key={material.id}
                onClick={() => toggleMaterial(material.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-green-50 border-l-4 border-green-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                        isSelected
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <span className="text-white text-xl">✓</span>}
                    </div>
                  </div>

                  {/* Imagen */}
                  {material.product.images[0] && (
                    <img
                      src={material.product.images[0].url}
                      alt={material.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {material.product.name}
                    </h3>
                    {material.product.internalReference && (
                      <p className="text-sm text-gray-500">
                        Ref: {material.product.internalReference}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-600">
                        Cantidad: <span className="font-semibold">{material.quantity}</span>
                      </p>
                      {material.warehouse && (
                        <p className="text-sm text-gray-600">
                          Almacén: {material.warehouse.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estado previo */}
                  {material.isLoaded && (
                    <div className="text-sm text-green-600 font-medium">
                      Ya cargado ✓
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-gray-900 mb-2">
          ⚠️ Importante
        </h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Verifica que todos los materiales estén en buenas condiciones</li>
          <li>
            Asegúrate de cargar las cantidades correctas en tu furgoneta
          </li>
          <li>
            No podrás iniciar la instalación si no confirmas la carga de todos
            los materiales
          </li>
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <Link
          href={`/technician/installations/${installation.id}`}
          className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          Cancelar
        </Link>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={noneSelected}
          className="flex-1 py-3"
        >
          Confirmar Carga ({selectedMaterials.size}/{installation.materials.length})
        </Button>
      </div>

      {/* Progreso */}
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-green-500 h-full transition-all duration-300"
          style={{
            width: `${
              (selectedMaterials.size / installation.materials.length) * 100
            }%`,
          }}
        />
      </div>
    </div>
  )
}
