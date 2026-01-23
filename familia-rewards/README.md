# 🏆 Familia Rewards

Sistema de recompensas familiar con gestión de puntos, tareas y control parental.

## 📋 Características

### Módulo Padre/Madre
- ✅ Crear perfiles de hijos con edad personalizada
- ✅ Asignar tareas y puntos según edad
- ✅ Validar/rechazar tareas completadas
- ✅ Configurar recompensas canjeables
- ✅ Sistema de puntos inteligente por edad
- ✅ **Control parental con notificaciones molestas persistentes**
- ✅ Historial completo de transacciones
- ✅ Dashboard con métricas en tiempo real

### Módulo Hijo/Hija
- ✅ Ver tareas asignadas
- ✅ Solicitar validación de tareas
- ✅ Ver puntos acumulados
- ✅ Canjear recompensas
- ✅ Sistema de rachas y logros
- ✅ Dashboard gamificado

### Módulo Pareja
- ✅ Sistema de puntos entre adultos
- ✅ Tareas compartidas del hogar
- ✅ Recompensas mutuas canjeables
- ✅ Intercambio de tareas

### 🔥 Control Parental (Notificaciones Molestas)
- ⚠️ **Notificaciones persistentes que NO se pueden cancelar**
- ⚠️ **Sonido y vibración automáticos cada X segundos**
- ⚠️ **Activación/desactivación remota desde app de padres**
- ⚠️ **El hijo NO puede detener las notificaciones**
- ⚠️ **Funciona incluso con la app cerrada**

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: TailwindCSS + shadcn/ui
- **Base de Datos**: Neon PostgreSQL (Serverless)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **PWA**: next-pwa
- **Mobile**: Capacitor (Android APK)
- **Notificaciones**: Firebase Cloud Messaging + Plugin Android Nativo
- **CI/CD**: GitHub Actions

