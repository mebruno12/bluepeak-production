import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create default settings
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
    },
  });
  console.log('✓ Default settings created');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bluepeak.pt' },
    update: {},
    create: {
      email: 'admin@bluepeak.pt',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✓ Admin user created (email: admin@bluepeak.pt, password: admin123)');

  // Create analyst user
  const analystPassword = await bcrypt.hash('analyst123', 10);
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@bluepeak.pt' },
    update: {},
    create: {
      email: 'analyst@bluepeak.pt',
      name: 'Analyst User',
      passwordHash: analystPassword,
      role: 'ANALYST',
    },
  });
  console.log('✓ Analyst user created (email: analyst@bluepeak.pt, password: analyst123)');

  // Create sample deal
  const sampleDeal = await prisma.deal.create({
    data: {
      title: 'R. Entrecampos 33A',
      address: 'Rua de Entrecampos 33A',
      city: 'Lisboa',
      listingUrl: 'https://www.idealista.pt/imovel/12345678/',
      notes: 'Sample fix & flip deal',
      status: 'DRAFT',
      createdById: analyst.id,

      // Scenario 1
      estimatedSalePrice1: 154000,
      purchasePrice1: 54000,
      vpt1: 50000,
      finalidadeHabitacao1: 'SECUNDARIA',
      escritura1: 500,
      registos1: 225,
      cpcvCompra1: 100,

      percentFinancedPurchase1: 0,
      termYearsPurchase1: 40,
      interestRatePurchase1: 0.04,
      commissionDossierPurchase1: 300,
      commissionAvaliacaoPurchase1: 250,
      commissionFormalizationPurchase1: 700,
      stampDutyRateLoanPurchase1: 0.006,
      mortgageRegistryPurchase1: 250,

      budgetWorks1: 40000,
      budgetWorksM21: 60000,
      percentFinancedWorks1: 0,
      termYearsWorks1: 40,
      interestRateWorks1: 0.04,
      commissionDossierWorks1: 300,
      commissionFormalizationWorks1: 700,
      stampDutyRateLoanWorks1: 0.006,
      mortgageRegistryWorks1: 250,
      tranchesWorks1: 2,

      imovelARU: false,
      useM2Method: false,
      areaBrutaM2: 100,
      custoM2Scenario1: 600,

      holdingMonths1: 5,
      insurancePerMonth1: 30,
      condoPerMonth1: 30,
      electricityPerMonth1: 40,
      waterPerMonth1: 40,

      agencyCommissionRate1: 0.03,
      cpcvVenda1: 100,
      earlyRepaymentPenaltyRateProperty1: 0.005,
      earlyRepaymentPenaltyRateWorks1: 0.005,

      taxRegimeScenario1: 'EMPRESA',
      ircRateScenario1: 0.20,
      irsRateScenario1: 0.48,

      // Scenario 2
      estimatedSalePrice2: 230000,
      purchasePrice2: 160000,
      vpt2: 50000,
      finalidadeHabitacao2: 'ISENTO',
      escritura2: 500,
      registos2: 225,
      cpcvCompra2: 100,

      percentFinancedPurchase2: 0,
      termYearsPurchase2: 40,
      interestRatePurchase2: 0.04,
      commissionDossierPurchase2: 300,
      commissionAvaliacaoPurchase2: 250,
      commissionFormalizationPurchase2: 700,
      stampDutyRateLoanPurchase2: 0.006,
      mortgageRegistryPurchase2: 250,

      budgetWorks2: 40000,
      budgetWorksM22: 60000,
      percentFinancedWorks2: 0,
      termYearsWorks2: 40,
      interestRateWorks2: 0.04,
      commissionDossierWorks2: 300,
      commissionFormalizationWorks2: 700,
      stampDutyRateLoanWorks2: 0.006,
      mortgageRegistryWorks2: 250,
      tranchesWorks2: 2,

      custoM2Scenario2: 600,

      holdingMonths2: 12,
      insurancePerMonth2: 30,
      condoPerMonth2: 30,
      electricityPerMonth2: 40,
      waterPerMonth2: 40,

      agencyCommissionRate2: 0.03,
      cpcvVenda2: 100,
      earlyRepaymentPenaltyRateProperty2: 0.005,
      earlyRepaymentPenaltyRateWorks2: 0.005,

      taxRegimeScenario2: 'EMPRESA',
      ircRateScenario2: 0.20,
      irsRateScenario2: 0.48,
    },
  });
  console.log('✓ Sample deal created');

  // Create sample valuation
  const sampleValuation = await prisma.valuation.create({
    data: {
      title: 'Rua Vasco da Gama de Cima',
      address: 'Rua Vasco da Gama de Cima',
      city: 'Lisboa',
      targetAreaM2: 97,
      buildingYear: 1980,
      floor: 3,
      hasElevator: false,
      notes: 'Sample property valuation',
      createdById: analyst.id,

      idealistaPricePerM2: 2350,
      casafariPricePerM2: 2100,
      confidencialPricePerM2: 2018,
      consultantPricePerM2: 2018,

      comparables: {
        create: [
          {
            askingPrice: 300000,
            areaM2: 120,
            link: 'https://www.idealista.pt/imovel/34308494/',
            notes: '4º andar c/ elevador',
            adjNegotiation: -0.05,
            adjLocation: 0,
            adjAge: 0,
            adjCondition: 0,
            adjOther: 0,
          },
          {
            askingPrice: 270000,
            areaM2: 87,
            link: 'https://www.idealista.pt/imovel/34160773/',
            notes: 'lugar de garagem',
            adjNegotiation: -0.05,
            adjLocation: 0,
            adjAge: 0,
            adjCondition: 0,
            adjOther: 0,
          },
          {
            askingPrice: 239000,
            areaM2: 88,
            link: 'https://www.idealista.pt/imovel/34335120/',
            notes: '2º andar c/ elevador',
            adjNegotiation: -0.05,
            adjLocation: 0,
            adjAge: 0,
            adjCondition: 0,
            adjOther: 0,
          },
        ],
      },
    },
  });
  console.log('✓ Sample valuation created');

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
