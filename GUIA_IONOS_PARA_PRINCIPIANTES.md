# 🚀 Guía IONOS para Principiantes - Paso a Paso DETALLADO

**Guía Ultra-Detallada para Desplegar Water CRM en IONOS sin Saber Nada de Servidores**

---

## 📌 ANTES DE EMPEZAR

Esta guía es para ti si:
- ✅ Nunca has configurado un servidor
- ✅ No sabes qué es SSH o Terminal
- ✅ Quieres desplegar Water CRM en IONOS paso a paso
- ✅ Necesitas que te expliquen TODO

**Tiempo total:** 2-3 horas
**Dificultad:** Principiante (todo explicado)
**Coste:** Solo el VPS de IONOS (~5-20€/mes según el plan)

---

# PARTE 1: PREPARACIÓN (15 minutos)

## 🎯 Paso 1.1: Conseguir los Datos de tu VPS de IONOS

### ¿Qué voy a hacer?
Vamos a buscar la IP de tu servidor y la contraseña para conectarnos.

### ¿Cómo lo hago?

1. **Abre tu navegador** (Chrome, Firefox, etc.)

2. **Ve a la página de IONOS:** https://my.ionos.es

3. **Inicia sesión** con tu email y contraseña de IONOS

4. Una vez dentro, verás un menú lateral. **Busca y haz clic en:**
   ```
   Servidor & Cloud → VPS
   ```

5. Te aparecerá una lista de tus VPS. **Haz clic en el que quieres usar**

6. Ahora estás en la página de detalles de tu VPS. **Anota estos datos:**

   📝 **ANOTA AQUÍ (necesitarás esto):**
   ```
   IP del VPS: _____________________ (ejemplo: 217.160.123.45)
   Usuario: root (normalmente es este)
   ```

7. **Para conseguir la contraseña:**
   - Si es un VPS nuevo, IONOS te envió la contraseña por email cuando lo contrataste
   - Busca en tu email "IONOS" o "VPS" o "servidor"
   - Si no encuentras el email, puedes **resetear la contraseña**:
     * En la página del VPS, busca un botón que diga **"Restablecer contraseña"** o **"Cambiar contraseña"**
     * Haz clic
     * IONOS te enviará la nueva contraseña por email

   📝 **ANOTA LA CONTRASEÑA AQUÍ:**
   ```
   Contraseña: _____________________
   ```

### ✅ Checkpoint:
Tienes anotados:
- [ ] IP del VPS
- [ ] Usuario (root)
- [ ] Contraseña

---

## 🎯 Paso 1.2: Instalar un Programa para Conectarte (Solo si usas Windows)

### ¿Qué voy a hacer?
Instalar un programa para conectarnos al servidor. Si usas **Mac o Linux**, SÁLTATE este paso.

### ¿Cómo lo hago? (SOLO WINDOWS)

**Opción A: Usar PowerShell (viene con Windows 10/11, recomendado)**

1. Presiona la tecla **Windows** (la de la banderita)
2. Escribe: **powershell**
3. Haz clic derecho en **Windows PowerShell**
4. Selecciona **"Ejecutar como administrador"**
5. Se abrirá una ventana azul con texto
6. ¡Ya está! Puedes usar esto para conectarte

**Opción B: Instalar PuTTY (alternativa)**

1. Ve a: https://www.putty.org/
2. Haz clic en **"Download PuTTY"**
3. Descarga **"putty-64bit-installer.msi"**
4. Ejecuta el instalador y haz clic en **Siguiente, Siguiente, Instalar**
5. Abre PuTTY desde el menú de inicio

### ✅ Checkpoint:
- [ ] Tengo PowerShell o PuTTY listo

---

# PARTE 2: CONECTARSE AL SERVIDOR (10 minutos)

## 🎯 Paso 2.1: Conectar al VPS por Primera Vez

### ¿Qué voy a hacer?
Conectarnos al servidor desde nuestro ordenador.

### ¿Cómo lo hago?

#### Si usas PowerShell o Mac/Linux Terminal:

1. **Abre tu terminal:**
   - Windows: PowerShell (que abriste antes)
   - Mac: Presiona `Cmd + Espacio`, escribe "Terminal", Enter
   - Linux: Presiona `Ctrl + Alt + T`

2. **Escribe este comando** (cambia `TU_IP` por la IP que anotaste):
   ```bash
   ssh root@TU_IP
   ```

   **Ejemplo real:**
   ```bash
   ssh root@217.160.123.45
   ```

3. **Presiona Enter**

4. **Te aparecerá algo como esto:**
   ```
   The authenticity of host '217.160.123.45' can't be established.
   Are you sure you want to continue connecting (yes/no)?
   ```

   **Escribe:** `yes` y presiona Enter

