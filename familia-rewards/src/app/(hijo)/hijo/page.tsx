import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default async function HijoDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'CHILD') {
    redirect('/login');
  }

  const childProfile = await db.child.findUnique({
    where: { userId: session.user.id },
    include: {
      tasks: {
        where: {
          OR: [
            { status: 'PENDING' },
            { status: 'COMPLETED' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      badges: {
        include: {
          badge: true,
        },
        take: 5,
        orderBy: { earnedAt: 'desc' },
      },
      punishmentState: true,
    },
  });

  if (!childProfile) {
    return <div>Perfil no encontrado</div>;
  }

  const rewards = await db.reward.findMany({
    where: {
      isActive: true,
      parentId: childProfile.parentId,
    },
    orderBy: { pointsCost: 'asc' },
    take: 6,
  });

  const nextReward = rewards.find(r => r.pointsCost > childProfile.totalPoints);
  const progress = nextReward
    ? (childProfile.totalPoints / nextReward.pointsCost) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con Puntos */}
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl mb-4 animate-bounce-soft">
            <span className="text-6xl">⭐</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-2">
            {childProfile.totalPoints}
          </h1>
          <p className="text-xl text-gray-600 font-semibold">Puntos</p>
          <p className="text-sm text-gray-500 mt-1">
            ¡Hola {childProfile.name}! 👋
          </p>
        </div>

        {/* Racha */}
        {childProfile.streak > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-2">🔥</div>
              <p className="text-3xl font-bold">{childProfile.streak} días</p>
              <p className="text-sm opacity-90">¡Racha increíble! Sigue así</p>
            </CardContent>
          </Card>
        )}

        {/* Progreso hacia siguiente recompensa */}
        {nextReward && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Próxima Recompensa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{nextReward.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {childProfile.totalPoints} / {nextReward.pointsCost} pts
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-center text-muted-foreground">
                  ¡Te faltan {nextReward.pointsCost - childProfile.totalPoints} puntos!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tareas del día */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ Mis Tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {childProfile.tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-4xl mb-2">🎉</p>
                <p>¡No tienes tareas pendientes!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {childProfile.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 ${
                      task.status === 'COMPLETED'
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-semibold text-primary">
                            +{task.points} puntos
                          </span>
                          {task.status === 'COMPLETED' && (
                            <span className="text-xs text-yellow-600 font-medium">
                              ⏳ Esperando aprobación
                            </span>
                          )}
                        </div>
                      </div>
                      {task.status === 'PENDING' && (
                        <Button size="sm">¡Hecho!</Button>
                      )}
                      {task.status === 'COMPLETED' && (
                        <div className="text-3xl">⏳</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recompensas disponibles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎁 Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {rewards.slice(0, 4).map((reward) => {
                const canRedeem = childProfile.totalPoints >= reward.pointsCost;
                return (
                  <div
                    key={reward.id}
                    className={`p-4 rounded-lg border-2 text-center ${
                      canRedeem
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="text-3xl mb-2">{reward.icon || '🎁'}</div>
                    <p className="font-semibold text-sm mb-1">{reward.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {reward.pointsCost} pts
                    </p>
                    {canRedeem && (
                      <Button size="sm" className="w-full">
                        Canjear
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        {childProfile.badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏅 Mis Logros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {childProfile.badges.map((childBadge) => (
                  <div
                    key={childBadge.id}
                    className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <span className="text-3xl mb-1">
                      {childBadge.badge.icon}
                    </span>
                    <span className="text-xs font-semibold text-center">
                      {childBadge.badge.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
