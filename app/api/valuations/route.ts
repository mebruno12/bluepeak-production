import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  const where: any = {};
  if (city) where.city = city;

  const valuations = await prisma.valuation.findMany({
    where,
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
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return NextResponse.json({ valuations });
}

export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { comparables, ...data } = await request.json();

    const valuation = await prisma.valuation.create({
      data: {
        ...data,
        createdById: session.userId,
        comparables: {
          create: comparables || [],
        },
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
    console.error('Create valuation error:', error);
    return NextResponse.json(
      { error: 'Failed to create valuation' },
      { status: 500 }
    );
  }
}
