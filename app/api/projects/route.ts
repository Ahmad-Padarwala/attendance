import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects - Get all projects
export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: { tickets: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, color } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                name,
                description: description || null,
                color: color || '#3B82F6'
            }
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
