'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDealPage() {
  const router = useRouter();

  useEffect(() => {
    const createNewDeal = async () => {
      try {
        const response = await fetch('/api/deals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'New Fix & Flip Deal',
            status: 'DRAFT',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          router.push(`/dashboard/deals/${data.deal.id}`);
        } else {
          console.error('Failed to create deal');
          alert('Failed to create new deal. Please try again.');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error creating deal:', error);
        alert('An error occurred. Please try again.');
        router.push('/dashboard');
      }
    };

    createNewDeal();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0B8BEC] mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Creating New Deal...
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your new fix & flip deal.
          </p>
        </div>
      </div>
    </div>
  );
}
