# 📦 Guía de Instalación - Water CRM

Esta guía te llevará paso a paso para instalar y ejecutar Water CRM en tu ordenador. **No necesitas saber programar**, solo sigue las instrucciones.

---

## 📋 Requisitos Previos

Antes de empezar, necesitas instalar estos programas en tu ordenador:

### 1. Node.js (Motor de JavaScript)

1. Ve a https://nodejs.org/
2. Descarga la versión **LTS** (recomendada)
3. Ejecuta el instalador y sigue las instrucciones
4. Para verificar que se instaló correctamente, abre una terminal/consola y escribe:
   ```bash
   node --version
   ```
   Deberías ver algo como `v18.x.x` o superior

### 2. PostgreSQL (Base de Datos)

**Windows:**
1. Ve a https://www.postgresql.org/download/windows/
2. Descarga el instalador
3. Ejecuta y sigue el asistente
4. **IMPORTANTE:** Anota la contraseña que pongas al usuario `postgres`
5. Deja el puerto por defecto: `5432`

**Mac:**
1. Descarga Postgres.app desde https://postgresapp.com/
2. Arrastra la app a Aplicaciones y ábrela
3. Haz clic en "Initialize" para crear el servidor

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Git (Control de versiones)

1. Ve a https://git-scm.com/downloads
2. Descarga e instala para tu sistema operativo
3. Sigue las opciones por defecto del instalador

---

## 🚀 Instalación del Proyecto

### Paso 1: Descargar el Proyecto

Si ya tienes el código en tu ordenador, sáltate este paso. Si no:

```bash
# Navega a la carpeta donde quieras tener el proyecto
cd /ruta/donde/quieras

# Clona el repositorio (si está en Git)
git clone [URL-DEL-REPOSITORIO]

# Entra en la carpeta
cd webmexico
```

### Paso 2: Instalar Dependencias

Las dependencias son las librerías que el proyecto necesita para funcionar.

```bash
npm install
```

Este comando puede tardar 2-5 minutos. Verás muchas líneas en la terminal, es normal.

### Paso 3: Configurar la Base de Datos

#### 3.1. Crear la Base de Datos en PostgreSQL

**Windows/Mac (usando pgAdmin):**
1. Abre pgAdmin (se instaló con PostgreSQL)
2. Conéctate al servidor local (te pedirá la contraseña)
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `water_crm`
5. Click en "Save"

**Linux/Terminal:**
```bash
# Conectarse a PostgreSQL
sudo -u postgres psql

# Crear la base de datos
CREATE DATABASE water_crm;

# Salir
\q
```

#### 3.2. Configurar Variables de Entorno

1. En la carpeta del proyecto, busca el archivo `.env.example`
2. Copia ese archivo y renómbralo a `.env` (sin el .example)
3. Abre el archivo `.env` con un editor de texto (Notepad, VS Code, etc.)
4. Modifica estas líneas:

```env
# Cambia esto por tus datos de PostgreSQL
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/water_crm?schema=public"

# Genera un secreto aleatorio (puedes usar cualquier texto largo y aleatorio)
NEXTAUTH_SECRET="cambia-esto-por-un-texto-muy-largo-y-aleatorio-123456"

# URL de tu aplicación
NEXTAUTH_URL="http://localhost:3000"

# Usar subdominios (déjalo en false por ahora)
NEXT_PUBLIC_USE_SUBDOMAINS="false"
```

**IMPORTANTE:** Cambia `TU_CONTRASEÑA` por la contraseña que pusiste al instalar PostgreSQL.

### Paso 4: Crear las Tablas de la Base de Datos (Migraciones)

Este comando creará todas las tablas necesarias en la base de datos:

```bash
npx prisma migrate dev --name init
```

Te preguntará si quieres continuar, escribe `y` y presiona Enter.

### Paso 5: Generar el Cliente de Prisma

```bash
npx prisma generate
```

### Paso 6: Poblar la Base de Datos con Datos Iniciales (Seed)

Este comando creará usuarios de prueba, productos, etc.:

```bash
npm run prisma:seed
```

Al finalizar, verás en pantalla las **credenciales de acceso** (anótalas).

---

## ▶️ Ejecutar la Aplicación

### Modo Desarrollo (para probar)

```bash
npm run dev
```

Verás un mensaje como:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

Abre tu navegador y ve a: **http://localhost:3000**

