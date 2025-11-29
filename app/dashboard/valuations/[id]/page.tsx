'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calculateComparable, calculateValuationMetrics, ComparableData, ComparableResults } from '@/lib/calculations';

interface Comparable {
  id: string;
  askingPrice?: number;
  areaM2?: number;
  pricePerM2?: number;
  link?: string;
  notes?: string;
  adjNegotiation?: number;
  adjArea?: number;
  adjLocation?: number;
  adjAge?: number;
  adjCondition?: number;
  adjOther?: number;
  totalAdjustment?: number;
  adjustedPricePerM2?: number;
}

interface Valuation {
  id: string;
  title: string;
  address?: string;
  city?: string;
  targetAreaM2?: number;
  buildingYear?: number;
  floor?: number;
  hasElevator: boolean;
  notes?: string;
  averagePricePerM2Raw?: number;
  averagePricePerM2Adjusted?: number;
  recommendedPricePerM2?: number;
  idealistaPricePerM2?: number;
  casafariPricePerM2?: number;
  confidencialPricePerM2?: number;
  consultantPricePerM2?: number;
  estimatedValueLow?: number;
  estimatedValueBase?: number;
  estimatedValueHigh?: number;
  createdBy: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
  comparables: Comparable[];
}

export default function ValuationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const valuationId = params.id as string;

  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [calculatedComparables, setCalculatedComparables] = useState<ComparableResults[]>([]);

  // Fetch valuation data
  useEffect(() => {
    async function fetchValuation() {
      try {
        const res = await fetch(`/api/valuations/${valuationId}`);
        if (!res.ok) throw new Error('Failed to fetch valuation');
        const data = await res.json();
        setValuation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchValuation();
  }, [valuationId]);

  // Calculate comparables whenever valuation changes
  useEffect(() => {
    if (!valuation || !valuation.targetAreaM2) return;

    const results = valuation.comparables.map(comp => {
      if (!comp.askingPrice || !comp.areaM2) {
        return { pricePerM2: 0, totalAdjustment: 0, adjustedPricePerM2: 0 };
      }

      const compData: ComparableData = {
        askingPrice: comp.askingPrice,
        areaM2: comp.areaM2,
        adjNegotiation: comp.adjNegotiation || 0,
        adjArea: comp.adjArea || 0,
        adjLocation: comp.adjLocation || 0,
        adjAge: comp.adjAge || 0,
        adjCondition: comp.adjCondition || 0,
        adjOther: comp.adjOther || 0,
      };

      return calculateComparable(compData, valuation.targetAreaM2 || 0);
    });

    setCalculatedComparables(results);

    // Calculate metrics
    const metrics = calculateValuationMetrics(results, valuation.targetAreaM2);

    // Update valuation with calculated metrics
    if (valuation) {
      const updatedValuation = {
        ...valuation,
        averagePricePerM2Raw: metrics.averagePricePerM2Raw,
        averagePricePerM2Adjusted: metrics.averagePricePerM2Adjusted,
        recommendedPricePerM2: metrics.recommendedPricePerM2,
        estimatedValueBase: metrics.estimatedValueBase,
      };

      // Calculate estimated value range
      if (updatedValuation.recommendedPricePerM2) {
        updatedValuation.estimatedValueLow = updatedValuation.recommendedPricePerM2 * 0.95 * (valuation.targetAreaM2 || 0);
        updatedValuation.estimatedValueHigh = updatedValuation.recommendedPricePerM2 * 1.05 * (valuation.targetAreaM2 || 0);
      }

      setValuation(updatedValuation);
    }
  }, [valuation?.comparables, valuation?.targetAreaM2]);

  // Debounced auto-save
  const debouncedSave = useCallback((updatedValuation: Valuation) => {
    if (saveTimeout) clearTimeout(saveTimeout);

    const timeout = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/valuations/${valuationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedValuation),
        });
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setSaving(false);
      }
    }, 1000);

    setSaveTimeout(timeout);
  }, [valuationId, saveTimeout]);

  const updateField = (field: keyof Valuation, value: any) => {
    if (!valuation) return;
    const updated = { ...valuation, [field]: value };
    setValuation(updated);
    debouncedSave(updated);
  };

  const updateComparable = (index: number, field: keyof Comparable, value: any) => {
    if (!valuation) return;
    const updatedComparables = [...valuation.comparables];
    updatedComparables[index] = { ...updatedComparables[index], [field]: value };
    const updated = { ...valuation, comparables: updatedComparables };
    setValuation(updated);
    debouncedSave(updated);
  };

  const addComparable = async () => {
    if (!valuation) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/valuations/${valuationId}/comparables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to add comparable');
      const newComparable = await res.json();
      setValuation({
        ...valuation,
        comparables: [...valuation.comparables, newComparable],
      });
    } catch (err) {
      alert('Failed to add comparable');
    } finally {
      setSaving(false);
    }
  };

  const removeComparable = async (comparableId: string) => {
    if (!valuation) return;
    if (!confirm('Are you sure you want to remove this comparable?')) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/valuations/${valuationId}/comparables/${comparableId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove comparable');
      setValuation({
        ...valuation,
        comparables: valuation.comparables.filter(c => c.id !== comparableId),
      });
    } catch (err) {
      alert('Failed to remove comparable');
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
          <p className="mt-4 text-gray-600">Loading valuation...</p>
        </div>
      </div>
    );
  }

  if (error || !valuation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error || 'Valuation not found'}</p>
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
              <h1 className="text-3xl font-bold mb-2">{valuation.title}</h1>
              <div className="text-gray-300 text-sm space-y-1">
                {valuation.address && <p>{valuation.address}</p>}
                {valuation.city && <p>{valuation.city}</p>}
                <p>Created by {valuation.createdBy.name} on {new Date(valuation.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
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
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Dashboard
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
        {/* Target Property Info */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-bold text-[#131836] mb-4">Target Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={valuation.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={valuation.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={valuation.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (m2)</label>
              <input
                type="number"
                value={valuation.targetAreaM2 || ''}
                onChange={(e) => updateField('targetAreaM2', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Year</label>
              <input
                type="number"
                value={valuation.buildingYear || ''}
                onChange={(e) => updateField('buildingYear', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <input
                type="number"
                value={valuation.floor || ''}
                onChange={(e) => updateField('floor', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={valuation.hasElevator}
                  onChange={(e) => updateField('hasElevator', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Has Elevator</span>
              </label>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={valuation.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Comparables Table */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#131836]">Comparables</h2>
            <button
              onClick={addComparable}
              className="px-4 py-2 bg-[#0B8BEC] text-white rounded hover:bg-blue-700"
            >
              + Add Comparable
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asking Price (€)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M2</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/m2</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adj. Negotiation</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adj. Area</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adj. Location</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adj. Age</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adj. Condition</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adj. Other</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Adj.</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adj. Price/m2</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {valuation.comparables.map((comp, index) => (
                  <tr key={comp.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={comp.askingPrice || ''}
                        onChange={(e) => updateComparable(index, 'askingPrice', parseFloat(e.target.value) || 0)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={comp.areaM2 || ''}
                        onChange={(e) => updateComparable(index, 'areaM2', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      €{calculatedComparables[index]?.pricePerM2.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={comp.link || ''}
                        onChange={(e) => updateComparable(index, 'link', e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="URL"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={comp.notes || ''}
                        onChange={(e) => updateComparable(index, 'notes', e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Notes"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        value={comp.adjNegotiation || ''}
                        onChange={(e) => updateComparable(index, 'adjNegotiation', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {(calculatedComparables[index]?.totalAdjustment || 0).toFixed(4)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        value={comp.adjLocation || ''}
                        onChange={(e) => updateComparable(index, 'adjLocation', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        value={comp.adjAge || ''}
                        onChange={(e) => updateComparable(index, 'adjAge', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        value={comp.adjCondition || ''}
                        onChange={(e) => updateComparable(index, 'adjCondition', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        value={comp.adjOther || ''}
                        onChange={(e) => updateComparable(index, 'adjOther', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                      {((calculatedComparables[index]?.totalAdjustment || 0) * 100).toFixed(2)}%
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      €{calculatedComparables[index]?.adjustedPricePerM2.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removeComparable(comp.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {valuation.comparables.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No comparables added yet. Click "Add Comparable" to get started.</p>
            </div>
          )}
        </div>

        {/* Summary Metrics */}
        <div className="bg-gradient-to-br from-[#0B8BEC] to-blue-600 rounded-lg shadow-lg p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-6">Valuation Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-blue-100 mb-1">Average Price/m2 (Raw)</div>
              <div className="text-3xl font-bold">
                €{valuation.averagePricePerM2Raw?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-blue-100 mb-1">Average Price/m2 (Adjusted)</div>
              <div className="text-3xl font-bold">
                €{valuation.averagePricePerM2Adjusted?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 border-2 border-white/30">
              <div className="text-sm text-blue-100 mb-1">Recommended Price/m2</div>
              <div className="text-3xl font-bold text-yellow-300">
                €{valuation.recommendedPricePerM2?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>

        {/* Benchmarks */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-bold text-[#131836] mb-4">Market Benchmarks (Price/m2)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idealista (€/m2)</label>
              <input
                type="number"
                value={valuation.idealistaPricePerM2 || ''}
                onChange={(e) => updateField('idealistaPricePerM2', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Casafari (€/m2)</label>
              <input
                type="number"
                value={valuation.casafariPricePerM2 || ''}
                onChange={(e) => updateField('casafariPricePerM2', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confidencial Imobiliario (€/m2)</label>
              <input
                type="number"
                value={valuation.confidencialPricePerM2 || ''}
                onChange={(e) => updateField('confidencialPricePerM2', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consultor Imobiliario (€/m2)</label>
              <input
                type="number"
                value={valuation.consultantPricePerM2 || ''}
                onChange={(e) => updateField('consultantPricePerM2', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Estimated Value */}
        <div className="bg-gradient-to-br from-[#131836] to-gray-800 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-6">Estimated Property Value</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Conservative (95%)</div>
              <div className="text-3xl font-bold text-red-400">
                €{valuation.estimatedValueLow?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-4 border-2 border-white/30">
              <div className="text-sm text-gray-300 mb-2">Base Estimate</div>
              <div className="text-4xl font-bold text-green-400">
                €{valuation.estimatedValueBase?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                ({valuation.targetAreaM2 || 0} m2 × €{valuation.recommendedPricePerM2?.toFixed(2) || '0.00'}/m2)
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Optimistic (105%)</div>
              <div className="text-3xl font-bold text-blue-400">
                €{valuation.estimatedValueHigh?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Valuation Range</div>
            <div className="text-lg font-semibold">
              €{valuation.estimatedValueLow?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'} -
              €{valuation.estimatedValueHigh?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
