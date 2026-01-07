import { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

export function Card({
  children,
  className = "",
  title,
  subtitle,
  actions,
  hover = false,
  padding = "md",
}: CardProps) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  const hoverStyle = hover ? "hover:shadow-medium transition-shadow" : ""

  return (
    <div className={`card ${paddingStyles[padding]} ${hoverStyle} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
