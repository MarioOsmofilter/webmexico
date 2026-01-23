import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function PadreDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PARENT') {
    redirect('/login');
  }

  const children = await db.child.findMany({
    where: { parentId: session.user.id },
    include: {
      tasks: {
        where: { status: 'COMPLETED' },
        take: 5,
      },
      _count: {
        select: {
          tasks: true,
          pointsHistory: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const pendingTasks = await db.task.count({
    where: {
      child: { parentId: session.user.id },
      status: 'COMPLETED',
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              🏠 Panel de Padre
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {session.user.name || session.user.email}
            </p>
          </div>
          <Button variant="destructive" onClick={() => {/* Logout */}}>
            Salir
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hijos</CardTitle>
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{children.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Perfiles activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <span className="text-2xl">⏳</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tareas por validar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
              <span className="text-2xl">⭐</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {children.reduce((acc, child) => acc + child.totalPoints, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulados en familia
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Children List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">👶</div>
                <h3 className="text-xl font-semibold mb-2">
                  No hay hijos registrados
                </h3>
                <p className="text-muted-foreground mb-4">
                  Añade el perfil de tu primer hijo para comenzar
                </p>
                <Button>Añadir Hijo</Button>
              </CardContent>
            </Card>
          ) : (
            children.map((child) => (
              <Card key={child.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: child.color + '20' }}
                    >
                      {child.avatar || '👤'}
                    </div>
                    <div>
                      <CardTitle>{child.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {child.age} años
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Puntos:</span>
                      <span className="text-2xl font-bold text-primary">
                        {child.totalPoints}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Racha:</span>
                      <span className="text-lg font-semibold">
                        🔥 {child.streak} días
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tareas:</span>
                      <span className="text-sm">
                        {child._count.tasks} completadas
                      </span>
                    </div>
                    <div className="pt-3 flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        Ver perfil
                      </Button>
                      <Button className="flex-1" size="sm">
                        Gestionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-20 text-lg" variant="outline">
            ➕ Añadir Hijo
          </Button>
          <Button className="h-20 text-lg" variant="outline">
            ✅ Validar Tareas
          </Button>
          <Button className="h-20 text-lg" variant="outline">
            🎁 Recompensas
          </Button>
          <Button className="h-20 text-lg" variant="outline">
            💑 Módulo Pareja
          </Button>
        </div>
      </div>
    </div>
  );
}