5. **Te pedirá la contraseña:**
   ```
   root@217.160.123.45's password:
   ```

   **Pega tu contraseña** (puede que no se vea mientras escribes, es normal)
   - Windows: Clic derecho para pegar
   - Mac/Linux: Cmd+V o Ctrl+Shift+V

   **Presiona Enter**

6. **Si todo va bien, verás algo como:**
   ```
   Welcome to Ubuntu 22.04.1 LTS
   root@vps12345:~#
   ```

   🎉 **¡Estás dentro del servidor!**

#### Si usas PuTTY (Windows):

1. **Abre PuTTY**

2. En **"Host Name (or IP address)"** escribe tu IP:
   ```
   217.160.123.45
   ```

3. En **"Port"** debe estar: `22`

4. Haz clic en **"Open"**

5. Te preguntará sobre el certificado, haz clic en **"Yes"** o **"Aceptar"**

6. Se abrirá una ventana negra que dice:
   ```
   login as:
   ```

   **Escribe:** `root` y presiona Enter

7. Te pedirá la contraseña:
   ```
   root@217.160.123.45's password:
   ```

   **Escribe tu contraseña** (no se verá, es normal) y presiona Enter

8. **Si todo va bien, verás:**
   ```
   Welcome to Ubuntu 22.04.1 LTS
   root@vps12345:~#
   ```

   🎉 **¡Estás dentro del servidor!**

### ⚠️ Si algo sale mal:

**Error: "Connection refused"**
- Solución: Verifica que la IP sea correcta
- Verifica que el VPS esté encendido en el panel de IONOS

**Error: "Permission denied"**
- Solución: La contraseña está mal. Resetéala desde el panel de IONOS

**Error: "Connection timed out"**
- Solución: Tu firewall está bloqueando la conexión o el VPS está apagado

### ✅ Checkpoint:
- [ ] Estoy conectado al servidor
- [ ] Veo algo como: `root@vps12345:~#`

---

# PARTE 3: PREPARAR EL SERVIDOR (30 minutos)

## 🎯 Paso 3.1: Actualizar el Sistema

### ¿Qué voy a hacer?
Actualizar todos los programas del servidor para que estén al día.

### ¿Cómo lo hago?

**Estás en la ventana del servidor** (donde ves `root@vps12345:~#`)

1. **Copia y pega este comando:**
   ```bash
   apt update
   ```

   Para pegar:
   - PowerShell/Terminal: Clic derecho o Ctrl+Shift+V
   - PuTTY: Clic derecho

2. **Presiona Enter**

3. Verás MUCHAS líneas de texto desplazándose. **Espera a que termine** (30-60 segundos)

4. Al final verás algo como:
   ```
   Reading package lists... Done
   Building dependency tree... Done
   ```

5. Ahora **ejecuta este otro comando:**
   ```bash
   apt upgrade -y
   ```

6. **Presiona Enter**

7. Esto tardará **2-5 minutos**. Verás más texto desplazándose. ☕ Es buen momento para un café.

8. Cuando termine, verás de nuevo: `root@vps12345:~#`

### ✅ Checkpoint:
- [ ] Los comandos terminaron sin errores rojos
- [ ] Veo de nuevo el prompt: `root@vps12345:~#`

---

## 🎯 Paso 3.2: Instalar Node.js 20

### ¿Qué voy a hacer?
Instalar Node.js, que es el programa que hace funcionar tu aplicación Water CRM.

### ¿Cómo lo hago?

1. **Primero, instalar curl** (es una herramienta para descargar cosas):
   ```bash
   apt install -y curl
   ```
   Presiona Enter y espera (15-30 segundos)

