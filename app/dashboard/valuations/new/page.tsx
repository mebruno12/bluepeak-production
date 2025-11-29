'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewValuationPage() {
  const router = useRouter();

  useEffect(() => {
    const createNewValuation = async () => {
      try {
        const response = await fetch('/api/valuations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'New Property Valuation',
            hasElevator: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          router.push(`/dashboard/valuations/${data.valuation.id}`);
        } else {
          console.error('Failed to create valuation');
          alert('Failed to create new valuation. Please try again.');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error creating valuation:', error);
        alert('An error occurred. Please try again.');
        router.push('/dashboard');
      }
    };

    createNewValuation();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#131836] mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Creating New Valuation...
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your new property valuation.
          </p>
        </div>
      </div>
    </div>
  );
}
