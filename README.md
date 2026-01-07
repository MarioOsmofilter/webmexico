# 💧 Water CRM

**Sistema de Gestión Completo para Empresas de Agua**

Progressive Web App (PWA) desarrollada con Next.js 14, TypeScript, Prisma y PostgreSQL.

---

## 🌟 Características Principales

### 🎯 Gestión Completa
- **Leads y Clientes**: Timeline de acciones, geolocalización, conversión automática
- **Propuestas**: Generación de PDFs personalizables, múltiples precios y modalidades
- **Ventas**: Seguimiento completo, sistema de puntos y rankings
- **Instalaciones**: Verificación por geolocalización, fotos, firma digital
- **Mantenimientos**: Calendario automático, historial, alertas

### 👥 Sistema Multi-Rol
- **Superadmin**: Control total, gestión de empresas y productos maestros
- **Admin**: Configuración de empresa, usuarios y permisos granulares
- **Directores**: Sales, Instalaciones, Marketing
- **Comerciales**: Dashboard con objetivos, propuestas, rutas
- **Instaladores**: Agenda, órdenes de carga, wallet
- **Marketing/TMK**: Campañas, listas de llamadas, scripts
- **Almacén**: Inventario multi-almacén, traspasos, alertas

### 🏢 Multi-Empresa (Tenancy)
- Subdominios o path-based
- Gestión centralizada desde superadmin
- Productos maestros compartibles
- Configuraciones independientes

### 📱 Progressive Web App
- **Responsive**: Móvil, tablet, ordenador
- **Instalable**: Como app nativa
- **Offline**: Funcionalidad básica sin conexión
- **Push Notifications**: Alertas en tiempo real

### 🗺️ Geolocalización
- **Rutas optimizadas**: Algoritmo de optimización de visitas
- **Verificación de instalaciones**: Radio de geolocalización
- **Mapas interactivos**: Leaflet/Google Maps
- **Direcciones editables**: Corrección manual si es necesario

### 📊 Dashboard y Reporting
- **Objetivos personalizables**: Mensuales y anuales
- **Métricas en tiempo real**: Conversión, facturación, actividad
- **Rankings**: Por puntos, ventas, instalaciones
- **Gráficos interactivos**: Recharts

### 🔐 Seguridad
- **NextAuth v5**: Autenticación robusta
- **Permisos granulares**: Por módulo y acción
- **Jerarquías**: Control de visibilidad entre roles
- **Activity logs**: Auditoría completa

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- Git

### Instalación

```bash
# 1. Clonar repositorio
git clone [URL]
cd webmexico

# 2. Instalar dependencias
npm install

# 3. Configurar .env (copiar .env.example)
cp .env.example .env

# 4. Editar .env con tus credenciales de PostgreSQL

# 5. Crear base de datos y migraciones
npx prisma migrate dev --name init

# 6. Generar cliente Prisma
npx prisma generate

# 7. Poblar base de datos con datos iniciales
npm run prisma:seed

# 8. Iniciar servidor de desarrollo
npm run dev
```

Abre http://localhost:3000 🎉

**Ver [INSTALACION.md](./INSTALACION.md) para instrucciones detalladas paso a paso.**

---

## 📂 Estructura del Proyecto

```
water-crm/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── migrations/             # Historial de migraciones
│   └── seed.ts                 # Datos iniciales
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # Iconos de la app
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (superadmin)/      # Panel superadmin
│   │   ├── (admin)/           # Panel admin
│   │   ├── (sales)/           # Panel comerciales
│   │   ├── (technician)/      # Panel instaladores
│   │   └── (marketing)/       # Panel marketing
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes base
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── products/
│   │   └── shared/
│   ├── lib/                   # Librerías y utilidades
│   │   ├── auth/              # Autenticación
│   │   ├── prisma/            # Cliente Prisma
│   │   └── utils/             # Funciones útiles
│   ├── types/                 # TypeScript types
│   ├── hooks/                 # React hooks
│   └── services/              # Servicios API
├── .env.example               # Variables de entorno ejemplo
├── next.config.js             # Configuración Next.js
├── tailwind.config.ts         # Configuración Tailwind
├── tsconfig.json              # Configuración TypeScript
└── package.json
```

---

## 🗄️ Esquema de Base de Datos

Ver [PROYECTO_ESTRUCTURA.md](./PROYECTO_ESTRUCTURA.md) para el esquema completo.

**Tablas principales:**
- Companies, Users, Roles, Permissions, Hierarchies
- Products, Categories, Attributes, Prices
- Leads, Clients, Timeline
- Proposals, Sales
- Installations, Maintenances, Incidents
- Warehouses, Inventory, Loading Orders
- Wallets, Transactions
- Calendar, Routes
- TMK Campaigns, Calls
- Internal Messages, Expenses

