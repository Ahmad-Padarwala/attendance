import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/middleware/auth';

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

    // Remove passwords
    const staffWithoutPasswords = staff.map(({ password: _, ...user }) => user);

    return NextResponse.json({
      success: true,
      staff: staffWithoutPasswords,
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

