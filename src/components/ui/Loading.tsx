interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function Loading({ size = "md", text, fullScreen = false }: LoadingProps) {
  const sizeStyles = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4",
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`spinner ${sizeStyles[size]}`}></div>
      {text && <p className="text-neutral-600">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  )
}
