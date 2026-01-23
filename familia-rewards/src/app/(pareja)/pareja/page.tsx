import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function ParejaDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Buscar perfil de pareja
  const coupleProfile = await db.coupleProfile.findFirst({
    where: {
      OR: [
        { userAId: session.user.id },
        { userBId: session.user.id },
      ],
    },
    include: {
      userA: true,
      userB: true,
      coupleTasks: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      coupleRewards: {
        take: 6,
        orderBy: { pointsCost: 'asc' },
      },
    },
  });

  if (!coupleProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Módulo Pareja</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No tienes un perfil de pareja configurado.
            </p>
            <Button>Configurar Pareja</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isUserA = coupleProfile.userAId === session.user.id;
  const myPoints = isUserA ? coupleProfile.pointsUserA : coupleProfile.pointsUserB;
  const partnerPoints = isUserA ? coupleProfile.pointsUserB : coupleProfile.pointsUserA;
  const partner = isUserA ? coupleProfile.userB : coupleProfile.userA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">💑 Módulo Pareja</h1>
          <p className="text-muted-foreground">
            {session.user.name} & {partner.name}
          </p>
        </div>

        {/* Puntos Comparados */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <p className="text-sm opacity-90 mb-2">Tus Puntos</p>
              <p className="text-5xl font-bold mb-1">{myPoints}</p>
              <p className="text-sm opacity-75">{session.user.name}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <p className="text-sm opacity-90 mb-2">Puntos de {partner.name}</p>
              <p className="text-5xl font-bold mb-1">{partnerPoints}</p>
              <p className="text-sm opacity-75">{partner.name}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tareas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Tareas de Pareja
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coupleProfile.coupleTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">✨</p>
                <p className="text-muted-foreground mb-4">
                  No hay tareas configuradas
                </p>
                <Button>Crear Primera Tarea</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {coupleProfile.coupleTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <p className="text-xs text-primary font-semibold mt-1">
                          +{task.points} puntos
                        </p>
                      </div>
                      <Button size="sm">Completar</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recompensas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎁 Recompensas de Pareja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupleProfile.coupleRewards.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-4xl mb-2">🎯</p>
                  <p className="text-muted-foreground mb-4">
                    No hay recompensas configuradas
                  </p>
                  <Button>Crear Recompensa</Button>
                </div>
              ) : (
                coupleProfile.coupleRewards.map((reward) => {
                  const canRedeem = myPoints >= reward.pointsCost;
                  return (
                    <Card
                      key={reward.id}
                      className={canRedeem ? 'border-green-500' : ''}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">
                          {reward.icon || '🎁'}
                        </div>
                        <p className="font-semibold mb-1">{reward.title}</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {reward.description}
                        </p>
                        <p className="text-xs font-semibold text-primary mb-3">
                          {reward.pointsCost} puntos
                        </p>
                        {canRedeem && (
                          <Button size="sm" className="w-full">
                            Canjear
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
