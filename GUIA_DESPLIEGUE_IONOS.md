# 🚀 Guía de Despliegue en IONOS VPS - Water CRM

**Guía Paso a Paso para Desplegar Water CRM en un VPS de IONOS**

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener:
- ✅ Un VPS contratado en IONOS (mínimo 2GB RAM recomendado)
- ✅ Acceso SSH al VPS (usuario root o con sudo)
- ✅ Un dominio apuntando a la IP del VPS (opcional pero recomendado)

---

## 🔧 Paso 1: Conectar al VPS por SSH

### Opción A: Desde el Panel de IONOS

1. Entra en tu panel de IONOS: https://my.ionos.es
2. Ve a **Servidor & Cloud → VPS**
3. Selecciona tu VPS
4. Haz clic en **"Abrir Consola"** o **"KVM Console"**

### Opción B: Desde tu Terminal (Recomendado)

```bash
# Windows (PowerShell o CMD)
ssh root@TU_IP_DEL_VPS

# Mac/Linux
ssh root@TU_IP_DEL_VPS
```

**Ejemplo:**
```bash
ssh root@217.160.123.45
```

Te pedirá la contraseña que IONOS te envió por email cuando contrataste el VPS.

---

## 🐧 Paso 2: Actualizar el Sistema

Una vez conectado al VPS, actualiza el sistema:

```bash
# Actualizar lista de paquetes
apt update

# Actualizar paquetes instalados
apt upgrade -y
```

---

## 📦 Paso 3: Instalar Node.js 20

```bash
# Instalar curl si no está instalado
apt install -y curl

# Agregar repositorio de NodeSource para Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Instalar Node.js y npm
apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

---

## 🐘 Paso 4: Instalar PostgreSQL 14

```bash
# Instalar PostgreSQL
apt install -y postgresql postgresql-contrib

# Verificar que PostgreSQL está corriendo
systemctl status postgresql

# Si no está corriendo, iniciarlo
systemctl start postgresql
systemctl enable postgresql
```

---

## 🗄️ Paso 5: Configurar Base de Datos

```bash
# Cambiar al usuario postgres
sudo -u postgres psql

# Dentro de psql, ejecuta estos comandos:
```

```sql
-- Crear usuario para Water CRM
CREATE USER watercrm_user WITH PASSWORD 'TuPasswordSegura123!';

-- Crear base de datos
CREATE DATABASE watercrm_db;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE watercrm_db TO watercrm_user;

-- Otorgar permisos en el schema public (PostgreSQL 15+)
\c watercrm_db
GRANT ALL ON SCHEMA public TO watercrm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO watercrm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO watercrm_user;

-- Salir de psql
\q
```

**⚠️ IMPORTANTE:** Cambia `TuPasswordSegura123!` por una contraseña segura y guárdala.

---

## 📥 Paso 6: Instalar Git y Clonar Repositorio

```bash
# Instalar Git
apt install -y git

# Crear directorio para la aplicación
mkdir -p /var/www
cd /var/www

# Clonar tu repositorio (si es privado, necesitarás configurar SSH keys)
# Opción 1: Repositorio público
git clone https://github.com/TU_USUARIO/webmexico.git

# Opción 2: Repositorio privado (necesitarás token o SSH)
# git clone https://TU_TOKEN@github.com/TU_USUARIO/webmexico.git

# Entrar al directorio
cd webmexico
```

### Si tu repositorio es privado:

```bash
# Configurar token de acceso personal de GitHub
git clone https://<TOKEN>@github.com/MarioOsmofilter/webmexico.git

# O configurar SSH key (recomendado)
ssh-keygen -t ed25519 -C "tu_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copia la clave pública y agrégala en GitHub: Settings → SSH and GPG keys
```

---

## ⚙️ Paso 7: Configurar Variables de Entorno

```bash
# Crear archivo .env
nano .env
```

Copia y pega este contenido (adaptando los valores):

```env
# Database
DATABASE_URL="postgresql://watercrm_user:TuPasswordSegura123!@localhost:5432/watercrm_db?schema=public"

