import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Crear nueva tarea (solo padres)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { childId, title, description, points, frequency, dueDate } =
      await req.json();

    if (!childId || !title || !points) {
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

    const task = await db.task.create({
      data: {
        childId,
        title,
        description,
        points: parseInt(points),
        frequency: frequency || 'ONCE',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Notificar al hijo
    await db.notification.create({
      data: {
        childId,
        senderId: session.user.id,
        type: 'TASK_ASSIGNED',
        title: '📝 Nueva tarea asignada',
        message: `${title} - ${points} puntos`,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Error al crear tarea' },
      { status: 500 }
    );
  }
}

// GET - Obtener tareas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');
    const status = searchParams.get('status');

    let tasks;

    if (session.user.role === 'PARENT') {
      const query: any = {};

      if (childId) {
        // Verificar que el hijo pertenece al padre
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

        query.childId = childId;
      } else {
        // Obtener tareas de todos los hijos del padre
        const children = await db.child.findMany({
          where: { parentId: session.user.id },
          select: { id: true },
        });

        query.childId = { in: children.map((c) => c.id) };
      }

      if (status) {
        query.status = status;
      }

      tasks = await db.task.findMany({
        where: query,
        include: {
          child: {
            select: {
              id: true,
              name: true,
              avatar: true,
              color: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (session.user.role === 'CHILD') {
      const child = await db.child.findUnique({
        where: { userId: session.user.id },
      });

      if (!child) {
        return NextResponse.json(
          { error: 'Perfil no encontrado' },
          { status: 404 }
        );
      }

      const query: any = { childId: child.id };

      if (status) {
        query.status = status;
      }

      tasks = await db.task.findMany({
        where: query,
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas' },
      { status: 500 }
    );
  }
}
