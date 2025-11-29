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

    const valuation = await prisma.valuation.findUnique({
      where: { id: params.id },
      include: {
        comparables: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!valuation) {
      return NextResponse.json(
        { error: 'Valuation not found' },
        { status: 404 }
      );
    }

    if (valuation.userId !== session.user.id) {
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
    doc.text('Comparative Market Analysis', pageWidth - 14, 20, {
      align: 'right',
    });

    // Property Information
    doc.setTextColor(...darkColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(valuation.propertyTitle, 14, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(valuation.propertyAddress, 14, 52);

    let yPosition = 65;

    // Subject Property Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Subject Property', 14, yPosition);
    yPosition += 5;

    const subjectData = [
      ['Attribute', 'Value'],
      ['Property Type', valuation.propertyType],
      ['Area', `${valuation.area} m²`],
      ['Bedrooms', valuation.bedrooms.toString()],
      ['Bathrooms', valuation.bathrooms.toString()],
      ['Condition', valuation.condition],
      ['Year Built', valuation.yearBuilt ? valuation.yearBuilt.toString() : 'N/A'],
      ['Parking Spaces', valuation.parkingSpaces ? valuation.parkingSpaces.toString() : '0'],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [subjectData[0]],
      body: subjectData.slice(1),
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

    // Valuation Summary
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Valuation Summary', 14, yPosition);
    yPosition += 5;

    const summaryData = [
      ['Metric', 'Value'],
      [
        'Estimated Value',
        `€${valuation.estimatedValue ? valuation.estimatedValue.toLocaleString() : 'N/A'}`,
      ],
      [
        'Value Range',
        `€${valuation.minValue ? valuation.minValue.toLocaleString() : 'N/A'} - €${valuation.maxValue ? valuation.maxValue.toLocaleString() : 'N/A'}`,
      ],
      [
        'Price per m²',
        `€${valuation.pricePerSqm ? valuation.pricePerSqm.toLocaleString() : 'N/A'}`,
      ],
      [
        'Confidence Level',
        valuation.confidenceLevel || 'N/A',
      ],
      [
        'Comparables Used',
        valuation.comparables.length.toString(),
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

    // Comparable Properties
    if (valuation.comparables.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('Comparable Properties', 14, yPosition);
      yPosition += 5;

      // Create comparables table with all details
      const comparablesData = valuation.comparables.map((comp, index) => {
        const adjustedPrice = comp.salePrice + comp.totalAdjustments;
        return [
          `Comp ${index + 1}`,
          comp.address.substring(0, 30) + (comp.address.length > 30 ? '...' : ''),
          `€${comp.salePrice.toLocaleString()}`,
          `€${comp.totalAdjustments.toLocaleString()}`,
          `€${adjustedPrice.toLocaleString()}`,
          `${comp.weight.toFixed(0)}%`,
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Address', 'Sale Price', 'Adjustments', 'Adjusted Price', 'Weight']],
        body: comparablesData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 50 },
          2: { halign: 'right', cellWidth: 25 },
          3: { halign: 'right', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 30 },
          5: { halign: 'right', cellWidth: 20 },
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Detailed comparable breakdowns
      valuation.comparables.forEach((comp, index) => {
        if (yPosition > 180) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text(`Comparable ${index + 1} - Details`, 14, yPosition);
        yPosition += 5;

        const compDetailData = [
          ['Attribute', 'Value', 'Adjustment'],
          ['Address', comp.address.substring(0, 40), '-'],
          ['Sale Price', `€${comp.salePrice.toLocaleString()}`, '-'],
          ['Area', `${comp.area} m²`, `€${comp.areaAdjustment.toLocaleString()}`],
          ['Bedrooms', comp.bedrooms.toString(), `€${comp.bedroomsAdjustment.toLocaleString()}`],
          ['Bathrooms', comp.bathrooms.toString(), `€${comp.bathroomsAdjustment.toLocaleString()}`],
          ['Condition', comp.condition, `€${comp.conditionAdjustment.toLocaleString()}`],
          ['Location', '-', `€${comp.locationAdjustment.toLocaleString()}`],
          ['Age', comp.age ? `${comp.age} years` : 'N/A', `€${comp.ageAdjustment.toLocaleString()}`],
          ['Parking', comp.parkingSpaces ? comp.parkingSpaces.toString() : '0', `€${comp.parkingAdjustment.toLocaleString()}`],
          ['Other', '-', `€${comp.otherAdjustments.toLocaleString()}`],
          ['Total Adjustments', '-', `€${comp.totalAdjustments.toLocaleString()}`],
          ['Adjusted Price', '-', `€${(comp.salePrice + comp.totalAdjustments).toLocaleString()}`],
        ];

        autoTable(doc, {
          startY: yPosition,
          head: [compDetailData[0]],
          body: compDetailData.slice(1),
          theme: 'striped',
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 60 },
            2: { halign: 'right', cellWidth: 40 },
          },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      });
    }

    // Notes section if available
    if (valuation.notes && valuation.notes.trim().length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('Notes', 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      const splitNotes = doc.splitTextToSize(valuation.notes, pageWidth - 28);
      doc.text(splitNotes, 14, yPosition);
    }

    // Disclaimer
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Disclaimer', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    const disclaimer = `This valuation report is provided for informational purposes only and should not be considered as a formal property appraisal. The estimated value is based on comparative market analysis using available comparable properties and may not reflect the actual market value. Actual property values may vary based on market conditions, specific property features, and other factors not captured in this analysis. This report should not be used as the sole basis for making investment or purchasing decisions. For official valuations, please consult with a certified property appraiser. BluePeak is not liable for any decisions made based on this report.`;

    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 28);
    doc.text(splitDisclaimer, 14, yPosition);

    // Footer on all pages
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
        'Content-Disposition': `attachment; filename="valuation-${valuation.propertyTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf"`,
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
