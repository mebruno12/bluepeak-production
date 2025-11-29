// Financial calculation utilities for Fix & Flip deals and Valuations

export function calculatePMT(rate: number, nper: number, pv: number): number {
  if (rate === 0) return -pv / nper;
  return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
}

export function calculateCUMIPMT(
  rate: number,
  nper: number,
  pv: number,
  startPeriod: number,
  endPeriod: number
): number {
  let cumInterest = 0;
  for (let i = startPeriod; i <= endPeriod; i++) {
    const interest = -pv * rate;
    cumInterest += interest;
    const principal = calculatePMT(rate, nper, pv) - interest;
    pv += principal;
  }
  return cumInterest;
}

export function calculateIMT(vpt: number, purchasePrice: number, finalidade: string): number {
  const baseValue = Math.max(vpt, purchasePrice);

  // Simplified IMT calculation for Portugal
  // In real implementation, you'd want the full table with all brackets
  if (finalidade === 'ISENTO') return 0;

  if (finalidade === 'PROPRIA') {
    // Primary residence (Habitação Própria Permanente)
    if (baseValue <= 97064) return 0;
    if (baseValue <= 115594) return baseValue * 0.01;
    if (baseValue <= 134328) return baseValue * 0.02;
    if (baseValue <= 171388) return baseValue * 0.05;
    if (baseValue <= 253875) return baseValue * 0.07;
    if (baseValue <= 295000) return baseValue * 0.08;
    return baseValue * 0.06; // Above 295k is 6% for primary
  }

  // Secondary residence or investment
  if (baseValue <= 100000) return baseValue * 0.01;
  if (baseValue <= 150000) return baseValue * 0.02;
  if (baseValue <= 200000) return baseValue * 0.05;
  if (baseValue <= 300000) return baseValue * 0.07;
  return baseValue * 0.08;
}

export function calculateIS(vpt: number, purchasePrice: number): number {
  return Math.max(vpt, purchasePrice) * 0.008;
}

export function calculateBudgetWithVAT(
  budget: number,
  budgetM2: number,
  useM2Method: boolean,
  isARU: boolean
): number {
  const baseValue = useM2Method ? budgetM2 : budget;
  const vatRate = isARU ? 0.06 : 0.23;
  return baseValue * (1 + vatRate);
}

// Deal Calculations for Scenario
export interface ScenarioInputs {
  // Basic
  estimatedSalePrice: number;
  purchasePrice: number;
  vpt: number;
  finalidadeHabitacao: string;

  // Acquisition
  escritura: number;
  registos: number;
  cpcvCompra: number;

  // Purchase Financing
  percentFinancedPurchase: number;
  termYearsPurchase: number;
  interestRatePurchase: number;
  commissionDossierPurchase: number;
  commissionAvaliacaoPurchase: number;
  commissionFormalizationPurchase: number;
  stampDutyRateLoanPurchase: number;
  mortgageRegistryPurchase: number;

  // Works
  budgetWorks: number;
  budgetWorksM2: number;
  imovelARU: boolean;
  useM2Method: boolean;

  // Works Financing
  percentFinancedWorks: number;
  termYearsWorks: number;
  interestRateWorks: number;
  commissionDossierWorks: number;
  commissionFormalizationWorks: number;
  stampDutyRateLoanWorks: number;
  mortgageRegistryWorks: number;
  tranchesWorks: number;

  // Holding
  holdingMonths: number;
  insurancePerMonth: number;
  condoPerMonth: number;
  electricityPerMonth: number;
  waterPerMonth: number;

  // Sale
  agencyCommissionRate: number;
  cpcvVenda: number;
  earlyRepaymentPenaltyRateProperty: number;
  earlyRepaymentPenaltyRateWorks: number;

  // Tax
  taxRegime: string;
  ircRate: number;
  irsRate: number;
}

export interface ScenarioResults {
  // Acquisition
  imt: number;
  is: number;
  totalAcquisition: number;

  // Purchase Financing
  loanAmountPurchase: number;
  stampDutyLoanPurchase: number;
  monthlyPaymentPurchase: number;
  totalFinancingCostPurchase: number;

  // Works
  budgetWorksWithVAT: number;
  loanAmountWorks: number;
  stampDutyLoanWorks: number;
  trancheCommissionWorks: number;
  monthlyPaymentWorks: number;
  totalFinancingCostWorks: number;

  // Holding
  interestPropertyPerMonth: number;
  interestWorksPerMonth: number;
  totalHoldingCosts: number;

