// components/company-service-unit-type/company-service-unit-type-top-card.tsx
"use client";

import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { PlusIcon } from 'lucide-react';
import { CompanyServiceUnitTypeCreateForm } from '@/components/company-service-unit-type/company-service-unit-type-create-form';

const CompanyServiceUnitTypeTopCard = () => {
  return (
    <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
      <span className='text-lg font-bold dark:text-white'>Company Service Unit Types</span>
      <div className='flex flex-row gap-2 w-full md:w-auto'>
        <CompanyServiceUnitTypeCreateForm
          trigger={
            <Button
              className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-blue-700 text-white'
              variant='default'
            >
              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Add Unit Type</span>
            </Button>
          }
        />
      </div>
    </Card>
  );
};

export default CompanyServiceUnitTypeTopCard;
