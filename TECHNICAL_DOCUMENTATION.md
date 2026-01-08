# Water CRM - Complete Technical Documentation

**Version:** 1.0.0
**Last Updated:** January 7, 2026
**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, NextAuth v5

---

## Table of Contents

### English
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Code Structure](#code-structure)
5. [Authentication System](#authentication-system)
6. [API Endpoints](#api-endpoints)
7. [Frontend Pages](#frontend-pages)
8. [Key Features](#key-features)
9. [Deployment](#deployment)

### Español
10. [Descripción del Sistema](#descripción-del-sistema)
11. [Arquitectura](#arquitectura-es)
12. [Esquema de Base de Datos](#esquema-de-base-de-datos)
13. [Estructura del Código](#estructura-del-código)
14. [Sistema de Autenticación](#sistema-de-autenticación)
15. [Endpoints de API](#endpoints-de-api)
16. [Páginas del Frontend](#páginas-del-frontend)
17. [Características Principales](#características-principales)
18. [Despliegue](#despliegue)

---

# ENGLISH DOCUMENTATION

## System Overview

Water CRM is a complete Customer Relationship Management system specifically designed for water treatment companies. It manages the entire sales cycle from lead capture to installation, maintenance, and inventory control.

### Core Functionality

- **Multi-tenant Architecture**: Isolated data per company
- **7 User Roles**: SUPERADMIN, ADMIN, DIRECTOR_SALES, DIRECTOR_INSTALLATIONS, DIRECTOR_MARKETING, SALES, TECHNICIAN, MARKETING, WAREHOUSE
- **Complete Sales Pipeline**: Lead → Proposal → Sale → Installation → Maintenance
- **Real-time GPS Tracking**: For installations with strict geolocation requirements
- **Inventory Management**: Stock reservation, warehouse movements, alerts
- **Digital Signatures**: Canvas-based signature capture for installations
- **PDF Generation**: Custom proposal templates with PDF export
- **Progressive Web App**: Installable on mobile devices, works offline

---

## Architecture

### Technology Stack

**Frontend:**
- **Next.js 14** (App Router with Server Components)
- **React 18.3.1** (Server and Client Components)
- **TypeScript 5.6.3** (Full type safety)
- **Tailwind CSS 3.4** (Utility-first styling)
- **Next-PWA 5.6** (Progressive Web App capabilities)

**Backend:**
- **Next.js API Routes** (RESTful API)
- **Prisma 5.22** (ORM for PostgreSQL)
- **PostgreSQL 14+** (Relational database)
- **NextAuth v5** (Authentication with JWT)

**Additional Libraries:**
- **@react-pdf/renderer**: PDF generation
- **bcryptjs**: Password hashing
- **Leaflet**: Maps and geolocation
- **Recharts**: Data visualization
- **Zod**: Schema validation

### Application Flow

```
User Request → Next.js Middleware → Authentication Check → API Route → Prisma Query → PostgreSQL → Response
                                  ↓
                            Session Validation (JWT)
                                  ↓
                            Role-based Access Control
                                  ↓
                            Company Isolation Check
```

### Folder Structure

```
webmexico/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin role pages
│   │   ├── (sales)/           # Sales role pages
│   │   ├── (technician)/      # Technician role pages
│   │   ├── (warehouse)/       # Warehouse role pages
│   │   ├── (auth)/            # Authentication pages
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   │   └── ui/               # UI components (Badge, Button, etc.)
│   └── lib/                   # Utilities and configurations
│       ├── auth/             # Authentication logic
│       ├── prisma/           # Prisma client
│       └── utils/            # Helper functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts              # Database seeding
│   └── migrations/          # Database migrations
└── public/                   # Static assets
```

---

## Database Schema

### Overview

The database consists of **32 models** organized into logical groups:

1. **Users & Companies** (5 models): User, Company, Role, UserPermission, UserHierarchy
2. **Products** (7 models): Product, ProductCategory, ProductAttribute, ProductAttributeValue, ProductImage, ProductPrice, ProductDatasheet
3. **Leads & Clients** (3 models): Lead, Client, ContactTimeline
4. **Proposals** (4 models): Proposal, ProposalItem, ProposalTemplate, ProposalRating
5. **Sales** (3 models): Sale, SaleItem, SalesGoal, SalesPointsConfig
6. **Installations** (3 models): Installation, InstallationMaterial, InstallationPhoto
7. **Maintenance** (3 models): Maintenance, MaintenanceMaterial, MaintenanceHistory
8. **Inventory** (7 models): Warehouse, Inventory, WarehouseMovement, InventoryMovement, LoadingOrder, LoadingOrderItem, StockAlert
9. **Finance** (2 models): Wallet, WalletTransaction
10. **Agenda** (3 models): CalendarEvent, Route, RouteStop
11. **Telemarketing** (5 models): TmkCampaign, TmkCallList, TmkCallListItem, TmkCall, TmkScript
12. **System** (6 models): InternalMessage, MessageAttachment, Expense, CompanySetting, ActivityLog, ApiKey, Incident

### Key Models Detail

#### User Model

```prisma
model User {
  id                  String      @id @default(cuid())
  email               String      @unique
  password            String      // bcrypt hashed
  firstName           String
  lastName            String
  phone               String?
  avatar              String?

  companyId           String
  company             Company     @relation(fields: [companyId], references: [id], onDelete: Cascade)

  role                UserRole    @default(CUSTOM)
  isActive            Boolean     @default(true)
  permissions         Json?       @db.JsonB

  forcePasswordChange Boolean     @default(false)

  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  lastLogin           DateTime?

  // Relations to other models...
}

enum UserRole {
  SUPERADMIN
  ADMIN
  DIRECTOR_SALES
  DIRECTOR_INSTALLATIONS
  DIRECTOR_MARKETING
  SALES
  TECHNICIAN
  MARKETING
  WAREHOUSE
  CUSTOM
}
```

**Key Features:**
- Password stored as bcrypt hash (10 rounds)
- `isActive` Boolean for soft delete
- `permissions` JSON for granular access control
- Multi-tenant isolation via `companyId`
- Cascade delete when company is removed

#### Installation Model (Critical for GPS tracking)

```prisma
model Installation {
  id                String             @id @default(cuid())
  companyId         String
  company           Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)

  saleId            String
  sale              Sale               @relation(fields: [saleId], references: [id])

  clientId          String
  client            Client             @relation(fields: [clientId], references: [id])

  assignedToUserId  String
  assignedTo        User               @relation(fields: [assignedToUserId], references: [id])

  status            InstallationStatus @default(SCHEDULED)

  // Installation address
  address           String?
  city              String?
  state             String?
  postalCode        String?
  latitude          Decimal?           @db.Decimal(10, 8)
  longitude         Decimal?           @db.Decimal(11, 8)

  // Scheduling
  scheduledDate     DateTime
  estimatedDuration Int?               // minutes

  actualStartDate   DateTime?
  actualEndDate     DateTime?
  actualDuration    Int?               // minutes

  // Materials management
  materialsLoaded   Boolean            @default(false)
  materialsLoadedAt DateTime?

  // GPS tracking at start
  startLatitude     Decimal?           @db.Decimal(10, 8)
  startLongitude    Decimal?           @db.Decimal(11, 8)
  startAddress      String?

  // GPS tracking at end
  endLatitude       Decimal?           @db.Decimal(10, 8)
  endLongitude      Decimal?           @db.Decimal(11, 8)
  endAddress        String?

  // Validation
  maxDistanceMeters Int                @default(1000)

  // Completion
  signature         String?            @db.Text  // base64
  clientDni         String?
  completionNotes   String?            @db.Text

  notes             String?            @db.Text
  metadata          Json?              @db.JsonB

  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  // Relations
  materials         InstallationMaterial[]
  photos            InstallationPhoto[]
  maintenances      Maintenance[]
  incidents         Incident[]
}

enum InstallationStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  POSTPONED
}
```

**Key Features:**
- Dual GPS tracking (start and end positions)
- Material loading verification
- Digital signature storage (base64)
- Client DNI capture
- Configurable maximum distance (default 1km)
- Metadata field for custom data (e.g., required photos count)

#### Inventory & Warehouse Models

```prisma
model Warehouse {
  id          String    @id @default(cuid())
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)

  name        String
  address     String?
  city        String?
  state       String?
  postalCode  String?
  phone       String?

  managerId   String?
  manager     User?     @relation(fields: [managerId], references: [id])

  isActive    Boolean   @default(true)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  inventory             Inventory[]
  movements             WarehouseMovement[]
  movementsFrom         InventoryMovement[] @relation("FromWarehouse")
  movementsTo           InventoryMovement[] @relation("ToWarehouse")
  stockAlerts           StockAlert[]
  loadingOrders         LoadingOrder[]
  installationMaterials InstallationMaterial[]
}

model Inventory {
  id               String    @id @default(cuid())

  warehouseId      String
  warehouse        Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)

  productId        String
  product          Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  quantity         Int       @default(0)
  reservedQuantity Int       @default(0)  // CRITICAL: For installations
  minStock         Int       @default(0)
  maxStock         Int?

  lastRestockDate  DateTime?
  updatedAt        DateTime  @updatedAt

  @@unique([warehouseId, productId])
}

model WarehouseMovement {
  id          String                @id @default(cuid())

  warehouseId String
  warehouse   Warehouse             @relation(fields: [warehouseId], references: [id], onDelete: Cascade)

  productId   String
  product     Product               @relation(fields: [productId], references: [id])

  type        WarehouseMovementType
  quantity    Int
  reason      String

  userId      String
  user        User                  @relation(fields: [userId], references: [id])

  createdAt   DateTime              @default(now())
}

enum WarehouseMovementType {
  IN         // Stock entry
  OUT        // Stock exit
  TRANSFER   // Transfer between warehouses
  ADJUSTMENT // Inventory adjustment
}
```

**Key Features:**
- `reservedQuantity` separate from `quantity` for stock blocking
- Automatic stock reservation when materials assigned to installation
- Automatic stock release when installation postponed
- Simple movement tracking with WarehouseMovement model

---

## Code Structure

### API Routes Pattern

All API routes follow this structure:

```typescript
// Example: /src/app/api/[resource]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // 3. Build query with company isolation
    const where: any = {
      companyId: session.user.companyId,  // CRITICAL: Multi-tenancy
    }

    if (status) {
      where.status = status
    }

    // 4. Database query
    const items = await prisma.resource.findMany({
      where,
      include: {
        // Related data
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 5. Response
    return NextResponse.json({ items })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse body
    const data = await request.json()

    // 3. Validation
    if (!data.requiredField) {
      return NextResponse.json(
        { error: "Missing required field" },
        { status: 400 }
      )
    }

    // 4. Create with company isolation
    const item = await prisma.resource.create({
      data: {
        ...data,
        companyId: session.user.companyId,  // CRITICAL
      },
    })

    // 5. Activity logging
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "RESOURCE",
        entityId: item.id,
      },
    })

    // 6. Response
    return NextResponse.json({ item }, { status: 201 })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Critical Installation APIs

#### Start Installation API

**File:** `/src/app/api/installations/[id]/start/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const installation = await prisma.installation.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!installation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Verify user assignment
    if (installation.assignedToUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify status
    if (installation.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Installation already started" },
        { status: 400 }
      )
    }

    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "GPS location required" },
        { status: 400 }
      )
    }

    // CRITICAL: Verify materials loaded
    if (!installation.materialsLoaded) {
      return NextResponse.json(
        { error: "Materials must be loaded first" },
        { status: 400 }
      )
    }

    // CRITICAL: Verify proximity (max 1km)
    const MAX_DISTANCE = 1000 // meters
    const WARNING_DISTANCE = 30 // meters
    let distanceWarning = null

    if (installation.latitude && installation.longitude) {
      const distance = getDistanceInMeters(
        latitude,
        longitude,
        Number(installation.latitude),
        Number(installation.longitude)
      )

      // Block if > 1km
      if (distance > MAX_DISTANCE) {
        return NextResponse.json(
          {
            error: `Too far from installation point (${Math.round(distance)}m)`,
            distance: Math.round(distance),
          },
          { status: 400 }
        )
      }

      // Warning if between 30m and 1km
      if (distance > WARNING_DISTANCE) {
        distanceWarning = `You are ${Math.round(distance)}m away. Make sure you are at the correct location.`
      }
    }

    // Start installation
    const updated = await prisma.installation.update({
      where: { id: params.id },
      data: {
        status: "IN_PROGRESS",
        actualStartDate: new Date(),
        startLatitude: latitude,
        startLongitude: longitude,
      },
    })

    return NextResponse.json({
      installation: updated,
      warning: distanceWarning,
    })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

// Haversine formula for GPS distance calculation
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}
```

**Key Features:**
- Verifies materials loaded before allowing start
- GPS distance validation with Haversine formula
- Maximum 1km distance (blocks start if exceeded)
- Warning between 30m-1km (allows with warning)
- Records GPS coordinates at start

#### Complete Installation API

**File:** `/src/app/api/installations/[id]/complete/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const installation = await prisma.installation.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!installation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (installation.assignedToUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (installation.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Installation must be in progress" },
        { status: 400 }
      )
    }

    const { latitude, longitude, signature, clientDni, notes } =
      await request.json()

    // GPS required
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "GPS location required" },
        { status: 400 }
      )
    }

    // Signature required
    if (!signature) {
      return NextResponse.json(
        { error: "Client signature required" },
        { status: 400 }
      )
    }

    // DNI required
    if (!clientDni) {
      return NextResponse.json(
        { error: "Client DNI required" },
        { status: 400 }
      )
    }

    // Verify required photos
    const photos = await prisma.installationPhoto.findMany({
      where: { installationId: params.id },
    })

    const requiredPhotos = (installation.metadata as any)?.requiredPhotos || 2
    const afterPhotos = photos.filter((p) => p.photoType === "AFTER")

    if (afterPhotos.length < requiredPhotos) {
      return NextResponse.json(
        { error: `At least ${requiredPhotos} completion photos required` },
        { status: 400 }
      )
    }

    // Calculate duration
    const duration = installation.actualStartDate
      ? Math.floor(
          (new Date().getTime() - installation.actualStartDate.getTime()) / 60000
        )
      : null

    // Complete installation
    const updated = await prisma.installation.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        actualEndDate: new Date(),
        actualDuration: duration,
        endLatitude: latitude,
        endLongitude: longitude,
        signature,
        clientDni,
        completionNotes: notes,
      },
    })

    // Mark materials as used
    await prisma.installationMaterial.updateMany({
      where: { installationId: params.id },
      data: { isUsed: true },
    })

    return NextResponse.json({ installation: updated })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
```

**Key Features:**
- Validates signature (base64 canvas data)
- Validates client DNI
- Verifies minimum photo count (configurable via metadata)
- Calculates actual duration
- Records GPS coordinates at completion
- Marks materials as used

### Frontend Components Pattern

#### Server Component (Default)

```typescript
// Example: /src/app/(sales)/leads/page.tsx

import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

export default async function LeadsPage() {
  // Server-side authentication
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Server-side data fetching
  const leads = await prisma.lead.findMany({
    where: {
      companyId: session.user.companyId,  // Company isolation
    },
    include: {
      assignedTo: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Server-side rendering
  return (
    <div>
      <h1>Leads</h1>
      {leads.map((lead) => (
        <div key={lead.id}>
          <Link href={`/sales/leads/${lead.id}`}>
            {lead.contactName}
          </Link>
        </div>
      ))}
    </div>
  )
}
```

#### Client Component (Interactive)

```typescript
// Example: InstallationView.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Installation {
  id: string
  status: string
  actualStartDate: Date | null
  // ...
}

export function InstallationView({ installation }: { installation: Installation }) {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time chronometer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getElapsedTime = () => {
    if (!installation.actualStartDate) return "00:00:00"

    const start = new Date(installation.actualStartDate)
    const elapsed = Math.floor((currentTime.getTime() - start.getTime()) / 1000)

    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return (
    <div>
      {installation.status === "IN_PROGRESS" && (
        <div>
          <h2>Time Elapsed</h2>
          <p className="text-4xl font-mono">{getElapsedTime()}</p>
        </div>
      )}
    </div>
  )
}
```

---

## Authentication System

### NextAuth Configuration

**File:** `/src/lib/auth/auth.ts`

```typescript
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma/client"
import { UserRole } from "@prisma/client"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          },
          include: {
            company: true,
            userPermissions: true,
          }
        })

        if (!user) {
          throw new Error("Invalid credentials")
        }

        // Check user active status
        if (!user.isActive) {
          throw new Error("User inactive or suspended")
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          companyId: user.companyId,
          companySlug: user.company.slug,
          forcePasswordChange: user.forcePasswordChange,
          avatar: user.avatar,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.companySlug = user.companySlug
        token.forcePasswordChange = user.forcePasswordChange
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.companyId = token.companyId as string
        session.user.companySlug = token.companySlug as string
        session.user.forcePasswordChange = token.forcePasswordChange as boolean
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

### Session Usage in API

```typescript
import { auth } from "@/lib/auth/auth"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Access session data
  const userId = session.user.id
  const userRole = session.user.role
  const companyId = session.user.companyId

  // ...
}
```

### Session Usage in Server Components

```typescript
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Access session data
  const userId = session.user.id
  const userRole = session.user.role

  // ...
}
```

---

## API Endpoints

### Complete API List (59 endpoints)

#### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/auth/change-password` - Change password

#### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user (generates temporary password)
- `GET /api/users/[id]` - Get user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Deactivate user

#### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

#### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/leads/[id]` - Get lead
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead
- `POST /api/leads/[id]/convert` - Convert to client
- `GET /api/leads/[id]/timeline` - Get timeline

#### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/[id]` - Get client
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

#### Proposals
- `GET /api/proposals` - List proposals
- `POST /api/proposals` - Create proposal
- `GET /api/proposals/[id]` - Get proposal
- `PUT /api/proposals/[id]` - Update proposal
- `DELETE /api/proposals/[id]` - Delete proposal
- `POST /api/proposals/[id]/approve` - Approve proposal
- `GET /api/proposals/[id]/pdf` - Generate PDF

#### Installations
- `GET /api/installations` - List installations
- `POST /api/installations` - Create installation
- `GET /api/installations/[id]` - Get installation
- `PUT /api/installations/[id]` - Update installation
- `POST /api/installations/[id]/start` - Start installation (GPS)
- `POST /api/installations/[id]/complete` - Complete (signature + DNI)
- `POST /api/installations/[id]/postpone` - Postpone (releases stock)
- `GET /api/installations/[id]/materials` - List materials
- `POST /api/installations/[id]/materials` - Add material (reserves stock)
- `POST /api/installations/[id]/load-materials` - Confirm materials loaded
- `POST /api/installations/[id]/photos` - Upload photo

#### Warehouses
- `GET /api/warehouses` - List warehouses
- `POST /api/warehouses` - Create warehouse
- `GET /api/warehouses/[id]` - Get warehouse
- `PUT /api/warehouses/[id]` - Update warehouse
- `DELETE /api/warehouses/[id]` - Delete warehouse
- `GET /api/warehouses/[id]/inventory` - Get inventory
- `POST /api/warehouses/[id]/inventory` - Add product to inventory
- `PUT /api/warehouses/[id]/inventory/[productId]` - Update stock
- `GET /api/warehouses/[id]/movements` - List movements
- `POST /api/warehouses/[id]/movements` - Create movement

#### Calendar
- `GET /api/calendar` - List events
- `POST /api/calendar` - Create event
- `GET /api/calendar/[id]` - Get event
- `PUT /api/calendar/[id]` - Update event
- `DELETE /api/calendar/[id]` - Delete event

#### Maintenance
- `GET /api/maintenances` - List maintenances
- `POST /api/maintenances` - Create maintenance
- `GET /api/maintenances/[id]` - Get maintenance
- `PUT /api/maintenances/[id]` - Update maintenance
- `DELETE /api/maintenances/[id]` - Delete maintenance

#### Public APIs (API Key required)
- `GET /api/public/products` - List products
- `GET /api/public/products/[id]` - Get product
- `POST /api/public/leads` - Create lead from website

---

## Frontend Pages

### Complete Pages List (59 pages)

#### Public
- `/` - Homepage
- `/login` - Login page

#### Admin
- `/admin/dashboard` - Dashboard
- `/admin/products` - Products management
- `/admin/users` - Users management
- `/admin/users/new` - Create user
- `/admin/calendar` - Calendar
- `/admin/calendar/new` - New event

#### Sales
- `/sales/dashboard` - Sales dashboard
- `/sales/leads` - Leads list
- `/sales/leads/new` - Create lead
- `/sales/leads/[id]` - Lead detail
- `/sales/leads/[id]/edit` - Edit lead
- `/sales/clients` - Clients list
- `/sales/clients/new` - Create client
- `/sales/clients/[id]` - Client detail
- `/sales/proposals` - Proposals list
- `/sales/proposals/new` - Create proposal
- `/sales/proposals/[id]` - Proposal detail

#### Technician
- `/technician/dashboard` - Technician dashboard
- `/technician/installations` - Installations list
- `/technician/installations/[id]` - Installation detail (with chronometer)
- `/technician/installations/[id]/load` - Load materials
- `/technician/maintenances` - Maintenances list
- `/technician/maintenances/[id]` - Maintenance detail

#### Warehouse
- `/warehouse/dashboard` - Warehouse dashboard
- `/warehouse/warehouses` - Warehouses list
- `/warehouse/warehouses/new` - Create warehouse
- `/warehouse/warehouses/[id]` - Warehouse detail + inventory

---

## Key Features

### 1. Installation GPS Tracking System

**How it works:**

1. **Materials Loading**
   - Technician sees list of materials for installation
   - Clicks "Load Materials" button
   - Checks each material in visual checklist
   - System marks `materialsLoaded = true`
   - Cannot start installation until all materials loaded

2. **Start Installation**
   - Gets current GPS coordinates from browser
   - Calculates distance to installation address using Haversine formula
   - Blocks if > 1000m (1km)
   - Shows warning if between 30m and 1000m
   - Allows if < 30m
   - Records GPS at start
   - Changes status to `IN_PROGRESS`
   - Starts chronometer

3. **During Installation**
   - Real-time chronometer visible (updates every second)
   - Can upload photos (BEFORE, DURING, AFTER)
   - Photos categorized by type

4. **Complete Installation**
   - Validates GPS location again
   - Requires client DNI input
   - Requires digital signature (canvas)
   - Validates minimum photo count
   - Calculates actual duration
   - Records GPS at completion
   - Marks status as `COMPLETED`

5. **Postpone Installation**
   - Opens form with reason input
   - Optionally set new date
   - Automatically releases reserved stock
   - Records partial duration if was in progress
   - Changes status to `POSTPONED`

### 2. Stock Reservation System

**How it works:**

1. **Material Assignment**
   ```typescript
   // When materials added to installation
   POST /api/installations/[id]/materials

   // Checks stock availability
   const inventory = await prisma.inventory.findFirst({
     where: { productId, warehouseId }
   })

   if (inventory.quantity < quantity) {
     throw new Error("Insufficient stock")
   }

   // Reserves stock
   await prisma.inventory.update({
     where: { id: inventory.id },
     data: {
       quantity: { decrement: quantity },
       reservedQuantity: { increment: quantity }
     }
   })

   // Creates installation material
   await prisma.installationMaterial.create({
     data: {
       installationId,
       productId,
       quantity,
       isReserved: true,
       warehouseId
     }
   })
   ```

2. **Stock Release on Postpone**
   ```typescript
   // When installation postponed
   POST /api/installations/[id]/postpone

   // Finds reserved materials
   const materials = installation.materials.filter(m =>
     m.isReserved && !m.isUsed
   )

   // Releases stock
   for (const material of materials) {
     await prisma.inventory.updateMany({
       where: {
         productId: material.productId,
         warehouseId: material.warehouseId
       },
       data: {
         quantity: { increment: material.quantity },
         reservedQuantity: { decrement: material.quantity }
       }
     })
   }
   ```

3. **Stock Consumed on Complete**
   ```typescript
   // When installation completed
   POST /api/installations/[id]/complete

   // Marks materials as used
   await prisma.installationMaterial.updateMany({
     where: { installationId },
     data: { isUsed: true }
   })

   // Reserved quantity already decremented
   // No need to touch inventory again
   ```

### 3. Digital Signature Capture

**Frontend Component:**

```typescript
"use client"

import { useRef, useState } from "react"

export function SignatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const getSignatureData = () => {
    const canvas = canvasRef.current
    if (!canvas) return null

    // Check if canvas has content
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasSignature = imageData.data.some(pixel => pixel !== 0)

    if (!hasSignature) return null

    return canvas.toDataURL("image/png")
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border-2 border-gray-300 rounded cursor-crosshair"
      />
      <button onClick={clearSignature}>Clear</button>
    </div>
  )
}
```

**Backend Storage:**

```typescript
// Signature stored as base64 string
await prisma.installation.update({
  where: { id },
  data: {
    signature: signatureBase64  // "data:image/png;base64,iVBORw0KG..."
  }
})
```

### 4. Real-time Chronometer

```typescript
"use client"

import { useState, useEffect } from "react"

export function Chronometer({ startDate }: { startDate: Date | null }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!startDate) return null

  const start = new Date(startDate)
  const elapsed = Math.floor((currentTime.getTime() - start.getTime()) / 1000)

  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60

  return (
    <div className="text-4xl font-mono">
      {String(hours).padStart(2, "0")}:
      {String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  )
}
```

---

## Deployment

### Requirements

- **Server:** Ubuntu 22.04 LTS (4GB RAM minimum)
- **Node.js:** 18.0.0 or higher
- **PostgreSQL:** 14 or higher
- **Nginx:** Latest
- **PM2:** Latest (process manager)
- **Certbot:** For SSL certificates

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/water_crm?schema=public"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Production
NODE_ENV="production"

# Multi-tenant
NEXT_PUBLIC_MAIN_DOMAIN="yourdomain.com"
NEXT_PUBLIC_USE_SUBDOMAINS="false"
```

### Deployment Steps

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. Seed database (optional)
npm run prisma:seed

# 5. Build application
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'water-crm',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/water-crm',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
}
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M;
}
```

---

# DOCUMENTACIÓN EN ESPAÑOL

## Descripción del Sistema

Water CRM es un sistema completo de gestión de relaciones con clientes (CRM) específicamente diseñado para empresas de tratamiento de agua. Gestiona todo el ciclo de ventas desde la captura de leads hasta la instalación, mantenimiento y control de inventario.

### Funcionalidad Principal

- **Arquitectura Multi-tenant**: Datos aislados por empresa
- **7 Roles de Usuario**: SUPERADMIN, ADMIN, DIRECTOR_SALES, DIRECTOR_INSTALLATIONS, DIRECTOR_MARKETING, SALES, TECHNICIAN, MARKETING, WAREHOUSE
- **Pipeline Completo de Ventas**: Lead → Propuesta → Venta → Instalación → Mantenimiento
- **Seguimiento GPS en Tiempo Real**: Para instalaciones con requisitos estrictos de geolocalización
- **Gestión de Inventario**: Reserva de stock, movimientos de almacén, alertas
- **Firmas Digitales**: Captura de firma basada en canvas para instalaciones
- **Generación de PDF**: Plantillas de propuestas personalizadas con exportación a PDF
- **Aplicación Web Progresiva**: Instalable en dispositivos móviles, funciona offline

---

## Arquitectura (ES)

### Stack Tecnológico

**Frontend:**
- **Next.js 14** (App Router con Server Components)
- **React 18.3.1** (Componentes de Servidor y Cliente)
- **TypeScript 5.6.3** (Seguridad total de tipos)
- **Tailwind CSS 3.4** (Estilos utility-first)
- **Next-PWA 5.6** (Capacidades de PWA)

**Backend:**
- **Rutas API de Next.js** (API RESTful)
- **Prisma 5.22** (ORM para PostgreSQL)
- **PostgreSQL 14+** (Base de datos relacional)
- **NextAuth v5** (Autenticación con JWT)

**Librerías Adicionales:**
- **@react-pdf/renderer**: Generación de PDF
- **bcryptjs**: Hash de contraseñas
- **Leaflet**: Mapas y geolocalización
- **Recharts**: Visualización de datos
- **Zod**: Validación de esquemas

### Flujo de Aplicación

```
Petición Usuario → Middleware Next.js → Verificación Auth → Ruta API → Query Prisma → PostgreSQL → Respuesta
                                        ↓
                                  Validación Sesión (JWT)
                                        ↓
                                  Control Acceso por Rol
                                        ↓
                                  Verificación Aislamiento Empresa
```

---

## Esquema de Base de Datos

### Visión General

La base de datos consta de **32 modelos** organizados en grupos lógicos:

1. **Usuarios y Empresas** (5 modelos): User, Company, Role, UserPermission, UserHierarchy
2. **Productos** (7 modelos): Product, ProductCategory, ProductAttribute, ProductAttributeValue, ProductImage, ProductPrice, ProductDatasheet
3. **Leads y Clientes** (3 modelos): Lead, Client, ContactTimeline
4. **Propuestas** (4 modelos): Proposal, ProposalItem, ProposalTemplate, ProposalRating
5. **Ventas** (3 modelos): Sale, SaleItem, SalesGoal, SalesPointsConfig
6. **Instalaciones** (3 modelos): Installation, InstallationMaterial, InstallationPhoto
7. **Mantenimiento** (3 modelos): Maintenance, MaintenanceMaterial, MaintenanceHistory
8. **Inventario** (7 modelos): Warehouse, Inventory, WarehouseMovement, InventoryMovement, LoadingOrder, LoadingOrderItem, StockAlert
9. **Finanzas** (2 modelos): Wallet, WalletTransaction
10. **Agenda** (3 modelos): CalendarEvent, Route, RouteStop
11. **Telemarketing** (5 modelos): TmkCampaign, TmkCallList, TmkCallListItem, TmkCall, TmkScript
12. **Sistema** (6 modelos): InternalMessage, MessageAttachment, Expense, CompanySetting, ActivityLog, ApiKey, Incident

### Modelos Clave Detallados

#### Modelo User (Usuario)

```prisma
model User {
  id                  String      @id @default(cuid())
  email               String      @unique
  password            String      // hash bcrypt
  firstName           String
  lastName            String
  phone               String?
  avatar              String?

  companyId           String
  company             Company     @relation(fields: [companyId], references: [id], onDelete: Cascade)

  role                UserRole    @default(CUSTOM)
  isActive            Boolean     @default(true)
  permissions         Json?       @db.JsonB

  forcePasswordChange Boolean     @default(false)

  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  lastLogin           DateTime?

  // Relaciones con otros modelos...
}

enum UserRole {
  SUPERADMIN
  ADMIN
  DIRECTOR_SALES
  DIRECTOR_INSTALLATIONS
  DIRECTOR_MARKETING
  SALES
  TECHNICIAN
  MARKETING
  WAREHOUSE
  CUSTOM
}
```

**Características Clave:**
- Contraseña almacenada como hash bcrypt (10 rondas)
- `isActive` Boolean para borrado suave
- `permissions` JSON para control de acceso granular
- Aislamiento multi-tenant vía `companyId`
- Borrado en cascada cuando se elimina la empresa

#### Modelo Installation (Instalación) - Crítico para seguimiento GPS

```prisma
model Installation {
  id                String             @id @default(cuid())
  companyId         String
  company           Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)

  saleId            String
  sale              Sale               @relation(fields: [saleId], references: [id])

  clientId          String
  client            Client             @relation(fields: [clientId], references: [id])

  assignedToUserId  String
  assignedTo        User               @relation(fields: [assignedToUserId], references: [id])

  status            InstallationStatus @default(SCHEDULED)

  // Dirección de instalación
  address           String?
  city              String?
  state             String?
  postalCode        String?
  latitude          Decimal?           @db.Decimal(10, 8)
  longitude         Decimal?           @db.Decimal(11, 8)

  // Programación
  scheduledDate     DateTime
  estimatedDuration Int?               // minutos

  actualStartDate   DateTime?
  actualEndDate     DateTime?
  actualDuration    Int?               // minutos

  // Gestión de materiales
  materialsLoaded   Boolean            @default(false)
  materialsLoadedAt DateTime?

  // Seguimiento GPS al inicio
  startLatitude     Decimal?           @db.Decimal(10, 8)
  startLongitude    Decimal?           @db.Decimal(11, 8)
  startAddress      String?

  // Seguimiento GPS al finalizar
  endLatitude       Decimal?           @db.Decimal(10, 8)
  endLongitude      Decimal?           @db.Decimal(11, 8)
  endAddress        String?

  // Validación
  maxDistanceMeters Int                @default(1000)

  // Finalización
  signature         String?            @db.Text  // base64
  clientDni         String?
  completionNotes   String?            @db.Text

  notes             String?            @db.Text
  metadata          Json?              @db.JsonB

  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  // Relaciones
  materials         InstallationMaterial[]
  photos            InstallationPhoto[]
  maintenances      Maintenance[]
  incidents         Incident[]
}

enum InstallationStatus {
  SCHEDULED      // Programada
  IN_PROGRESS    // En progreso
  COMPLETED      // Completada
  CANCELLED      // Cancelada
  POSTPONED      // Pospuesta
}
```

**Características Clave:**
- Doble seguimiento GPS (posiciones de inicio y fin)
- Verificación de carga de materiales
- Almacenamiento de firma digital (base64)
- Captura de DNI del cliente
- Distancia máxima configurable (por defecto 1km)
- Campo metadata para datos personalizados (ej: cantidad de fotos requeridas)

#### Modelos Inventory y Warehouse (Inventario y Almacén)

```prisma
model Warehouse {
  id          String    @id @default(cuid())
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)

  name        String
  address     String?
  city        String?
  state       String?
  postalCode  String?
  phone       String?

  managerId   String?
  manager     User?     @relation(fields: [managerId], references: [id])

  isActive    Boolean   @default(true)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relaciones
  inventory             Inventory[]
  movements             WarehouseMovement[]
  movementsFrom         InventoryMovement[] @relation("FromWarehouse")
  movementsTo           InventoryMovement[] @relation("ToWarehouse")
  stockAlerts           StockAlert[]
  loadingOrders         LoadingOrder[]
  installationMaterials InstallationMaterial[]
}

model Inventory {
  id               String    @id @default(cuid())

  warehouseId      String
  warehouse        Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)

  productId        String
  product          Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  quantity         Int       @default(0)
  reservedQuantity Int       @default(0)  // CRÍTICO: Para instalaciones
  minStock         Int       @default(0)
  maxStock         Int?

  lastRestockDate  DateTime?
  updatedAt        DateTime  @updatedAt

  @@unique([warehouseId, productId])
}

model WarehouseMovement {
  id          String                @id @default(cuid())

  warehouseId String
  warehouse   Warehouse             @relation(fields: [warehouseId], references: [id], onDelete: Cascade)

  productId   String
  product     Product               @relation(fields: [productId], references: [id])

  type        WarehouseMovementType
  quantity    Int
  reason      String

  userId      String
  user        User                  @relation(fields: [userId], references: [id])

  createdAt   DateTime              @default(now())
}

enum WarehouseMovementType {
  IN         // Entrada de stock
  OUT        // Salida de stock
  TRANSFER   // Transferencia entre almacenes
  ADJUSTMENT // Ajuste de inventario
}
```

**Características Clave:**
- `reservedQuantity` separado de `quantity` para bloqueo de stock
- Reserva automática de stock cuando se asignan materiales a instalación
- Liberación automática de stock cuando se pospone instalación
- Seguimiento simple de movimientos con modelo WarehouseMovement

---

## Estructura del Código

### Patrón de Rutas API

Todas las rutas API siguen esta estructura:

```typescript
// Ejemplo: /src/app/api/[resource]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"

export async function GET(request: NextRequest) {
  try {
    // 1. Autenticación
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // 2. Parámetros de consulta
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // 3. Construir query con aislamiento por empresa
    const where: any = {
      companyId: session.user.companyId,  // CRÍTICO: Multi-tenancy
    }

    if (status) {
      where.status = status
    }

    // 4. Consulta a base de datos
    const items = await prisma.resource.findMany({
      where,
      include: {
        // Datos relacionados
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 5. Respuesta
    return NextResponse.json({ items })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticación
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // 2. Parsear body
    const data = await request.json()

    // 3. Validación
    if (!data.requiredField) {
      return NextResponse.json(
        { error: "Falta campo requerido" },
        { status: 400 }
      )
    }

    // 4. Crear con aislamiento por empresa
    const item = await prisma.resource.create({
      data: {
        ...data,
        companyId: session.user.companyId,  // CRÍTICO
      },
    })

    // 5. Log de actividad
    await prisma.activityLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "RESOURCE",
        entityId: item.id,
      },
    })

    // 6. Respuesta
    return NextResponse.json({ item }, { status: 201 })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
```

### APIs Críticas de Instalación

#### API para Iniciar Instalación

**Archivo:** `/src/app/api/installations/[id]/start/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const installation = await prisma.installation.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!installation) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 })
    }

    // Verificar asignación de usuario
    if (installation.assignedToUserId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar estado
    if (installation.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Instalación ya iniciada" },
        { status: 400 }
      )
    }

    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Se requiere ubicación GPS" },
        { status: 400 }
      )
    }

    // CRÍTICO: Verificar materiales cargados
    if (!installation.materialsLoaded) {
      return NextResponse.json(
        { error: "Debes cargar los materiales primero" },
        { status: 400 }
      )
    }

    // CRÍTICO: Verificar proximidad (máx 1km)
    const MAX_DISTANCE = 1000 // metros
    const WARNING_DISTANCE = 30 // metros
    let distanceWarning = null

    if (installation.latitude && installation.longitude) {
      const distance = getDistanceInMeters(
        latitude,
        longitude,
        Number(installation.latitude),
        Number(installation.longitude)
      )

      // Bloquear si > 1km
      if (distance > MAX_DISTANCE) {
        return NextResponse.json(
          {
            error: `Estás muy lejos del punto de instalación (${Math.round(distance)}m)`,
            distance: Math.round(distance),
          },
          { status: 400 }
        )
      }

      // Aviso si entre 30m y 1km
      if (distance > WARNING_DISTANCE) {
        distanceWarning = `Estás a ${Math.round(distance)}m. Asegúrate de estar en el lugar correcto.`
      }
    }

    // Iniciar instalación
    const updated = await prisma.installation.update({
      where: { id: params.id },
      data: {
        status: "IN_PROGRESS",
        actualStartDate: new Date(),
        startLatitude: latitude,
        startLongitude: longitude,
      },
    })

    return NextResponse.json({
      installation: updated,
      warning: distanceWarning,
    })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

// Fórmula de Haversine para cálculo de distancia GPS
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distancia en metros
}
```

**Características Clave:**
- Verifica materiales cargados antes de permitir inicio
- Validación de distancia GPS con fórmula de Haversine
- Distancia máxima de 1km (bloquea inicio si se excede)
- Aviso entre 30m-1km (permite con advertencia)
- Registra coordenadas GPS al inicio

---

## Sistema de Autenticación

### Configuración de NextAuth

**Archivo:** `/src/lib/auth/auth.ts`

```typescript
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma/client"
import { UserRole } from "@prisma/client"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña requeridos")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          },
          include: {
            company: true,
            userPermissions: true,
          }
        })

        if (!user) {
          throw new Error("Credenciales inválidas")
        }

        // Verificar estado activo del usuario
        if (!user.isActive) {
          throw new Error("Usuario inactivo o suspendido")
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Credenciales inválidas")
        }

        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          companyId: user.companyId,
          companySlug: user.company.slug,
          forcePasswordChange: user.forcePasswordChange,
          avatar: user.avatar,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.companySlug = user.companySlug
        token.forcePasswordChange = user.forcePasswordChange
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.companyId = token.companyId as string
        session.user.companySlug = token.companySlug as string
        session.user.forcePasswordChange = token.forcePasswordChange as boolean
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

### Uso de Sesión en API

```typescript
import { auth } from "@/lib/auth/auth"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Acceder a datos de sesión
  const userId = session.user.id
  const userRole = session.user.role
  const companyId = session.user.companyId

  // ...
}
```

### Uso de Sesión en Componentes de Servidor

```typescript
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Acceder a datos de sesión
  const userId = session.user.id
  const userRole = session.user.role

  // ...
}
```

---

## Características Principales

### 1. Sistema de Seguimiento GPS de Instalaciones

**Cómo funciona:**

1. **Carga de Materiales**
   - Técnico ve lista de materiales para instalación
   - Hace clic en botón "Cargar Materiales"
   - Marca cada material en checklist visual
   - Sistema marca `materialsLoaded = true`
   - No puede iniciar instalación hasta que todos los materiales estén cargados

2. **Iniciar Instalación**
   - Obtiene coordenadas GPS actuales del navegador
   - Calcula distancia a dirección de instalación usando fórmula de Haversine
   - Bloquea si > 1000m (1km)
   - Muestra aviso si entre 30m y 1000m
   - Permite si < 30m
   - Registra GPS al inicio
   - Cambia estado a `IN_PROGRESS`
   - Inicia cronómetro

3. **Durante Instalación**
   - Cronómetro en tiempo real visible (actualiza cada segundo)
   - Puede subir fotos (ANTES, DURANTE, DESPUÉS)
   - Fotos categorizadas por tipo

4. **Completar Instalación**
   - Valida ubicación GPS nuevamente
   - Requiere DNI del cliente
   - Requiere firma digital (canvas)
   - Valida cantidad mínima de fotos
   - Calcula duración real
   - Registra GPS al completar
   - Marca estado como `COMPLETED`

5. **Posponer Instalación**
   - Abre formulario con input de motivo
   - Opcionalmente establece nueva fecha
   - Libera automáticamente stock reservado
   - Registra duración parcial si estaba en progreso
   - Cambia estado a `POSTPONED`

### 2. Sistema de Reserva de Stock

**Cómo funciona:**

1. **Asignación de Material**
   ```typescript
   // Cuando se añaden materiales a instalación
   POST /api/installations/[id]/materials

   // Verifica disponibilidad de stock
   const inventory = await prisma.inventory.findFirst({
     where: { productId, warehouseId }
   })

   if (inventory.quantity < quantity) {
     throw new Error("Stock insuficiente")
   }

   // Reserva stock
   await prisma.inventory.update({
     where: { id: inventory.id },
     data: {
       quantity: { decrement: quantity },
       reservedQuantity: { increment: quantity }
     }
   })

   // Crea material de instalación
   await prisma.installationMaterial.create({
     data: {
       installationId,
       productId,
       quantity,
       isReserved: true,
       warehouseId
     }
   })
   ```

2. **Liberación de Stock al Posponer**
   ```typescript
   // Cuando se pospone instalación
   POST /api/installations/[id]/postpone

   // Encuentra materiales reservados
   const materials = installation.materials.filter(m =>
     m.isReserved && !m.isUsed
   )

   // Libera stock
   for (const material of materials) {
     await prisma.inventory.updateMany({
       where: {
         productId: material.productId,
         warehouseId: material.warehouseId
       },
       data: {
         quantity: { increment: material.quantity },
         reservedQuantity: { decrement: material.quantity }
       }
     })
   }
   ```

3. **Stock Consumido al Completar**
   ```typescript
   // Cuando se completa instalación
   POST /api/installations/[id]/complete

   // Marca materiales como usados
   await prisma.installationMaterial.updateMany({
     where: { installationId },
     data: { isUsed: true }
   })

   // Cantidad reservada ya decrementada
   // No necesita tocar inventario de nuevo
   ```

### 3. Captura de Firma Digital

**Componente Frontend:**

```typescript
"use client"

import { useRef, useState } from "react"

export function SignatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const getSignatureData = () => {
    const canvas = canvasRef.current
    if (!canvas) return null

    // Verificar si canvas tiene contenido
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasSignature = imageData.data.some(pixel => pixel !== 0)

    if (!hasSignature) return null

    return canvas.toDataURL("image/png")
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border-2 border-gray-300 rounded cursor-crosshair"
      />
      <button onClick={clearSignature}>Limpiar</button>
    </div>
  )
}
```

**Almacenamiento en Backend:**

```typescript
// Firma almacenada como string base64
await prisma.installation.update({
  where: { id },
  data: {
    signature: signatureBase64  // "data:image/png;base64,iVBORw0KG..."
  }
})
```

### 4. Cronómetro en Tiempo Real

```typescript
"use client"

import { useState, useEffect } from "react"

export function Chronometer({ startDate }: { startDate: Date | null }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!startDate) return null

  const start = new Date(startDate)
  const elapsed = Math.floor((currentTime.getTime() - start.getTime()) / 1000)

  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60

  return (
    <div className="text-4xl font-mono">
      {String(hours).padStart(2, "0")}:
      {String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  )
}
```

---

## Despliegue

### Requisitos

- **Servidor:** Ubuntu 22.04 LTS (4GB RAM mínimo)
- **Node.js:** 18.0.0 o superior
- **PostgreSQL:** 14 o superior
- **Nginx:** Última versión
- **PM2:** Última versión (gestor de procesos)
- **Certbot:** Para certificados SSL

### Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/water_crm?schema=public"

# Autenticación
NEXTAUTH_URL="https://tudominio.com"
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"

# Producción
NODE_ENV="production"

# Multi-tenant
NEXT_PUBLIC_MAIN_DOMAIN="tudominio.com"
NEXT_PUBLIC_USE_SUBDOMAINS="false"
```

### Pasos de Despliegue

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma
npx prisma generate

# 3. Ejecutar migraciones
npx prisma migrate deploy

# 4. Poblar base de datos (opcional)
npm run prisma:seed

# 5. Compilar aplicación
npm run build

# 6. Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Configuración PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'water-crm',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/water-crm',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
}
```

### Configuración Nginx

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M;
}
```

---

**END OF DOCUMENTATION**

This documentation provides complete technical details for developers to understand and work with the Water CRM system. All critical features, database models, API patterns, and deployment procedures are documented in both English and Spanish.
