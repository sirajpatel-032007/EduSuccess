import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, type, notes } = body;

    if (!studentId || !type) {
      return NextResponse.json({ error: 'Missing studentId or type' }, { status: 400 });
    }

    const intervention = await prisma.intervention.create({
      data: {
        studentId,
        type,
        notes: notes || 'Manually added by administrator',
        status: 'recommended'
      }
    });

    return NextResponse.json(intervention);
  } catch (error: any) {
    console.error('Error creating intervention:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const updated = await prisma.intervention.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating intervention:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
