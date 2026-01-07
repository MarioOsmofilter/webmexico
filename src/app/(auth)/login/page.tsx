"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/utils/validators"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setIsLoading(false)
        return
      }

      // Redirigir después de login exitoso
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError("Ha ocurrido un error. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-strong p-8">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            💧 Water CRM
          </h1>
          <p className="text-neutral-600">
            Sistema de Gestión para Empresas de Agua
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error general */}
          {error && (
            <div className="bg-error-light/10 border border-error-light text-error-dark px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input ${errors.email ? "border-error" : ""}`}
              placeholder="tu@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`input ${errors.password ? "border-error" : ""}`}
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Botón de login */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner w-5 h-5 border-2"></span>
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        {/* Credenciales de demo */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 mb-2 text-center font-medium">
            Credenciales de prueba:
          </p>
          <div className="text-xs text-neutral-500 space-y-1">
            <p>
              <strong>Superadmin:</strong> superadmin@watercrm.com / Admin123!
            </p>
            <p>
              <strong>Admin:</strong> admin@aguaspuras.com / Admin123!
            </p>
            <p>
              <strong>Comercial:</strong> comercial1@aguaspuras.com / Comercial123!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-neutral-500">
          Water CRM v1.0.0 | © 2024
        </div>
      </div>
    </div>
  )
}
