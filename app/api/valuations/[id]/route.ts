import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const valuation = await prisma.valuation.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comparables: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!valuation) {
    return NextResponse.json({ error: 'Valuation not found' }, { status: 404 });
  }

  return NextResponse.json({ valuation });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { comparables, ...data } = await request.json();

  try {
    // Delete existing comparables if new ones are provided
    if (comparables !== undefined) {
      await prisma.comparable.deleteMany({
        where: { valuationId: id },
      });
    }

    const valuation = await prisma.valuation.update({
      where: { id },
      data: {
        ...data,
        ...(comparables !== undefined && {
          comparables: {
            create: comparables,
          },
        }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comparables: true,
      },
    });

    return NextResponse.json({ valuation });
  } catch (error) {
    console.error('Update valuation error:', error);
    return NextResponse.json(
      { error: 'Failed to update valuation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.valuation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete valuation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete valuation' },
      { status: 500 }
    );
  }
}
