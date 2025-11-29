import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch settings (create default if not exists)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find existing settings for user
    let settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: session.user.id,
          // All default values are defined in Prisma schema
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate numeric fields
    const numericFields = [
      'defaultImtRate',
      'defaultStampDutyRate',
      'defaultNotaryFees',
      'defaultRegistrationFees',
      'defaultLegalFeesRate',
      'defaultInterestRate',
      'defaultLoanTermMonths',
      'defaultOpeningFeeRate',
      'defaultAppraisalFee',
      'defaultMortgageTaxRate',
      'defaultInterestOnlyMonths',
      'defaultInsuranceMonthly',
      'defaultImiMonthly',
      'defaultUtilitiesMonthly',
      'defaultMaintenanceMonthly',
      'defaultAgentFeesRate',
      'defaultCapitalGainsTaxRate',
    ];

    for (const field of numericFields) {
      if (body[field] !== undefined) {
        const value = parseFloat(body[field]);
        if (isNaN(value) || value < 0) {
          return NextResponse.json(
            { error: `Invalid value for ${field}` },
            { status: 400 }
          );
        }
      }
    }

    // Ensure settings exist (create if not)
    let settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Update settings with provided fields
    const updatedSettings = await prisma.settings.update({
      where: { userId: session.user.id },
      data: {
        // Acquisition defaults
        defaultImtRate: body.defaultImtRate,
        defaultStampDutyRate: body.defaultStampDutyRate,
        defaultNotaryFees: body.defaultNotaryFees,
        defaultRegistrationFees: body.defaultRegistrationFees,
        defaultLegalFeesRate: body.defaultLegalFeesRate,
        // Financing defaults
        defaultInterestRate: body.defaultInterestRate,
        defaultLoanTermMonths: body.defaultLoanTermMonths,
        defaultOpeningFeeRate: body.defaultOpeningFeeRate,
        defaultAppraisalFee: body.defaultAppraisalFee,
        defaultMortgageTaxRate: body.defaultMortgageTaxRate,
        defaultInterestOnlyMonths: body.defaultInterestOnlyMonths,
        // Holding costs defaults
        defaultInsuranceMonthly: body.defaultInsuranceMonthly,
        defaultImiMonthly: body.defaultImiMonthly,
        defaultUtilitiesMonthly: body.defaultUtilitiesMonthly,
        defaultMaintenanceMonthly: body.defaultMaintenanceMonthly,
        // Tax defaults
        defaultAgentFeesRate: body.defaultAgentFeesRate,
        defaultCapitalGainsTaxRate: body.defaultCapitalGainsTaxRate,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
