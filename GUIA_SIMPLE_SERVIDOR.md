# 🚀 GUÍA RÁPIDA: Montar Water CRM en Servidor Real

**Para alguien que nunca ha montado un servidor - Paso a paso SIN complicaciones**

---

## 📋 LO QUE NECESITAS ANTES DE EMPEZAR

### 1. Un Servidor VPS
Necesitas contratar un servidor. Las opciones más fáciles:

- **DigitalOcean** (lo más fácil): https://www.digitalocean.com → Droplet básico ($12/mes)
- **Hetzner** (más barato): https://www.hetzner.com → VPS CX21 (€5/mes)
- **Contabo** (muy barato): https://contabo.com → VPS S (€5/mes)

**Qué servidor necesitas:**
- Sistema: Ubuntu 22.04 LTS
- RAM: Mínimo 4GB (recomendado 8GB)
- Disco: 20GB SSD
- CPU: 2 cores

### 2. Un Dominio (Opcional pero recomendado)
Si quieres usar `tuempresa.com` en lugar de `123.456.789.0`:
- Compra en Namecheap, GoDaddy, o cualquier registrador
- Apunta el dominio a la IP del servidor (te explico abajo)

---

## 🎯 PASO 1: CONECTARTE AL SERVIDOR

### Si estás en Windows:
1. Descarga **PuTTY**: https://www.putty.org/
2. Abre PuTTY
3. En "Host Name" pon la IP de tu servidor (ej: `123.456.789.0`)
4. Puerto: `22`
5. Click en "Open"
6. Usuario: `root`
7. Contraseña: la que te dieron al crear el servidor

### Si estás en Mac o Linux:
Abre Terminal y escribe:
```bash
ssh root@123.456.789.0
```
(cambia `123.456.789.0` por tu IP real)

---

## 🔧 PASO 2: PREPARAR EL SERVIDOR (Copiar y pegar cada comando)

**Una vez conectado al servidor, copia y pega estos comandos UNO POR UNO:**

### 2.1 Actualizar el sistema
```bash
apt update && apt upgrade -y
```
(Tarda 1-2 minutos)

### 2.2 Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verifica que funciona:
```bash
node --version
```
Debe mostrar algo como `v20.x.x`

### 2.3 Instalar PostgreSQL (base de datos)
```bash
apt install -y postgresql postgresql-contrib
```

### 2.4 Configurar PostgreSQL
```bash
sudo -u postgres psql
```

Ahora estás dentro de PostgreSQL. Copia estas líneas **UNA POR UNA**:
```sql
CREATE DATABASE water_crm;
CREATE USER watercrm_user WITH ENCRYPTED PASSWORD 'TuContraseñaSuperSegura123!';
GRANT ALL PRIVILEGES ON DATABASE water_crm TO watercrm_user;
\c water_crm
GRANT ALL ON SCHEMA public TO watercrm_user;
\q
```

(Cambia `TuContraseñaSuperSegura123!` por una contraseña que inventes)

### 2.5 Instalar PM2 (para mantener la app funcionando)
```bash
npm install -g pm2
```

### 2.6 Instalar Nginx (servidor web)
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

## 📥 PASO 3: SUBIR TU CÓDIGO AL SERVIDOR

### Opción A: Con Git (RECOMENDADO)

Si tienes tu código en GitHub:
```bash
cd /var/www
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git water-crm
cd water-crm
```

### Opción B: Con FileZilla (Si no usas Git)

1. Descarga FileZilla: https://filezilla-project.org/
2. Conecta al servidor:
   - Host: Tu IP del servidor
   - Usuario: `root`
   - Contraseña: tu contraseña
   - Puerto: `22`
3. Sube la carpeta completa del proyecto a `/var/www/water-crm`

---

## ⚙️ PASO 4: CONFIGURAR LA APLICACIÓN

### 4.1 Instalar dependencias
```bash
cd /var/www/water-crm
npm install
```
(Tarda 2-3 minutos)

### 4.2 Crear el archivo de configuración (.env)
```bash
nano .env
```

Pega esto (CAMBIA LOS VALORES EN MAYÚSCULAS):
```env
# Base de datos
DATABASE_URL="postgresql://watercrm_user:TuContraseñaSuperSegura123!@localhost:5432/water_crm?schema=public"

# Autenticación
NEXTAUTH_URL="https://TU_DOMINIO.com"
NEXTAUTH_SECRET="GENERA_ESTO_ABAJO"

# Producción
NODE_ENV="production"

# Multi-empresa
NEXT_PUBLIC_MAIN_DOMAIN="TU_DOMINIO.com"
NEXT_PUBLIC_USE_SUBDOMAINS="false"
```

**IMPORTANTE: Generar NEXTAUTH_SECRET**

Sal del editor (Ctrl+X, luego Y, luego Enter) y genera el secreto:
```bash
openssl rand -base64 32
```

Copia el resultado, vuelve a abrir el .env:
```bash
nano .env
```

Y pega el secreto donde dice `GENERA_ESTO_ABAJO`.

Guarda (Ctrl+X, Y, Enter).

### 4.3 Preparar la base de datos
```bash
npx prisma generate
npx prisma migrate deploy
```

Si pregunta algo, di que SÍ.

### 4.4 Crear usuarios iniciales (OPCIONAL)
```bash
npm run prisma:seed
```

**⚠️ IMPORTANTE:** Anota las contraseñas que muestra. Luego CÁMBIALAS desde la aplicación.

