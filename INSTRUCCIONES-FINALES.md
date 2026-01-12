# 🎯 WATER CRM - Instrucciones Finales

## ✅ Estado Actual: TODO FUNCIONANDO

Tu aplicación **Water CRM está completamente funcional** y corriendo en el servidor.

- ✅ PostgreSQL: Funcionando con base de datos `water_crm`
- ✅ Next.js: Corriendo con PM2 en puerto 8080
- ✅ Datos de prueba: 3 usuarios creados (superadmin, admin, comercial)
- ✅ Código: Sin errores de compilación
- ✅ Todas las tablas: Creadas (53 tablas, 43 enums)

---

## 🚧 ÚNICO PROBLEMA: Firewall de Plesk

El firewall de Plesk está bloqueando el acceso externo al puerto 8080.

**Prueba interna (funciona):**
```bash
curl http://localhost:8080
# ✅ Responde correctamente con la página Water CRM
```

**Prueba externa (bloqueado):**
```
http://217.154.186.92:8080
# ❌ 403 Forbidden - host_not_allowed
```

---

## 📞 SOLUCIÓN: Contactar Soporte IONOS

### Opción 1: Ticket de Soporte (Recomendado)

**Accede a:** https://my.ionos.com/support

**Texto del ticket:**
```
Asunto: Abrir puerto 8080 en firewall para aplicación Next.js

Hola,

Tengo un VPS en 217.154.186.92 con Plesk y necesito abrir el puerto 8080
para acceder a mi aplicación Water CRM desde internet.

Actualmente el firewall bloquea el puerto con "403 Forbidden - host_not_allowed".

¿Pueden ayudarme a abrir este puerto en el firewall?

Alternativamente, también acepto configurar un proxy inverso con Apache
en el puerto 80 si es más sencillo.

Gracias
```

---

### Opción 2: Chat/Teléfono

**Chat en vivo:** https://my.ionos.com/
**Teléfono:** 900 802 500 (España, gratuito)

**Les dices:**
"Necesito abrir el puerto 8080 en el firewall de mi VPS 217.154.186.92
para acceder a mi aplicación Next.js. Actualmente da 403 Forbidden."

---

## 🔐 Mientras Tanto: Acceso por Túnel SSH

### Desde tu Windows:

1. **Abre PowerShell**

2. **Ejecuta:**
   ```powershell
   ssh -L 3000:127.0.0.1:8080 root@217.154.186.92
   ```

3. **Ingresa la contraseña** del servidor

4. **Deja la ventana abierta** (minimízala pero no la cierres)

5. **Abre tu navegador:** http://localhost:3000

---

## 🎯 URLs de Acceso

**Cuando el firewall esté abierto:**
- Principal: http://217.154.186.92:8080
- Login: http://217.154.186.92:8080/login

**Con túnel SSH (ahora):**
- Principal: http://localhost:3000
- Login: http://localhost:3000/login

---

## 👤 Credenciales de Prueba

```
Superadmin:
Email:    superadmin@watercrm.com
Password: Admin123!

Admin:
Email:    admin@aguaspuras.com
Password: Admin123!

Comercial:
Email:    comercial1@aguaspuras.com
Password: Admin123!
```

---

## 🔄 Gestión del Servidor

### Ver estado de la aplicación:
```bash
pm2 status
```

### Ver logs en tiempo real:
```bash
pm2 logs watercrm
```

### Reiniciar la aplicación:
```bash
pm2 restart watercrm
```

### Detener la aplicación:
```bash
pm2 stop watercrm
```

### Iniciar si está detenida:
```bash
pm2 start watercrm
```

### Hacer que PM2 inicie al arrancar el servidor:
```bash
pm2 startup
pm2 save
```

---

## 📊 Resumen de Servicios

| Servicio    | Estado   | Puerto | Comando para verificar        |
|-------------|----------|--------|-------------------------------|
| PostgreSQL  | ✅ Online | 5432   | `service postgresql status`   |
| Next.js     | ✅ Online | 8080   | `pm2 status`                  |
| PM2         | ✅ Online | -      | `pm2 list`                    |

---

## 🎯 Próximos Pasos

1. ✅ **Contacta a soporte de IONOS** para abrir el puerto 8080
2. ⏳ **Espera** a que configuren el firewall (normalmente 24-48h)
3. 🚀 **Prueba** http://217.154.186.92:8080
4. 🎉 **¡Listo!** Tu CRM estará accesible desde cualquier lugar

---

## ⚠️ Notas Importantes

- **No desinstales PM2**: Es lo que mantiene Next.js corriendo
- **No borres la base de datos**: Contiene los usuarios de prueba
- **El servidor reinicia automáticamente**: PM2 lo mantiene activo
- **Si cambias el código**: Haz `pm2 restart watercrm`

---

## 💡 Alternativa: Puerto 80 con Nginx

Si IONOS no puede abrir el 8080, pídeles que configuren Apache/Nginx como proxy en el puerto 80:

```apache
ProxyPass / http://localhost:8080/
ProxyPassReverse / http://localhost:8080/
```

Entonces accederás con: http://217.154.186.92 (sin puerto)

---

## 🆘 Si Algo Falla

1. **La app no responde:**
   ```bash
   pm2 restart watercrm
   pm2 logs watercrm
   ```

2. **PostgreSQL detenido:**
   ```bash
   service postgresql start
   ```

3. **El servidor se reinició:**
   ```bash
   pm2 resurrect
   ```

4. **Olvidaste tu contraseña del servidor:**
   - Ve al panel de IONOS
   - Reset de contraseña del VPS

---

## 📝 Archivos Importantes

- **Código fuente:** `/home/user/webmexico`
- **Base de datos:** PostgreSQL (usuario: `usuario`, DB: `water_crm`)
- **Logs de PM2:** `/root/.pm2/logs/`
- **Logs de PostgreSQL:** `/var/log/postgresql/`

---

## ✅ Checklist Final

- [x] PostgreSQL instalado y corriendo
- [x] Base de datos `water_crm` creada
- [x] 53 tablas creadas
- [x] 3 usuarios de prueba insertados
- [x] Next.js compilando sin errores
- [x] PM2 gestionando el proceso
- [x] App accesible en localhost:8080
- [ ] **Firewall configurado** ← ESTE ES EL ÚNICO PASO PENDIENTE

---

## 🎉 ¡ENHORABUENA!

Has configurado exitosamente un CRM completo con:
- PostgreSQL
- Next.js 14
- TypeScript
- Prisma ORM
- NextAuth
- PWA
- Multi-tenant
- 53 modelos de datos
- Sistema completo de gestión

**Solo falta que IONOS abra el puerto 8080 en el firewall.**

---

**Creado:** 12 de Enero 2026
**Servidor:** 217.154.186.92
**Proyecto:** Water CRM v1.0.0
