import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// PUT - Update a workspace
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

        if (decoded.role !== 'STAFF') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { id } = await params;
        const workspaceId = parseInt(id);

        if (isNaN(workspaceId)) {
            return NextResponse.json({ error: 'Invalid workspace ID' }, { status: 400 });
        }

        // Check if workspace exists and belongs to user
        const existingWorkspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!existingWorkspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        if (existingWorkspace.userId !== decoded.userId) {
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

        const workspace = await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                title,
                link,
                description,
            },
        });

        return NextResponse.json({ workspace });
    } catch (error) {
        console.error('Error updating workspace:', error);
        return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
    }
}

// DELETE - Delete a workspace
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

        if (decoded.role !== 'STAFF') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { id } = await params;
        const workspaceId = parseInt(id);

        if (isNaN(workspaceId)) {
            return NextResponse.json({ error: 'Invalid workspace ID' }, { status: 400 });
        }

        // Check if workspace exists and belongs to user
        const existingWorkspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!existingWorkspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        if (existingWorkspace.userId !== decoded.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await prisma.workspace.delete({
            where: { id: workspaceId },
        });

        return NextResponse.json({ message: 'Workspace deleted successfully' });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
    }
}
