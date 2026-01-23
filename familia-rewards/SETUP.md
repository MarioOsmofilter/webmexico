# 🚀 Guía de Setup y Deployment

## 📋 Índice

1. [Setup Inicial](#setup-inicial)
2. [Configurar Neon PostgreSQL](#configurar-neon-postgresql)
3. [Configurar Firebase](#configurar-firebase)
4. [Crear Usuarios de Prueba](#crear-usuarios-de-prueba)
5. [Compilar APK](#compilar-apk)
6. [Deploy a Producción](#deploy-a-producción)
7. [Configurar GitHub Actions](#configurar-github-actions)

---

## 1. Setup Inicial

### Instalar dependencias

```bash
cd familia-rewards
npm install
```

### Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `.env`:
```env
NEXTAUTH_SECRET="resultado-aqui"
```

---

## 2. Configurar Neon PostgreSQL

### Paso 1: Crear cuenta

1. Ve a [https://neon.tech](https://neon.tech)
2. Registrate con GitHub o email
3. Es gratis hasta 3GB

### Paso 2: Crear proyecto

1. Click en "New Project"
2. Nombre: `familia-rewards`
3. Región: Elige la más cercana
4. PostgreSQL version: 16

### Paso 3: Obtener conexiones

Neon te dará dos URLs:

**Connection String (pooled)**:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Direct Connection**:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Paso 4: Actualizar .env

```env
DATABASE_URL="tu-connection-string-pooled"
DIRECT_URL="tu-direct-connection"
```

### Paso 5: Aplicar schema de Prisma

```bash
npm run db:generate
npm run db:push
```

---

## 3. Configurar Firebase

### Paso 1: Crear proyecto Firebase

1. Ve a [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click en "Agregar proyecto"
3. Nombre: `familia-rewards`
4. Deshabilita Google Analytics (opcional)

### Paso 2: Habilitar Cloud Messaging

1. En el menú lateral → "Cloud Messaging"
2. Click en "Habilitar"

### Paso 3: Registrar app web

1. En "Información general del proyecto" → Click en "Web" (ícono </>)
2. Alias: `familia-rewards-web`
3. Copia las credenciales:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "familia-rewards.firebaseapp.com",
  projectId: "familia-rewards",
  storageBucket: "familia-rewards.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

### Paso 4: Obtener VAPID Key

1. En Cloud Messaging → Pestaña "Web Push certificates"
2. Click en "Generar par de claves"
3. Copia la clave VAPID

### Paso 5: Actualizar .env

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="familia-rewards.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="familia-rewards"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="familia-rewards.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123:web:abc123"
NEXT_PUBLIC_FIREBASE_VAPID_KEY="BG8x..."
```

### Paso 6: Actualizar firebase-messaging-sw.js

Edita `public/firebase-messaging-sw.js` y reemplaza las credenciales:

```javascript
firebase.initializeApp({
  apiKey: 'tu-api-key',
  authDomain: 'tu-app.firebaseapp.com',
  // ... resto de credenciales
});
```

---

## 4. Crear Usuarios de Prueba

### Método 1: Via Prisma Studio

```bash
npm run db:studio
```

Se abrirá una interfaz web en `http://localhost:5555`

1. Ve a tabla `User`
2. Click en "Add record"
3. Rellena:
   - email: `padre@demo.com`
   - password: (hash bcrypt de `Demo123!`)
   - name: `Padre Demo`
   - role: `PARENT`

### Método 2: Via Script SQL

Conéctate a Neon y ejecuta:

```sql
-- Crear usuario padre (password: Demo123!)
INSERT INTO users (id, email, password, name, role) VALUES
('clxxxx', 'padre@demo.com', '$2b$10$YourBcryptHashHere', 'Padre Demo', 'PARENT');

-- Crear perfil de padre
INSERT INTO parent_profiles (id, "userId") VALUES
('clxxxx', 'clxxxx');

-- Crear hijo
INSERT INTO children (id, "parentId", name, age, avatar, color) VALUES
('clxxxx', 'clxxxx', 'Juan', 10, '👦', '#3b82f6');
```

### Método 3: API de Registro (crear endpoint)

Crea `src/app/api/auth/register/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { email, password, name, role } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'PARENT',
    },
  });

  if (role === 'PARENT') {
    await db.parentProfile.create({
      data: { userId: user.id },
    });
  }

  return NextResponse.json({ success: true, user });
}
```

Luego:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"padre@demo.com","password":"Demo123!","name":"Padre Demo","role":"PARENT"}'
```

---

## 5. Compilar APK

### Setup Android

1. **Instalar Java 17**

```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# macOS
brew install openjdk@17

# Verificar
java -version
```

2. **Inicializar Capacitor**

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android
npx cap init
```

Responde:
- App name: `Familia Rewards`
- App ID: `com.familiarewards.app`
- Web dir: `out`

3. **Build Next.js**

```bash
npm run build
```

4. **Agregar plataforma Android**

```bash
npx cap add android
```

5. **Sincronizar**

```bash
npx cap sync android
```

6. **Compilar APK**

```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```

APK generado en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Instalar en dispositivo

**Via USB:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Via archivo:**
1. Copia `app-debug.apk` al móvil
2. Abre desde el explorador de archivos
3. Permite "Instalar desde fuentes desconocidas"

---

## 6. Deploy a Producción

### Opción A: Vercel (Recomendado para PWA)

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Configurar variables de entorno**

En el dashboard de Vercel:
- Settings → Environment Variables
- Añade todas las variables del `.env`

5. **Deploy a producción**
```bash
vercel --prod
```

### Opción B: Railway

1. Ve a [railway.app](https://railway.app)
2. Login con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona `familia-rewards`
5. Añade variables de entorno
6. Deploy automático

### Opción C: Servidor VPS (Linux)

```bash
# En tu servidor
git clone https://github.com/tu-usuario/familia-rewards.git
cd familia-rewards
npm install
npm run build

# Usar PM2 para mantener la app corriendo
npm install -g pm2
pm2 start npm --name "familia-rewards" -- start
pm2 save
pm2 startup
```

---

## 7. Configurar GitHub Actions

### Paso 1: Habilitar Actions

1. Ve a tu repositorio en GitHub
2. Settings → Actions → General
3. Habilita "Allow all actions and reusable workflows"

### Paso 2: Añadir Secrets

Settings → Secrets and variables → Actions → New repository secret

Añade estos secrets:

```
DATABASE_URL
DIRECT_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

### Paso 3: (Opcional) Para Release APK firmado

Genera keystore:
```bash
keytool -genkey -v -keystore release.keystore -alias familia-rewards -keyalg RSA -keysize 2048 -validity 10000
```

Convierte a Base64:
```bash
base64 -i release.keystore -o keystore.b64
```

Añade estos secrets adicionales:
```
ANDROID_KEYSTORE_BASE64  (contenido de keystore.b64)
KEYSTORE_PASSWORD
KEY_ALIAS
KEY_PASSWORD
```

### Paso 4: Hacer push

```bash
git add .
git commit -m "Setup complete"
git push
```

El workflow se ejecutará automáticamente y generará el APK.

Descarga el APK desde:
- Actions → (último workflow) → Artifacts → app-debug

---

## 🎉 ¡Listo!

Tu app está configurada y funcionando. Puedes:

1. ✅ Acceder a la PWA: `https://tu-dominio.vercel.app`
2. ✅ Descargar APK desde GitHub Actions
3. ✅ Instalar en Android
4. ✅ Probar el control parental

---

## 🐛 Troubleshooting

### Error: "Prisma Client not generated"

```bash
npm run db:generate
```

### Error: "Cannot find module '@/lib/db'"

```bash
npm install
npm run build
```

### Error en Android: "SDK not found"

Instala Android Studio y configura `ANDROID_HOME`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Notificaciones no funcionan en Android

1. Verifica permisos en AndroidManifest.xml
2. Asegúrate de que Firebase esté configurado
3. Comprueba que el plugin esté registrado en MainActivity.java

---

## 📚 Recursos

- [Documentación Next.js](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
