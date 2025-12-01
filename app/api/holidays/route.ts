import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET holidays (public for staff to see)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: YYYY-MM

    let whereClause = {};
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
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