2. **Descargar el instalador de Node.js 20:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   ```
   Presiona Enter y espera (30-60 segundos)

   Verás mucho texto. Al final debe decir algo como:
   ```
   ## Run `sudo apt-get install -y nodejs` to install Node.js
   ```

3. **Instalar Node.js:**
   ```bash
   apt install -y nodejs
   ```
   Presiona Enter y espera (1-2 minutos)

4. **Verificar que se instaló correctamente:**
   ```bash
   node --version
   ```

   **Debes ver:** `v20.11.0` o similar (que empiece con v20)

   Si lo ves, **¡perfecto!** ✅

5. **Verificar npm también:**
   ```bash
   npm --version
   ```

   **Debes ver:** `10.2.4` o similar

   Si lo ves, **¡perfecto!** ✅

### ⚠️ Si algo sale mal:

**Si node --version da error:**
- Repite el paso 2 y 3
- O contacta conmigo

### ✅ Checkpoint:
- [ ] `node --version` muestra v20.x.x
- [ ] `npm --version` muestra un número

---

## 🎯 Paso 3.3: Instalar PostgreSQL (Base de Datos)

### ¿Qué voy a hacer?
Instalar PostgreSQL, que es donde se guardarán todos los datos de Water CRM.

### ¿Cómo lo hago?

1. **Instalar PostgreSQL:**
   ```bash
   apt install -y postgresql postgresql-contrib
   ```
   Presiona Enter y espera (2-3 minutos)

2. **Verificar que está corriendo:**
   ```bash
   systemctl status postgresql
   ```
   Presiona Enter

   **Debes ver algo como:**
   ```
   ● postgresql.service - PostgreSQL RDBMS
        Loaded: loaded
        Active: active (running)
   ```

   Si ves **"active (running)"** en verde, **¡perfecto!** ✅

3. **Presiona la tecla `q`** para salir de esa pantalla

4. **Si dice "inactive" o "stopped", inícialo:**
   ```bash
   systemctl start postgresql
   systemctl enable postgresql
   ```

### ✅ Checkpoint:
- [ ] PostgreSQL está corriendo (active/running)

---

## 🎯 Paso 3.4: Crear la Base de Datos

### ¿Qué voy a hacer?
Crear una base de datos para Water CRM y un usuario para acceder a ella.

### ¿Cómo lo hago?

1. **Entrar a PostgreSQL:**
   ```bash
   sudo -u postgres psql
   ```
   Presiona Enter

   Ahora verás esto:
   ```
   postgres=#
   ```

   Esto significa que estás dentro de PostgreSQL

2. **Crear un usuario** (cambia `MiPassword123!` por una contraseña segura):
   ```sql
   CREATE USER watercrm_user WITH PASSWORD 'MiPassword123!';
   ```

   📝 **ANOTA TU CONTRASEÑA AQUÍ:**
   ```
   Contraseña DB: _____________________
   ```

   Presiona Enter

   Debes ver: `CREATE ROLE` ✅

3. **Crear la base de datos:**
   ```sql
   CREATE DATABASE watercrm_db;
   ```
   Presiona Enter

   Debes ver: `CREATE DATABASE` ✅

4. **Dar permisos al usuario:**
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE watercrm_db TO watercrm_user;
   ```
   Presiona Enter

   Debes ver: `GRANT` ✅

5. **Conectar a la nueva base de datos:**
   ```sql
   \c watercrm_db
   ```
   Presiona Enter

   Debes ver: `You are now connected to database "watercrm_db"` ✅

6. **Dar más permisos:**
   ```sql
   GRANT ALL ON SCHEMA public TO watercrm_user;
   ```
   Presiona Enter

   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO watercrm_user;
   ```
   Presiona Enter

   ```sql
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO watercrm_user;
   ```
   Presiona Enter

7. **Salir de PostgreSQL:**
   ```sql
   \q
   ```
   Presiona Enter

   Ahora volverás a ver: `root@vps12345:~#`

### ✅ Checkpoint:
- [ ] Has creado el usuario watercrm_user
- [ ] Has creado la base de datos watercrm_db
- [ ] Has anotado la contraseña
- [ ] Has salido de PostgreSQL

---

# PARTE 4: SUBIR EL CÓDIGO (20 minutos)

## 🎯 Paso 4.1: Instalar Git

### ¿Qué voy a hacer?
Instalar Git para poder descargar el código de Water CRM.

### ¿Cómo lo hago?

1. **Instalar Git:**
   ```bash
   apt install -y git
   ```
   Presiona Enter y espera (30-60 segundos)

2. **Verificar:**
   ```bash
   git --version
   ```

   Debes ver algo como: `git version 2.34.1` ✅

### ✅ Checkpoint:
- [ ] Git está instalado

---

## 🎯 Paso 4.2: Descargar el Código de Water CRM

### ¿Qué voy a hacer?
Descargar todo el código de Water CRM al servidor.

### ¿Cómo lo hago?

1. **Crear un directorio para el código:**
   ```bash
   mkdir -p /var/www
   ```
   Presiona Enter

2. **Ir a ese directorio:**
   ```bash
   cd /var/www
   ```
   Presiona Enter

3. **Verificar dónde estás:**
   ```bash
   pwd
   ```
   Debes ver: `/var/www` ✅

