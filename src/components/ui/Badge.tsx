import { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "primary" | "success" | "warning" | "error" | "neutral"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    primary: "badge-primary",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    neutral: "badge-neutral",
  }

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  }

  return (
    <span className={`badge ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  )
}
