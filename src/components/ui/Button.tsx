import { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "danger" | "success" | "outline"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "btn font-medium transition-all duration-200 inline-flex items-center justify-center gap-2"

  const variantStyles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    success: "btn-success",
    outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-50",
  }

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  const widthStyle = fullWidth ? "w-full" : ""

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="spinner w-4 h-4 border-2"></span>
      )}
      {children}
    </button>
  )
}
