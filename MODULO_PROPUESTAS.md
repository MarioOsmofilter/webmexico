# 📄 Módulo de Propuestas con PDFs Configurables

## 🎯 Descripción

Sistema completo de generación de propuestas comerciales con:
- **Plantillas configurables** para PDFs
- **Selección de productos** con precios editables
- **Sistema de aprobación** automático si el precio está por debajo del umbral
- **Modalidades de pago**: Venta o Alquiler
- **Plazos personalizables**: 1, 12, 24, 36, 48, 60 meses
- **Generación de PDF** profesional con diseño personalizado

---

## 📡 APIs Disponibles

### 1. **Gestión de Propuestas**

#### Listar Propuestas
```http
GET /api/proposals?status=DRAFT&createdBy=user-id
```

**Filtros disponibles:**
- `status`: DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED
- `createdBy`: ID del usuario creador
- `clientId`: ID del cliente
- `leadId`: ID del lead

**Respuesta:**
```json
{
  "proposals": [
    {
      "id": "...",
      "proposalNumber": "PROP-2024-001",
      "status": "DRAFT",
      "totalAmount": 599.99,
      "paymentType": "SALE",
      "installments": 1,
      "requiresApproval": false,
      "createdAt": "2024-...",
      "items": [...],
      "creator": {...},
      "lead": {...}
    }
  ]
}
```

---

#### Crear Propuesta
```http
POST /api/proposals
Content-Type: application/json

{
  "leadId": "lead-id",  // O clientId
  "paymentType": "SALE",  // O "RENTAL"
  "installments": 1,  // 1, 12, 24, 36, 48, 60
  "validUntil": "2024-12-31",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "unitPrice": 599.99,
      "discountPercent": 10
    }
  ]
}
```

**Lógica automática:**
1. Calcula el total automáticamente
2. **Verifica precios contra el umbral mínimo** del producto
3. Si `unitPrice < minPriceThreshold` → `requiresApproval = true`
4. Genera número de propuesta automático (`PROP-2024-XXX`)
5. Crea timeline si es de un lead

**Respuesta:**
```json
{
  "proposal": {
    "id": "...",
    "proposalNumber": "PROP-2024-001",
    "requiresApproval": true,  // Si el precio está por debajo
    "totalAmount": 1079.98,
    "items": [...]
  }
}
```

---

#### Obtener Propuesta
```http
GET /api/proposals/[id]
```

**Respuesta completa con:**
- Items con detalles de productos (precios, imágenes)
- Información de cliente/lead
- Creador y aprobador
- Rating (si existe)

---

#### Actualizar Propuesta
```http
PUT /api/proposals/[id]
Content-Type: application/json

{
  "status": "SENT",
  "validUntil": "2024-12-31"
}
```

**Restricciones:**
- No se puede editar si está `ACCEPTED` o `convertedToSale = true`

---

#### Eliminar Propuesta
```http
DELETE /api/proposals/[id]
```

**Permisos:** Solo ADMIN o DIRECTOR_SALES

**Restricciones:**
- No se puede eliminar si está convertida a venta

---

### 2. **Sistema de Aprobación**

#### Aprobar Propuesta
```http
POST /api/proposals/[id]/approve
```

**Permisos:** Solo DIRECTOR_SALES o ADMIN

**Lógica:**
1. Verifica que `requiresApproval = true`
2. Verifica que no esté ya aprobada
3. Marca `approvedBy` y `approvedAt`
4. Crea entrada en timeline
5. Notifica al comercial (futuro)

**Respuesta:**
```json
{
  "success": true,
  "proposal": {...},
  "message": "Propuesta aprobada correctamente"
}
```

---

#### Rechazar Propuesta
```http
DELETE /api/proposals/[id]/approve
Content-Type: application/json

{
  "reason": "Precio demasiado bajo"
}
```

**Lógica:**
1. Cambia status a `REJECTED`
2. Añade motivo al timeline
3. Log de actividad

---

### 3. **Generación de PDF**

#### Descargar PDF
```http
GET /api/proposals/[id]/pdf
```

**Lógica:**
1. Obtiene propuesta con todos los datos
2. Busca plantilla default de la empresa
3. Genera PDF con @react-pdf/renderer
4. Si está en `DRAFT` y no requiere aprobación → cambia a `SENT`
5. Crea timeline de "propuesta enviada"

**Respuesta:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Propuesta-PROP-2024-001.pdf"

[PDF Binary Data]
```

**Estructura del PDF:**
- Header configurable (logo, info empresa)
- Título: "PROPUESTA COMERCIAL"
- Número y fecha
- Datos del cliente
- Tabla de productos con:
  - Nombre producto
  - Cantidad
  - Precio unitario
  - Descuento
  - Total
- Subtotal y TOTAL destacado
- Condiciones de pago:
  - Modalidad (Venta/Alquiler)
  - Forma de pago (plazos)
  - Cuota mensual (si aplica)
  - Validez
- Términos y condiciones configurables
- Footer personalizable

---

### 4. **Plantillas de PDF**

#### Listar Plantillas
```http
GET /api/proposal-templates
```

**Respuesta:**
```json
{
  "templates": [
    {
      "id": "...",
      "name": "Plantilla Estándar",
      "isDefault": true,
      "headerHtml": "...",
      "footerHtml": "...",
      "stylesJson": {...}
    }
  ]
}
```

---

#### Crear Plantilla
```http
POST /api/proposal-templates
Content-Type: application/json

{
  "name": "Plantilla Premium",
  "headerHtml": "<p>Logo y datos de empresa</p>",
  "footerHtml": "<p>Términos y condiciones personalizados</p>",
  "stylesJson": {
    "primaryColor": "#1890ff",
    "fontSize": 10
  },
  "isDefault": false
}
```

**Permisos:** Solo ADMIN

**Lógica:**
- Si `isDefault = true`, quita el default de otras plantillas

---

#### Actualizar Plantilla
```http
PUT /api/proposal-templates
Content-Type: application/json

