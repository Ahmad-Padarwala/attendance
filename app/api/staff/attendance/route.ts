import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: YYYY-MM
    const userId = authResult.user.userId;

    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const date = new Date(year, monthNum - 1, 1);
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    } else {
      // Default to current month
      const now = new Date();
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    // Get attendance records for the month
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        lunchBreaks: true,
      },
      orderBy: { date: 'desc' },
    });

    // Get today's status
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const todayRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId,
        date: new Date(todayDateString),
      },
      include: {
        lunchBreaks: true,
      },
    });

    let status = 'not_punched_in';
    let activeLunchBreak = null;

    if (todayRecord) {
      // Check if on leave
      if (todayRecord.workDone?.startsWith('ON_LEAVE')) {
        status = 'on_leave';
      } else if (todayRecord.punchOutTime) {
        status = 'punched_out';
      } else {
        activeLunchBreak = todayRecord.lunchBreaks.find(
          (lb) => !lb.lunchEndTime
        );
        if (activeLunchBreak) {
          status = 'on_lunch_break';
        } else {
          status = 'punched_in';
        }
      }
    }

    return NextResponse.json({
      success: true,
      attendanceRecords,
      todayStatus: {
        status,
        record: todayRecord,
        activeLunchBreak,
      },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

