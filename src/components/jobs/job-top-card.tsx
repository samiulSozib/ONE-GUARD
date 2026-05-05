// components/job/job-top-card.tsx
"use client";

import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { PlusIcon } from 'lucide-react';
import { JobCreateForm } from './create-job-form';

const JobTopCard = () => {
    return (
        <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
            <span className='text-lg font-bold dark:text-white'>Jobs</span>
            <div className='flex flex-row gap-2 w-full md:w-auto'>
                <JobCreateForm
                    trigger={
                        <Button
                            className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-[#5F0015]/90 text-white'
                            variant='default'
                        >
                            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="">Add Job</span>
                        </Button>
                    }
                />
            </div>
        </Card>
    );
};

export default JobTopCard;