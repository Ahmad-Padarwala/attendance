import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';

export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('id');

    if (!recordId) {
      return NextResponse.json(
        { error: 'Attendance record ID is required' },
        { status: 400 }
      );
    }

    const userId = authResult.user.userId;

    // Find the attendance record
    const record = await prisma.attendanceRecord.findUnique({
      where: { id: parseInt(recordId) },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    // Check if the record belongs to the user
    if (record.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own attendance records' },
        { status: 403 }
      );
    }

    // Delete the attendance record (cascade will delete lunch breaks)
    await prisma.attendanceRecord.delete({
      where: { id: parseInt(recordId) },
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

