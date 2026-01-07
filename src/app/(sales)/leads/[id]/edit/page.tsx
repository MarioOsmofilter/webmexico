import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { EditLeadForm } from "./EditLeadForm"

export default async function EditLeadPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener lead
  const lead = await prisma.lead.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
  })

  if (!lead) {
    redirect("/sales/leads")
  }

  // Verificar permisos
  if (
    !["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role) &&
    lead.assignedTo !== session.user.id &&
    lead.assignedTo !== null
  ) {
    redirect("/sales/leads")
  }

  // Obtener usuarios disponibles para asignar (solo si es director o admin)
  const availableUsers =
    ["SUPERADMIN", "ADMIN", "DIRECTOR_SALES"].includes(session.user.role)
      ? await prisma.user.findMany({
          where: {
            companyId: session.user.companyId,
            role: {
              in: ["SALES", "DIRECTOR_SALES"],
            },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
          orderBy: {
            firstName: "asc",
          },
        })
      : []

  return <EditLeadForm lead={lead} availableUsers={availableUsers} />
}
