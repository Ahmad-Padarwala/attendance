import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST create new ticket (staff can create tickets)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, assignedToId, priority, dueDate } = body;

    if (!title || !description || !dueDate) {
      return NextResponse.json(
        { error: 'Title, description, and due date are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Generate ticket number
    const lastTicket = await prisma.ticket.findFirst({
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
      },
    });

    const ticketNumber = lastTicket
      ? `TKT-${String(lastTicket.id + 1).padStart(4, '0')}`
      : 'TKT-0001';

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        dueDate: parsedDate,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        createdById: decoded.userId,
      },
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
        comments: true,
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create ticket: ' + errorMessage },
      { status: 500 }
    );
  }
}

