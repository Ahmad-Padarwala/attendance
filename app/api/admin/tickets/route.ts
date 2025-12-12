import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET all tickets (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');
    const priority = searchParams.get('priority');

    const where: any = {};
    // Only add to where clause if value exists and is not empty
    if (status && status !== '' && status.trim() !== '') {
      where.status = status;
    }
    if (assignedToId && assignedToId !== '') {
      where.assignedToId = parseInt(assignedToId);
    }
    if (priority && priority !== '' && priority.trim() !== '') {
      where.priority = priority;
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

// POST create new ticket (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
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

    // Generate ticket number (don't use any filters)
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

