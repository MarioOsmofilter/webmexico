"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils/format"

interface Product {
  id: string
  name: string
  internalReference: string | null
  basePrice: any
  prices: {
    salePrice1: any | null
    rentalPrice1: any | null
    rentalPrice12: any | null
    minPriceThreshold: any | null
  } | null
  images: { url: string }[]
}

interface ProposalItem {
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  discount: number
}

interface NewProposalFormProps {
  leads: { id: string; contactName: string; businessName: string | null; email: string | null }[]
  clients: { id: string; name: string; email: string | null }[]
  products: Product[]
  templates: { id: string; name: string; isDefault: boolean }[]
  preselectedLeadId?: string
  preselectedClientId?: string
}

export function NewProposalForm({
  leads,
  clients,
  products,
  templates,
  preselectedLeadId,
  preselectedClientId,
}: NewProposalFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [leadId, setLeadId] = useState(preselectedLeadId || "")
  const [clientId, setClientId] = useState(preselectedClientId || "")
  const [paymentType, setPaymentType] = useState<"SALE" | "RENTAL">("SALE")
  const [installments, setInstallments] = useState(1)
  const [validityDays, setValidityDays] = useState(30)
  const [templateId, setTemplateId] = useState(
    templates.find((t) => t.isDefault)?.id || templates[0]?.id || ""
  )
  const [notes, setNotes] = useState("")

  const [items, setItems] = useState<ProposalItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")

  // Calcular totales
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const totalDiscount = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.unitPrice * (item.discount / 100),
    0
  )
  const total = subtotal - totalDiscount

  const handleAddProduct = () => {
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    // Verificar que no esté ya agregado
    if (items.some((item) => item.productId === product.id)) {
      alert("Este producto ya está agregado a la propuesta")
      return
    }

    // Determinar precio según tipo de pago
    let unitPrice = 0
    if (paymentType === "SALE") {
      unitPrice = Number(product.basePrice || 0)
    } else {
      unitPrice = Number(product.prices?.rentalPrice12 || 0)
    }

    const newItem: ProposalItem = {
      productId: product.id,
      product,
      quantity: 1,
      unitPrice,
      discount: 0,
    }

    setItems([...items, newItem])
    setSelectedProductId("")
  }

  const handleRemoveProduct = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId))
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    )
  }

  const handleUpdatePrice = (productId: string, price: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, unitPrice: Math.max(0, price) }
          : item
      )
    )
  }

  const handleUpdateDiscount = (productId: string, discount: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, discount: Math.min(100, Math.max(0, discount)) }
          : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validaciones
    if (!leadId && !clientId) {
      setError("Debes seleccionar un lead o cliente")
      setLoading(false)
      return
    }

    if (items.length === 0) {
      setError("Debes agregar al menos un producto")
      setLoading(false)
      return
    }

    if (!templateId) {
      setError("Debes seleccionar una plantilla")
      setLoading(false)
      return
    }

    const data = {
      leadId: leadId || undefined,
      clientId: clientId || undefined,
      paymentType,
      installments: paymentType === "SALE" ? installments : 1,
      validityDays,
      templateId,
      notes: notes || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discount,
      })),
    }

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear la propuesta")
      }

      const result = await response.json()
      router.push(`/sales/proposals/${result.proposal.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/sales/proposals"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Propuestas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Propuesta</h1>
        <p className="text-gray-500 mt-1">
          Crea una propuesta comercial para un cliente o lead
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo - Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente/Lead */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cliente o Lead
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead
                  </label>
                  <select
                    value={leadId}
                    onChange={(e) => {
                      setLeadId(e.target.value)
                      if (e.target.value) setClientId("")
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecciona un lead</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.contactName}
                        {lead.businessName && ` - ${lead.businessName}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => {
                      setClientId(e.target.value)
                      if (e.target.value) setLeadId("")
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                * Selecciona un lead O un cliente (no ambos)
              </p>
            </div>

            {/* Configuración */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Pago
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) =>
                      setPaymentType(e.target.value as "SALE" | "RENTAL")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="SALE">Venta</option>
                    <option value="RENTAL">Alquiler</option>
                  </select>
                </div>

                {paymentType === "SALE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuotas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={installments}
                      onChange={(e) =>
                        setInstallments(parseInt(e.target.value) || 1)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validez (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) =>
                      setValidityDays(parseInt(e.target.value) || 30)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plantilla PDF
                  </label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                        {template.isDefault && " (Por defecto)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notas que no aparecerán en el PDF..."
                  />
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Productos
              </h2>

              {/* Agregar producto */}
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                      {product.internalReference && ` (${product.internalReference})`} -{" "}
                      {formatCurrency(
                        Number(
                          paymentType === "SALE"
                            ? product.basePrice || 0
                            : product.prices?.rentalPrice12 || 0
                        )
                      )}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedProductId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  + Agregar
                </button>
              </div>

              {/* Lista de productos */}
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No has agregado productos a la propuesta
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex gap-4">
                        {/* Imagen */}
                        {item.product.images[0] && (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}

                        {/* Info y controles */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {item.product.name}
                              </h3>
                              {item.product.reference && (
                                <p className="text-sm text-gray-500">
                                  Ref: {item.product.reference}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveProduct(item.productId)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Cantidad
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Precio Unit. (€)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleUpdatePrice(
                                    item.productId,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Descuento (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={item.discount}
                                onChange={(e) =>
                                  handleUpdateDiscount(
                                    item.productId,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Subtotal
                              </label>
                              <div className="px-2 py-1 text-sm font-semibold text-gray-900">
                                {formatCurrency(
                                  item.quantity *
                                    item.unitPrice *
                                    (1 - item.discount / 100)
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Alerta de precio bajo */}
                          {item.product.prices?.minPriceThreshold &&
                            item.unitPrice <
                              Number(item.product.prices.minPriceThreshold) && (
                              <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                                ⚠️ Precio por debajo del umbral mínimo. Esta
                                propuesta requerirá aprobación.
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descuento:</span>
                    <span className="text-red-600">
                      -{formatCurrency(totalDiscount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {paymentType === "SALE" && installments > 1 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">
                      Pago en {installments} cuotas:
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(total / installments)}/mes
                    </p>
                  </div>
                )}

                {paymentType === "RENTAL" && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Alquiler mensual</p>
                  </div>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <p>📦 {items.length} producto(s)</p>
                  <p>📅 Válida por {validityDays} días</p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="mt-6 space-y-2">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  disabled={items.length === 0 || (!leadId && !clientId)}
                >
                  Crear Propuesta
                </Button>
                <Link
                  href="/sales/proposals"
                  className="block w-full text-center px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
