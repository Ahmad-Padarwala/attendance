import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/auth';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: YYYY-MM
    const resolvedParams = await params;
    const staffId = parseInt(resolvedParams.id);

    // Get staff details
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      include: {
        staffProfile: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

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
        userId: staffId,
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

    // Get holidays for the month
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate statistics
    const totalHoursWorked = attendanceRecords.reduce(
      (sum, record) => sum + (Number(record.workingHours) || 0),
      0
    );

    const completedDays = attendanceRecords.filter(
      (r) => r.punchInTime && r.punchOutTime
    ).length;

    // Calculate expected working hours
    const DAY_NAMES = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const workingDays = staff.staffProfile
      ? JSON.parse(staff.staffProfile.workingDays)
      : [];
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const holidayDates = new Set(
      holidays.map((h) => new Date(h.date).toISOString().split('T')[0])
    );

    // Count expected working days (excluding holidays)
    const expectedWorkingDays = days.filter((day) => {
      const dayName = DAY_NAMES[getDay(day)];
      const dateKey = day.toISOString().split('T')[0];
      return workingDays.includes(dayName) && !holidayDates.has(dateKey);
    }).length;

    // Calculate expected hours based on office hours
    let expectedDailyHours = 8; // default
    if (staff.staffProfile) {
      const [inHour, inMin] = staff.staffProfile.officeTimeIn.split(':').map(Number);
      const [outHour, outMin] = staff.staffProfile.officeTimeOut.split(':').map(Number);
      const inMinutes = inHour * 60 + inMin;
      const outMinutes = outHour * 60 + outMin;
      expectedDailyHours = (outMinutes - inMinutes) / 60;
    }

    const expectedTotalHours = expectedWorkingDays * expectedDailyHours;

    const { password: _, ...staffWithoutPassword } = staff;

    return NextResponse.json({
      success: true,
      staff: staffWithoutPassword,
      attendanceRecords,
      holidays,
      statistics: {
        totalHoursWorked: Number(totalHoursWorked.toFixed(2)),
        expectedTotalHours: Number(expectedTotalHours.toFixed(2)),
        completedDays,
        expectedWorkingDays,
        totalRecords: attendanceRecords.length,
      },
    });
  } catch (error) {
    console.error('Get staff attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

