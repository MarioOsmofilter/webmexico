import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Crear recompensa (solo padres)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { title, description, pointsCost, category, icon } = await req.json();

    if (!title || !pointsCost) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    const reward = await db.reward.create({
      data: {
        parentId: session.user.id,
        title,
        description,
        pointsCost: parseInt(pointsCost),
        category: category || 'CUSTOM',
        icon,
      },
    });

    return NextResponse.json({ success: true, reward });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: 'Error al crear recompensa' },
      { status: 500 }
    );
  }
}

// GET - Obtener recompensas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let rewards;

    if (session.user.role === 'PARENT') {
      rewards = await db.reward.findMany({
        where: { parentId: session.user.id },
        orderBy: { pointsCost: 'asc' },
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

      rewards = await db.reward.findMany({
        where: {
          parentId: child.parentId,
          isActive: true,
        },
        orderBy: { pointsCost: 'asc' },
      });
    }

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Error al obtener recompensas' },
      { status: 500 }
    );
  }
}
