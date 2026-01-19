import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';

// GET - Staff retrieves pending cabin calls
export async function GET(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        // Get all pending calls for this staff member
        const pendingCalls = await prisma.cabinCall.findMany({
            where: {
                staffId: authResult.user.userId,
                status: 'PENDING',
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        email: true,
                        staffProfile: {
                            select: { fullName: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            calls: pendingCalls,
        });
    } catch (error) {
        console.error('Get cabin calls error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
