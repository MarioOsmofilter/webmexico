"use client"

import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { UserRole } from "@prisma/client"

interface DashboardLayoutProps {
  children: ReactNode
  userRole: UserRole
  userName: string
  companyName: string
  title?: string
  actions?: ReactNode
}

export function DashboardLayout({
  children,
  userRole,
  userName,
  companyName,
  title,
  actions,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar userRole={userRole} userName={userName} companyName={companyName} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        {(title || actions) && (
          <div className="bg-white border-b border-neutral-200 px-8 py-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
                )}
              </div>
              {actions && <div className="flex gap-2">{actions}</div>}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
