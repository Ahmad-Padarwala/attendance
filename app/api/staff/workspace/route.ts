import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Fetch all workspaces for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

        if (decoded.role !== 'STAFF') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const workspaces = await prisma.workspace.findMany({
            where: {
                userId: decoded.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ workspaces });
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
    }
}

// POST - Create a new workspace
export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

        if (decoded.role !== 'STAFF') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { title, link, description } = await req.json();

        // Validation
        if (!title || !link || !description) {
            return NextResponse.json({ error: 'Title, link, and description are required' }, { status: 400 });
        }

        if (title.length > 200) {
            return NextResponse.json({ error: 'Title must be less than 200 characters' }, { status: 400 });
        }

        // Basic URL validation
        try {
            new URL(link);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        const workspace = await prisma.workspace.create({
            data: {
                userId: decoded.userId,
                title,
                link,
                description,
            },
        });

        return NextResponse.json({ workspace }, { status: 201 });
    } catch (error) {
        console.error('Error creating workspace:', error);
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
    }
}
