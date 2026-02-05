"use client";

import { useSearchParams, useParams } from 'next/navigation';
import { Guard } from '@/app/types/guard';
import ViewGuardTopCard from '@/components/guard/view-guard-top-card';
import ViewGuardContent from '@/components/guard/view-guard-content';

export default function GuardDetailsPage() {
  const searchParams = useSearchParams();
  
  // Get guard from query parameters
  const guardToDisplay = ((): Guard | null => {
    const guardParam = searchParams.get('guard');
    
    if (guardParam) {
      try {
        const decodedGuard = JSON.parse(decodeURIComponent(guardParam));
        return decodedGuard as Guard;
      } catch (error) {
        console.error('Error parsing guard from params:', error);
        return null;
      }
    }
    
    return null;
  })();

  if (!guardToDisplay) {
    return (
      <div className="text-center py-10">
        <h2>Guard not found</h2>
        <p className="text-gray-600 mt-2">
          Please navigate from the guards list or provide guard data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <ViewGuardTopCard guard={guardToDisplay} />
        </div>
        <div className="py-2 px-4 md:px-6">
          <ViewGuardContent guard={guardToDisplay}/>
        </div>
      </div>
    </div>
  );
}