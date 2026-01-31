import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id] - Get a single project
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tickets: {
                    include: {
                        assignedTo: {
                            include: {
                                staffProfile: true
                            }
                        },
                        comments: true
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);
        const body = await request.json();
        const { name, description, color } = body;

        const project = await prisma.project.update({
            where: { id: projectId },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(color && { color })
            }
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);

        // Check if project has tickets
        const ticketCount = await prisma.ticket.count({
            where: { projectId }
        });

        if (ticketCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete project with ${ticketCount} ticket(s). Please reassign or delete tickets first.` },
                { status: 400 }
            );
        }

        await prisma.project.delete({
            where: { id: projectId }
        });

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
