import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/middleware/auth';

// Helper function to determine staff status
async function getStaffStatus(userId: number) {
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
  let punchInTime = null;
  let punchOutTime = null;

  if (todayRecord) {
    punchInTime = todayRecord.punchInTime;
    punchOutTime = todayRecord.punchOutTime;

    if (todayRecord.punchOutTime) {
      status = 'punched_out';
    } else {
      const activeLunchBreak = todayRecord.lunchBreaks.find(
        (lb) => !lb.lunchEndTime
      );
      if (activeLunchBreak) {
        status = 'on_lunch_break';
      } else {
        status = 'punched_in';
      }
    }
  }

  return { status, punchInTime, punchOutTime };
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

    const staff = await prisma.user.findMany({
      where: { role: 'STAFF' },
      include: {
        staffProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get current status for each staff member
    const staffWithStatus = await Promise.all(
      staff.map(async ({ password: _, ...user }) => {
        const currentStatus = await getStaffStatus(user.id);
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
      notPunchedIn: staffWithStatus.filter(s => s.currentStatus.status === 'not_punched_in').length,
    };

    return NextResponse.json({
      success: true,
      staff: staffWithStatus,
      summary,
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

