import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/auth';

// GET all holidays
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    let whereClause = {};
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const holidays = await prisma.holiday.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      success: true,
      holidays,
    });
  } catch (error) {
    console.error('Get holidays error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new holiday
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { name, date, description } = await request.json();

    if (!name || !date) {
      return NextResponse.json(
        { error: 'Name and date are required' },
        { status: 400 }
      );
    }

    // Check if holiday already exists on this date
    const existingHoliday = await prisma.holiday.findFirst({
      where: { date: new Date(date) },
    });

    if (existingHoliday) {
      return NextResponse.json(
        { error: 'Holiday already exists on this date' },
        { status: 400 }
      );
    }

    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      holiday,
    });
  } catch (error) {
    console.error('Create holiday error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE holiday
export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      );
    }

    await prisma.holiday.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Holiday deleted successfully',
    });
  } catch (error) {
    console.error('Delete holiday error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

