import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { LoadMaterialsForm } from "./LoadMaterialsForm"

export default async function LoadMaterialsPage({
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
      assignedToUserId: session.user.id,
    },
    include: {
      client: {
        select: {
          name: true,
          address: true,
          city: true,
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
    },
  })

  if (!installation) {
    redirect("/technician/installations")
  }

  return <LoadMaterialsForm installation={installation} />
}