4. **Ahora viene la parte importante: CLONAR TU REPOSITORIO**

   🤔 **¿Tu repositorio de GitHub es público o privado?**

   ### Si es PÚBLICO:

   ```bash
   git clone https://github.com/MarioOsmofilter/webmexico.git
   ```
   Presiona Enter

   Tardará 1-2 minutos. Verás algo como:
   ```
   Cloning into 'webmexico'...
   remote: Counting objects...
   Receiving objects: 100%
   ```

   Al final: `done.` ✅

   ### Si es PRIVADO (necesitas un token):

   **a) Crear un token de GitHub:**

   1. Ve a GitHub en tu navegador: https://github.com
   2. Haz clic en tu **foto de perfil** (arriba derecha)
   3. **Settings** (Configuración)
   4. Scroll hasta abajo: **Developer settings**
   5. **Personal access tokens** → **Tokens (classic)**
   6. **Generate new token (classic)**
   7. En "Note" escribe: `IONOS VPS`
   8. En "Expiration" selecciona: `No expiration` (sin expiración)
   9. **Marca el checkbox:** `repo` (todos los sub-checkboxes)
   10. Scroll abajo y haz clic en **Generate token**
   11. **COPIA EL TOKEN** (empieza con `ghp_...`)

   📝 **ANOTA EL TOKEN AQUÍ (no lo perderás):**
   ```
   GitHub Token: _____________________
   ```

   **b) Clonar con el token:**

   ```bash
   git clone https://TU_TOKEN@github.com/MarioOsmofilter/webmexico.git
   ```

   Cambia `TU_TOKEN` por el token que copiaste.

   **Ejemplo:**
   ```bash
   git clone https://ghp_abc123xyz789@github.com/MarioOsmofilter/webmexico.git
   ```

   Presiona Enter y espera (1-2 minutos)

5. **Verificar que se descargó:**
   ```bash
   ls
   ```

   Debes ver: `webmexico` ✅

6. **Entrar al directorio:**
   ```bash
   cd webmexico
   ```

7. **Verificar que estás dentro:**
   ```bash
   pwd
   ```

   Debes ver: `/var/www/webmexico` ✅

8. **Ver los archivos:**
   ```bash
   ls
   ```

   Deberías ver tus archivos: `src`, `prisma`, `package.json`, etc. ✅

### ✅ Checkpoint:
- [ ] El código está descargado en /var/www/webmexico
- [ ] Puedo ver los archivos con `ls`

---

## 🎯 Paso 4.3: Configurar Variables de Entorno

### ¿Qué voy a hacer?
Crear un archivo `.env` con la configuración de la base de datos y otros secretos.

### ¿Cómo lo hago?

1. **Asegúrate de estar en el directorio correcto:**
   ```bash
   cd /var/www/webmexico
   ```

2. **Generar un secreto seguro para NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

   Te mostrará algo como:
   ```
   xK9mP2nR5tW8yE1qA4sD7gJ0hL3fV6bN9cX2zM5kI8
   ```

   📝 **COPIA Y ANOTA ESTO:**
   ```
   NEXTAUTH_SECRET: _____________________
   ```

3. **Crear el archivo .env:**
   ```bash
   nano .env
   ```

   Se abrirá un editor de texto

4. **AHORA VIENE LO IMPORTANTE:** Copia y pega esto (CAMBIANDO los valores):

   ```env
   # Database
   DATABASE_URL="postgresql://watercrm_user:TU_PASSWORD_DB@localhost:5432/watercrm_db?schema=public"

   # NextAuth
   NEXTAUTH_SECRET="TU_NEXTAUTH_SECRET"
   NEXTAUTH_URL="http://TU_IP_DEL_VPS:3000"

   # Node Environment
   NODE_ENV="production"
   ```

   **IMPORTANTE - CAMBIA ESTOS VALORES:**
   - `TU_PASSWORD_DB` → La contraseña que pusiste en el Paso 3.4 (la anotaste)
   - `TU_NEXTAUTH_SECRET` → El secreto que acabas de generar (lo acabas de anotar)
   - `TU_IP_DEL_VPS` → La IP de tu VPS (la anotaste al principio)

   **EJEMPLO REAL (con valores de ejemplo):**
   ```env
   DATABASE_URL="postgresql://watercrm_user:MiPassword123!@localhost:5432/watercrm_db?schema=public"
   NEXTAUTH_SECRET="xK9mP2nR5tW8yE1qA4sD7gJ0hL3fV6bN9cX2zM5kI8"
   NEXTAUTH_URL="http://217.160.123.45:3000"
   NODE_ENV="production"
   ```

5. **Guardar el archivo:**
   - Presiona `Ctrl + X`
   - Te preguntará: `Save modified buffer?`
   - Presiona `Y` (Yes)
   - Te preguntará: `File Name to Write: .env`
   - Presiona `Enter`

6. **Verificar que se creó:**
   ```bash
   cat .env
   ```

   Deberías ver tu configuración ✅

