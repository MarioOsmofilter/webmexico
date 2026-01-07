# 🚀 Guía de Despliegue en VPS (Producción)

Esta guía te enseña a **desplegar Water CRM en un servidor VPS** (DigitalOcean, Linode, AWS, etc.) para producción.

---

## 📋 Requisitos del Servidor

### Especificaciones Mínimas
- **CPU:** 2 cores
- **RAM:** 4GB mínimo (8GB recomendado)
- **Disco:** 20GB SSD
- **Sistema Operativo:** Ubuntu 22.04 LTS (recomendado)

### Software Necesario
- Node.js 18+
- PostgreSQL 14+
- Nginx (como reverse proxy)
- PM2 (para mantener la app corriendo)
- Certbot (para SSL/HTTPS)

---

## 🔧 Paso 1: Preparar el Servidor

### 1.1 Conectarse al VPS

```bash
ssh root@tu-ip-del-vps
```

### 1.2 Actualizar el Sistema

```bash
apt update && apt upgrade -y
```

### 1.3 Crear Usuario No-Root

```bash
adduser watercrm
usermod -aG sudo watercrm
su - watercrm
```

---

## 📦 Paso 2: Instalar Dependencias

### 2.1 Instalar Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node --version  # Debe mostrar v18.x.x
npm --version
```

### 2.2 Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar
sudo systemctl status postgresql
```

### 2.3 Configurar PostgreSQL

```bash
# Conectarse como usuario postgres
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE water_crm;
CREATE USER watercrm_user WITH ENCRYPTED PASSWORD 'TU_CONTRASEÑA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE water_crm TO watercrm_user;

# Dar permisos al esquema
\c water_crm
GRANT ALL ON SCHEMA public TO watercrm_user;

# Salir
\q
```

### 2.4 Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 2.5 Instalar Nginx

```bash
sudo apt install -y nginx

# Iniciar y habilitar
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📁 Paso 3: Subir el Código al Servidor

### Opción A: Desde Git (Recomendado)

```bash
# En el servidor
cd /home/watercrm
git clone https://github.com/TU_USUARIO/webmexico.git
cd webmexico
```

### Opción B: Subir con SCP

```bash
# Desde tu PC local
scp -r /ruta/local/webmexico watercrm@tu-ip:/home/watercrm/
```

---

## ⚙️ Paso 4: Configurar la Aplicación

### 4.1 Instalar Dependencias de Node

```bash
cd /home/watercrm/webmexico
npm install
```

### 4.2 Crear Archivo .env

```bash
nano .env
```

Pega esto (ajusta los valores):

```env
# Base de datos
DATABASE_URL="postgresql://watercrm_user:TU_CONTRASEÑA_SEGURA_AQUI@localhost:5432/water_crm?schema=public"

# NextAuth
NEXTAUTH_URL="https://tudominio.com"
NEXTAUTH_SECRET="GENERA_ESTO_CON: openssl rand -base64 32"

# Configuración multi-empresa
NEXT_PUBLIC_MAIN_DOMAIN="tudominio.com"
NEXT_PUBLIC_USE_SUBDOMAINS="false"

# Producción
NODE_ENV="production"

# Email (opcional)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@tudominio.com"
```

**IMPORTANTE:** Genera un secreto seguro:

```bash
openssl rand -base64 32
```

### 4.3 Ejecutar Migraciones

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4.4 Poblar Base de Datos (Opcional)

```bash
npm run prisma:seed
```

⚠️ **IMPORTANTE:** Cambia las contraseñas de los usuarios seed antes de ir a producción.

### 4.5 Compilar la Aplicación

```bash
npm run build
```

---

## 🔄 Paso 5: Configurar PM2

### 5.1 Crear Archivo de Configuración PM2

```bash
nano ecosystem.config.js
```

Contenido:

```javascript
module.exports = {
  apps: [{
    name: 'water-crm',
    script: 'npm',
    args: 'start',
    cwd: '/home/watercrm/webmexico',
    instances: 2,  // Usa 2 instancias (ajusta según CPU)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
  }]
}
```

### 5.2 Crear Carpeta de Logs

```bash
mkdir -p logs
```

### 5.3 Iniciar con PM2

```bash
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs water-crm

# Guardar configuración para reinicio automático
pm2 save
pm2 startup
# Copia y ejecuta el comando que te muestra
```

---

## 🌐 Paso 6: Configurar Nginx (Reverse Proxy)

### 6.1 Crear Configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/water-crm
```

Contenido:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Logs
    access_log /var/log/nginx/water-crm-access.log;
    error_log /var/log/nginx/water-crm-error.log;

    # Proxy a Next.js
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

    # Cache para archivos estáticos
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Límites de tamaño de archivos (para subir imágenes)
    client_max_body_size 20M;
}
```

### 6.2 Activar Configuración

```bash
sudo ln -s /etc/nginx/sites-available/water-crm /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## 🔒 Paso 7: Configurar SSL/HTTPS (Certbot)

### 7.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtener Certificado SSL

```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Sigue las instrucciones:
1. Ingresa tu email
2. Acepta términos
3. Elige redireccionar HTTP a HTTPS (opción 2)

### 7.3 Verificar Renovación Automática

```bash
sudo certbot renew --dry-run
```

El certificado se renovará automáticamente cada 90 días.

---

## 🔥 Paso 8: Configurar Firewall (UFW)

```bash
# Activar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'