  // Sale
  agencyCommissionWithVAT: number;
  earlyRepaymentPenaltyValueProperty: number;
  earlyRepaymentPenaltyValueWorks: number;
  totalSaleCosts: number;

  // Results
  grossProfit: number;
  totalTaxes: number;
  netProfit: number;
  cashNeeded: number;
  roi: number;
  cashOnCashRoi: number;
  annualizedRoi: number;
}

export function calculateScenario(inputs: ScenarioInputs): ScenarioResults {
  // Acquisition
  const imt = calculateIMT(inputs.vpt, inputs.purchasePrice, inputs.finalidadeHabitacao);
  const is = calculateIS(inputs.vpt, inputs.purchasePrice);
  const totalAcquisition = inputs.purchasePrice + imt + is + inputs.escritura + inputs.registos + inputs.cpcvCompra;

  // Purchase Financing
  const loanAmountPurchase = inputs.percentFinancedPurchase * inputs.purchasePrice;
  const stampDutyLoanPurchase = inputs.stampDutyRateLoanPurchase * loanAmountPurchase;
  const monthlyPaymentPurchase = loanAmountPurchase > 0
    ? calculatePMT(inputs.interestRatePurchase / 12, inputs.termYearsPurchase * 12, loanAmountPurchase)
    : 0;
  const totalFinancingCostPurchase = loanAmountPurchase > 0
    ? inputs.commissionDossierPurchase +
      inputs.commissionAvaliacaoPurchase +
      inputs.commissionFormalizationPurchase +
      stampDutyLoanPurchase +
      inputs.mortgageRegistryPurchase
    : 0;

  // Works
  const budgetWorksWithVAT = calculateBudgetWithVAT(
    inputs.budgetWorks,
    inputs.budgetWorksM2,
    inputs.useM2Method,
    inputs.imovelARU
  );
  const loanAmountWorks = inputs.percentFinancedWorks * budgetWorksWithVAT;
  const stampDutyLoanWorks = inputs.stampDutyRateLoanWorks * loanAmountWorks;
  const trancheCommissionWorks = inputs.tranchesWorks * 150;
  const monthlyPaymentWorks = loanAmountWorks > 0
    ? calculatePMT(inputs.interestRateWorks / 12, inputs.termYearsWorks * 12, loanAmountWorks)
    : 0;
  const totalFinancingCostWorks = loanAmountWorks > 0
    ? budgetWorksWithVAT + inputs.commissionDossierWorks +
      inputs.commissionFormalizationWorks +
      stampDutyLoanWorks +
      inputs.mortgageRegistryWorks +
      trancheCommissionWorks
    : budgetWorksWithVAT;

  // Holding
  const interestPropertyPerMonth = loanAmountPurchase > 0
    ? Math.abs(calculateCUMIPMT(
        inputs.interestRatePurchase / 12,
        inputs.termYearsPurchase * 12,
        loanAmountPurchase,
        1,
        inputs.holdingMonths
      ))
    : 0;

  const interestWorksPerMonth = loanAmountWorks > 0
    ? Math.abs(calculateCUMIPMT(
        inputs.interestRateWorks / 12,
        inputs.termYearsWorks * 12,
        loanAmountWorks,
        1,
        inputs.holdingMonths
      ))
    : 0;

  const monthlyHoldingCosts = inputs.insurancePerMonth + inputs.condoPerMonth +
    inputs.electricityPerMonth + inputs.waterPerMonth;
  const totalHoldingCosts = (monthlyHoldingCosts * inputs.holdingMonths) +
    interestPropertyPerMonth + interestWorksPerMonth;

  // Sale
  const agencyCommissionWithVAT = (inputs.agencyCommissionRate * inputs.estimatedSalePrice) * 1.23;

  const principalPaidProperty = monthlyPaymentPurchase * inputs.holdingMonths;
  const remainingPrincipalProperty = loanAmountPurchase - principalPaidProperty;
  const earlyRepaymentPenaltyValueProperty = inputs.earlyRepaymentPenaltyRateProperty *
    Math.max(0, remainingPrincipalProperty);

  const principalPaidWorks = monthlyPaymentWorks * inputs.holdingMonths;
  const remainingPrincipalWorks = loanAmountWorks - principalPaidWorks;
  const earlyRepaymentPenaltyValueWorks = inputs.earlyRepaymentPenaltyRateWorks *
    Math.max(0, remainingPrincipalWorks);

  const totalSaleCosts = agencyCommissionWithVAT + inputs.cpcvVenda +
    earlyRepaymentPenaltyValueProperty + earlyRepaymentPenaltyValueWorks;

  // Results
  const grossProfit = inputs.estimatedSalePrice - totalAcquisition -
    totalFinancingCostPurchase - totalFinancingCostWorks -
    totalHoldingCosts - totalSaleCosts;

  let totalTaxes = 0;
  if (grossProfit > 0) {
    if (inputs.taxRegime === 'EMPRESA') {
      totalTaxes = grossProfit * inputs.ircRate;
    } else {
      totalTaxes = (grossProfit * 0.5) * inputs.irsRate;
    }
  }

  const netProfit = grossProfit - totalTaxes;

  const cashNeeded = totalAcquisition + totalFinancingCostPurchase - loanAmountPurchase +
    (totalFinancingCostWorks - loanAmountWorks) +
    (inputs.holdingMonths * (monthlyHoldingCosts + monthlyPaymentPurchase + monthlyPaymentWorks));

  const totalInvestment = inputs.purchasePrice + totalAcquisition - inputs.purchasePrice +
    totalFinancingCostPurchase + totalFinancingCostWorks +
    totalHoldingCosts + totalSaleCosts;

  const roi = totalInvestment > 0 ? netProfit / totalInvestment : 0;
  const cashOnCashRoi = cashNeeded > 0 ? netProfit / cashNeeded : 0;
  const annualizedRoi = inputs.holdingMonths > 0 ? roi * (12 / inputs.holdingMonths) : 0;

  return {
    imt,
    is,
    totalAcquisition,
    loanAmountPurchase,
    stampDutyLoanPurchase,
    monthlyPaymentPurchase,
    totalFinancingCostPurchase,
    budgetWorksWithVAT,
    loanAmountWorks,
    stampDutyLoanWorks,
    trancheCommissionWorks,
    monthlyPaymentWorks,
    totalFinancingCostWorks,
    interestPropertyPerMonth,
    interestWorksPerMonth,
    totalHoldingCosts,
    agencyCommissionWithVAT,
    earlyRepaymentPenaltyValueProperty,
    earlyRepaymentPenaltyValueWorks,
    totalSaleCosts,
    grossProfit,
    totalTaxes,
    netProfit,
    cashNeeded,
    roi,
    cashOnCashRoi,
    annualizedRoi,
  };
}

