import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/middleware/auth';

// Helper function to determine staff status
async function getStaffStatus(userId: number, dateString: string) {
  const record = await prisma.attendanceRecord.findFirst({
    where: {
      userId,
      date: new Date(dateString),
    },
    include: {
      lunchBreaks: true,
    },
  });

  let status = 'not_punched_in';
  let punchInTime = null;
  let punchOutTime = null;
  let workingHours = null;
  let lunchBreaks: any[] = [];
  let totalLunchMinutes = 0;
  let netWorkingHours = null;

  if (record) {
    punchInTime = record.punchInTime;
    punchOutTime = record.punchOutTime;
    workingHours = record.workingHours;

    // Process lunch breaks
    lunchBreaks = record.lunchBreaks.map((lb) => {
      let duration = lb.duration;

      // Calculate duration if not stored and lunch ended
      if (!duration && lb.lunchEndTime) {
        const start = new Date(lb.lunchStartTime).getTime();
        const end = new Date(lb.lunchEndTime).getTime();
        duration = Math.round((end - start) / (1000 * 60)); // minutes
      }

      if (duration) {
        totalLunchMinutes += duration;
      }

      return {
        lunchStartTime: lb.lunchStartTime,
        lunchEndTime: lb.lunchEndTime,
        duration: duration,
      };
    });

    // Calculate net working hours (excluding lunch time)
    if (workingHours !== null && totalLunchMinutes > 0) {
      const lunchHours = totalLunchMinutes / 60;
      netWorkingHours = Math.max(0, Number(workingHours) - lunchHours);
    } else if (workingHours !== null) {
      netWorkingHours = Number(workingHours);
    }

    // Check if on leave
    if (record.workDone?.startsWith('ON_LEAVE')) {
      status = 'on_leave';
    } else if (record.punchOutTime) {
      status = 'punched_out';
    } else {
      // Only check for active lunch/punch-in if it's today
      const today = new Date().toISOString().split('T')[0];
      if (dateString === today) {
        const activeLunchBreak = record.lunchBreaks.find(
          (lb) => !lb.lunchEndTime
        );
        if (activeLunchBreak) {
          status = 'on_lunch_break';
        } else {
          status = 'punched_in';
        }
      } else {
        // For past dates, if there's no punch out, it's incomplete
        status = 'punched_in';
      }
    }
  }

  return {
    status,
    punchInTime,
    punchOutTime,
    workingHours,
    lunchBreaks,
    totalLunchMinutes,
    netWorkingHours
  };
}

// GET all staff
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get date parameter from query, default to today
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const selectedDate = dateParam || new Date().toISOString().split('T')[0];

    const staff = await prisma.user.findMany({
      where: { role: 'STAFF' },
      include: {
        staffProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get status for each staff member for the selected date
    const staffWithStatus = await Promise.all(
      staff.map(async ({ password: _, ...user }) => {
        const currentStatus = await getStaffStatus(user.id, selectedDate);
        return {
          ...user,
          currentStatus,
        };
      })
    );

    // Calculate summary stats
    const summary = {
      total: staffWithStatus.length,
      punchedIn: staffWithStatus.filter(s => s.currentStatus.status === 'punched_in').length,
      onLunch: staffWithStatus.filter(s => s.currentStatus.status === 'on_lunch_break').length,
      punchedOut: staffWithStatus.filter(s => s.currentStatus.status === 'punched_out').length,
      onLeave: staffWithStatus.filter(s => s.currentStatus.status === 'on_leave').length,
      notPunchedIn: staffWithStatus.filter(s => s.currentStatus.status === 'not_punched_in').length,
    };

    return NextResponse.json({
      success: true,
      staff: staffWithStatus,
      summary,
      selectedDate,
    });
  } catch (error) {
    console.error('Get staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new staff
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const {
      email,
      password,
      fullName,
      salary,
      workingDays,
      officeTimeIn,
      officeTimeOut,
    } = await request.json();

    // Validate input
    if (
      !email ||
      !password ||
      !fullName ||
      !salary ||
      !workingDays ||
      !officeTimeIn ||
      !officeTimeOut
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and staff profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STAFF',
        staffProfile: {
          create: {
            fullName,
            salary: parseFloat(salary),
            workingDays: JSON.stringify(workingDays), // Array of days
            officeTimeIn,
            officeTimeOut,
          },
        },
      },
      include: {
        staffProfile: true,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      staff: userWithoutPassword,
    });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

