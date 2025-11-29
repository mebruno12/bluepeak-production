import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        acquisition: true,
        financing: true,
        works: true,
        holding: true,
        sale: true,
        results: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [11, 139, 236]; // #0B8BEC
    const darkColor: [number, number, number] = [19, 24, 54]; // #131836

    // Header with BluePeak branding
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BluePeak', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Deal Analysis Report', pageWidth - 14, 20, { align: 'right' });

    // Property Information
    doc.setTextColor(...darkColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(deal.propertyTitle, 14, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(deal.propertyAddress, 14, 52);

    let yPosition = 65;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Deal Summary', 14, yPosition);
    yPosition += 5;

    const summaryData = [
      ['Metric', 'Conservative', 'Optimistic'],
      [
        'Investment',
        `€${((deal.acquisition?.totalInvestment || 0) / 1000).toFixed(0)}k`,
        `€${((deal.acquisition?.totalInvestment || 0) / 1000).toFixed(0)}k`,
      ],
      [
        'Net Profit',
        `€${((deal.results?.netProfitConservative || 0) / 1000).toFixed(0)}k`,
        `€${((deal.results?.netProfitOptimistic || 0) / 1000).toFixed(0)}k`,
      ],
      [
        'ROI',
        `${(deal.results?.roiConservative || 0).toFixed(1)}%`,
        `${(deal.results?.roiOptimistic || 0).toFixed(1)}%`,
      ],
      [
        'IRR',
        `${(deal.results?.irrConservative || 0).toFixed(1)}%`,
        `${(deal.results?.irrOptimistic || 0).toFixed(1)}%`,
      ],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
      },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Acquisition Details
    if (deal.acquisition) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('Acquisition', 14, yPosition);
      yPosition += 5;

      const acquisitionData = [
        ['Item', 'Amount'],
        ['Purchase Price', `€${deal.acquisition.purchasePrice.toLocaleString()}`],
        ['IMT', `€${deal.acquisition.imt.toLocaleString()}`],
        ['Stamp Duty', `€${deal.acquisition.stampDuty.toLocaleString()}`],
        ['Notary Fees', `€${deal.acquisition.notaryFees.toLocaleString()}`],
        ['Registration Fees', `€${deal.acquisition.registrationFees.toLocaleString()}`],
        ['Legal Fees', `€${deal.acquisition.legalFees.toLocaleString()}`],
        ['Other Costs', `€${deal.acquisition.otherCosts.toLocaleString()}`],
        ['Total Investment', `€${deal.acquisition.totalInvestment.toLocaleString()}`],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [acquisitionData[0]],
        body: acquisitionData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Financing Details
    if (deal.financing) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('Financing', 14, yPosition);
      yPosition += 5;

      const financingData = [
        ['Item', 'Amount'],
        ['Loan Amount', `€${deal.financing.loanAmount.toLocaleString()}`],
        ['Interest Rate', `${deal.financing.interestRate.toFixed(2)}%`],
        ['Loan Term', `${deal.financing.loanTermMonths} months`],
        ['Opening Fee', `€${deal.financing.openingFee.toLocaleString()}`],
        ['Appraisal Fee', `€${deal.financing.appraisalFee.toLocaleString()}`],
        ['Mortgage Tax', `€${deal.financing.mortgageTax.toLocaleString()}`],
        ['Total Loan Costs', `€${deal.financing.totalLoanCosts.toLocaleString()}`],
        ['Interest Only Period', `${deal.financing.interestOnlyMonths} months`],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [financingData[0]],
        body: financingData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Works Details
    if (deal.works) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('Renovation Works', 14, yPosition);
      yPosition += 5;

      const worksData = [
        ['Item', 'Amount'],
        ['Construction Costs', `€${deal.works.constructionCosts.toLocaleString()}`],
        ['Architecture Fees', `€${deal.works.architectureFees.toLocaleString()}`],
        ['Licenses', `€${deal.works.licenses.toLocaleString()}`],
        ['Contingency', `€${deal.works.contingency.toLocaleString()}`],
        ['Total Works', `€${deal.works.totalWorks.toLocaleString()}`],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [worksData[0]],
        body: worksData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Holding Details
    if (deal.holding) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('Holding Costs', 14, yPosition);
      yPosition += 5;

      const holdingData = [
        ['Item', 'Monthly', 'Total'],
        [
          'Insurance',
          `€${deal.holding.insuranceMonthly.toLocaleString()}`,
          `€${deal.holding.totalInsurance.toLocaleString()}`,
        ],
        [
          'IMI',
          `€${deal.holding.imiMonthly.toLocaleString()}`,
          `€${deal.holding.totalImi.toLocaleString()}`,
        ],
        [
          'Utilities',
          `€${deal.holding.utilitiesMonthly.toLocaleString()}`,
          `€${deal.holding.totalUtilities.toLocaleString()}`,
        ],
        [
          'Maintenance',
          `€${deal.holding.maintenanceMonthly.toLocaleString()}`,
          `€${deal.holding.totalMaintenance.toLocaleString()}`,
        ],
        [
          'Interest',
          `€${deal.holding.interestMonthly.toLocaleString()}`,
          `€${deal.holding.totalInterest.toLocaleString()}`,
        ],
        ['Total', '-', `€${deal.holding.totalHoldingCosts.toLocaleString()}`],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [holdingData[0]],
        body: holdingData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
          2: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Sale Details
    if (deal.sale) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('Exit Strategy', 14, yPosition);
      yPosition += 5;

      const saleData = [
        ['Item', 'Conservative', 'Optimistic'],
        [
          'Sale Price',
          `€${deal.sale.salePriceConservative.toLocaleString()}`,
          `€${deal.sale.salePriceOptimistic.toLocaleString()}`,
        ],
        [
          'Agent Fees',
          `€${deal.sale.agentFeesConservative.toLocaleString()}`,
          `€${deal.sale.agentFeesOptimistic.toLocaleString()}`,
        ],
        [
          'Legal Fees',
          `€${deal.sale.legalFeesConservative.toLocaleString()}`,
          `€${deal.sale.legalFeesOptimistic.toLocaleString()}`,
        ],
        [
          'IMT on Sale',
          `€${deal.sale.imtOnSaleConservative.toLocaleString()}`,
          `€${deal.sale.imtOnSaleOptimistic.toLocaleString()}`,
        ],
        [
          'Capital Gains Tax',
          `€${deal.sale.capitalGainsTaxConservative.toLocaleString()}`,
          `€${deal.sale.capitalGainsTaxOptimistic.toLocaleString()}`,
        ],
        [
          'Net Sale Proceeds',
          `€${deal.sale.netSaleProceedsConservative.toLocaleString()}`,
          `€${deal.sale.netSaleProceedsOptimistic.toLocaleString()}`,
        ],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [saleData[0]],
        body: saleData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
          2: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Final Results
    if (deal.results) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('Investment Results', 14, yPosition);
      yPosition += 5;

      const resultsData = [
        ['Metric', 'Conservative', 'Optimistic'],
        [
          'Total Investment',
          `€${deal.results.totalInvestment.toLocaleString()}`,
          `€${deal.results.totalInvestment.toLocaleString()}`,
        ],
        [
          'Gross Profit',
          `€${deal.results.grossProfitConservative.toLocaleString()}`,
          `€${deal.results.grossProfitOptimistic.toLocaleString()}`,
        ],
        [
          'Net Profit',
          `€${deal.results.netProfitConservative.toLocaleString()}`,
          `€${deal.results.netProfitOptimistic.toLocaleString()}`,
        ],
        [
          'ROI',
          `${deal.results.roiConservative.toFixed(2)}%`,
          `${deal.results.roiOptimistic.toFixed(2)}%`,
        ],
        [
          'IRR',
          `${deal.results.irrConservative.toFixed(2)}%`,
          `${deal.results.irrOptimistic.toFixed(2)}%`,
        ],
        [
          'Multiple on Money',
          `${deal.results.momConservative.toFixed(2)}x`,
          `${deal.results.momOptimistic.toFixed(2)}x`,
        ],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [resultsData[0]],
        body: resultsData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
          2: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by BluePeak - ${new Date().toLocaleDateString()}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="deal-${deal.propertyTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