# NextAuth
NEXTAUTH_SECRET="genera_un_string_aleatorio_muy_largo_y_seguro_aqui_32_caracteres_minimo"
NEXTAUTH_URL="https://tu-dominio.com"

# Si no tienes dominio aún, usa la IP:
# NEXTAUTH_URL="http://217.160.123.45:3000"

# Node Environment
NODE_ENV="production"
```

**Para generar NEXTAUTH_SECRET seguro:**
```bash
openssl rand -base64 32
```

**Guardar y salir:**
- Presiona `Ctrl + X`
- Presiona `Y`
- Presiona `Enter`

---

## 📦 Paso 8: Instalar Dependencias y Construir

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones de base de datos
npx prisma migrate deploy

# Poblar base de datos con datos iniciales (opcional)
npx prisma db seed

# Construir la aplicación para producción
npm run build
```

**Este paso puede tardar 2-5 minutos.** Verás mensajes de compilación de Next.js.

---

## 🔄 Paso 9: Instalar y Configurar PM2

PM2 mantendrá tu aplicación corriendo permanentemente.

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación con PM2
pm2 start npm --name "watercrm" -- start

# Configurar PM2 para reiniciar al arrancar el servidor
pm2 startup systemd
# Ejecuta el comando que PM2 te muestre

# Guardar configuración actual de PM2
pm2 save

# Verificar que está corriendo
pm2 status

# Ver logs en tiempo real
pm2 logs watercrm
```

**Comandos útiles de PM2:**
```bash
pm2 restart watercrm  # Reiniciar aplicación
pm2 stop watercrm     # Detener aplicación
pm2 logs watercrm     # Ver logs
pm2 monit             # Monitor en tiempo real
```

---

## 🌐 Paso 10: Instalar y Configurar Nginx

Nginx servirá como proxy inverso para tu aplicación.

```bash
# Instalar Nginx
apt install -y nginx

# Crear configuración para Water CRM
nano /etc/nginx/sites-available/watercrm
```

### Opción A: Si tienes dominio (Recomendado)

Copia esta configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir a HTTPS (lo configuraremos después)
    # return 301 https://$server_name$request_uri;

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

        # Timeouts para peticiones largas
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Archivos estáticos de Next.js
    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Límite de tamaño de archivos (para subida de fotos)
    client_max_body_size 10M;
}
```

### Opción B: Si solo usas IP (temporal)

```nginx
server {
    listen 80 default_server;
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
    }

    client_max_body_size 10M;
}
```

**Guardar y salir** (Ctrl+X, Y, Enter)

### Activar la configuración:

```bash
# Crear enlace simbólico
ln -s /etc/nginx/sites-available/watercrm /etc/nginx/sites-enabled/

# Eliminar configuración por defecto si existe
rm /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
nginx -t

# Si todo está OK, reiniciar Nginx
systemctl restart nginx

# Habilitar Nginx al inicio
systemctl enable nginx
```

---

## 🔒 Paso 11: Configurar SSL con Let's Encrypt (Si tienes dominio)

**⚠️ REQUISITO:** Tu dominio debe estar apuntando a la IP del VPS antes de este paso.

### Verificar que el dominio apunta correctamente:

```bash
# Desde tu computadora local
ping tu-dominio.com

# Debe responder con la IP de tu VPS
```

### Instalar Certbot:

```bash
# Instalar Certbot para Nginx
apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Sigue las instrucciones:
# 1. Introduce tu email
# 2. Acepta términos (Y)
# 3. Elige si quieres compartir tu email (Y o N)
# 4. Elige opción 2 (Redirect) para forzar HTTPS
```

### Renovación automática:

```bash
# Verificar renovación automática
certbot renew --dry-run

# El certificado se renovará automáticamente antes de expirar
```

### Actualizar .env con HTTPS:

