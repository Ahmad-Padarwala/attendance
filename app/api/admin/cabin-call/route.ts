import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/auth';

// POST - Admin sends a cabin call to a staff member
export async function POST(request: NextRequest) {
    try {
        const authResult = requireAdmin(request);
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { staffId, message } = await request.json();

        // Validate input
        if (!staffId) {
            return NextResponse.json(
                { error: 'Staff ID is required' },
                { status: 400 }
            );
        }

        // Verify staff exists and is actually a staff member
        const staff = await prisma.user.findUnique({
            where: { id: parseInt(staffId) },
            select: { id: true, role: true, email: true, staffProfile: { select: { fullName: true } } },
        });

        if (!staff) {
            return NextResponse.json(
                { error: 'Staff member not found' },
                { status: 404 }
            );
        }

        if (staff.role !== 'STAFF') {
            return NextResponse.json(
                { error: 'User is not a staff member' },
                { status: 400 }
            );
        }

        // Create the cabin call
        const cabinCall = await prisma.cabinCall.create({
            data: {
                staffId: parseInt(staffId),
                adminId: authResult.user.userId,
                message: message || null,
                status: 'PENDING',
            },
            include: {
                staff: {
                    select: {
                        id: true,
                        email: true,
                        staffProfile: {
                            select: { fullName: true },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            call: cabinCall,
            message: `Call sent to ${staff.staffProfile?.fullName || staff.email}`,
        });
    } catch (error) {
        console.error('Send cabin call error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