¡Ya puedes usar la aplicación! 🎉

### Modo Producción (para usar en serio)

```bash
# 1. Compilar la aplicación
npm run build

# 2. Iniciar el servidor
npm start
```

---

## 👤 Credenciales por Defecto

Después de ejecutar el seed, tendrás estos usuarios:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Superadmin | superadmin@watercrm.com | Admin123! |
| Admin | admin@aguaspuras.com | Admin123! (debe cambiar) |
| Director Comercial | director.comercial@aguaspuras.com | Director123! |
| Comercial | comercial1@aguaspuras.com | Comercial123! |
| Instalador | instalador1@aguaspuras.com | Tecnico123! |
| Marketing | marketing@aguaspuras.com | Marketing123! |
| Almacén | almacen@aguaspuras.com | Almacen123! |

---

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Inicia el servidor de producción |
| `npm run lint` | Revisa el código en busca de errores |
| `npx prisma studio` | Abre interfaz visual para ver la BD |
| `npx prisma migrate dev` | Aplica cambios a la base de datos |
| `npm run db:reset` | RESETEA toda la BD (¡cuidado!) |

---

## 📊 Ver la Base de Datos (Prisma Studio)

Si quieres ver y editar los datos de la base de datos visualmente:

```bash
npx prisma studio
```

Se abrirá una interfaz web en http://localhost:5555

---

## ❓ Solución de Problemas

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Problema:** No se puede conectar a PostgreSQL.

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Windows: Busca "Services" → PostgreSQL debe estar "Running"
3. Mac: Abre Postgres.app y verifica que esté iniciado
4. Linux: `sudo systemctl status postgresql`

### Error: "Password authentication failed"

**Problema:** La contraseña de PostgreSQL es incorrecta.

**Solución:**
Revisa el archivo `.env` y asegúrate de que la contraseña en `DATABASE_URL` sea correcta.

### Error: "Port 3000 is already in use"

**Problema:** Ya hay algo corriendo en el puerto 3000.

**Solución:**
```bash
# Para otro puerto, por ejemplo 3001
PORT=3001 npm run dev
```

### Error al instalar dependencias (npm install)

**Problema:** Fallos durante la instalación.

**Solución:**
1. Borra las carpetas `node_modules` y el archivo `package-lock.json`
2. Vuelve a ejecutar `npm install`

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Mac/Linux
rm -rf node_modules package-lock.json
npm install
```

---

## 🌐 Configurar para Producción (Servidor Real)

### Opción 1: Vercel (Gratis y Fácil)

1. Crea una cuenta en https://vercel.com
2. Instala Vercel CLI: `npm i -g vercel`
3. En la carpeta del proyecto: `vercel`
4. Sigue las instrucciones

**Para la base de datos:**
- Usa un servicio como [Neon](https://neon.tech) (PostgreSQL gratis)
- Copia la URL de conexión y ponla en las variables de entorno de Vercel

### Opción 2: VPS (Digital Ocean, Linode, etc.)

1. Contrata un VPS con Ubuntu
2. Instala Node.js y PostgreSQL
3. Clona el proyecto
4. Configura Nginx como reverse proxy
5. Usa PM2 para mantener la app corriendo

*(Si necesitas ayuda con esto, dime y te doy instrucciones detalladas)*

---

## 🔐 Seguridad Importante

Antes de poner esto en producción (internet):

1. **Cambia todas las contraseñas** del seed
2. **Genera un NEXTAUTH_SECRET nuevo:**
   ```bash
   openssl rand -base64 32
   ```
3. **Usa HTTPS** (certificado SSL)
4. **Cambia la contraseña de PostgreSQL**
5. **No subas el archivo .env a Git** (ya está en .gitignore)

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección "Solución de Problemas" arriba
2. Busca el error en Google (copia el mensaje de error)
3. Pregúntame y te ayudo a resolverlo

---

## 🎯 Próximos Pasos

Una vez que tengas todo funcionando:

1. **Explora el sistema** con las credenciales de prueba
2. **Crea tu primera empresa** desde el panel de superadmin
3. **Personaliza los módulos** que necesites
4. **Configura los productos** de tu catálogo
5. **Invita a tu equipo** creando usuarios

---

**¡Listo! Ya tienes Water CRM funcionando. Si necesitas ayuda, solo pregunta. 😊**