{
  "id": "template-id",
  "name": "Plantilla Actualizada",
  "headerHtml": "...",
  "isDefault": true
}
```

---

#### Eliminar Plantilla
```http
DELETE /api/proposal-templates?id=template-id
```

---

## 🎨 Configuración de Plantillas

### HeaderHTML (Ejemplo)
```html
<div>
  <h1>Aguas Puras S.L.</h1>
  <p>CIF: B12345678</p>
  <p>Teléfono: 900 123 456</p>
  <p>Email: info@aguaspuras.com</p>
</div>
```

### FooterHTML (Ejemplo)
```html
<div>
  <h3>Términos y Condiciones</h3>
  <p>• Esta propuesta tiene una validez de 30 días.</p>
  <p>• Los precios incluyen IVA.</p>
  <p>• Instalación en 5-7 días laborables.</p>
  <p>• Garantía de 2 años.</p>
</div>
```

### StylesJSON (Ejemplo)
```json
{
  "primaryColor": "#1890ff",
  "secondaryColor": "#52c41a",
  "fontSize": 10,
  "fontFamily": "Helvetica"
}
```

---

## 🔧 Flujo Completo de Uso

### 1. **Admin Configura Plantilla**
```bash
POST /api/proposal-templates
{
  "name": "Plantilla Aguas Puras",
  "headerHtml": "...",
  "footerHtml": "...",
  "isDefault": true
}
```

### 2. **Comercial Crea Propuesta**
```bash
POST /api/proposals
{
  "leadId": "lead-123",
  "paymentType": "SALE",
  "installments": 12,
  "items": [
    {
      "productId": "prod-456",
      "quantity": 1,
      "unitPrice": 450.00  # Precio por debajo de umbral (500)
    }
  ]
}

# Respuesta:
{
  "requiresApproval": true  # ⚠️ Necesita aprobación
}
```

### 3. **Director Aprueba** (si requiere)
```bash
POST /api/proposals/prop-id/approve

# Respuesta:
{
  "success": true,
  "message": "Propuesta aprobada"
}
```

### 4. **Comercial Genera PDF**
```bash
GET /api/proposals/prop-id/pdf

# Descarga: Propuesta-PROP-2024-001.pdf
```

### 5. **Cliente Acepta** (próxima funcionalidad)
```bash
# Futuro: Link público para que cliente acepte
GET /proposals/public/prop-token

# Acepta:
POST /proposals/public/prop-token/accept
```

---

## 📊 Ejemplos de Precios por Modalidad

### Venta
```json
{
  "paymentType": "SALE",
  "installments": 1,
  "totalAmount": 599.99
}
```
→ Pago único de 599.99€

```json
{
  "paymentType": "SALE",
  "installments": 12,
  "totalAmount": 650.00
}
```
→ 12 cuotas de 54.17€

### Alquiler
```json
{
  "paymentType": "RENTAL",
  "installments": 24,
  "totalAmount": 960.00  # 40€/mes * 24 meses
}
```
→ Cuota mensual de 40€ durante 24 meses

---

## 🔐 Permisos

| Acción | SALES | DIRECTOR_SALES | ADMIN | SUPERADMIN |
|--------|-------|----------------|-------|------------|
| Listar propias | ✅ | ✅ | ✅ | ✅ |
| Listar todas | ❌ | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ✅ | ✅ |
| Editar propia | ✅ | ✅ | ✅ | ✅ |
| Eliminar | ❌ | ✅ | ✅ | ✅ |
| Aprobar | ❌ | ✅ | ✅ | ✅ |
| Gestionar plantillas | ❌ | ❌ | ✅ | ✅ |
| Generar PDF | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Pruebas

### Test del Sistema Completo
```bash
# Ejecutar tests de base de datos
npm run db:test
```

Este comando ejecuta 14 tests que verifican:
1. ✅ Conexión a PostgreSQL
2. ✅ Creación de empresa
3. ✅ Usuarios con jerarquía
4. ✅ Productos con precios
5. ✅ Leads con timeline
6. ✅ Propuestas con items
7. ✅ Conversión lead → cliente
8. ✅ Ventas
9. ✅ Almacén e inventario
10. ✅ Instalaciones
11. ✅ Wallets y transacciones
12. ✅ Relaciones entre tablas
13. ✅ Eliminación en cascada
14. ✅ Activity logs y API keys

---

## 📝 Próximas Mejoras

- [ ] **Rating de propuestas** - Cliente puede valorar
- [ ] **Propuestas comparativas** - Mostrar varias opciones
- [ ] **Firma electrónica** - Aceptación digital
- [ ] **Link público** - Cliente ve y acepta sin login
- [ ] **Notificaciones** - Email cuando se crea/aprueba
- [ ] **Historial de cambios** - Ver modificaciones
- [ ] **Plantillas avanzadas** - Editor WYSIWYG
- [ ] **Múltiples idiomas** - ES, EN, FR, etc.
- [ ] **Adjuntos** - Anexar fichas técnicas
- [ ] **Comentarios** - Notas internas en propuesta

---

## 🐛 Troubleshooting

### Error: "requiresApproval siempre false"
✅ Verifica que los productos tengan `minPriceThreshold` configurado en `product_prices`

### PDF no se genera
✅ Verifica que `@react-pdf/renderer` esté instalado
✅ Comprueba que la empresa tenga al menos una plantilla default

### Propuesta no se puede editar
✅ Verifica que no esté en status `ACCEPTED` o `convertedToSale = true`

---

**Desarrollado con ❤️ para Water CRM**
