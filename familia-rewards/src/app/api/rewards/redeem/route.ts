import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Canjear recompensa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { rewardId } = await req.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: 'rewardId es requerido' },
        { status: 400 }
      );
    }

    const child = await db.child.findUnique({
      where: { userId: session.user.id },
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    const reward = await db.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: 'Recompensa no encontrada' },
        { status: 404 }
      );
    }

    if (!reward.isActive) {
      return NextResponse.json(
        { error: 'Recompensa no disponible' },
        { status: 400 }
      );
    }

    if (child.totalPoints < reward.pointsCost) {
      return NextResponse.json(
        { error: 'Puntos insuficientes' },
        { status: 400 }
      );
    }

    // Crear canje
    const redemption = await db.rewardRedemption.create({
      data: {
        childId: child.id,
        rewardId: reward.id,
        pointsUsed: reward.pointsCost,
      },
    });

    // Restar puntos al hijo
    await db.child.update({
      where: { id: child.id },
      data: {
        totalPoints: {
          decrement: reward.pointsCost,
        },
      },
    });

    // Crear transacción de puntos
    await db.pointTransaction.create({
      data: {
        childId: child.id,
        points: -reward.pointsCost,
        reason: `Recompensa canjeada: ${reward.title}`,
      },
    });

    // Notificar al padre
    await db.notification.create({
      data: {
        senderId: session.user.id,
        type: 'REWARD_REDEEMED',
        title: '🎁 Recompensa canjeada',
        message: `${child.name} canjeó: ${reward.title}`,
      },
    });

    return NextResponse.json({ success: true, redemption });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { error: 'Error al canjear recompensa' },
      { status: 500 }
    );
  }
}
