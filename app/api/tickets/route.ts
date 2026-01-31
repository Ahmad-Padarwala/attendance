import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET all tickets (public to all authenticated users)
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
        const assignedToId = searchParams.get('assignedToId');
        const priority = searchParams.get('priority');
        const ticketType = searchParams.get('type');
        const search = searchParams.get('search');
        const projectId = searchParams.get('projectId');

        const where: any = {};

        // Only add to where clause if value exists and is not empty
        if (status && status !== '' && status.trim() !== '') {
            where.status = status;
        }
        if (assignedToId && assignedToId !== '') {
            if (assignedToId === 'unassigned') {
                where.assignedToId = null;
            } else {
                where.assignedToId = parseInt(assignedToId);
            }
        }
        if (priority && priority !== '' && priority.trim() !== '') {
            where.priority = priority;
        }
        if (ticketType && ticketType !== '' && ticketType.trim() !== '') {
            where.ticketType = ticketType;
        }
        if (projectId && projectId !== '' && projectId !== 'all') {
            if (projectId === 'unassigned') {
                where.projectId = null;
            } else {
                where.projectId = parseInt(projectId);
            }
        }
        if (search && search.trim() !== '') {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { ticketNumber: { contains: search } },
            ];
        }

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                project: true,
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
