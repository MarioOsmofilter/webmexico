import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// PATCH - Completar o validar tarea
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { taskId } = await params;
    const { action, reviewNote } = await req.json();

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        child: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    // HIJO: Marcar tarea como completada
    if (action === 'complete' && session.user.role === 'CHILD') {
      const child = await db.child.findUnique({
        where: { userId: session.user.id },
      });

      if (!child || child.id !== task.childId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }

      if (task.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'La tarea no está pendiente' },
          { status: 400 }
        );
      }

      const updatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Notificar al padre
      await db.notification.create({
        data: {
          senderId: session.user.id,
          type: 'TASK_COMPLETED',
          title: '✅ Tarea completada',
          message: `${child.name} completó: ${task.title}`,
        },
      });

      return NextResponse.json({ success: true, task: updatedTask });
    }

    // PADRE: Aprobar o rechazar tarea
    if (
      (action === 'approve' || action === 'reject') &&
      session.user.role === 'PARENT'
    ) {
      if (task.child.parentId !== session.user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }

      if (task.status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'La tarea no está completada' },
          { status: 400 }
        );
      }

      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

      const updatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: newStatus,
          reviewedAt: new Date(),
          reviewNote,
        },
      });

      if (action === 'approve') {
        // Añadir puntos al hijo
        await db.pointTransaction.create({
          data: {
            childId: task.childId,
            points: task.points,
            reason: `Tarea aprobada: ${task.title}`,
            taskId: task.id,
          },
        });

        await db.child.update({
          where: { id: task.childId },
          data: {
            totalPoints: {
              increment: task.points,
            },
            lifetimePoints: {
              increment: task.points,
            },
          },
        });

        // Notificar al hijo
        await db.notification.create({
          data: {
            childId: task.childId,
            senderId: session.user.id,
            type: 'TASK_APPROVED',
            title: '🎉 ¡Tarea aprobada!',
            message: `+${task.points} puntos por: ${task.title}`,
          },
        });
      } else {
        // Notificar rechazo
        await db.notification.create({
          data: {
            childId: task.childId,
            senderId: session.user.id,
            type: 'TASK_REJECTED',
            title: '❌ Tarea rechazada',
            message: `${task.title}${reviewNote ? `: ${reviewNote}` : ''}`,
          },
        });
      }

      return NextResponse.json({ success: true, task: updatedTask });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tarea' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar tarea (solo padres)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { taskId } = await params;

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        child: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    if (task.child.parentId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await db.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Error al eliminar tarea' },
      { status: 500 }
    );
  }
}