### ⚠️ IMPORTANTE:
- La DATABASE_URL debe estar en UNA SOLA LÍNEA (sin saltos de línea)
- No dejes espacios antes o después del `=`
- Las comillas deben ser comillas rectas `"` no curvas `""`

### ✅ Checkpoint:
- [ ] He creado el archivo .env
- [ ] He cambiado todos los valores (password, secret, IP)
- [ ] Puedo ver mi configuración con `cat .env`

---

# PARTE 5: INSTALAR Y COMPILAR LA APLICACIÓN (20 minutos)

## 🎯 Paso 5.1: Instalar Dependencias

### ¿Qué voy a hacer?
Instalar todas las librerías que necesita Water CRM.

### ¿Cómo lo hago?

1. **Asegúrate de estar en el directorio correcto:**
   ```bash
   cd /var/www/webmexico
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

   Presiona Enter

   **Esto tardará 3-5 minutos** ⏰

   Verás MUCHO texto desplazándose. Es NORMAL.

   Al final verás algo como:
   ```
   added 312 packages in 3m
   ```

   ✅ Si ves esto, perfecto!

### ⚠️ Si ves errores:

**"WARN" en amarillo:** Es normal, ignóralos
**"ERROR" en rojo:** Algo salió mal, manda captura del error

### ✅ Checkpoint:
- [ ] npm install terminó sin ERRORES rojos
- [ ] Veo "added XXX packages"

---

## 🎯 Paso 5.2: Configurar Prisma (ORM de Base de Datos)

### ¿Qué voy a hacer?
Generar el cliente de Prisma y crear las tablas en la base de datos.

### ¿Cómo lo hago?

1. **Generar el cliente de Prisma:**
   ```bash
   npx prisma generate
   ```

   Presiona Enter y espera (30-60 segundos)

   Debes ver:
   ```
   ✔ Generated Prisma Client
   ```
   ✅

2. **Crear las tablas en la base de datos:**
   ```bash
   npx prisma migrate deploy
   ```

   Presiona Enter y espera (1-2 minutos)

   Verás algo como:
   ```
   Applying migration `20240101_init`
   Applying migration `20240102_add_users`
   ...
   The following migrations have been applied:
   ```

   ✅ Si termina sin errores, perfecto!

3. **Poblar la base de datos con datos iniciales (usuario admin, etc.):**
   ```bash
   npx prisma db seed
   ```

   Presiona Enter y espera (30 segundos)

   Debes ver:
   ```
   🌱 Seeding database...
   ✅ Database seeded successfully
   ```
   ✅

### ⚠️ Si "prisma migrate deploy" da error:

**Error: "Can't reach database server"**
- Solución: Verifica tu DATABASE_URL en .env
- Ejecuta: `cat .env` y revisa la línea DATABASE_URL
- Verifica que PostgreSQL esté corriendo: `systemctl status postgresql`

**Error: "Authentication failed"**
- Solución: La contraseña en DATABASE_URL está mal
- Edita el .env: `nano .env`
- Corrige la contraseña
- Guarda (Ctrl+X, Y, Enter)
- Vuelve a intentar

### ✅ Checkpoint:
- [ ] `prisma generate` completado ✅
- [ ] `prisma migrate deploy` completado ✅
- [ ] `prisma db seed` completado ✅

---

## 🎯 Paso 5.3: Compilar la Aplicación

### ¿Qué voy a hacer?
Compilar Water CRM para producción (optimizar todo el código).

### ¿Cómo lo hago?

1. **Compilar:**
   ```bash
   npm run build
   ```

   Presiona Enter

   **Esto tardará 3-5 minutos** ⏰☕

   Verás mucho texto y porcentajes:
   ```
   Creating an optimized production build...
   Compiled successfully
   ```

   Al final verás un resumen:
   ```
   Route (app)                              Size
   ├ ○ /                                   1.2 kB
   ├ ○ /login                              2.3 kB
   ...
   ○  (Static)  automatically rendered as static HTML
   ```

   ✅ Si termina sin errores, perfecto!

### ⚠️ Si da error:

**Error: "JavaScript heap out of memory"**
- Solución: Tu VPS tiene poca RAM
- Intenta: `NODE_OPTIONS="--max-old-space-size=2048" npm run build`

**Error: "Module not found"**
- Solución: Falta alguna dependencia
- Ejecuta: `npm install` de nuevo

### ✅ Checkpoint:
- [ ] `npm run build` terminó con "Compiled successfully"
- [ ] Veo la lista de rutas (Route table)

---

# PARTE 6: HACER QUE LA APP CORRA 24/7 (15 minutos)

## 🎯 Paso 6.1: Instalar PM2

### ¿Qué voy a hacer?
Instalar PM2, que mantendrá tu aplicación corriendo todo el tiempo (incluso si el servidor se reinicia).

### ¿Cómo lo hago?

1. **Instalar PM2 globalmente:**
   ```bash
   npm install -g pm2
   ```

   Presiona Enter y espera (30-60 segundos)

2. **Verificar:**
   ```bash
   pm2 --version
   ```

   Debes ver un número como: `5.3.0` ✅

### ✅ Checkpoint:
- [ ] PM2 está instalado

---

## 🎯 Paso 6.2: Iniciar la Aplicación con PM2

### ¿Qué voy a hacer?
Iniciar Water CRM y hacer que corra en segundo plano.

### ¿Cómo lo hago?

1. **Asegúrate de estar en el directorio correcto:**
   ```bash
   cd /var/www/webmexico
   ```

2. **Iniciar la aplicación:**
   ```bash
   pm2 start npm --name "watercrm" -- start
   ```

   Presiona Enter

   Verás una tabla:
   ```
   ┌─────┬──────────┬─────┬─────┬────────┐
   │ id  │ name     │ mode│ ↺   │ status │
   ├─────┼──────────┼─────┼─────┼────────┤
   │ 0   │ watercrm │ fork│ 0   │ online │
   └─────┴──────────┴─────┴─────┴────────┘
   ```

   **Si ves "online" en verde** ✅ ¡PERFECTO!

3. **Ver los logs para verificar que arrancó bien:**
   ```bash
   pm2 logs watercrm --lines 30
   ```

   Deberías ver algo como:
   ```
   ▸ Ready on http://localhost:3000
   ```

   ✅ Si ves "Ready on http://localhost:3000" ¡EXCELENTE!

4. **Presiona `Ctrl + C`** para salir de los logs

5. **Configurar PM2 para que inicie automáticamente al arrancar el servidor:**
   ```bash
   pm2 startup systemd
   ```

   Te mostrará un comando como:
   ```
   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
   ```

   **COPIA ESE COMANDO COMPLETO** y pégalo en la terminal, presiona Enter

6. **Guardar la configuración actual:**
   ```bash
   pm2 save
   ```

   Debes ver:
   ```
   [PM2] Saving current process list...
   [PM2] Successfully saved
   ```
   ✅

7. **Verificar estado:**
   ```bash
   pm2 status
   ```

   Debes ver tu app "online" ✅

### ⚠️ Si la app está "errored" (en rojo):

```bash
pm2 logs watercrm --lines 50
```

Lee el error y:
- Si dice "ECONNREFUSED": Problema con la base de datos, revisa .env
- Si dice "Port 3000 already in use": Hay algo usando ese puerto
- Manda captura del error para ayudarte

### ✅ Checkpoint:
- [ ] La app está "online" en PM2
- [ ] Veo "Ready on http://localhost:3000" en los logs

---

# PARTE 7: CONFIGURAR NGINX (SERVIDOR WEB) (20 minutos)

## 🎯 Paso 7.1: Instalar Nginx

### ¿Qué voy a hacer?
Instalar Nginx, que recibirá las peticiones y las enviará a tu aplicación.

### ¿Cómo lo hago?

1. **Instalar Nginx:**
   ```bash
   apt install -y nginx
   ```

   Presiona Enter y espera (30-60 segundos)

2. **Verificar que está corriendo:**
   ```bash
   systemctl status nginx
   ```

   Debes ver **"active (running)"** en verde ✅

3. **Presiona `q`** para salir

### ✅ Checkpoint:
- [ ] Nginx está instalado y corriendo

---

## 🎯 Paso 7.2: Configurar Nginx para Water CRM

### ¿Qué voy a hacer?
Crear una configuración para que Nginx dirija el tráfico a Water CRM.

### ¿Cómo lo hago?

1. **Crear archivo de configuración:**
   ```bash
   nano /etc/nginx/sites-available/watercrm
   ```

   Se abrirá el editor (estará vacío)

2. **Copia y pega esta configuración:**

   ```nginx
   server {
       listen 80;
       server_name _;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;

           proxy_connect_timeout 60s;
           proxy_send_timeout 60s;
           proxy_read_timeout 60s;
       }

       location /_next/static {
           proxy_pass http://localhost:3000/_next/static;
           proxy_cache_valid 60m;
           add_header Cache-Control "public, max-age=3600, immutable";
       }

       client_max_body_size 10M;
   }
   ```

3. **Guardar:**
   - `Ctrl + X`
   - `Y`
   - `Enter`

4. **Activar la configuración:**
   ```bash
   ln -s /etc/nginx/sites-available/watercrm /etc/nginx/sites-enabled/
   ```

5. **Eliminar configuración por defecto:**
   ```bash
   rm -f /etc/nginx/sites-enabled/default
   ```

6. **Verificar que la configuración es correcta:**
   ```bash
   nginx -t
   ```

   Debes ver:
   ```
   nginx: configuration file /etc/nginx/nginx.conf test is successful
   ```
   ✅

7. **Reiniciar Nginx:**
   ```bash
   systemctl restart nginx
   ```

8. **Habilitar Nginx al inicio:**
   ```bash
   systemctl enable nginx
   ```

### ✅ Checkpoint:
- [ ] `nginx -t` dice "test is successful"
- [ ] Nginx reiniciado sin errores

---

# PARTE 8: ¡PROBAR QUE FUNCIONA! (5 minutos)

## 🎯 Paso 8.1: Configurar Firewall

### ¿Qué voy a hacer?
Abrir los puertos necesarios en el firewall.

### ¿Cómo lo hago?

1. **Instalar UFW:**
   ```bash
   apt install -y ufw
   ```

2. **Permitir SSH (¡IMPORTANTE! No te bloquees):**
   ```bash
   ufw allow 22/tcp
   ```
   ✅ MUY IMPORTANTE este paso

3. **Permitir HTTP:**
   ```bash
   ufw allow 80/tcp
   ```

4. **Permitir HTTPS (para el futuro):**
   ```bash
   ufw allow 443/tcp
   ```

5. **Activar firewall:**
   ```bash
   ufw enable
   ```

   Te preguntará: `Command may disrupt existing ssh connections. Proceed with operation (y|n)?`

   Escribe: `y` y presiona Enter

6. **Verificar:**
   ```bash
   ufw status
   ```

   Debes ver:
   ```
   Status: active
   22/tcp      ALLOW       Anywhere
   80/tcp      ALLOW       Anywhere
   443/tcp     ALLOW       Anywhere
   ```
   ✅

### ✅ Checkpoint:
- [ ] Firewall activo con puertos 22, 80 y 443 abiertos

---

## 🎯 Paso 8.2: ¡PROBAR EN EL NAVEGADOR!

### ¿Qué voy a hacer?
¡Ver Water CRM funcionando en tu navegador! 🎉

### ¿Cómo lo hago?

1. **Abre tu navegador** (Chrome, Firefox, Edge, Safari)

2. **En la barra de direcciones, escribe:**
   ```
   http://TU_IP_DEL_VPS
   ```

   **Ejemplo:**
   ```
   http://217.160.123.45
   ```

3. **Presiona Enter**

4. **¡DEBERÍAS VER LA PÁGINA DE LOGIN DE WATER CRM!** 🎉

   ```
   ╔════════════════════════════════╗
   ║     Water CRM - Login          ║
   ║                                ║
   ║  Email: [______________]       ║
   ║  Password: [______________]    ║
   ║                                ║
   ║        [ Iniciar Sesión ]      ║
   ╚════════════════════════════════╝
   ```

5. **Prueba a hacer login con las credenciales por defecto:**
   ```
   Email: admin@watercrm.com
   Password: admin123
   ```

6. **Si puedes hacer login y ves el dashboard** → 🎊 **¡¡¡LO CONSEGUISTE!!!** 🎊

### ⚠️ Si no carga la página:

**Error: "No se puede acceder a este sitio"**

Ejecuta en el servidor:
```bash
# Verificar que la app está corriendo
pm2 status

