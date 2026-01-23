# 📱 Configurar APK para Producción

## ⚠️ IMPORTANTE

El APK actual está en **modo demo** y muestra solo una pantalla de bienvenida.

Para que la app funcione completamente, necesitas **desplegarla en un servidor** y configurar el APK para que se conecte a ese servidor.

---

## 🚀 Opción 1: Desplegar en Vercel (RECOMENDADO)

### Paso 1: Desplegar la app

```bash
cd familia-rewards

# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Seguir las instrucciones:
# - Project name: familia-rewards
# - Link to existing project: N
# - Directory: ./
```

Al finalizar obtendrás una URL como:
```
https://familia-rewards-xxxxx.vercel.app
```

### Paso 2: Configurar variables de entorno en Vercel

En el dashboard de Vercel:
1. Settings → Environment Variables
2. Añadir:
   - `DATABASE_URL` (tu Neon PostgreSQL URL)
   - `DIRECT_URL` (tu Neon direct URL)
   - `NEXTAUTH_URL` (la URL de Vercel)
   - `NEXTAUTH_SECRET` (genera con `openssl rand -base64 32`)
   - Variables de Firebase (si las tienes)

### Paso 3: Configurar Capacitor

Edita `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.familiarewards.app',
  appName: 'Familia Rewards',
  webDir: 'public',
  server: {
    url: 'https://familia-rewards-xxxxx.vercel.app', // 👈 TU URL AQUÍ
    cleartext: false,
  },
  // ...resto de la config
};
```

### Paso 4: Recompilar APK

```bash
# Sincronizar cambios
npx cap sync android

# Compilar nuevo APK
cd android
./gradlew assembleDebug

# El APK estará en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🚀 Opción 2: Desplegar en Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar
railway init

# Desplegar
railway up
```

Obtendrás una URL y seguir los mismos pasos de configuración.

---

## 🔧 Opción 3: Servidor Local (Solo para testing)

Si quieres probar localmente:

### Paso 1: Obtener tu IP local

```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

Ejemplo: `192.168.1.100`

### Paso 2: Configurar Capacitor

```typescript
server: {
  url: 'http://192.168.1.100:3000',
  cleartext: true,
},
```

### Paso 3: Correr servidor y compilar APK

```bash
# Terminal 1: Correr servidor
npm run dev

# Terminal 2: Compilar APK
npx cap sync android
cd android && ./gradlew assembleDebug
```

⚠️ **IMPORTANTE**: Tu móvil debe estar en la misma red WiFi que tu PC.

---

## 📊 Verificar que funciona

1. Instala el APK en tu móvil
2. Abre la app
3. Deberías ver la pantalla de login
4. Crea un usuario desde el endpoint `/api/auth/register` o via Prisma Studio

---

## 🐛 Troubleshooting

### La app no carga (pantalla blanca)

- ✅ Verifica que la URL en `capacitor.config.ts` sea correcta
- ✅ Verifica que el servidor esté corriendo
- ✅ Abre Chrome DevTools conectado al móvil: `chrome://inspect`

### Error de CORS

Añade en `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ],
    },
  ];
},
```

### Variables de entorno no funcionan

Asegúrate de que las variables estén en Vercel/Railway, no solo en `.env` local.

---

## ✅ Checklist Final

- [ ] App desplegada en Vercel/Railway
- [ ] Variables de entorno configuradas
- [ ] URL actualizada en `capacitor.config.ts`
- [ ] APK recompilado con nueva config
- [ ] APK instalado en móvil
- [ ] App carga correctamente
- [ ] Login funciona
- [ ] Puedes crear tareas, puntos, etc.

---

## 🎯 Alternativa: PWA sin APK

Si no quieres compilar APK, la app funciona como PWA:

1. Despliega en Vercel
2. Abre la URL en Chrome móvil
3. Menú → "Añadir a pantalla de inicio"
4. ¡Listo! Funciona como app instalada

---

**¿Dudas?** Lee la documentación completa en `README.md` y `SETUP.md`