```bash
nano .env

# Cambiar:
# NEXTAUTH_URL="http://tu-dominio.com"
# Por:
# NEXTAUTH_URL="https://tu-dominio.com"

# Guardar (Ctrl+X, Y, Enter)

# Reiniciar aplicación
pm2 restart watercrm
```

---

## 🔥 Paso 12: Configurar Firewall (Importante para seguridad)

```bash
# Instalar UFW (Uncomplicated Firewall)
apt install -y ufw

# Permitir SSH (¡IMPORTANTE! No te bloquees)
ufw allow 22/tcp

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Habilitar firewall
ufw enable

# Verificar estado
ufw status
```

---

## 🎯 Paso 13: Verificar que Todo Funciona

### Verificar servicios:

```bash
# Verificar PostgreSQL
systemctl status postgresql

# Verificar Nginx
systemctl status nginx

# Verificar PM2
pm2 status

# Ver logs de la aplicación
pm2 logs watercrm --lines 50
```

### Probar en el navegador:

1. **Con dominio:** Abre `https://tu-dominio.com`
2. **Solo con IP:** Abre `http://TU_IP_DEL_VPS`

**Deberías ver la página de login de Water CRM** ✅

### Credenciales por defecto (si ejecutaste el seed):

```
Email: admin@watercrm.com
Password: admin123
```

**⚠️ IMPORTANTE:** Cambia esta contraseña inmediatamente después del primer login.

---

## 📊 Paso 14: Monitoreo y Mantenimiento

### Ver logs en tiempo real:

```bash
# Logs de la aplicación
pm2 logs watercrm

# Logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs de PostgreSQL
tail -f /var/log/postgresql/postgresql-14-main.log
```

### Monitorear recursos:

```bash
# Ver uso de CPU y RAM
pm2 monit

# Ver uso general del sistema
htop

# Si htop no está instalado:
apt install -y htop
```

### Reiniciar servicios si es necesario:

```bash
# Reiniciar aplicación
pm2 restart watercrm

# Reiniciar Nginx
systemctl restart nginx

# Reiniciar PostgreSQL
systemctl restart postgresql
```

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
# Conectar al VPS
ssh root@TU_IP

# Ir al directorio
cd /var/www/webmexico

# Descargar cambios
git pull origin main  # o la rama que uses

# Instalar nuevas dependencias (si hay)
npm install

# Ejecutar migraciones (si hay cambios en schema.prisma)
npx prisma migrate deploy
npx prisma generate

# Reconstruir
npm run build

# Reiniciar aplicación
pm2 restart watercrm

# Ver logs para verificar
pm2 logs watercrm
```

---

## 🛡️ Seguridad Adicional

### 1. Cambiar puerto SSH (Opcional pero recomendado)

```bash
# Editar configuración SSH
nano /etc/ssh/sshd_config

# Buscar la línea: #Port 22
# Cambiarla por: Port 2222  (o el puerto que prefieras)

# Guardar y salir

# Actualizar firewall
ufw allow 2222/tcp
ufw delete allow 22/tcp

# Reiniciar SSH
systemctl restart sshd

# Para conectar ahora:
# ssh -p 2222 root@TU_IP
```

### 2. Deshabilitar login con contraseña (usar solo SSH keys)

```bash
# Primero configura tus SSH keys
ssh-copy-id root@TU_IP

# Luego deshabilita contraseñas
nano /etc/ssh/sshd_config

# Cambiar:
# PasswordAuthentication yes
# Por:
# PasswordAuthentication no

# Reiniciar SSH
systemctl restart sshd
```

### 3. Configurar backups automáticos

```bash
# Crear script de backup
nano /root/backup-watercrm.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de base de datos
sudo -u postgres pg_dump watercrm_db > $BACKUP_DIR/db_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/db_$DATE.sql

# Mantener solo últimos 7 backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Dar permisos de ejecución
chmod +x /root/backup-watercrm.sh

# Probar el script
/root/backup-watercrm.sh

# Configurar cron para backup diario a las 3 AM
crontab -e

