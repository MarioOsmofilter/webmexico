import { UserRole } from "@prisma/client"
import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    companyId: string
    companySlug: string
    forcePasswordChange: boolean
    avatar?: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      companyId: string
      companySlug: string
      forcePasswordChange: boolean
      avatar?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    companyId: string
    companySlug: string
    forcePasswordChange: boolean
  }
}
