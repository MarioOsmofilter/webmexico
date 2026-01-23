import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Activar/desactivar castigo (notificaciones molestas)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { childId, isActive, reason, intervalSeconds, endAt } =
      await req.json();

    if (!childId) {
      return NextResponse.json(
        { error: 'childId es requerido' },
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

    // Buscar o crear estado de castigo
    let punishmentState = await db.punishmentState.findUnique({
      where: { childId },
    });

    if (punishmentState) {
      // Actualizar estado existente
      punishmentState = await db.punishmentState.update({
        where: { childId },
        data: {
          isActive,
          reason: reason || punishmentState.reason,
          intervalSeconds: intervalSeconds || punishmentState.intervalSeconds,
          endAt: endAt ? new Date(endAt) : null,
        },
      });
    } else {
      // Crear nuevo estado
      punishmentState = await db.punishmentState.create({
        data: {
          childId,
          isActive,
          reason: reason || 'Castigo activado',
          intervalSeconds: intervalSeconds || 30, // Por defecto cada 30 segundos
          endAt: endAt ? new Date(endAt) : null,
        },
      });
    }

    // Crear notificación para el hijo
    await db.notification.create({
      data: {
        childId,
        senderId: session.user.id,
        type: isActive ? 'PUNISHMENT_ACTIVE' : 'TASK_ASSIGNED',
        title: isActive ? '🚨 Castigo Activado' : '✅ Castigo Desactivado',
        message: isActive
          ? `${reason || 'Tu dispositivo está siendo restringido'}`
          : 'El castigo ha sido desactivado',
      },
    });

    return NextResponse.json({
      success: true,
      punishmentState,
      message: isActive
        ? 'Castigo activado. El hijo recibirá notificaciones persistentes.'
        : 'Castigo desactivado.',
    });
  } catch (error) {
    console.error('Error managing punishment:', error);
    return NextResponse.json(
      { error: 'Error al gestionar castigo' },
      { status: 500 }
    );
  }
}

// GET - Obtener estado de castigo
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

    const punishmentState = await db.punishmentState.findUnique({
      where: { childId },
    });

    if (!punishmentState) {
      return NextResponse.json({
        isActive: false,
        message: 'No hay castigo activo',
      });
    }

    // Verificar si el castigo ha expirado
    if (punishmentState.endAt && new Date() > punishmentState.endAt) {
      await db.punishmentState.update({
        where: { childId },
        data: { isActive: false },
      });

      return NextResponse.json({
        isActive: false,
        message: 'Castigo expirado',
      });
    }

    return NextResponse.json({
      isActive: punishmentState.isActive,
      punishmentState,
    });
  } catch (error) {
    console.error('Error fetching punishment state:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de castigo' },
      { status: 500 }
    );
  }
}
