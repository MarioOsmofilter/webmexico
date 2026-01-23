# ⚡ Quick Start - 5 Minutos

Guía ultra-rápida para tener la app funcionando en 5 minutos.

## 1️⃣ Instalar (1 min)

```bash
cd familia-rewards
npm install
```

## 2️⃣ Configurar Neon DB (2 min)

1. **Ir a** [neon.tech](https://neon.tech) y crear cuenta
2. **Crear proyecto** llamado `familia-rewards`
3. **Copiar** la connection string que te dan
4. **Crear** archivo `.env`:

```bash
cp .env.example .env
```

5. **Pegar** la connection string en `.env`:

```env
DATABASE_URL="tu-connection-string-aqui"
DIRECT_URL="tu-connection-string-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cualquier-string-aleatorio-largo"
```

## 3️⃣ Setup Base de Datos (1 min)

```bash
npm run db:generate
npm run db:push
```

## 4️⃣ Arrancar (1 min)

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 5️⃣ Crear Usuario Demo

Opción rápida - ejecuta en la consola del navegador (F12):

```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'padre@demo.com',
    password: 'Demo123!',
    name: 'Padre Demo',
    role: 'PARENT'
  })
}).then(r => r.json()).then(console.log)
```

**Espera...** necesitas crear primero el endpoint de registro.

### Crear endpoint de registro

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

Ahora sí, ejecuta el fetch anterior.

## 6️⃣ Login

1. Ve a [http://localhost:3000/login](http://localhost:3000/login)
2. Email: `padre@demo.com`
3. Password: `Demo123!`

## ✅ ¡Listo!

Ya tienes la app funcionando localmente.

---

## 🚀 Siguiente: Compilar APK

```bash
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK en: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔥 Probar Control Parental

1. Crear perfil de hijo desde el dashboard padre
2. Crear usuario hijo con rol CHILD
3. Activar "Modo Castigo" en el dashboard padre
4. Abrir app en móvil del hijo
5. **¡Las notificaciones molestas empezarán a aparecer!** 🚨

---

## ❓ ¿Problemas?

Lee `SETUP.md` para instrucciones detalladas.

## 🎯 Firebase (Opcional)

Si quieres notificaciones push:

1. Crear proyecto en [firebase.google.com](https://firebase.google.com)
2. Copiar credenciales a `.env`
3. Listo

Sin Firebase, la app funciona igual pero sin push notifications.

---

**¡Disfruta de Familia Rewards!** 🏆
