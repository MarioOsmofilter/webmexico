"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatPhone, formatDateTime, formatDate } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { StartInstallationForm } from "./StartInstallationForm"
import { CompleteInstallationForm } from "./CompleteInstallationForm"
import { PostponeForm } from "./PostponeForm"
import { PhotoUpload } from "./PhotoUpload"

interface InstallationViewProps {
  installation: any
  requiredPhotos: number
}

export function InstallationView({
  installation,
  requiredPhotos,
}: InstallationViewProps) {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showStartForm, setShowStartForm] = useState(false)
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [showPostponeForm, setShowPostponeForm] = useState(false)

  // Actualizar tiempo cada segundo para el cronómetro
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Calcular duración en tiempo real
  const getElapsedTime = () => {
    if (!installation.actualStartDate) return null

    const start = new Date(installation.actualStartDate)
    const elapsed = Math.floor((currentTime.getTime() - start.getTime()) / 1000)

    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60

    return {
      hours,
      minutes,
      seconds,
      total: elapsed,
      formatted: `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    }
  }

  const elapsed = getElapsedTime()
  const allMaterialsLoaded = installation.materials.every((m: any) => m.isLoaded)
  const canStart =
    installation.status === "SCHEDULED" &&
    (installation.materials.length === 0 || allMaterialsLoaded)

  const beforePhotos = installation.photos.filter(
    (p: any) => p.photoType === "BEFORE"
  )
  const afterPhotos = installation.photos.filter(
    (p: any) => p.photoType === "AFTER"
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/technician/installations"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Mis Instalaciones
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {installation.client.name}
            </h1>
            <p className="text-gray-500 mt-1">
              {installation.client.address}, {installation.client.city}
            </p>
          </div>
          <Badge
            color={
              installation.status === "COMPLETED"
                ? "green"
                : installation.status === "IN_PROGRESS"
                ? "yellow"
                : "blue"
            }
          >
            {installation.status === "COMPLETED"
              ? "Completada"
              : installation.status === "IN_PROGRESS"
              ? "En Progreso"
              : installation.status === "POSTPONED"
              ? "Postponida"
              : "Programada"}
          </Badge>
        </div>
      </div>

      {/* Cronómetro (solo si está en progreso) */}
      {installation.status === "IN_PROGRESS" && elapsed && (
        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">⏱️ Tiempo transcurrido</p>
            <p className="text-5xl font-bold text-yellow-600 font-mono">
              {elapsed.formatted}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Iniciado: {formatDateTime(installation.actualStartDate)}
            </p>
          </div>
        </div>
      )}

      {/* Información del Cliente */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Cliente
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nombre</p>
            <p className="font-medium text-gray-900">{installation.client.name}</p>
          </div>

          {installation.client.contactName && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Contacto</p>
              <p className="font-medium text-gray-900">
                {installation.client.contactName}
              </p>
            </div>
          )}

          {installation.client.phone && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Teléfono</p>
              <a
                href={`tel:${installation.client.phone}`}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {formatPhone(installation.client.phone)}
              </a>
            </div>
          )}

          {installation.client.email && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <a
                href={`mailto:${installation.client.email}`}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {installation.client.email}
              </a>
            </div>
          )}

          <div className="col-span-2">
            <p className="text-sm text-gray-500 mb-1">Dirección de Instalación</p>
            <p className="font-medium text-gray-900">
              {installation.address || installation.client.address}
              {", "}
              {installation.city || installation.client.city}
              {installation.state && `, ${installation.state}`}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Fecha Programada</p>
            <p className="font-medium text-gray-900">
              {formatDateTime(installation.scheduledDate)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Duración Estimada</p>
            <p className="font-medium text-gray-900">
              {installation.estimatedDuration} minutos
            </p>
          </div>
        </div>
      </div>

      {/* Materiales */}
      {installation.materials.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Materiales ({installation.materials.length})
            </h2>
            {!allMaterialsLoaded && installation.status === "SCHEDULED" && (
              <Link
                href={`/technician/installations/${installation.id}/load`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Cargar Materiales →
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {installation.materials.map((material: any) => (
              <div
                key={material.id}
                className={`p-4 rounded-lg border-2 ${
                  material.isLoaded
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  {material.product.images[0] && (
                    <img
                      src={material.product.images[0].url}
                      alt={material.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {material.isLoaded ? "✅" : "❌"} {material.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Cantidad: {material.quantity}
                      {material.warehouse && ` • Almacén: ${material.warehouse.name}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!allMaterialsLoaded && installation.status === "SCHEDULED" && (
            <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ Debes cargar todos los materiales antes de iniciar la
                instalación
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fotos ANTES (desperfectos previos) */}
      {installation.status !== "COMPLETED" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📸 Fotos de Desperfectos Previos
          </h2>

          <PhotoUpload
            installationId={installation.id}
            photoType="BEFORE"
            existingPhotos={beforePhotos}
            disabled={installation.status === "COMPLETED"}
          />

          <p className="text-sm text-gray-500 mt-2">
            Documenta cualquier desperfecto que exista antes de comenzar la
            instalación
          </p>
        </div>
      )}

      {/* Fotos DESPUÉS (instalación completada) */}
      {installation.status === "IN_PROGRESS" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📸 Fotos de la Instalación Finalizada
          </h2>

          <PhotoUpload
            installationId={installation.id}
            photoType="AFTER"
            existingPhotos={afterPhotos}
            disabled={false}
          />

          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              📋 Debes subir al menos {requiredPhotos} fotos de la instalación
              completada antes de finalizar ({afterPhotos.length}/{requiredPhotos})
            </p>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>

        <div className="space-y-3">
          {/* Iniciar Instalación */}
          {canStart && !showStartForm && (
            <Button
              onClick={() => setShowStartForm(true)}
              className="w-full py-3"
            >
              🚀 Iniciar Instalación
            </Button>
          )}

          {showStartForm && (
            <StartInstallationForm
              installationId={installation.id}
              onCancel={() => setShowStartForm(false)}
              onSuccess={() => router.refresh()}
            />
          )}

          {/* Completar Instalación */}
          {installation.status === "IN_PROGRESS" && !showCompleteForm && (
            <Button
              onClick={() => {
                if (afterPhotos.length < requiredPhotos) {
                  alert(
                    `Debes subir al menos ${requiredPhotos} fotos finales antes de completar`
                  )
                  return
                }
                setShowCompleteForm(true)
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700"
            >
              ✅ Completar Instalación
            </Button>
          )}

          {showCompleteForm && (
            <CompleteInstallationForm
              installationId={installation.id}
              onCancel={() => setShowCompleteForm(false)}
              onSuccess={() => router.refresh()}
            />
          )}

          {/* Postponer */}
          {installation.status !== "COMPLETED" && !showPostponeForm && (
            <button
              onClick={() => setShowPostponeForm(true)}
              className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ⏸️ No Finalizar / Postponer
            </button>
          )}

          {showPostponeForm && (
            <PostponeForm
              installationId={installation.id}
              onCancel={() => setShowPostponeForm(false)}
              onSuccess={() => {
                router.push("/technician/installations")
                router.refresh()
              }}
            />
          )}
        </div>
      </div>

      {/* Notas */}
      {installation.notes && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{installation.notes}</p>
        </div>
      )}
    </div>
  )
}
