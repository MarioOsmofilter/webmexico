"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/Button"

interface CompleteInstallationFormProps {
  installationId: string
  onCancel: () => void
  onSuccess: () => void
}

export function CompleteInstallationForm({
  installationId,
  onCancel,
  onSuccess,
}: CompleteInstallationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clientDni, setClientDni] = useState("")
  const [notes, setNotes] = useState("")
  const [signature, setSignature] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature("")
  }

  const handleComplete = async () => {
    setLoading(true)
    setError("")

    try {
      // Validar DNI
      if (!clientDni.trim()) {
        throw new Error("Debes ingresar el DNI del cliente")
      }

      // Obtener firma del canvas
      const canvas = canvasRef.current
      if (!canvas) {
        throw new Error("Error al obtener la firma")
      }

      const signatureData = canvas.toDataURL("image/png")

      // Verificar que haya firma
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Error al verificar la firma")
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const hasSignature = imageData.data.some((pixel) => pixel !== 0)

      if (!hasSignature) {
        throw new Error("La firma del cliente es requerida")
      }

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

      // Enviar solicitud de completar
      const response = await fetch(
        `/api/installations/${installationId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
            signature: signatureData,
            clientDni: clientDni.trim(),
            notes: notes.trim() || undefined,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al completar instalación")
      }

      alert("✅ Instalación completada correctamente")
      onSuccess()
    } catch (err: any) {
      if (err.code === 1) {
        setError(
          "Debes permitir el acceso a tu ubicación para completar la instalación"
        )
      } else {
        setError(err.message)
      }
      setLoading(false)
    }
  }

  return (
    <div className="bg-green-50 p-6 rounded-lg border border-green-200 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">
          ✅ Completar Instalación
        </h3>
        <p className="text-sm text-gray-600">
          Para finalizar, necesitamos la firma y DNI del cliente.
        </p>
      </div>

      {/* DNI del Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DNI/NIE del Cliente <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={clientDni}
          onChange={(e) => setClientDni(e.target.value.toUpperCase())}
          placeholder="12345678X"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          maxLength={9}
        />
      </div>

      {/* Firma */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Firma del Cliente <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={clearSignature}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Limpiar
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
        />
        <p className="text-xs text-gray-500 mt-1">
          El cliente debe firmar en el recuadro de arriba
        </p>
      </div>

      {/* Notas de Finalización */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas de Finalización (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Observaciones, incidencias, comentarios..."
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Al completar:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Se verificará tu ubicación GPS (mismo lugar que el inicio)</li>
          <li>Se detendrá el cronómetro automáticamente</li>
          <li>Se registrará la firma y DNI del cliente</li>
          <li>
            Debes haber subido todas las fotos requeridas de la instalación
          </li>
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
          onClick={handleComplete}
          loading={loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Completar Instalación
        </Button>
      </div>
    </div>
  )
}
