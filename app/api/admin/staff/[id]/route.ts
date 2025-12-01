import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/middleware/auth';

// GET single staff
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

    const resolvedParams = await params;
    const staff = await prisma.user.findUnique({
      where: { id: parseInt(resolvedParams.id) },
      include: {
        staffProfile: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    const { password: _, ...staffWithoutPassword } = staff;

    return NextResponse.json({
      success: true,
      staff: staffWithoutPassword,
    });
  } catch (error) {
    console.error('Get staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update staff
export async function PUT(
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

    const data = await request.json();
    const resolvedParams = await params;
    const staffId = parseInt(resolvedParams.id);

    // Check if staff exists
    const existingStaff = await prisma.user.findUnique({
      where: { id: staffId },
      include: { staffProfile: true },
    });

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Update user
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = await hashPassword(data.password);

    const updatedUser = await prisma.user.update({
      where: { id: staffId },
      data: updateData,
      include: {
        staffProfile: true,
      },
    });

    // Update staff profile
    if (existingStaff.staffProfile) {
      const profileUpdateData: any = {};
      if (data.fullName) profileUpdateData.fullName = data.fullName;
      if (data.salary) profileUpdateData.salary = parseFloat(data.salary);
      if (data.workingDays)
        profileUpdateData.workingDays = JSON.stringify(data.workingDays);
      if (data.officeTimeIn) profileUpdateData.officeTimeIn = data.officeTimeIn;
      if (data.officeTimeOut)
        profileUpdateData.officeTimeOut = data.officeTimeOut;

      await prisma.staffProfile.update({
        where: { userId: staffId },
        data: profileUpdateData,
      });
    }

    // Fetch updated user
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      include: {
        staffProfile: true,
      },
    });

    const { password: _, ...staffWithoutPassword } = staff!;

    return NextResponse.json({
      success: true,
      staff: staffWithoutPassword,
    });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE staff
export async function DELETE(
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

    const resolvedParams = await params;
    const staffId = parseInt(resolvedParams.id);

    await prisma.user.delete({
      where: { id: staffId },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

