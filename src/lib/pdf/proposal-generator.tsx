import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer"
import { formatCurrency, formatDate } from "@/lib/utils/format"

// Estilos base del PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2pt solid #1890ff",
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1890ff",
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#1890ff",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    borderBottom: "1pt solid #ddd",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    padding: 8,
  },
  tableCol: {
    fontSize: 9,
  },
  tableColProduct: {
    width: "40%",
  },
  tableColQty: {
    width: "10%",
    textAlign: "center",
  },
  tableColPrice: {
    width: "20%",
    textAlign: "right",
  },
  tableColDiscount: {
    width: "15%",
    textAlign: "right",
  },
  tableColTotal: {
    width: "15%",
    textAlign: "right",
  },
  totalSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 5,
    width: "40%",
  },
  totalLabel: {
    flex: 1,
    fontSize: 10,
    textAlign: "right",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    width: 100,
    textAlign: "right",
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1890ff",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
    borderTop: "1pt solid #ddd",
    paddingTop: 10,
  },
  paymentInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f7ff",
    borderRadius: 5,
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1890ff",
  },
  paymentText: {
    fontSize: 9,
    marginBottom: 3,
  },
  terms: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#fafafa",
    borderLeft: "3pt solid #1890ff",
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  termsText: {
    fontSize: 8,
    lineHeight: 1.5,
    color: "#666",
  },
})

interface ProposalPDFProps {
  proposal: any
  company: any
  template?: any
}

export function ProposalPDF({ proposal, company, template }: ProposalPDFProps) {
  // Calcular subtotal
  const subtotal = proposal.items.reduce((sum: number, item: any) => {
    return sum + Number(item.totalPrice)
  }, 0)

  // Obtener texto del tipo de pago
  const paymentTypeText = proposal.paymentType === "SALE" ? "Compra" : "Alquiler"
  const installmentsText =
    proposal.installments === 1
      ? "Pago único"
      : `${proposal.installments} cuotas mensuales`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header personalizable */}
        <View style={styles.header}>
          {company.logo && (
            <Image src={company.logo} style={styles.logo} />
          )}
          <Text style={styles.companyName}>{company.name}</Text>
          {template?.headerHtml && (
            <Text style={styles.companyInfo}>{template.headerHtml}</Text>
          )}
        </View>

        {/* Título */}
        <Text style={styles.title}>PROPUESTA COMERCIAL</Text>
        <Text style={styles.subtitle}>
          Nº {proposal.proposalNumber} - {formatDate(proposal.createdAt)}
        </Text>

        {/* Información del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>
                {proposal.client?.contactName || proposal.lead?.contactName}
              </Text>
            </View>
            {(proposal.client?.email || proposal.lead?.email) && (
              <View style={styles.col}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>
                  {proposal.client?.email || proposal.lead?.email}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>
                {proposal.client?.phone || proposal.lead?.phone}
              </Text>
            </View>
            {(proposal.client?.address || proposal.lead?.address) && (
              <View style={styles.col}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>
                  {proposal.client?.address || proposal.lead?.address}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabla de productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de la Propuesta</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, styles.tableColProduct]}>
                Producto
              </Text>
              <Text style={[styles.tableCol, styles.tableColQty]}>Cant.</Text>
              <Text style={[styles.tableCol, styles.tableColPrice]}>
                Precio Unit.
              </Text>
              <Text style={[styles.tableCol, styles.tableColDiscount]}>
                Desc.
              </Text>
              <Text style={[styles.tableCol, styles.tableColTotal]}>
                Total
              </Text>
            </View>

            {/* Items */}
            {proposal.items.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.tableColProduct]}>
                  {item.product.name}
                  {item.customDescription && (
                    <Text style={{ fontSize: 8, color: "#666" }}>
                      {"\n"}
                      {item.customDescription}
                    </Text>
                  )}
                </Text>
                <Text style={[styles.tableCol, styles.tableColQty]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCol, styles.tableColPrice]}>
                  {formatCurrency(Number(item.unitPrice))}
                </Text>
                <Text style={[styles.tableCol, styles.tableColDiscount]}>
                  {item.discountPercent > 0
                    ? `${item.discountPercent}%`
                    : "-"}
                </Text>
                <Text style={[styles.tableCol, styles.tableColTotal]}>
                  {formatCurrency(Number(item.totalPrice))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totales */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>TOTAL:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(Number(proposal.totalAmount))}
            </Text>
          </View>
        </View>

        {/* Información de pago */}
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>Condiciones de Pago</Text>
          <Text style={styles.paymentText}>
            Modalidad: {paymentTypeText}
          </Text>
          <Text style={styles.paymentText}>
            Forma de pago: {installmentsText}
          </Text>
          {proposal.paymentType === "RENTAL" && (
            <Text style={styles.paymentText}>
              Cuota mensual: {formatCurrency(Number(proposal.totalAmount) / proposal.installments)}
            </Text>
          )}
          {proposal.validUntil && (
            <Text style={styles.paymentText}>
              Válido hasta: {formatDate(proposal.validUntil)}
            </Text>
          )}
        </View>

        {/* Términos y condiciones */}
        <View style={styles.terms}>
          <Text style={styles.termsTitle}>Términos y Condiciones</Text>
          {template?.footerHtml ? (
            <Text style={styles.termsText}>{template.footerHtml}</Text>
          ) : (
            <>
              <Text style={styles.termsText}>
                • Esta propuesta tiene una validez de 30 días desde la fecha de emisión.
              </Text>
              <Text style={styles.termsText}>
                • Los precios incluyen IVA.
              </Text>
              <Text style={styles.termsText}>
                • La instalación se realizará en un plazo de 5-7 días laborables tras la confirmación del pedido.
              </Text>
              <Text style={styles.termsText}>
                • Garantía de 2 años en equipos.
              </Text>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {company.name} | Propuesta generada el {formatDate(new Date())}
          </Text>
          <Text>
            Este documento es una propuesta comercial sin valor contractual hasta su aceptación formal
          </Text>
        </View>
      </Page>
    </Document>
  )
}
