'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Settings {
  id: string;
  userId: string;
  // Acquisition defaults
  defaultImtRate: number;
  defaultStampDutyRate: number;
  defaultNotaryFees: number;
  defaultRegistrationFees: number;
  defaultLegalFeesRate: number;
  // Financing defaults
  defaultInterestRate: number;
  defaultLoanTermMonths: number;
  defaultOpeningFeeRate: number;
  defaultAppraisalFee: number;
  defaultMortgageTaxRate: number;
  defaultInterestOnlyMonths: number;
  // Holding costs defaults
  defaultInsuranceMonthly: number;
  defaultImiMonthly: number;
  defaultUtilitiesMonthly: number;
  defaultMaintenanceMonthly: number;
  // Tax defaults
  defaultAgentFeesRate: number;
  defaultCapitalGainsTaxRate: number;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load settings. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setMessage({
        type: 'success',
        text: 'Settings saved successfully!',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Settings, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: parseFloat(value) || 0,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load settings</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Default Settings
            </h1>
          </div>
          <p className="text-gray-600">
            Configure default values for new deals and calculations
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Acquisition Defaults */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Acquisition Defaults
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMT Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultImtRate}
                  onChange={(e) =>
                    handleChange('defaultImtRate', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stamp Duty Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultStampDutyRate}
                  onChange={(e) =>
                    handleChange('defaultStampDutyRate', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notary Fees (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultNotaryFees}
                  onChange={(e) =>
                    handleChange('defaultNotaryFees', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Fees (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultRegistrationFees}
                  onChange={(e) =>
                    handleChange('defaultRegistrationFees', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Fees Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultLegalFeesRate}
                  onChange={(e) =>
                    handleChange('defaultLegalFeesRate', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Financing Defaults */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Financing Defaults
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultInterestRate}
                  onChange={(e) =>
                    handleChange('defaultInterestRate', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term (months)
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.defaultLoanTermMonths}
                  onChange={(e) =>
                    handleChange('defaultLoanTermMonths', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Fee Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultOpeningFeeRate}
                  onChange={(e) =>
                    handleChange('defaultOpeningFeeRate', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appraisal Fee (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultAppraisalFee}
                  onChange={(e) =>
                    handleChange('defaultAppraisalFee', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mortgage Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultMortgageTaxRate}
                  onChange={(e) =>
                    handleChange('defaultMortgageTaxRate', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Only Period (months)
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.defaultInterestOnlyMonths}
                  onChange={(e) =>
                    handleChange('defaultInterestOnlyMonths', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Holding Costs Defaults */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Holding Costs Defaults (Monthly)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance (€/month)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultInsuranceMonthly}
                  onChange={(e) =>
                    handleChange('defaultInsuranceMonthly', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMI (€/month)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultImiMonthly}
                  onChange={(e) =>
                    handleChange('defaultImiMonthly', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilities (€/month)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultUtilitiesMonthly}
                  onChange={(e) =>
                    handleChange('defaultUtilitiesMonthly', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance (€/month)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultMaintenanceMonthly}
                  onChange={(e) =>
                    handleChange('defaultMaintenanceMonthly', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tax Defaults */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Tax Defaults
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Fees Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultAgentFeesRate}
                  onChange={(e) =>
                    handleChange('defaultAgentFeesRate', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capital Gains Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultCapitalGainsTaxRate}
                  onChange={(e) =>
                    handleChange('defaultCapitalGainsTaxRate', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* BluePeak Branding Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87-.78-7-4.36-7-8V8.3l7-3.11 7 3.11V12c0 3.64-3.13 7.22-7 8z" />
            </svg>
            <span className="text-sm font-medium">
              Powered by <span className="text-blue-600 font-bold">BluePeak</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
