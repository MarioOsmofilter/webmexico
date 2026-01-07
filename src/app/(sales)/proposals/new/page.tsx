import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/prisma/client"
import { NewProposalForm } from "./NewProposalForm"

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: { leadId?: string; clientId?: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener leads disponibles (sin convertir y en estados válidos)
  const leads = await prisma.lead.findMany({
    where: {
      companyId: session.user.companyId,
      convertedToClient: false,
      status: {
        in: ["QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION"],
      },
    },
    select: {
      id: true,
      contactName: true,
      company: true,
      email: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Obtener clientes activos
  const clients = await prisma.client.findMany({
    where: {
      companyId: session.user.companyId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Obtener productos disponibles
  const products = await prisma.product.findMany({
    where: {
      companyId: session.user.companyId,
      status: "ACTIVE",
    },
    include: {
      prices: true,
      images: {
        take: 1,
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  // Obtener plantillas disponibles
  const templates = await prisma.proposalTemplate.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true,
    },
    orderBy: {
      isDefault: "desc",
    },
  })

  return (
    <NewProposalForm
      leads={leads}
      clients={clients}
      products={products}
      templates={templates}
      preselectedLeadId={searchParams.leadId}
      preselectedClientId={searchParams.clientId}
    />
  )
}
