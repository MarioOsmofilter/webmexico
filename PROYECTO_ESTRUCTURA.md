# 🌊 WATER CRM - Proyecto Completo

## 📋 Índice
1. [Stack Tecnológico](#stack-tecnológico)
2. [Arquitectura del Sistema](#arquitectura)
3. [Esquema de Base de Datos](#base-de-datos)
4. [Módulos del Sistema](#módulos)
5. [Sistema de Roles y Permisos](#roles)
6. [Instalación Paso a Paso](#instalación)

---

## 🚀 Stack Tecnológico

### Frontend + Backend
- **Next.js 14** (App Router) - Framework React full-stack
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos responsive
- **PWA (next-pwa)** - Progressive Web App

### Base de Datos
- **PostgreSQL** - Base de datos relacional
- **Prisma ORM** - Migraciones y queries type-safe

### Autenticación
- **NextAuth.js v5** - Autenticación multi-rol

### Librerías Clave
- **React Hook Form** - Formularios
- **Zod** - Validación de datos
- **Recharts** - Gráficos dashboard
- **React Leaflet** - Mapas y geolocalización
- **@react-pdf/renderer** - PDFs
- **date-fns** - Manejo de fechas
- **Axios** - Peticiones HTTP

---

## 🏗️ Arquitectura del Sistema

### Multi-Empresa (Tenancy)
```
Opción 1: Subdominio (RECOMENDADA)
- empresa1.water-crm.com
- empresa2.water-crm.com
- admin.water-crm.com (Superadmin)

Opción 2: Path-based
- water-crm.com/empresa1
- water-crm.com/empresa2
- water-crm.com/admin
```

### Flujo de Autenticación
```
1. Login → NextAuth verifica credenciales
2. Si es primera vez → Forzar cambio de contraseña
3. Cargar empresa + rol + permisos
4. Redirigir al dashboard correspondiente
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### 1. USUARIOS Y EMPRESAS
```sql
- companies (Empresas)
  - id, name, slug, subdomain, logo, status
  - superadmin_id, created_at, settings

- users (Usuarios)
  - id, email, password_hash, first_name, last_name
  - company_id, role, status, force_password_change
  - phone, avatar, created_at, last_login

- roles (Roles personalizables)
  - id, company_id, name, permissions_json
  - is_default, created_at

- user_permissions (Permisos específicos por usuario)
  - id, user_id, module, can_view, can_create, can_edit, can_delete
  - can_view_subordinates, can_view_all

- user_hierarchies (Jerarquías - quién reporta a quién)
  - id, user_id, supervisor_id, company_id
```

#### 2. PRODUCTOS
```sql
- product_categories
  - id, company_id, name, parent_id, order

- products
  - id, company_id, name, description
  - internal_reference, manufacturer_reference
  - base_price, status, created_by
  - is_master (producto maestro del superadmin)

- product_attributes (Atributos configurables)
  - id, name, type (text, number, select, boolean)
  - company_id (null si es global del superadmin)

- product_attribute_values
  - id, product_id, attribute_id, value

- product_images
  - id, product_id, url, is_primary, order

- product_prices (Precios según modalidad)
  - id, product_id
  - sale_price_1, sale_price_12, sale_price_24, sale_price_36, sale_price_48, sale_price_60
  - rental_price_1, rental_price_12, rental_price_24, rental_price_36, rental_price_48, rental_price_60
  - min_price_threshold (precio mínimo sin aprobación)

- product_datasheets (Fichas técnicas generadas)
  - id, product_id, language, pdf_url, html_content
```

#### 3. LEADS Y CLIENTES
```sql
- leads
  - id, company_id, source (web, telemarketing, manual)
  - contact_type (individual, business)
  - contact_name, email, phone
  - business_name, business_contact, business_email, business_phone
  - address, city, postal_code, latitude, longitude
  - assigned_to_user_id, status
  - created_by, created_at, last_contact_date
  - days_without_action (calculado)

- clients (Leads convertidos)
  - id, company_id, lead_id
  - [todos los campos de leads +]
  - client_code, vat_number
  - payment_method, billing_address
  - converted_at, total_revenue

- contact_timeline (Historial de acciones)
  - id, entity_type (lead/client), entity_id
  - user_id, action_type, description
  - created_at, metadata_json
```

#### 4. PROPUESTAS/PRESUPUESTOS
```sql
- proposals
  - id, company_id, lead_id, client_id
  - proposal_number, created_by, status
  - total_amount, payment_type (sale/rental)
  - installments, requires_approval, approved_by
  - created_at, valid_until, converted_to_sale

- proposal_items
  - id, proposal_id, product_id
  - quantity, unit_price, discount_percent
  - total_price, custom_description

- proposal_templates (Plantillas configurables)
  - id, company_id, name
  - header_html, footer_html, styles_json
  - is_default

- proposal_ratings (Valoración de propuestas)
  - id, proposal_id, rating, comments
  - rated_at
```

#### 5. VENTAS
```sql
- sales
  - id, company_id, proposal_id, client_id
  - sale_number, total_amount
  - sale_type (sale/rental), payment_terms
  - created_by, sale_date, status
  - points_awarded (para ranking)

- sale_items
  - id, sale_id, product_id
  - quantity, unit_price, total_price

- sales_goals (Objetivos de ventas)
  - id, company_id, user_id, team_id
  - goal_type (individual/team)
  - period (monthly/yearly), year, month
  - target_amount, target_units, target_points
  - current_amount, current_units, current_points

- sales_points_config (Configuración de puntos)
  - id, company_id
  - product_id, sale_type, points
```

#### 6. INSTALACIONES
```sql
- installations
  - id, company_id, sale_id, client_id
  - assigned_to_user_id, status
  - scheduled_date, started_at, completed_at
  - start_latitude, start_longitude, start_address
  - end_latitude, end_longitude, end_address
  - max_distance_meters (radio permitido)
  - notes, signature_url

- installation_materials
  - id, installation_id, product_id
  - quantity_used, warehouse_id

- installation_photos
  - id, installation_id, url, caption, taken_at
```

#### 7. MANTENIMIENTOS
```sql
- maintenances
  - id, company_id, client_id, installation_id
  - maintenance_type (periodic/incident)
  - scheduled_date, completed_at
  - assigned_to_user_id, status
  - next_maintenance_date

- maintenance_materials
  - id, maintenance_id, product_id, quantity_used

- maintenance_history
  - id, client_id, maintenance_id
  - date, description, technician_id
```

#### 8. INCIDENCIAS
```sql
- incidents
  - id, company_id, client_id, installation_id
  - reported_by_user_id, assigned_to_user_id
  - priority, status, category
  - description, resolution
  - created_at, resolved_at
```

#### 9. ALMACÉN
```sql
- warehouses
  - id, company_id, name, location
  - manager_user_id, warehouse_type (central/vehicle)
  - is_active

- inventory
  - id, warehouse_id, product_id
  - quantity, min_stock, max_stock
  - last_restock_date

- inventory_movements
  - id, company_id
  - from_warehouse_id, to_warehouse_id
  - product_id, quantity, movement_type
  - created_by, created_at, notes

- loading_orders (Órdenes de carga para furgonetas)
  - id, company_id, user_id (instalador)
  - warehouse_id, status, created_at, loaded_at

- loading_order_items
  - id, loading_order_id, product_id, quantity

- stock_alerts (Alertas automáticas)
  - id, warehouse_id, product_id
  - alert_type (low_stock/out_of_stock)
  - suggested_reorder_quantity
  - created_at, resolved_at
```

#### 10. WALLET / MONEDEROS
```sql
- wallets
  - id, user_id, company_id
  - balance, pending_validation

- wallet_transactions
  - id, wallet_id, user_id
  - transaction_type (collection/delivery/expense)
  - amount, payment_method (cash/card)
  - sale_id, client_id
  - status (pending/validated/rejected)
  - validated_by, validated_at
  - created_at, notes
```

#### 11. AGENDA Y CALENDARIO
```sql
- calendar_events
  - id, company_id, user_id
  - event_type (visit/installation/maintenance/call)
  - related_entity_type (lead/client)
  - related_entity_id
  - title, description
  - start_datetime, end_datetime
  - location, latitude, longitude
  - status (scheduled/completed/cancelled)
  - created_by

- routes (Rutas optimizadas)
  - id, company_id, user_id
  - route_date, total_distance_km
  - estimated_duration_minutes
  - created_at, route_data_json (waypoints)

- route_stops
  - id, route_id, order
  - entity_type (lead/client), entity_id
  - address, latitude, longitude
  - estimated_arrival, actual_arrival
```

#### 12. TELEMARKETING
```sql
- tmk_campaigns
  - id, company_id, name
  - start_date, end_date, status
  - created_by

- tmk_call_lists
  - id, campaign_id, name
  - total_contacts, completed_calls

- tmk_call_list_items
  - id, call_list_id, lead_id
  - status (pending/called/interested/not_interested)
  - call_attempts, last_call_at

- tmk_calls
  - id, company_id, user_id
  - lead_id, call_list_item_id
  - call_date, duration_seconds
  - outcome, notes
  - scheduled_callback

- tmk_scripts
  - id, company_id, name, content
  - is_active
```

#### 13. MENSAJERÍA INTERNA
```sql
- internal_messages
  - id, company_id
  - sender_user_id, recipient_user_id
  - subject, body, is_read
  - sent_at, read_at

- message_attachments
  - id, message_id, file_url, file_name
```

#### 14. GASTOS
```sql
- expenses
  - id, company_id, user_id
  - expense_type, amount, currency
  - expense_date, description
  - receipt_url
  - status (pending/approved/rejected)
  - approved_by, approved_at
```

#### 15. CONFIGURACIÓN Y LOGS
```sql
- company_settings
  - id, company_id
  - setting_key, setting_value
  - updated_by, updated_at

- activity_logs
  - id, company_id, user_id
  - action, entity_type, entity_id
  - ip_address, user_agent
  - created_at, metadata_json

- api_keys (Para APIs públicas)
  - id, company_id, key, name
  - permissions, is_active
  - created_at, last_used_at
```

---

## 📦 Módulos del Sistema

### 1. Dashboard
- **Comerciales**: Conversión, facturación, ranking, progreso objetivos
- **Instaladores**: Nº instalaciones, incidencias, tiempo medio
- **Directores**: Vista de equipo, asignación objetivos
- **Admin**: Filtros por usuario, métricas globales

### 2. Leads
- Listado con filtros y búsqueda
- Timeline de acciones
- Creación de propuestas
- Alertas de inactividad (días sin trabajar)
- Conversión a cliente

### 3. Clientes
- Todo lo de leads + historial completo
- Ventas, instalaciones, mantenimientos
- Geolocalización editable
- Historial de transacciones

### 4. Propuestas
- Configurador de plantillas (Admin)
- Selector de productos con precios
- Venta vs Alquiler
- Plazos (1, 12, 24, 36, 48, 60 meses)
- Aprobación si precio < umbral
- Generación PDF automática

### 5. Agenda
- Vista lista y vista calendario
- Drag & drop entre días
- Filtros por usuario/tipo
- Sincronización con rutas

### 6. Rutas
- Selección de visitas pendientes
- Optimización automática (algoritmo TSP)
- Estimación de duración
- Visualización en mapa

### 7. Instalaciones
- Geolocalización inicio/fin (radio máximo)
- Fotos del proceso
- Materiales usados
- Firma digital

### 8. Mantenimientos
- Calendario de mantenimientos
- Historial por cliente
- Material necesario
- Avisos automáticos

### 9. Almacén
- Multi-almacén
- Traspasos entre almacenes
- Stock mínimo/máximo
- Alertas automáticas
- Predicción de reposición

### 10. Wallet
- Saldo por usuario
- Registro de cobros (efectivo/tarjeta)
- Validación por director
- Historial de transacciones

### 11. Productos
- Catálogo con atributos configurables
- Productos maestros (Superadmin)
- Múltiples fotos
- Precios según modalidad
- Generación fichas técnicas (ES/EN)
- API pública para web (PIM)

### 12. Telemarketing
- Campañas y listas
- Scripts de llamadas
- Registro de llamadas
- Asignación a comerciales

---

## 👥 Sistema de Roles y Permisos

### Roles Base

1. **Superadmin**
   - Crea empresas y productos maestros
   - Acceso total al sistema
   - Gestión de subdominios

2. **Admin** (por empresa)
   - Configuración de empresa
   - Gestión de usuarios y roles
   - Asignación de permisos granulares
   - Configuración de módulos
   - Edición de precios y productos

3. **Director Comercial**
   - Gestión de comerciales
   - Asignación de objetivos
   - Aprobación de descuentos
   - Dashboard de equipo

4. **Director de Instalaciones**
   - Gestión de instaladores
   - Asignación de trabajos
   - Dashboard de equipo

5. **Director de Marketing**
   - Gestión de equipo TMK
   - Campañas y listas
   - Dashboard de equipo

6. **Comercial**
   - Leads y clientes asignados
   - Crear propuestas
   - Dashboard personal
   - Agenda y rutas

7. **Instalador**
   - Instalaciones asignadas
   - Mantenimientos
   - Incidencias
   - Wallet y carga

8. **Marketing/TMK**
   - Llamadas y listas
   - Creación de leads
   - Asignación de visitas

9. **Almacén**
   - Gestión de inventario
   - Órdenes de carga
   - Traspasos

### Permisos Granulares
- Por módulo: ver, crear, editar, eliminar
- Ver subordinados / Ver todos
- Doble rol (ej: Comercial + Instalador)

---

## 🔧 Instalación Paso a Paso

*Esta sección se completará con instrucciones detalladas después de generar el código*

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- Git

### Pasos
1. Clonar repositorio
2. Instalar dependencias
3. Configurar variables de entorno
4. Ejecutar migraciones
5. Seed inicial (superadmin)
6. Iniciar desarrollo

---

## 📡 APIs Públicas

### API 1: Catálogo de Productos (PIM)
```
GET /api/public/products?apiKey=xxx&companySlug=xxx
GET /api/public/products/:id?apiKey=xxx
```

### API 2: Captura de Leads
```
POST /api/public/leads?apiKey=xxx
Body: { name, email, phone, ... }
```

---

## 🎨 Diseño Responsive

- Mobile first
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- PWA instalable en móviles
- Modo offline básico

---

*Documento generado automáticamente para Water CRM*
