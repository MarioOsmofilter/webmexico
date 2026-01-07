import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { InstallationView } from "./InstallationView"

export default async function InstallationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const installation = await prisma.installation.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
      assignedTo: session.user.id,
    },
    include: {
      client: true,
      sale: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
      materials: {
        include: {
          product: {
            include: {
              images: {
                take: 1,
                orderBy: { order: "asc" },
              },
            },
          },
          warehouse: {
            select: {
              name: true,
            },
          },
        },
      },
      photos: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!installation) {
    redirect("/technician/installations")
  }

  // Obtener configuración de fotos requeridas (admin puede configurar esto)
  const requiredPhotos = (installation.metadata as any)?.requiredPhotos || 2

  return (
    <InstallationView
      installation={installation}
      requiredPhotos={requiredPhotos}
    />
  )
}
