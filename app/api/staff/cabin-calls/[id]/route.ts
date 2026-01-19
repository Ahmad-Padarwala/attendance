import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';

// PUT - Staff acknowledges or dismisses a cabin call
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('=== Acknowledge Call API Called ===');

        const authResult = requireAuth(request);
        if ('error' in authResult) {
            console.log('Auth failed:', authResult.error);
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        console.log('Auth successful, user:', authResult.user);

        const { status } = await request.json();
        const resolvedParams = await params;
        const callId = parseInt(resolvedParams.id);

        console.log('Call ID:', callId, 'Status:', status);

        // Validate status
        if (!status || !['ACKNOWLEDGED', 'DISMISSED'].includes(status)) {
            console.log('Invalid status provided:', status);
            return NextResponse.json(
                { error: 'Invalid status. Must be ACKNOWLEDGED or DISMISSED' },
                { status: 400 }
            );
        }

        // Verify the call exists and belongs to this staff member
        console.log('Looking for call with ID:', callId);
        const existingCall = await prisma.cabinCall.findUnique({
            where: { id: callId },
        });

        console.log('Existing call:', existingCall);

        if (!existingCall) {
            console.log('Call not found');
            return NextResponse.json(
                { error: 'Call not found' },
                { status: 404 }
            );
        }

        console.log('Checking ownership - Call staffId:', existingCall.staffId, 'User ID:', authResult.user.userId);

        if (existingCall.staffId !== authResult.user.userId) {
            console.log('Unauthorized - staff mismatch');
            return NextResponse.json(
                { error: 'Unauthorized to update this call' },
                { status: 403 }
            );
        }

        // Update the call status
        console.log('Updating call status to:', status);
        const updatedCall = await prisma.cabinCall.update({
            where: { id: callId },
            data: {
                status,
                acknowledgedAt: new Date(),
            },
        });

        console.log('Call updated successfully:', updatedCall);
        return NextResponse.json({
            success: true,
            call: updatedCall,
        });
    } catch (error) {
        console.error('Update cabin call error:', error);
        // Log more details for debugging
        if (error instanceof Error) {
            console.error('Error details:', error.message, error.stack);
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
