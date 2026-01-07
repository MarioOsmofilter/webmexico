import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-strong p-8 md:p-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-600 mb-4">
            💧 Water CRM
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 mb-8">
            Sistema de Gestión para Empresas de Agua
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="card hover:shadow-medium transition-shadow">
              <h3 className="text-lg font-semibold text-primary-600 mb-2">
                🎯 Gestión Completa
              </h3>
              <p className="text-neutral-600 text-sm">
                Leads, clientes, propuestas, ventas, instalaciones y mantenimientos
              </p>
            </div>

            <div className="card hover:shadow-medium transition-shadow">
              <h3 className="text-lg font-semibold text-primary-600 mb-2">
                👥 Multi-Rol
              </h3>
              <p className="text-neutral-600 text-sm">
                Superadmin, Admin, Comerciales, Instaladores, Marketing y más
              </p>
            </div>

            <div className="card hover:shadow-medium transition-shadow">
              <h3 className="text-lg font-semibold text-primary-600 mb-2">
                📱 PWA Responsive
              </h3>
              <p className="text-neutral-600 text-sm">
                Funciona en móvil, tablet y ordenador. Instalable como app
              </p>
            </div>

            <div className="card hover:shadow-medium transition-shadow">
              <h3 className="text-lg font-semibold text-primary-600 mb-2">
                🗺️ Geolocalización
              </h3>
              <p className="text-neutral-600 text-sm">
                Rutas optimizadas, instalaciones verificadas y mapas integrados
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="btn btn-primary text-lg px-8 py-3">
              Iniciar Sesión
            </Link>
            <Link href="/docs" className="btn btn-secondary text-lg px-8 py-3">
              Documentación
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200">
            <p className="text-neutral-500 text-sm">
              Versión 1.0.0 | Desarrollado con Next.js 14, TypeScript, Prisma y PostgreSQL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
