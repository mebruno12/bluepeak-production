'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

type Deal = {
  id: string;
  title: string;
  city: string | null;
  status: string;
  roiScenario1: number | null;
  roiScenario2: number | null;
  createdBy: {
    name: string;
  };
  updatedAt: string;
};

type Valuation = {
  id: string;
  title: string;
  city: string | null;
  recommendedPricePerM2: number | null;
  estimatedValueBase: number | null;
  createdBy: {
    name: string;
  };
  updatedAt: string;
};

type CombinedItem = {
  id: string;
  type: 'Deal' | 'Valuation';
  title: string;
  city: string | null;
  status?: string;
  metrics: string;
  createdBy: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<CombinedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [statusFilter, cityFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch deals
      const dealsParams = new URLSearchParams();
      if (statusFilter) dealsParams.append('status', statusFilter);
      if (cityFilter) dealsParams.append('city', cityFilter);

      const dealsResponse = await fetch(`/api/deals?${dealsParams}`);
      const dealsData = await dealsResponse.json();

      // Fetch valuations
      const valuationsParams = new URLSearchParams();
      if (cityFilter) valuationsParams.append('city', cityFilter);

      const valuationsResponse = await fetch(`/api/valuations?${valuationsParams}`);
      const valuationsData = await valuationsResponse.json();

      if (!dealsResponse.ok || !valuationsResponse.ok) {
        router.push('/login');
        return;
      }

      // Combine and transform data
      const dealItems: CombinedItem[] = (dealsData.deals || []).map((deal: Deal) => ({
        id: deal.id,
        type: 'Deal' as const,
        title: deal.title,
        city: deal.city,
        status: deal.status,
        metrics: deal.roiScenario1
          ? `ROI: ${(deal.roiScenario1 * 100).toFixed(1)}%`
          : 'No data',
        createdBy: deal.createdBy.name,
        updatedAt: deal.updatedAt,
      }));

      const valuationItems: CombinedItem[] = (valuationsData.valuations || []).map(
        (valuation: Valuation) => ({
          id: valuation.id,
          type: 'Valuation' as const,
          title: valuation.title,
          city: valuation.city,
          metrics: valuation.recommendedPricePerM2
            ? `${valuation.recommendedPricePerM2.toFixed(0)} EUR/m2`
            : 'No data',
          createdBy: valuation.createdBy.name,
          updatedAt: valuation.updatedAt,
        })
      );

      const combinedItems = [...dealItems, ...valuationItems].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setItems(combinedItems);

      // Extract unique cities
      const allCities = combinedItems
        .map((item) => item.city)
        .filter((city): city is string => city !== null);
      setCities([...new Set(allCities)].sort());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item: CombinedItem) => {
    if (item.type === 'Deal') {
      router.push(`/dashboard/deals/${item.id}`);
    } else {
      router.push(`/dashboard/valuations/${item.id}`);
    }
  };

  const handleExportPDF = async (item: CombinedItem) => {
    try {
      const endpoint =
        item.type === 'Deal'
          ? `/api/deals/${item.id}/export`
          : `/api/valuations/${item.id}/export`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.type.toLowerCase()}-${item.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'ARCHIVED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your deals and valuations in one place
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard/deals/new')}
          className="bg-[#0B8BEC] hover:bg-[#0a7dd4] text-white p-6 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-3"
        >
          <span className="text-2xl">🏗️</span>
          <span className="text-lg font-semibold">Create New Fix & Flip Deal</span>
        </button>
        <button
          onClick={() => router.push('/dashboard/valuations/new')}
          className="bg-[#131836] hover:bg-[#1a1f4a] text-white p-6 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-3"
        >
          <span className="text-2xl">📈</span>
          <span className="text-lg font-semibold">Create New Valuation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status (Deals only)
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0B8BEC] focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0B8BEC] focus:border-transparent"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No items found. Create your first deal or valuation!
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.type === 'Deal'
                            ? 'bg-[#0B8BEC] text-white'
                            : 'bg-[#131836] text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.city || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status ? (
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.metrics}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(item.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-[#0B8BEC] hover:text-[#0a7dd4] font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleExportPDF(item)}
                          className="text-[#131836] hover:text-[#1a1f4a] font-medium"
                        >
                          Export PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && items.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Items</h3>
            <p className="text-3xl font-bold text-gray-900">{items.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Deals</h3>
            <p className="text-3xl font-bold text-[#0B8BEC]">
              {items.filter((item) => item.type === 'Deal').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Valuations</h3>
            <p className="text-3xl font-bold text-[#131836]">
              {items.filter((item) => item.type === 'Valuation').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
