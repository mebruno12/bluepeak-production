'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calculateScenario, ScenarioInputs, ScenarioResults } from '@/lib/calculations';

interface Deal {
  id: string;
  title: string;
  address?: string;
  city?: string;
  listingUrl?: string;
  notes?: string;
  status: string;
  createdBy: { name: string; email: string };
  createdAt: string;
  updatedAt: string;

  // All scenario fields
  estimatedSalePrice1?: number;
  purchasePrice1?: number;
  vpt1?: number;
  finalidadeHabitacao1?: string;
  imt1?: number;
  is1?: number;
  escritura1?: number;
  registos1?: number;
  cpcvCompra1?: number;
  totalAcquisition1?: number;

  percentFinancedPurchase1?: number;
  loanAmountPurchase1?: number;
  termYearsPurchase1?: number;
  interestRatePurchase1?: number;
  commissionDossierPurchase1?: number;
  commissionAvaliacaoPurchase1?: number;
  commissionFormalizationPurchase1?: number;
  stampDutyRateLoanPurchase1?: number;
  stampDutyLoanPurchase1?: number;
  mortgageRegistryPurchase1?: number;
  monthlyPaymentPurchase1?: number;
  totalFinancingCostPurchase1?: number;

  budgetWorks1?: number;
  budgetWorksM21?: number;
  budgetWorksWithVAT1?: number;
  percentFinancedWorks1?: number;
  loanAmountWorks1?: number;
  termYearsWorks1?: number;
  interestRateWorks1?: number;
  commissionDossierWorks1?: number;
  commissionFormalizationWorks1?: number;
  stampDutyRateLoanWorks1?: number;
  stampDutyLoanWorks1?: number;
  mortgageRegistryWorks1?: number;
  tranchesWorks1?: number;
  trancheCommissionWorks1?: number;
  monthlyPaymentWorks1?: number;
  totalFinancingCostWorks1?: number;

  holdingMonths1?: number;
  insurancePerMonth1?: number;
  condoPerMonth1?: number;
  electricityPerMonth1?: number;
  waterPerMonth1?: number;
  interestPropertyPerMonth1?: number;
  interestWorksPerMonth1?: number;
  totalHoldingCosts1?: number;

  agencyCommissionRate1?: number;
  agencyCommissionWithVAT1?: number;
  cpcvVenda1?: number;
  earlyRepaymentPenaltyRateProperty1?: number;
  earlyRepaymentPenaltyValueProperty1?: number;
  earlyRepaymentPenaltyRateWorks1?: number;
  earlyRepaymentPenaltyValueWorks1?: number;
  totalSaleCosts1?: number;

  grossProfitScenario1?: number;
  taxRegimeScenario1?: string;
  ircRateScenario1?: number;
  irsRateScenario1?: number;
  totalTaxesScenario1?: number;
  netProfitScenario1?: number;
  roiScenario1?: number;
  cashOnCashRoiScenario1?: number;
  annualizedRoiScenario1?: number;
  cashNeededScenario1?: number;

  // Scenario 2 fields (same structure)
  estimatedSalePrice2?: number;
  purchasePrice2?: number;
  vpt2?: number;
  finalidadeHabitacao2?: string;
  imt2?: number;
  is2?: number;
  escritura2?: number;
  registos2?: number;
  cpcvCompra2?: number;
  totalAcquisition2?: number;

  percentFinancedPurchase2?: number;
  loanAmountPurchase2?: number;
  termYearsPurchase2?: number;
  interestRatePurchase2?: number;
  commissionDossierPurchase2?: number;
  commissionAvaliacaoPurchase2?: number;
  commissionFormalizationPurchase2?: number;
  stampDutyRateLoanPurchase2?: number;
  stampDutyLoanPurchase2?: number;
  mortgageRegistryPurchase2?: number;
  monthlyPaymentPurchase2?: number;
  totalFinancingCostPurchase2?: number;