# Verificar reglas
sudo ufw status
```

---

## 📊 Paso 9: Configurar Monitoreo

### 9.1 PM2 Monitoring (Gratis)

```bash
pm2 install pm2-logrotate

# Configurar rotación de logs
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 9.2 Ver Métricas

```bash
pm2 monit  # Monitor en tiempo real
```

---

## 🔄 Paso 10: Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
# 1. Navegar a la carpeta
cd /home/watercrm/webmexico

# 2. Obtener últimos cambios
git pull origin main

# 3. Instalar nuevas dependencias (si las hay)
npm install

# 4. Ejecutar migraciones (si las hay)
npx prisma migrate deploy

# 5. Recompilar
npm run build

# 6. Reiniciar PM2
pm2 restart water-crm

# 7. Ver logs
pm2 logs water-crm --lines 50
```

---

## 🗄️ Paso 11: Backup de Base de Datos

### 11.1 Crear Script de Backup

```bash
nano /home/watercrm/backup.sh
```

Contenido:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/watercrm/backups"
mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
PGPASSWORD="TU_CONTRASEÑA" pg_dump -U watercrm_user -h localhost water_crm > $BACKUP_DIR/water_crm_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/water_crm_$DATE.sql

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completado: water_crm_$DATE.sql.gz"
```

### 11.2 Dar Permisos de Ejecución

```bash
chmod +x /home/watercrm/backup.sh
```

### 11.3 Programar Backup Automático (Cron)

```bash
crontab -e
```

Añadir (backup diario a las 2AM):

```
0 2 * * * /home/watercrm/backup.sh
```

### 11.4 Restaurar desde Backup

```bash
gunzip /home/watercrm/backups/water_crm_YYYYMMDD_HHMMSS.sql.gz
PGPASSWORD="TU_CONTRASEÑA" psql -U watercrm_user -h localhost water_crm < /home/watercrm/backups/water_crm_YYYYMMDD_HHMMSS.sql
```

---

## 🚨 Paso 12: Seguridad Adicional

### 12.1 Cambiar Puerto SSH (Opcional)

```bash
sudo nano /etc/ssh/sshd_config

# Cambiar:
Port 2222  # En lugar de 22

sudo systemctl restart sshd
sudo ufw allow 2222
```

### 12.2 Deshabilitar Login Root

```bash
sudo nano /etc/ssh/sshd_config

# Cambiar:
PermitRootLogin no

sudo systemctl restart sshd
```

### 12.3 Fail2Ban (Protección contra Brute Force)

```bash
sudo apt install -y fail2ban

# Crear configuración
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📝 Comandos Útiles

### Ver Logs de la Aplicación
```bash
pm2 logs water-crm
pm2 logs water-crm --lines 100
```

### Reiniciar Aplicación
```bash
pm2 restart water-crm
```

### Ver Estado del Sistema
```bash
pm2 status
pm2 monit
```

### Ver Logs de Nginx
```bash
sudo tail -f /var/log/nginx/water-crm-access.log
sudo tail -f /var/log/nginx/water-crm-error.log
```

### Ver Logs de PostgreSQL
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## ⚡ Optimizaciones de Rendimiento

### 1. Caché de Prisma

```bash
# Ya está configurado en prisma/client.ts
```

### 2. Compresión Gzip en Nginx

Añadir a `/etc/nginx/sites-available/water-crm`:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
```

### 3. Aumentar Límites de PostgreSQL

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Ajustar:

```
max_connections = 200
shared_buffers = 1GB  # 25% de RAM
effective_cache_size = 3GB  # 75% de RAM
```

Reiniciar:

```bash
sudo systemctl restart postgresql
```

---

## 🔍 Troubleshooting

### Error: "Can't connect to database"
✅ Verifica que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
✅ Revisa el DATABASE_URL en `.env`
✅ Verifica permisos del usuario de BD

### Error: "Port 3000 already in use"
✅ Mata el proceso: `pm2 delete water-crm`
✅ O usa otro puerto en `ecosystem.config.js`

### Error: "502 Bad Gateway"
✅ Verifica que PM2 esté corriendo: `pm2 status`
✅ Revisa logs: `pm2 logs water-crm`
✅ Verifica configuración de Nginx: `sudo nginx -t`

### La app no inicia después de `npm run build`
✅ Verifica errores de compilación
✅ Revisa que todas las variables de entorno estén configuradas
✅ Ejecuta `npx prisma generate` de nuevo

---

## 📧 Soporte

Si encuentras problemas:
1. Revisa los logs: `pm2 logs water-crm`
2. Verifica el estado: `pm2 status`
3. Revisa la documentación de Next.js
4. Contacta con soporte

---

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] PostgreSQL configurado y corriendo
- [ ] Variables de entorno en `.env` configuradas
- [ ] NEXTAUTH_SECRET generado de forma segura
- [ ] Migraciones ejecutadas
- [ ] Contraseñas del seed cambiadas
- [ ] App compilada con `npm run build`
- [ ] PM2 corriendo y guardado
- [ ] Nginx configurado y funcionando
- [ ] SSL/HTTPS activo con Certbot
- [ ] Firewall (UFW) configurado
- [ ] Backups automáticos programados
- [ ] Monitoreo configurado
- [ ] Dominio apuntando al VPS

---

**¡Tu Water CRM está listo para producción!** 🎉
