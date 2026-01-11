# Cómo copiar Prisma Client desde Windows al servidor

## El problema
El servidor tiene un firewall que bloquea `binaries.prisma.sh`, por lo que no puede descargar los engines de Prisma necesarios para ejecutar la aplicación.

## La solución
Generar el Prisma client en tu máquina Windows (sin firewall) y copiarlo al servidor.

---

## Pasos en tu máquina Windows

### 1. Abre CMD (Command Prompt) como administrador

### 2. Ve al directorio del proyecto
```cmd
cd C:\ruta\a\tu\proyecto\webmexico
```

### 3. Actualiza el código
```cmd
git pull origin claude/water-crm-pwa-xYiOa
```

### 4. Genera el Prisma client
```cmd
npx prisma generate
```

Deberías ver algo como:
```
✔ Generated Prisma Client (v5.22.0) to .\node_modules\@prisma\client
```

### 5. Comprime los archivos generados

**Opción A: Con PowerShell** (recomendado)
```powershell
# En PowerShell (no CMD)
Compress-Archive -Path node_modules\.prisma, node_modules\@prisma\client -DestinationPath prisma-client.zip -Force
```

**Opción B: Con 7-Zip** (si lo tienes instalado)
```cmd
"C:\Program Files\7-Zip\7z.exe" a -tzip prisma-client.zip node_modules\.prisma node_modules\@prisma\client
```

**Opción C: Manualmente**
- Ve a la carpeta `node_modules`
- Selecciona las carpetas `.prisma` y `@prisma/client`
- Click derecho → "Enviar a" → "Carpeta comprimida (en zip)"
- Renombra a `prisma-client.zip`

### 6. Copia al servidor

**Opción A: Con scp** (si tienes Git Bash o WSL)
```bash
scp prisma-client.zip root@217.154.186.92:/home/user/webmexico/
```

**Opción B: Con WinSCP o FileZilla**
1. Abre WinSCP o FileZilla
2. Conecta a: `217.154.186.92`
3. Usuario: `root`
4. Navega a: `/home/user/webmexico/`
5. Arrastra el archivo `prisma-client.zip`

---

## Pasos en el servidor (yo me encargo)

Una vez que hayas copiado el archivo, avísame y yo ejecutaré:

```bash
cd /home/user/webmexico
unzip -o prisma-client.zip
npm run dev
```

---

## Verificación

La aplicación debería estar disponible en:
- **Servidor local**: http://localhost:3000
- **Servidor remoto**: http://217.154.186.92:3000 (si el firewall lo permite)

## Credenciales de prueba

- **Superadmin**: superadmin@watercrm.com / Admin123!
- **Admin**: admin@aguaspuras.com / Admin123!
- **Comercial**: comercial1@aguaspuras.com / Admin123!

---

## Notas importantes

- Este proceso solo necesitas hacerlo UNA VEZ
- Después, el servidor podrá funcionar normalmente
- Si cambias el `schema.prisma` en el futuro, tendrás que repetir el proceso