  budgetWorks2?: number;
  budgetWorksM22?: number;
  budgetWorksWithVAT2?: number;
  percentFinancedWorks2?: number;
  loanAmountWorks2?: number;
  termYearsWorks2?: number;
  interestRateWorks2?: number;
  commissionDossierWorks2?: number;
  commissionFormalizationWorks2?: number;
  stampDutyRateLoanWorks2?: number;
  stampDutyLoanWorks2?: number;
  mortgageRegistryWorks2?: number;
  tranchesWorks2?: number;
  trancheCommissionWorks2?: number;
  monthlyPaymentWorks2?: number;
  totalFinancingCostWorks2?: number;

  holdingMonths2?: number;
  insurancePerMonth2?: number;
  condoPerMonth2?: number;
  electricityPerMonth2?: number;
  waterPerMonth2?: number;
  interestPropertyPerMonth2?: number;
  interestWorksPerMonth2?: number;
  totalHoldingCosts2?: number;

  agencyCommissionRate2?: number;
  agencyCommissionWithVAT2?: number;
  cpcvVenda2?: number;
  earlyRepaymentPenaltyRateProperty2?: number;
  earlyRepaymentPenaltyValueProperty2?: number;
  earlyRepaymentPenaltyRateWorks2?: number;
  earlyRepaymentPenaltyValueWorks2?: number;
  totalSaleCosts2?: number;

  grossProfitScenario2?: number;
  taxRegimeScenario2?: string;
  ircRateScenario2?: number;
  irsRateScenario2?: number;
  totalTaxesScenario2?: number;
  netProfitScenario2?: number;
  roiScenario2?: number;
  cashOnCashRoiScenario2?: number;
  annualizedRoiScenario2?: number;
  cashNeededScenario2?: number;