---

## 🔌 APIs Públicas

### API de Productos (PIM)
```bash
GET /api/public/products?apiKey=xxx
GET /api/public/products/:id?apiKey=xxx
```

### API de Captura de Leads
```bash
POST /api/public/leads
Content-Type: application/json
X-API-Key: xxx

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "666123456",
  "notes": "Interesado en purificador"
}
```

---

## 📱 Módulos del Sistema

| Módulo | Descripción | Roles con Acceso |
|--------|-------------|------------------|
| Dashboard | Métricas, objetivos, rankings | Todos |
| Leads | Gestión de prospectos | Marketing, Sales, Directors |
| Clientes | Base de datos de clientes | Sales, Technician, Directors |
| Propuestas | Generación de presupuestos | Sales, Directors |
| Agenda | Calendario de eventos | Todos (según permisos) |
| Rutas | Optimización de visitas | Sales, Technician |
| Instalaciones | Órdenes de trabajo | Technician, Directors |
| Mantenimientos | Programación y historial | Technician, Directors |
| Almacén | Inventario y traspasos | Warehouse, Technician, Admin |
| Wallet | Monederos y transacciones | Sales, Technician, Directors |
| Productos | Catálogo y PIM | Admin, Superadmin |
| Telemarketing | Campañas y llamadas | Marketing, Directors |

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Compilar para producción
npm start                # Servidor de producción
npm run lint             # Lint del código

# Base de datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Crear migración
npm run prisma:studio    # Interfaz visual BD
npm run prisma:seed      # Poblar con datos de prueba
npm run db:push          # Push schema sin migración
npm run db:reset         # ⚠️ Resetear BD completa
```

---

## 🔐 Credenciales por Defecto

Después de ejecutar el seed:

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Superadmin** | superadmin@watercrm.com | Admin123! |
| **Admin** | admin@aguaspuras.com | Admin123! |
| **Director Comercial** | director.comercial@aguaspuras.com | Director123! |
| **Comercial** | comercial1@aguaspuras.com | Comercial123! |
| **Instalador** | instalador1@aguaspuras.com | Tecnico123! |
| **Marketing** | marketing@aguaspuras.com | Marketing123! |
| **Almacén** | almacen@aguaspuras.com | Almacen123! |

⚠️ **IMPORTANTE:** Cambia estas contraseñas antes de usar en producción.

---

## 🌐 Despliegue en Producción

### Vercel (Recomendado)

1. Sube el proyecto a GitHub
2. Importa en [Vercel](https://vercel.com)
3. Configura variables de entorno
4. Usa [Neon](https://neon.tech) para PostgreSQL (gratis)

### VPS (Digital Ocean, Linode, etc.)

1. Servidor Ubuntu con Node.js y PostgreSQL
2. Nginx como reverse proxy
3. PM2 para process management
4. Certificado SSL con Let's Encrypt

Ver guía detallada en [INSTALACION.md](./INSTALACION.md#configurar-para-produccion)

---

## 🤝 Contribuir

Por ahora este es un proyecto privado. Si necesitas añadir funcionalidades:

1. Crea una rama nueva: `git checkout -b feature/mi-funcionalidad`
2. Haz tus cambios
3. Commit: `git commit -m "Añadir mi funcionalidad"`
4. Push: `git push origin feature/mi-funcionalidad`

---

## 📄 Licencia

Propietario: [Tu Empresa]
Todos los derechos reservados.

---

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@tuempresa.com
- Documentación: [PROYECTO_ESTRUCTURA.md](./PROYECTO_ESTRUCTURA.md)
- Instalación: [INSTALACION.md](./INSTALACION.md)

---

## 🗺️ Roadmap

**Versión 1.0** (Actual)
- ✅ Sistema multi-rol y multi-empresa
- ✅ Gestión de leads y clientes
- ✅ Propuestas y ventas
- ✅ Instalaciones y mantenimientos
- ✅ Almacén e inventario
- ✅ Dashboard y reporting
- ✅ PWA

**Versión 1.1** (Próximamente)
- 🔄 App móvil nativa (React Native)
- 🔄 Integración con WhatsApp Business
- 🔄 Firma electrónica avanzada
- 🔄 IA para predicción de ventas

**Versión 2.0** (Futuro)
- 📋 Facturación electrónica
- 📋 Integración con ERPs
- 📋 Marketplace de productos
- 📋 App para clientes finales

---

**Desarrollado con ❤️ usando Next.js, TypeScript, Prisma y PostgreSQL**