# Verificar Nginx
systemctl status nginx

# Ver logs de la app
pm2 logs watercrm --lines 30

# Ver logs de Nginx
tail -n 50 /var/log/nginx/error.log
```

Manda captura de los errores que veas.

**Error: "502 Bad Gateway"**

Ejecuta:
```bash
pm2 restart watercrm
systemctl restart nginx
```

Espera 30 segundos y recarga la página.

### ✅ Checkpoint Final:
- [ ] Puedo acceder a Water CRM desde mi navegador
- [ ] Puedo hacer login
- [ ] Veo el dashboard

---

# 🎉 ¡FELICIDADES! LO LOGRASTE

## 🎊 Tu Water CRM está ahora en producción

### ✅ Lo que has conseguido:

1. ✅ Conectarte a un servidor VPS por SSH
2. ✅ Instalar Node.js, PostgreSQL, Git, PM2 y Nginx
3. ✅ Configurar una base de datos PostgreSQL
4. ✅ Descargar y configurar Water CRM
5. ✅ Compilar la aplicación para producción
6. ✅ Hacer que corra 24/7 con PM2
7. ✅ Configurar Nginx como proxy inverso
8. ✅ Configurar firewall
9. ✅ **¡TENER WATER CRM FUNCIONANDO EN INTERNET!**

### 🌐 Acceso:

**URL:** `http://TU_IP_DEL_VPS`

