import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/shared/DashboardLayout"
import { Button, Card, Badge, EmptyState } from "@/components/ui"
import prisma from "@/lib/prisma/client"
import { formatCurrency } from "@/lib/utils/format"
import Link from "next/link"

export default async function ProductsPage() {
  const session = await auth()

  if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  // Obtener productos
  const products = await prisma.product.findMany({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      prices: true,
      _count: {
        select: {
          images: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Activo</Badge>
      case "INACTIVE":
        return <Badge variant="neutral">Inactivo</Badge>
      case "DISCONTINUED":
        return <Badge variant="error">Descontinuado</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  return (
    <DashboardLayout
      userRole={session.user.role}
      userName={session.user.name}
      companyName={company?.name || "Mi Empresa"}
      title="Catálogo de Productos"
      actions={
        <Link href="/admin/products/new">
          <Button>+ Nuevo Producto</Button>
        </Link>
      }
    >
      {products.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No hay productos"
          description="Crea tu primer producto para empezar a generar propuestas"
          action={{
            label: "Crear Producto",
            onClick: () => (window.location.href = "/admin/products/new"),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-neutral-600 text-sm mb-2">
                  Total Productos
                </p>
                <p className="text-3xl font-bold text-primary-600">
                  {products.length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-neutral-600 text-sm mb-2">Activos</p>
                <p className="text-3xl font-bold text-success">
                  {products.filter((p) => p.status === "ACTIVE").length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-neutral-600 text-sm mb-2">Con Imágenes</p>
                <p className="text-3xl font-bold text-primary-600">
                  {products.filter((p) => p._count.images > 0).length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-neutral-600 text-sm mb-2">Con Precios</p>
                <p className="text-3xl font-bold text-primary-600">
                  {products.filter((p) => p.prices !== null).length}
                </p>
              </div>
            </Card>
          </div>

          {/* Listado de productos */}
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Referencia</th>
                    <th>Precio Base</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-neutral-200 rounded flex items-center justify-center text-neutral-500">
                              🏷️
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-neutral-500 max-w-md truncate">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {product.category ? (
                          <Badge variant="neutral">
                            {product.category.name}
                          </Badge>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td>
                        <div className="text-sm">
                          {product.internalReference || (
                            <span className="text-neutral-400">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="font-medium">
                          {formatCurrency(Number(product.basePrice))}
                        </span>
                      </td>
                      <td>{getStatusBadge(product.status)}</td>
                      <td>
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button size="sm" variant="secondary">
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
