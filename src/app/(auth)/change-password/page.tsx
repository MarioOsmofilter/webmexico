"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/utils/validators"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Error al cambiar la contraseña")
        setIsLoading(false)
        return
      }

      setSuccess(true)

      // Actualizar sesión
      await update()

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 2000)
    } catch (err) {
      setError("Ha ocurrido un error. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-strong p-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Cambio de Contraseña Obligatorio
          </h1>
          <p className="text-neutral-600">
            Por seguridad, debes cambiar tu contraseña antes de continuar
          </p>
        </div>

        {success ? (
          <div className="bg-success-light/10 border border-success-light text-success-dark px-4 py-3 rounded-lg text-center">
            <p className="font-medium">¡Contraseña cambiada con éxito!</p>
            <p className="text-sm mt-1">Redirigiendo al dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error general */}
            {error && (
              <div className="bg-error-light/10 border border-error-light text-error-dark px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Contraseña actual */}
            <div>
              <label htmlFor="currentPassword" className="label">
                Contraseña Actual
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className={`input ${errors.currentPassword ? "border-error" : ""}`}
                placeholder="••••••••"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* Nueva contraseña */}
            <div>
              <label htmlFor="newPassword" className="label">
                Nueva Contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className={`input ${errors.newPassword ? "border-error" : ""}`}
                placeholder="••••••••"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.newPassword.message}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Mínimo 8 caracteres, debe contener mayúsculas, minúsculas, números y caracteres especiales
              </p>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar Nueva Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`input ${errors.confirmPassword ? "border-error" : ""}`}
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-5 h-5 border-2"></span>
                  Cambiando contraseña...
                </span>
              ) : (
                "Cambiar Contraseña"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