**Credenciales por defecto:**
- Email: `admin@watercrm.com`
- Password: `admin123`

### ⚠️ IMPORTANTE - PRÓXIMOS PASOS:

#### 1. Cambiar Contraseña del Admin (AHORA)

1. Haz login en Water CRM
2. Ve a tu perfil / configuración
3. Cambia la contraseña `admin123` por una segura

#### 2. Configurar Dominio (Opcional pero Recomendado)

Si tienes un dominio (ej: `micrm.com`):

**a) Configurar DNS en IONOS:**
1. Panel de IONOS → Dominios
2. Selecciona tu dominio
3. Gestionar DNS / DNS Settings
4. Crear registro tipo A:
   - Nombre: `@`
   - Valor: `TU_IP_DEL_VPS`
   - TTL: 3600
5. Crear registro tipo A para www:
   - Nombre: `www`
   - Valor: `TU_IP_DEL_VPS`
   - TTL: 3600

**b) Espera 10-30 minutos** (propagación DNS)

**c) Verificar que funciona:**
```bash
ping tudominio.com
```

Debe responder con tu IP.

**d) Configurar SSL (HTTPS):**

Conecta al servidor y ejecuta:

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Editar configuración de Nginx
nano /etc/nginx/sites-available/watercrm

# Cambiar la línea:
# server_name _;
# Por:
# server_name tudominio.com www.tudominio.com;

