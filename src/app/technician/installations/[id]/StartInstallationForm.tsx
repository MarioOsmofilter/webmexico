"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

interface StartInstallationFormProps {
  installationId: string
  onCancel: () => void
  onSuccess: () => void
}

export function StartInstallationForm({
  installationId,
  onCancel,
  onSuccess,
}: StartInstallationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")

  const handleStart = async () => {
    setLoading(true)
    setError("")
    setWarning("")

    try {
      // Obtener ubicación GPS
      if (!navigator.geolocation) {
        throw new Error("Tu dispositivo no soporta geolocalización")
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        }
      )

      const { latitude, longitude } = position.coords

      // Enviar solicitud de inicio
      const response = await fetch(`/api/installations/${installationId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar instalación")
      }

      // Mostrar warning si existe
      if (data.warning) {
        setWarning(data.warning)
        // Esperar confirmación del usuario
        if (
          !confirm(
            `${data.warning}\n\n¿Estás seguro de que estás en el lugar correcto?`
          )
        ) {
          setLoading(false)
          return
        }
      }

      alert("✅ Instalación iniciada correctamente")
      onSuccess()
    } catch (err: any) {
      if (err.code === 1) {
        setError(
          "Debes permitir el acceso a tu ubicación para iniciar la instalación"
        )
      } else {
        setError(err.message)
      }
      setLoading(false)
    }
  }

  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">
          🚀 Iniciar Instalación
        </h3>
        <p className="text-sm text-gray-600">
          Para iniciar la instalación, necesitamos verificar que estás en el
          lugar correcto usando tu ubicación GPS.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Requisitos:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Debes estar a menos de 1km del punto de instalación</li>
          <li>
            Si estás entre 30m y 1km, recibirás un aviso (puede haber un bar
            cercano)
          </li>
          <li>Todos los materiales deben estar cargados</li>
          <li>Se iniciará el cronómetro automáticamente</li>
        </ul>
      </div>

      {warning && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          ⚠️ {warning}
        </div>
      )}

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
        <Button onClick={handleStart} isLoading={loading} className="flex-1">
          Verificar Ubicación e Iniciar
        </Button>
      </div>
    </div>
  )
}
