import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET tickets assigned to staff
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      assignedToId: decoded.userId,
    };
    // Only add status filter if value exists and is not empty
    if (status && status !== '' && status.trim() !== '') {
      where.status = status;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        assignedTo: {
          include: {
            staffProfile: true,
          },
        },
        createdBy: {
          include: {
            staffProfile: true,
          },
        },
        comments: {
          include: {
            user: {
              include: {
                staffProfile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

