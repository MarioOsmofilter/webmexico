import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Añadir/restar puntos a un hijo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { childId, points, reason } = await req.json();

    if (!childId || !points || !reason) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el hijo pertenece al padre
    const child = await db.child.findFirst({
      where: {
        id: childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: 'Hijo no encontrado' }, { status: 404 });
    }

    // Crear transacción de puntos
    const transaction = await db.pointTransaction.create({
      data: {
        childId,
        points: parseInt(points),
        reason,
      },
    });

    // Actualizar puntos del hijo
    const updatedChild = await db.child.update({
      where: { id: childId },
      data: {
        totalPoints: {
          increment: parseInt(points),
        },
        lifetimePoints: {
          increment: parseInt(points) > 0 ? parseInt(points) : 0,
        },
      },
    });

    // Crear notificación para el hijo
    await db.notification.create({
      data: {
        childId,
        senderId: session.user.id,
        type: parseInt(points) > 0 ? 'TASK_APPROVED' : 'TASK_REJECTED',
        title: parseInt(points) > 0 ? '¡Puntos ganados!' : 'Puntos perdidos',
        message: `${parseInt(points) > 0 ? '+' : ''}${points} puntos: ${reason}`,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      child: updatedChild,
    });
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json(
      { error: 'Error al añadir puntos' },
      { status: 500 }
    );
  }
}

// GET - Obtener historial de puntos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');

    if (!childId) {
      return NextResponse.json(
        { error: 'childId es requerido' },
        { status: 400 }
      );
    }

    // Verificar permisos
    if (session.user.role === 'PARENT') {
      const child = await db.child.findFirst({
        where: {
          id: childId,
          parentId: session.user.id,
        },
      });

      if (!child) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'CHILD') {
      const child = await db.child.findFirst({
        where: {
          id: childId,
          userId: session.user.id,
        },
      });

      if (!child) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
    }

    const transactions = await db.pointTransaction.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