  // Common fields
  imovelARU?: boolean;
  useM2Method?: boolean;
  areaBrutaM2?: number;
  custoM2Scenario1?: number;
  custoM2Scenario2?: number;
}

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [results1, setResults1] = useState<ScenarioResults | null>(null);
  const [results2, setResults2] = useState<ScenarioResults | null>(null);

  // Fetch deal data
  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/deals/${dealId}`);
        if (!res.ok) throw new Error('Failed to fetch deal');
        const data = await res.json();
        setDeal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchDeal();
  }, [dealId]);

  // Calculate results whenever deal changes
  useEffect(() => {
    if (!deal) return;

    // Calculate Scenario 1
    if (deal.estimatedSalePrice1 && deal.purchasePrice1) {
      const inputs1: ScenarioInputs = {
        estimatedSalePrice: deal.estimatedSalePrice1,
        purchasePrice: deal.purchasePrice1,
        vpt: deal.vpt1 || 0,
        finalidadeHabitacao: deal.finalidadeHabitacao1 || 'INVESTIMENTO',
        escritura: deal.escritura1 || 500,
        registos: deal.registos1 || 225,
        cpcvCompra: deal.cpcvCompra1 || 100,
        percentFinancedPurchase: deal.percentFinancedPurchase1 || 0,
        termYearsPurchase: deal.termYearsPurchase1 || 40,
        interestRatePurchase: deal.interestRatePurchase1 || 0.04,
        commissionDossierPurchase: deal.commissionDossierPurchase1 || 300,
        commissionAvaliacaoPurchase: deal.commissionAvaliacaoPurchase1 || 250,
        commissionFormalizationPurchase: deal.commissionFormalizationPurchase1 || 700,
        stampDutyRateLoanPurchase: deal.stampDutyRateLoanPurchase1 || 0.006,
        mortgageRegistryPurchase: deal.mortgageRegistryPurchase1 || 250,
        budgetWorks: deal.budgetWorks1 || 0,
        budgetWorksM2: deal.budgetWorksM21 || 0,
        imovelARU: deal.imovelARU || false,
        useM2Method: deal.useM2Method || false,
        percentFinancedWorks: deal.percentFinancedWorks1 || 0,
        termYearsWorks: deal.termYearsWorks1 || 40,
        interestRateWorks: deal.interestRateWorks1 || 0.04,
        commissionDossierWorks: deal.commissionDossierWorks1 || 300,
        commissionFormalizationWorks: deal.commissionFormalizationWorks1 || 700,
        stampDutyRateLoanWorks: deal.stampDutyRateLoanWorks1 || 0.006,
        mortgageRegistryWorks: deal.mortgageRegistryWorks1 || 250,
        tranchesWorks: deal.tranchesWorks1 || 0,
        holdingMonths: deal.holdingMonths1 || 6,
        insurancePerMonth: deal.insurancePerMonth1 || 30,
        condoPerMonth: deal.condoPerMonth1 || 30,
        electricityPerMonth: deal.electricityPerMonth1 || 40,
        waterPerMonth: deal.waterPerMonth1 || 40,
        agencyCommissionRate: deal.agencyCommissionRate1 || 0.03,
        cpcvVenda: deal.cpcvVenda1 || 100,
        earlyRepaymentPenaltyRateProperty: deal.earlyRepaymentPenaltyRateProperty1 || 0.005,
        earlyRepaymentPenaltyRateWorks: deal.earlyRepaymentPenaltyRateWorks1 || 0.005,
        taxRegime: deal.taxRegimeScenario1 || 'PARTICULAR',
        ircRate: deal.ircRateScenario1 || 0.20,
        irsRate: deal.irsRateScenario1 || 0.48,
      };
      setResults1(calculateScenario(inputs1));
    }

    // Calculate Scenario 2
    if (deal.estimatedSalePrice2 && deal.purchasePrice2) {
      const inputs2: ScenarioInputs = {
        estimatedSalePrice: deal.estimatedSalePrice2,
        purchasePrice: deal.purchasePrice2,
        vpt: deal.vpt2 || 0,
        finalidadeHabitacao: deal.finalidadeHabitacao2 || 'INVESTIMENTO',
        escritura: deal.escritura2 || 500,
        registos: deal.registos2 || 225,
        cpcvCompra: deal.cpcvCompra2 || 100,
        percentFinancedPurchase: deal.percentFinancedPurchase2 || 0,
        termYearsPurchase: deal.termYearsPurchase2 || 40,
        interestRatePurchase: deal.interestRatePurchase2 || 0.04,
        commissionDossierPurchase: deal.commissionDossierPurchase2 || 300,
        commissionAvaliacaoPurchase: deal.commissionAvaliacaoPurchase2 || 250,
        commissionFormalizationPurchase: deal.commissionFormalizationPurchase2 || 700,
        stampDutyRateLoanPurchase: deal.stampDutyRateLoanPurchase2 || 0.006,
        mortgageRegistryPurchase: deal.mortgageRegistryPurchase2 || 250,
        budgetWorks: deal.budgetWorks2 || 0,
        budgetWorksM2: deal.budgetWorksM22 || 0,
        imovelARU: deal.imovelARU || false,
        useM2Method: deal.useM2Method || false,
        percentFinancedWorks: deal.percentFinancedWorks2 || 0,
        termYearsWorks: deal.termYearsWorks2 || 40,
        interestRateWorks: deal.interestRateWorks2 || 0.04,
        commissionDossierWorks: deal.commissionDossierWorks2 || 300,
        commissionFormalizationWorks: deal.commissionFormalizationWorks2 || 700,
        stampDutyRateLoanWorks: deal.stampDutyRateLoanWorks2 || 0.006,
        mortgageRegistryWorks: deal.mortgageRegistryWorks2 || 250,
        tranchesWorks: deal.tranchesWorks2 || 0,
        holdingMonths: deal.holdingMonths2 || 6,
        insurancePerMonth: deal.insurancePerMonth2 || 30,
        condoPerMonth: deal.condoPerMonth2 || 30,
        electricityPerMonth: deal.electricityPerMonth2 || 40,
        waterPerMonth: deal.waterPerMonth2 || 40,
        agencyCommissionRate: deal.agencyCommissionRate2 || 0.03,
        cpcvVenda: deal.cpcvVenda2 || 100,
        earlyRepaymentPenaltyRateProperty: deal.earlyRepaymentPenaltyRateProperty2 || 0.005,
        earlyRepaymentPenaltyRateWorks: deal.earlyRepaymentPenaltyRateWorks2 || 0.005,
        taxRegime: deal.taxRegimeScenario2 || 'PARTICULAR',
        ircRate: deal.ircRateScenario2 || 0.20,
        irsRate: deal.irsRateScenario2 || 0.48,
      };
      setResults2(calculateScenario(inputs2));
    }
  }, [deal]);

  // Debounced auto-save
  const debouncedSave = useCallback((updatedDeal: Deal) => {
    if (saveTimeout) clearTimeout(saveTimeout);

    const timeout = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/deals/${dealId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDeal),
        });
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setSaving(false);
      }
    }, 1000);

    setSaveTimeout(timeout);
  }, [dealId, saveTimeout]);

  const updateField = (field: keyof Deal, value: any) => {
    if (!deal) return;
    const updated = { ...deal, [field]: value };
    setDeal(updated);
    debouncedSave(updated);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!deal) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...deal, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setDeal(updated);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error || 'Deal not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#131836] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{deal.title}</h1>
              <div className="text-gray-300 text-sm space-y-1">
                {deal.address && <p>{deal.address}</p>}
                {deal.city && <p>{deal.city}</p>}
                <p>Created by {deal.createdBy.name} on {new Date(deal.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                deal.status === 'APPROVED' ? 'bg-green-500' :
                deal.status === 'REJECTED' ? 'bg-red-500' :
                deal.status === 'SUBMITTED' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}>
                {deal.status}
              </span>
              {saving && <span className="px-3 py-1 bg-blue-500 rounded text-sm">Saving...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('DRAFT')}
              disabled={deal.status === 'DRAFT'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleStatusChange('SUBMITTED')}
              disabled={deal.status === 'SUBMITTED' || deal.status === 'APPROVED'}
              className="px-4 py-2 bg-[#0B8BEC] text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit for Review
            </button>
            <button
              onClick={() => handleStatusChange('APPROVED')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleStatusChange('REJECTED')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject
            </button>
          </div>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Basic Info Section */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-bold text-[#131836] mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={deal.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={deal.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={deal.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing URL</label>
              <input
                type="text"
                value={deal.listingUrl || ''}
                onChange={(e) => updateField('listingUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={deal.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Common Works Settings */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-[#131836] mb-4">Works Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Bruta (m2)</label>
                <input
                  type="number"
                  value={deal.areaBrutaM2 || ''}
                  onChange={(e) => updateField('areaBrutaM2', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deal.imovelARU || false}
                    onChange={(e) => updateField('imovelARU', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Imovel ARU (6% VAT)</span>
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deal.useM2Method || false}
                    onChange={(e) => updateField('useM2Method', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Use m2 Method</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Two Scenarios Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scenario 1 */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#0B8BEC] to-blue-600 text-white p-4 rounded-lg">
              <h2 className="text-2xl font-bold">Scenario 1</h2>
            </div>

            {/* Scenario 1 - Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Basic Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Sale Price (€)</label>
                  <input
                    type="number"
                    value={deal.estimatedSalePrice1 || ''}
                    onChange={(e) => updateField('estimatedSalePrice1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (€)</label>
                  <input
                    type="number"
                    value={deal.purchasePrice1 || ''}
                    onChange={(e) => updateField('purchasePrice1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VPT (€)</label>
                  <input
                    type="number"
                    value={deal.vpt1 || ''}
                    onChange={(e) => updateField('vpt1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade Habitacao</label>
                  <select
                    value={deal.finalidadeHabitacao1 || 'INVESTIMENTO'}
                    onChange={(e) => updateField('finalidadeHabitacao1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PROPRIA">Propria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                    <option value="INVESTIMENTO">Investimento</option>
                    <option value="EMPRESA">Empresa</option>
                    <option value="ISENTO">Isento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scenario 1 - Acquisition Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Acquisition Costs</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IMT (€)</label>
                    <input
                      type="number"
                      value={results1?.imt.toFixed(2) || '0.00'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IS (€)</label>
                    <input
                      type="number"
                      value={results1?.is.toFixed(2) || '0.00'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escritura (€)</label>
                  <input
                    type="number"
                    value={deal.escritura1 || ''}
                    onChange={(e) => updateField('escritura1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registos (€)</label>
                  <input
                    type="number"
                    value={deal.registos1 || ''}
                    onChange={(e) => updateField('registos1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPCV Compra (€)</label>
                  <input
                    type="number"
                    value={deal.cpcvCompra1 || ''}
                    onChange={(e) => updateField('cpcvCompra1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Acquisition (€)</label>
                  <input
                    type="number"
                    value={results1?.totalAcquisition.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 1 - Purchase Financing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Purchase Financing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Financed</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.percentFinancedPurchase1 || ''}
                    onChange={(e) => updateField('percentFinancedPurchase1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (€)</label>
                  <input
                    type="number"
                    value={results1?.loanAmountPurchase.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term (Years)</label>
                    <input
                      type="number"
                      value={deal.termYearsPurchase1 || ''}
                      onChange={(e) => updateField('termYearsPurchase1', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={deal.interestRatePurchase1 || ''}
                      onChange={(e) => updateField('interestRatePurchase1', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Dossier (€)</label>
                  <input
                    type="number"
                    value={deal.commissionDossierPurchase1 || ''}
                    onChange={(e) => updateField('commissionDossierPurchase1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Avaliacao (€)</label>
                  <input
                    type="number"
                    value={deal.commissionAvaliacaoPurchase1 || ''}
                    onChange={(e) => updateField('commissionAvaliacaoPurchase1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Formalization (€)</label>
                  <input
                    type="number"
                    value={deal.commissionFormalizationPurchase1 || ''}
                    onChange={(e) => updateField('commissionFormalizationPurchase1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stamp Duty Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={deal.stampDutyRateLoanPurchase1 || ''}
                    onChange={(e) => updateField('stampDutyRateLoanPurchase1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Registry (€)</label>
                  <input
                    type="number"
                    value={deal.mortgageRegistryPurchase1 || ''}
                    onChange={(e) => updateField('mortgageRegistryPurchase1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment (€)</label>
                  <input
                    type="number"
                    value={results1?.monthlyPaymentPurchase.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 1 - Works/Renovation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Works/Renovation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Works (€)</label>
                  <input
                    type="number"
                    value={deal.budgetWorks1 || ''}
                    onChange={(e) => updateField('budgetWorks1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {deal.useM2Method && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Works m2 (€)</label>
                    <input
                      type="number"
                      value={deal.budgetWorksM21 || ''}
                      onChange={(e) => updateField('budgetWorksM21', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget with VAT (€)</label>
                  <input
                    type="number"
                    value={results1?.budgetWorksWithVAT.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Financed Works</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.percentFinancedWorks1 || ''}
                    onChange={(e) => updateField('percentFinancedWorks1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term (Years)</label>
                    <input
                      type="number"
                      value={deal.termYearsWorks1 || ''}
                      onChange={(e) => updateField('termYearsWorks1', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={deal.interestRateWorks1 || ''}
                      onChange={(e) => updateField('interestRateWorks1', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tranches</label>
                  <input
                    type="number"
                    value={deal.tranchesWorks1 || ''}
                    onChange={(e) => updateField('tranchesWorks1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 1 - Holding Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Holding Costs</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Holding Months</label>
                  <input
                    type="number"
                    value={deal.holdingMonths1 || ''}
                    onChange={(e) => updateField('holdingMonths1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance/mo (€)</label>
                    <input
                      type="number"
                      value={deal.insurancePerMonth1 || ''}
                      onChange={(e) => updateField('insurancePerMonth1', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condo/mo (€)</label>
                    <input
                      type="number"
                      value={deal.condoPerMonth1 || ''}
                      onChange={(e) => updateField('condoPerMonth1', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Electricity/mo (€)</label>
                    <input
                      type="number"
                      value={deal.electricityPerMonth1 || ''}
                      onChange={(e) => updateField('electricityPerMonth1', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Water/mo (€)</label>
                    <input
                      type="number"
                      value={deal.waterPerMonth1 || ''}
                      onChange={(e) => updateField('waterPerMonth1', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Holding Costs (€)</label>
                  <input
                    type="number"
                    value={results1?.totalHoldingCosts.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 1 - Sale Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Sale Costs</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agency Commission Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.agencyCommissionRate1 || ''}
                    onChange={(e) => updateField('agencyCommissionRate1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agency Comm. with VAT (€)</label>
                  <input
                    type="number"
                    value={results1?.agencyCommissionWithVAT.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPCV Venda (€)</label>
                  <input
                    type="number"
                    value={deal.cpcvVenda1 || ''}
                    onChange={(e) => updateField('cpcvVenda1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Early Repayment Penalty Rate (Property)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={deal.earlyRepaymentPenaltyRateProperty1 || ''}
                    onChange={(e) => updateField('earlyRepaymentPenaltyRateProperty1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Early Repayment Penalty Rate (Works)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={deal.earlyRepaymentPenaltyRateWorks1 || ''}
                    onChange={(e) => updateField('earlyRepaymentPenaltyRateWorks1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Sale Costs (€)</label>
                  <input
                    type="number"
                    value={results1?.totalSaleCosts.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 1 - Tax Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Tax Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Regime</label>
                  <select
                    value={deal.taxRegimeScenario1 || 'PARTICULAR'}
                    onChange={(e) => updateField('taxRegimeScenario1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EMPRESA">Empresa</option>
                    <option value="PARTICULAR">Particular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IRC Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.ircRateScenario1 || ''}
                    onChange={(e) => updateField('ircRateScenario1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IRS Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.irsRateScenario1 || ''}
                    onChange={(e) => updateField('irsRateScenario1', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 1 - Results */}
            <div className="bg-gradient-to-br from-[#131836] to-gray-800 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-6">Results - Scenario 1</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Gross Profit:</span>
                  <span className={`text-2xl font-bold ${(results1?.grossProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    €{results1?.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Taxes:</span>
                  <span className="text-xl font-semibold">
                    €{results1?.totalTaxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                  <span className="text-gray-300">Net Profit:</span>
                  <span className={`text-2xl font-bold ${(results1?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    €{results1?.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Cash Needed:</span>
                  <span className="text-xl font-semibold text-[#0B8BEC]">
                    €{results1?.cashNeeded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-600">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">ROI</div>
                    <div className="text-lg font-bold text-[#0B8BEC]">
                      {((results1?.roi || 0) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">Cash-on-Cash</div>
                    <div className="text-lg font-bold text-[#0B8BEC]">
                      {((results1?.cashOnCashRoi || 0) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">Annualized ROI</div>
                    <div className="text-lg font-bold text-[#0B8BEC]">
                      {((results1?.annualizedRoi || 0) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario 2 */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg">
              <h2 className="text-2xl font-bold">Scenario 2</h2>
            </div>

            {/* Scenario 2 - Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Basic Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Sale Price (€)</label>
                  <input
                    type="number"
                    value={deal.estimatedSalePrice2 || ''}
                    onChange={(e) => updateField('estimatedSalePrice2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (€)</label>
                  <input
                    type="number"
                    value={deal.purchasePrice2 || ''}
                    onChange={(e) => updateField('purchasePrice2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VPT (€)</label>
                  <input
                    type="number"
                    value={deal.vpt2 || ''}
                    onChange={(e) => updateField('vpt2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade Habitacao</label>
                  <select
                    value={deal.finalidadeHabitacao2 || 'INVESTIMENTO'}
                    onChange={(e) => updateField('finalidadeHabitacao2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="PROPRIA">Propria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                    <option value="INVESTIMENTO">Investimento</option>
                    <option value="EMPRESA">Empresa</option>
                    <option value="ISENTO">Isento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scenario 2 - Acquisition Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Acquisition Costs</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IMT (€)</label>
                    <input
                      type="number"
                      value={results2?.imt.toFixed(2) || '0.00'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IS (€)</label>
                    <input
                      type="number"
                      value={results2?.is.toFixed(2) || '0.00'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escritura (€)</label>
                  <input
                    type="number"
                    value={deal.escritura2 || ''}
                    onChange={(e) => updateField('escritura2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registos (€)</label>
                  <input
                    type="number"
                    value={deal.registos2 || ''}
                    onChange={(e) => updateField('registos2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPCV Compra (€)</label>
                  <input
                    type="number"
                    value={deal.cpcvCompra2 || ''}
                    onChange={(e) => updateField('cpcvCompra2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Acquisition (€)</label>
                  <input
                    type="number"
                    value={results2?.totalAcquisition.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-purple-50 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 2 - Purchase Financing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Purchase Financing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Financed</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.percentFinancedPurchase2 || ''}
                    onChange={(e) => updateField('percentFinancedPurchase2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (€)</label>
                  <input
                    type="number"
                    value={results2?.loanAmountPurchase.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term (Years)</label>
                    <input
                      type="number"
                      value={deal.termYearsPurchase2 || ''}
                      onChange={(e) => updateField('termYearsPurchase2', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={deal.interestRatePurchase2 || ''}
                      onChange={(e) => updateField('interestRatePurchase2', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Dossier (€)</label>
                  <input
                    type="number"
                    value={deal.commissionDossierPurchase2 || ''}
                    onChange={(e) => updateField('commissionDossierPurchase2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Avaliacao (€)</label>
                  <input
                    type="number"
                    value={deal.commissionAvaliacaoPurchase2 || ''}
                    onChange={(e) => updateField('commissionAvaliacaoPurchase2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Formalization (€)</label>
                  <input
                    type="number"
                    value={deal.commissionFormalizationPurchase2 || ''}
                    onChange={(e) => updateField('commissionFormalizationPurchase2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stamp Duty Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={deal.stampDutyRateLoanPurchase2 || ''}
                    onChange={(e) => updateField('stampDutyRateLoanPurchase2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Registry (€)</label>
                  <input
                    type="number"
                    value={deal.mortgageRegistryPurchase2 || ''}
                    onChange={(e) => updateField('mortgageRegistryPurchase2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment (€)</label>
                  <input
                    type="number"
                    value={results2?.monthlyPaymentPurchase.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 2 - Works/Renovation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Works/Renovation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Works (€)</label>
                  <input
                    type="number"
                    value={deal.budgetWorks2 || ''}
                    onChange={(e) => updateField('budgetWorks2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {deal.useM2Method && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Works m2 (€)</label>
                    <input
                      type="number"
                      value={deal.budgetWorksM22 || ''}
                      onChange={(e) => updateField('budgetWorksM22', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget with VAT (€)</label>
                  <input
                    type="number"
                    value={results2?.budgetWorksWithVAT.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Financed Works</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.percentFinancedWorks2 || ''}
                    onChange={(e) => updateField('percentFinancedWorks2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term (Years)</label>
                    <input
                      type="number"
                      value={deal.termYearsWorks2 || ''}
                      onChange={(e) => updateField('termYearsWorks2', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={deal.interestRateWorks2 || ''}
                      onChange={(e) => updateField('interestRateWorks2', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tranches</label>
                  <input
                    type="number"
                    value={deal.tranchesWorks2 || ''}
                    onChange={(e) => updateField('tranchesWorks2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 2 - Holding Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Holding Costs</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Holding Months</label>
                  <input
                    type="number"
                    value={deal.holdingMonths2 || ''}
                    onChange={(e) => updateField('holdingMonths2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance/mo (€)</label>
                    <input
                      type="number"
                      value={deal.insurancePerMonth2 || ''}
                      onChange={(e) => updateField('insurancePerMonth2', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condo/mo (€)</label>
                    <input
                      type="number"
                      value={deal.condoPerMonth2 || ''}
                      onChange={(e) => updateField('condoPerMonth2', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Electricity/mo (€)</label>
                    <input
                      type="number"
                      value={deal.electricityPerMonth2 || ''}
                      onChange={(e) => updateField('electricityPerMonth2', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Water/mo (€)</label>
                    <input
                      type="number"
                      value={deal.waterPerMonth2 || ''}
                      onChange={(e) => updateField('waterPerMonth2', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Holding Costs (€)</label>
                  <input
                    type="number"
                    value={results2?.totalHoldingCosts.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-purple-50 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 2 - Sale Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Sale Costs</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agency Commission Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.agencyCommissionRate2 || ''}
                    onChange={(e) => updateField('agencyCommissionRate2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agency Comm. with VAT (€)</label>
                  <input
                    type="number"
                    value={results2?.agencyCommissionWithVAT.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPCV Venda (€)</label>
                  <input
                    type="number"
                    value={deal.cpcvVenda2 || ''}
                    onChange={(e) => updateField('cpcvVenda2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Early Repayment Penalty Rate (Property)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={deal.earlyRepaymentPenaltyRateProperty2 || ''}
                    onChange={(e) => updateField('earlyRepaymentPenaltyRateProperty2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Early Repayment Penalty Rate (Works)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={deal.earlyRepaymentPenaltyRateWorks2 || ''}
                    onChange={(e) => updateField('earlyRepaymentPenaltyRateWorks2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Sale Costs (€)</label>
                  <input
                    type="number"
                    value={results2?.totalSaleCosts.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-purple-50 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 2 - Tax Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#131836] mb-4">Tax Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Regime</label>
                  <select
                    value={deal.taxRegimeScenario2 || 'PARTICULAR'}
                    onChange={(e) => updateField('taxRegimeScenario2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="EMPRESA">Empresa</option>
                    <option value="PARTICULAR">Particular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IRC Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.ircRateScenario2 || ''}
                    onChange={(e) => updateField('ircRateScenario2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IRS Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deal.irsRateScenario2 || ''}
                    onChange={(e) => updateField('irsRateScenario2', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Scenario 2 - Results */}
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-6">Results - Scenario 2</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Gross Profit:</span>
                  <span className={`text-2xl font-bold ${(results2?.grossProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    €{results2?.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Taxes:</span>
                  <span className="text-xl font-semibold">
                    €{results2?.totalTaxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-purple-700">
                  <span className="text-gray-300">Net Profit:</span>
                  <span className={`text-2xl font-bold ${(results2?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    €{results2?.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Cash Needed:</span>
                  <span className="text-xl font-semibold text-purple-300">
                    €{results2?.cashNeeded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-700">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">ROI</div>
                    <div className="text-lg font-bold text-purple-300">
                      {((results2?.roi || 0) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">Cash-on-Cash</div>
                    <div className="text-lg font-bold text-purple-300">
                      {((results2?.cashOnCashRoi || 0) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">Annualized ROI</div>
                    <div className="text-lg font-bold text-purple-300">
                      {((results2?.annualizedRoi || 0) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