// Valuation Calculations
export interface ComparableData {
  askingPrice: number;
  areaM2: number;
  adjNegotiation: number;
  adjArea: number;
  adjLocation: number;
  adjAge: number;
  adjCondition: number;
  adjOther: number;
}

export interface ComparableResults {
  pricePerM2: number;
  totalAdjustment: number;
  adjustedPricePerM2: number;
}

export function calculateComparable(
  comp: ComparableData,
  targetAreaM2: number
): ComparableResults {
  const pricePerM2 = comp.areaM2 > 0 ? comp.askingPrice / comp.areaM2 : 0;

  // Area adjustment calculation: (comp_m2 - target_m2) * 0.25 / 100
  const adjArea = ((comp.areaM2 - targetAreaM2) * 0.25) / 100;

  const totalAdjustment = comp.adjNegotiation + adjArea + comp.adjLocation +
    comp.adjAge + comp.adjCondition + comp.adjOther;

  const adjustedPricePerM2 = pricePerM2 * (1 + totalAdjustment);

  return {
    pricePerM2,
    totalAdjustment,
    adjustedPricePerM2,
  };
}

export function calculateValuationMetrics(
  comparables: ComparableResults[],
  targetAreaM2: number
): {
  averagePricePerM2Raw: number;
  averagePricePerM2Adjusted: number;
  recommendedPricePerM2: number;
  estimatedValueBase: number;
} {
  const validComps = comparables.filter(c => c.pricePerM2 > 0);

  const averagePricePerM2Raw = validComps.length > 0
    ? validComps.reduce((sum, c) => sum + c.pricePerM2, 0) / validComps.length
    : 0;

  const averagePricePerM2Adjusted = validComps.length > 0
    ? validComps.reduce((sum, c) => sum + c.adjustedPricePerM2, 0) / validComps.length
    : 0;

  // Recommended price is the adjusted average
  const recommendedPricePerM2 = averagePricePerM2Adjusted;

  const estimatedValueBase = recommendedPricePerM2 * targetAreaM2;

  return {
    averagePricePerM2Raw,
    averagePricePerM2Adjusted,
    recommendedPricePerM2,
    estimatedValueBase,
  };
}