### 4.5 Compilar la aplicación
```bash
npm run build
```
(Tarda 2-4 minutos)

---

## 🔄 PASO 5: ARRANCAR LA APLICACIÓN CON PM2

### 5.1 Crear configuración de PM2
```bash
nano ecosystem.config.js
```

Pega esto:
```javascript
module.exports = {
  apps: [{
    name: 'water-crm',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/water-crm',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Guarda (Ctrl+X, Y, Enter).

### 5.2 Iniciar con PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

El último comando te mostrará otro comando. **CÓPIALO Y EJECÚTALO**.

### 5.3 Ver que funciona
```bash
pm2 status
```

Debe mostrar `water-crm` con estado `online`.

Si quieres ver logs en tiempo real:
```bash
pm2 logs water-crm
```

---

## 🌐 PASO 6: CONFIGURAR NGINX (Para que funcione desde Internet)

### 6.1 Crear configuración
```bash
nano /etc/nginx/sites-available/water-crm
```

Pega esto (CAMBIA `TU_DOMINIO.com`):
```nginx
server {
    listen 80;
    server_name TU_DOMINIO.com www.TU_DOMINIO.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M;
}
```

Guarda (Ctrl+X, Y, Enter).

### 6.2 Activar configuración
```bash
ln -s /etc/nginx/sites-available/water-crm /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 🔒 PASO 7: ACTIVAR HTTPS (SSL) - GRATIS con Let's Encrypt

### 7.1 Instalar Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtener certificado SSL
```bash
certbot --nginx -d TU_DOMINIO.com -d www.TU_DOMINIO.com
```

Te hará unas preguntas:
1. Email: Tu email
2. Términos: Acepta (A)
3. Recibir emails: Como quieras (Y o N)
4. Redirect HTTP a HTTPS: **Elige 2** (Redirect)

**¡LISTO!** Ahora tu sitio tiene HTTPS automático.

---

## 🔥 PASO 8: CONFIGURAR FIREWALL (Seguridad básica)

```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

Confirma con `y` cuando pregunte.

---

## ✅ PASO 9: VERIFICAR QUE TODO FUNCIONA

Abre tu navegador y ve a:
```
https://TU_DOMINIO.com
```

Deberías ver la página de login del Water CRM.

**Credenciales por defecto (si hiciste el seed):**
- Email: `superadmin@watercrm.com`
- Contraseña: `Admin123!`

**⚠️ CÁMBIALA INMEDIATAMENTE después de entrar.**

---

## 🔄 CÓMO ACTUALIZAR LA APLICACIÓN (Cuando hagas cambios)

Conecta al servidor y ejecuta:
```bash
cd /var/www/water-crm
git pull origin main  # Si usas Git
npm install  # Si agregaste dependencias nuevas
npx prisma migrate deploy  # Si cambiaste la base de datos
npm run build
pm2 restart water-crm
```

---

## 🆘 PROBLEMAS COMUNES Y SOLUCIONES

### "No puedo conectar a la base de datos"
```bash
# Verifica que PostgreSQL está corriendo
systemctl status postgresql

# Si está parado, arráncalo
systemctl start postgresql
```

### "La página no carga"
```bash
# Verifica que PM2 está corriendo
pm2 status

# Si está parado, arráncalo
pm2 restart water-crm

# Ver errores
pm2 logs water-crm
```

### "Error 502 Bad Gateway"
```bash
# Verifica Nginx
systemctl status nginx

# Ver configuración
nginx -t

# Si hay error, revisa el archivo
nano /etc/nginx/sites-available/water-crm
```

### "La base de datos no tiene datos"
```bash
cd /var/www/water-crm
npm run prisma:seed
```

---

## 📞 APUNTAR TU DOMINIO AL SERVIDOR

Si compraste un dominio, ve al panel del registrador y:

1. Busca "DNS Settings" o "Gestión DNS"
2. Añade/Edita el registro **A**:
   - Nombre/Host: `@` (o déjalo vacío)
   - Tipo: `A`
   - Valor/Dirección: LA IP DE TU SERVIDOR
   - TTL: `3600`

3. Añade el registro **A** para www:
   - Nombre/Host: `www`
   - Tipo: `A`
   - Valor: LA IP DE TU SERVIDOR
   - TTL: `3600`

**IMPORTANTE:** Tarda entre 5 minutos y 24 horas en propagarse (normalmente ~1 hora).

---

## ✨ RESUMEN DE COMANDOS ÚTILES

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs water-crm

# Reiniciar aplicación
pm2 restart water-crm

# Ver uso de recursos
pm2 monit

# Entrar a PostgreSQL
sudo -u postgres psql water_crm

# Ver archivos de la aplicación
cd /var/www/water-crm
ls -la
```

---

## 🎉 ¡LISTO!

Tu Water CRM está funcionando en producción.

**Próximos pasos recomendados:**
1. Cambia TODAS las contraseñas por defecto
2. Crea tus usuarios reales desde el panel de admin
3. Configura un backup automático (ver DESPLIEGUE_VPS.md para detalles)
4. Monitoriza los logs regularmente

**Si algo falla:**
1. Mira los logs: `pm2 logs water-crm`
2. Verifica la base de datos: `sudo -u postgres psql water_crm`
3. Revisa Nginx: `nginx -t`

---

**¿Necesitas ayuda?** Todos los detalles técnicos están en `DESPLIEGUE_VPS.md`.
