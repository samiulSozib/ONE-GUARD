// components/job-application/job-application-top-card.tsx
"use client";

import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { DownloadIcon, RefreshCw } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchJobApplications, fetchJobApplicationStats } from '@/store/slices/jobApplicationSlice';
import SweetAlertService from '@/lib/sweetAlert';

interface JobApplicationTopCardProps {
  onRefresh?: () => void;
}

const JobApplicationTopCard = ({ onRefresh }: JobApplicationTopCardProps) => {
  const dispatch = useAppDispatch();

  const handleRefresh = async () => {
    await dispatch(fetchJobApplications({ page: 1, per_page: 10 }));
    await dispatch(fetchJobApplicationStats());
    SweetAlertService.success('Refreshed', 'Applications list has been refreshed.', {
      timer: 1500,
      showConfirmButton: false,
    });
    onRefresh?.();
  };

  const handleExport = () => {
    SweetAlertService.info('Export Feature', 'Export functionality will be implemented soon.');
  };

  return (
    <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
      <span className='text-lg font-bold dark:text-white'>Job Applications</span>
      <div className='flex flex-row gap-2 w-full md:w-auto'>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm'
        >
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Refresh
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm'
        >
          <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Export
        </Button>
      </div>
    </Card>
  );
};

export default JobApplicationTopCard;