# Agregar esta línea:
0 3 * * * /root/backup-watercrm.sh >> /var/log/watercrm-backup.log 2>&1
```

---

## 🆘 Solución de Problemas

### Problema: "Cannot connect to database"

**Solución:**
```bash
# Verificar que PostgreSQL está corriendo
systemctl status postgresql

# Verificar conexión
sudo -u postgres psql -c "\l"

# Verificar que el usuario tiene permisos
sudo -u postgres psql -c "SELECT usename FROM pg_user;"

# Revisar DATABASE_URL en .env
cat .env | grep DATABASE_URL
```

### Problema: "502 Bad Gateway"

**Solución:**
```bash
# Verificar que la aplicación está corriendo
pm2 status

# Si no está corriendo:
pm2 start watercrm

# Ver logs para encontrar el error
pm2 logs watercrm --lines 100

# Verificar que está escuchando en puerto 3000
netstat -tulpn | grep 3000
```

### Problema: "Application not loading"

**Solución:**
```bash
# Ver logs detallados
pm2 logs watercrm --err --lines 200

# Reiniciar completamente
pm2 delete watercrm
cd /var/www/webmexico
pm2 start npm --name "watercrm" -- start

# Verificar variables de entorno
cat .env

# Verificar build
npm run build
```

### Problema: "Out of memory"

**Solución:**
```bash
# Crear archivo swap si el VPS tiene poca RAM
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# Verificar
free -h
```

### Problema: "Cannot upload photos"

**Solución:**
```bash
# Verificar permisos del directorio public/uploads
mkdir -p /var/www/webmexico/public/uploads
chown -R www-data:www-data /var/www/webmexico/public/uploads
chmod -R 755 /var/www/webmexico/public/uploads

# Verificar límite en Nginx
nano /etc/nginx/sites-available/watercrm
# Buscar: client_max_body_size
# Cambiar a: client_max_body_size 20M;

# Reiniciar Nginx
systemctl restart nginx
```

---

## 📞 Checklist Final

Antes de dar por terminado, verifica:

- ✅ PostgreSQL está corriendo y accesible
- ✅ Aplicación está corriendo en PM2
- ✅ Nginx está configurado y activo
- ✅ Puedes acceder desde el navegador
- ✅ Puedes hacer login
- ✅ SSL está configurado (si tienes dominio)
- ✅ Firewall está activo
- ✅ Backups están configurados
- ✅ Has cambiado las contraseñas por defecto
- ✅ Variables de entorno están correctamente configuradas

---

## 🎓 Comandos Útiles para el Día a Día

```bash
# Conectar al VPS
ssh root@TU_IP

# Ver estado de todo
pm2 status && systemctl status nginx && systemctl status postgresql

# Reiniciar aplicación
pm2 restart watercrm

# Ver logs en vivo
pm2 logs watercrm

# Actualizar código
cd /var/www/webmexico && git pull && npm install && npm run build && pm2 restart watercrm

# Backup manual
/root/backup-watercrm.sh

# Ver uso de recursos
pm2 monit

# Ver espacio en disco
df -h
```

---

## 📚 Recursos Adicionales

- **Panel IONOS:** https://my.ionos.es
- **Documentación Next.js:** https://nextjs.org/docs/deployment
- **Documentación PM2:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Documentación Nginx:** https://nginx.org/en/docs/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## 🎉 ¡Felicidades!

Tu aplicación Water CRM está ahora desplegada en producción en tu VPS de IONOS.

**URL de acceso:**
- Con dominio: `https://tu-dominio.com`
- Solo IP: `http://TU_IP_DEL_VPS`

**Usuario admin por defecto:**
- Email: `admin@watercrm.com`
- Password: `admin123`

**⚠️ RECUERDA:** Cambia la contraseña del admin inmediatamente.

---

**Última actualización:** Enero 2026
**Versión:** 1.0
**Soporte:** Ver documentación técnica completa en TECHNICAL_DOCUMENTATION.md