## 📦 Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/tu-usuario/familia-rewards.git
cd familia-rewards
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://user:password@your-neon-host.neon.tech/familia_rewards?sslmode=require"
DIRECT_URL="postgresql://user:password@your-neon-host.neon.tech/familia_rewards?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-generado"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="tu-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="tu-app-id"
NEXT_PUBLIC_FIREBASE_VAPID_KEY="tu-vapid-key"
```

### 4. Configurar Base de Datos

#### Opción A: Usar Neon (Recomendado para producción)

1. Crear cuenta en [Neon.tech](https://neon.tech)
2. Crear nuevo proyecto
3. Copiar las URLs de conexión
4. Pegar en `.env`

#### Opción B: PostgreSQL local

```bash
# Instalar PostgreSQL localmente
DATABASE_URL="postgresql://postgres:password@localhost:5432/familia_rewards"
```

### 5. Generar Prisma Client y migrar BD

```bash
npm run db:generate
npm run db:push
```

### 6. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar **Cloud Messaging**
3. Obtener credenciales y VAPID key
4. Actualizar `public/firebase-messaging-sw.js` con tus credenciales
5. Agregar credenciales a `.env`

### 7. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📱 Compilar APK Android

### Requisitos previos
- Node.js 20+
- Java 17
- Android Studio (opcional, para testing)

### Pasos

1. **Build de Next.js**
```bash
npm run build
```

2. **Sincronizar Capacitor**
```bash
npx cap sync android
```

3. **Compilar APK Debug**
```bash
cd android
./gradlew assembleDebug
```

El APK se generará en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

4. **Compilar APK Release (firmado)**

Primero, crea un keystore:
```bash
keytool -genkey -v -keystore release.keystore -alias familia-rewards -keyalg RSA -keysize 2048 -validity 10000
```

Luego compila:
```bash
cd android
./gradlew assembleRelease
```

### 🤖 Compilación automática con GitHub Actions

El proyecto incluye workflows de GitHub Actions que compilan el APK automáticamente en cada push.

**Configurar secrets en GitHub:**
1. Ve a Settings → Secrets and variables → Actions
2. Añade los siguientes secrets:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - (resto de variables de Firebase)
   - `ANDROID_KEYSTORE_BASE64` (keystore en base64)
   - `KEYSTORE_PASSWORD`
   - `KEY_ALIAS`
   - `KEY_PASSWORD`

El APK se generará automáticamente y estará disponible en la pestaña **Actions** de GitHub.

## 🔧 Uso del Control Parental

### Desde la App de Padres

1. Ir al perfil del hijo
2. Activar "Modo Castigo"
3. Configurar:
   - Razón del castigo
   - Intervalo de notificaciones (segundos)
   - Duración (opcional)
4. Pulsar "Activar"

### ¿Qué pasa en el móvil del hijo?

- ⚠️ Comienzan a aparecer notificaciones cada X segundos
- ⚠️ Las notificaciones NO se pueden cancelar deslizando
- ⚠️ Sonido y vibración en cada notificación
- ⚠️ Aparecen incluso con la app cerrada
- ⚠️ Solo los padres pueden desactivarlo desde su app

### Código de ejemplo para activar castigo

```typescript
// En el componente del padre
const activarCastigo = async (childId: string) => {
  const response = await fetch('/api/punishment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      childId,
      isActive: true,
      reason: 'No hiciste los deberes',
      intervalSeconds: 30, // Cada 30 segundos
      endAt: null, // Indefinido hasta que se desactive
    }),
  });

  const data = await response.json();
  console.log(data.message);
};
```

## 🎨 Integración con v0.dev

Puedes usar v0.dev para generar componentes UI y luego copiarlos a:

```
src/components/ui/
src/components/padre/
src/components/hijo/
src/components/pareja/
```

## 📊 Sistema de Puntos por Edad

| Edad | Puntos Mínimos | Puntos Máximos | Tareas Sugeridas |
|------|----------------|----------------|------------------|
| 3-5 años | 5 | 20 | Recoger juguetes, lavarse dientes |
| 6-9 años | 10 | 50 | Hacer cama, deberes, leer |
| 10-14 años | 20 | 100 | Estudiar, ordenar habitación |
| 15-18 años | 30 | 200 | Responsabilidades mayores |

## 🏗️ Estructura del Proyecto

```
familia-rewards/
├── src/
│   ├── app/
│   │   ├── (padre)/       # Rutas dashboard padre
│   │   ├── (hijo)/        # Rutas dashboard hijo
│   │   ├── (pareja)/      # Rutas dashboard pareja
│   │   ├── api/           # API Routes
│   │   │   ├── auth/
│   │   │   ├── points/
│   │   │   ├── tasks/
│   │   │   ├── rewards/
│   │   │   └── punishment/  # ⚠️ Control parental
│   │   └── login/
│   ├── components/
│   │   ├── ui/            # shadcn/ui
│   │   ├── padre/
│   │   ├── hijo/
│   │   └── pareja/
│   ├── lib/
│   │   ├── db.ts          # Prisma client
│   │   ├── auth.ts        # NextAuth config
│   │   ├── firebase.ts    # Firebase config
│   │   └── persistent-notification.ts  # Plugin nativo
│   ├── hooks/
│   │   └── usePunishmentMonitor.ts  # Monitor de castigos
│   └── types/
├── prisma/
│   └── schema.prisma      # Schema de BD
├── android-plugin/        # Plugin Android nativo
├── .github/
│   └── workflows/
│       └── build-apk.yml  # CI/CD
└── public/
    ├── manifest.json      # PWA manifest
    └── firebase-messaging-sw.js
```

## 🔒 Seguridad

- ✅ Autenticación con NextAuth.js
- ✅ Roles y permisos (PARENT, CHILD, COUPLE)
- ✅ Validación en backend de todas las operaciones
- ✅ Queries protegidas por usuario/rol
- ✅ Variables de entorno para secrets
- ✅ Conexión segura a Neon PostgreSQL (SSL)

## 📝 Licencia

MIT

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Añadir nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📧 Soporte

Para preguntas o soporte, abre un issue en GitHub.

---

Desarrollado con ❤️ para familias
