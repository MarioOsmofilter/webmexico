import { ReactNode } from "react"
import Link from "next/link"
import { Button } from "./Button"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && <div className="text-6xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-600 max-w-md mb-6">{description}</p>
      )}
      {action && (
        <>
          {action.href ? (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          ) : action.onClick ? (
            <Button onClick={action.onClick}>{action.label}</Button>
          ) : null}
        </>
      )}
    </div>
  )
}
