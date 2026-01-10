"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { formatDateTime } from "@/lib/utils/format"

interface Photo {
  id: string
  url: string
  description: string
  photoType: string
  createdAt: Date
}

interface PhotoUploadProps {
  installationId: string
  photoType: "BEFORE" | "DURING" | "AFTER"
  existingPhotos: Photo[]
  disabled: boolean
}

export function PhotoUpload({
  installationId,
  photoType,
  existingPhotos,
  disabled,
}: PhotoUploadProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        throw new Error("Solo se permiten archivos de imagen")
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no puede superar los 5MB")
      }

      // Convertir a base64 para simular upload
      // En producción, aquí subirías a un servicio como S3, Cloudinary, etc.
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string

          // Guardar foto en base de datos
          const response = await fetch(
            `/api/installations/${installationId}/photos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: base64,
                type: photoType,
                description: "",
              }),
            }
          )

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || "Error al subir foto")
          }

          router.refresh()
          setUploading(false)
        } catch (err: any) {
          setError(err.message)
          setUploading(false)
        }
      }

      reader.onerror = () => {
        setError("Error al leer el archivo")
        setUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (err: any) {
      setError(err.message)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Botón para subir foto */}
      {!disabled && (
        <div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id={`photo-upload-${photoType}`}
            disabled={uploading}
          />
          <label htmlFor={`photo-upload-${photoType}`}>
            <div className="cursor-pointer">
              <Button
                as="span"
                isLoading={uploading}
                disabled={uploading}
                className="w-full"
              >
                📸 {uploading ? "Subiendo..." : "Tomar/Subir Foto"}
              </Button>
            </div>
          </label>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Galería de fotos */}
      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {existingPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
            >
              <img
                src={photo.url}
                alt={photo.description || "Foto de instalación"}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                <p className="text-xs">
                  {formatDateTime(photo.createdAt)}
                </p>
                {photo.description && (
                  <p className="text-xs mt-1">{photo.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {existingPhotos.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No hay fotos subidas
        </div>
      )}
    </div>
  )
}