# Guardar (Ctrl+X, Y, Enter)

# Obtener certificado SSL
certbot --nginx -d tudominio.com -d www.tudominio.com

# Sigue las instrucciones (email, aceptar términos, redirect a HTTPS)

# Actualizar .env
nano /var/www/webmexico/.env

# Cambiar NEXTAUTH_URL a:
# NEXTAUTH_URL="https://tudominio.com"

# Guardar y reiniciar
pm2 restart watercrm
```

Ahora podrás acceder con **HTTPS** ✅🔒

#### 3. Configurar Backups Automáticos

```bash
# Crear script de backup
nano /root/backup-watercrm.sh
```

Pega esto:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump watercrm_db > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
echo "Backup completado: $DATE"
```

```bash
# Dar permisos
chmod +x /root/backup-watercrm.sh

# Probar
/root/backup-watercrm.sh

# Configurar para que corra diariamente
crontab -e

# Si pregunta qué editor, elige: nano (opción 1)

# Agregar al final:
0 3 * * * /root/backup-watercrm.sh >> /var/log/watercrm-backup.log 2>&1

# Guardar (Ctrl+X, Y, Enter)
```

Ahora se hará backup automático cada día a las 3 AM ✅

---

## 📝 Comandos Útiles para el Día a Día

```bash
# Conectar al servidor
ssh root@TU_IP

# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs watercrm

# Reiniciar la aplicación
pm2 restart watercrm

# Ver uso de recursos
pm2 monit

# Ver logs de Nginx
tail -f /var/log/nginx/access.log

# Reiniciar Nginx
systemctl restart nginx

# Backup manual
/root/backup-watercrm.sh

# Ver espacio en disco
df -h

# Ver uso de RAM
free -h
```

---

## 🆘 Si Necesitas Ayuda

Si algo no funciona:

1. **Captura el error** (foto o copia del texto)
2. **Indica en qué paso estabas**
3. **Envía:**
   - Captura del error
   - Output de: `pm2 logs watercrm --lines 50`
   - Output de: `systemctl status nginx`
   - Contenido de: `cat /var/www/webmexico/.env` (borra las contraseñas antes de enviarlo)

---

## 🎓 ¿Qué has Aprendido?

- ✅ Conectarte por SSH a un servidor
- ✅ Usar la terminal de Linux
- ✅ Instalar software en Ubuntu/Debian
- ✅ Configurar PostgreSQL
- ✅ Trabajar con Git
- ✅ Compilar una aplicación Next.js
- ✅ Usar PM2 para gestión de procesos
- ✅ Configurar Nginx
- ✅ Configurar firewall UFW
- ✅ ¡Desplegar una aplicación en producción!

**¡Enhorabuena! Ahora eres capaz de desplegar aplicaciones web en servidores.** 🎉

---

**Guía creada:** Enero 2026
**Para:** Water CRM v1.0
**Nivel:** Principiante total
**Tiempo estimado:** 2-3 horas

**¡ÉXITO!** 🚀
