import React from 'react'
import { Card, CardHeader } from '../ui/card'
import { ButtonGroup } from '../ui/button-group'
import { Button } from '../ui/button'
import { IconBrandGoogleMaps } from '@tabler/icons-react'
import { PlusIcon, MapPin, Users, User } from 'lucide-react'
import { ComplaintCreateForm } from './complaint-create-form'

const ComplaintTopCard = () => {
    return (
        <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
            {/* Button Group Section */}
            <span className='text-lg font-bold dark:text-white'>Complaint List</span>
            {/* Action Buttons Section */}
            <div className='flex flex-row gap-2 w-full md:w-auto'>
                
                <ComplaintCreateForm
                    trigger={
                        <Button
                            className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-blue-700 text-white'
                            variant='default'
                        >
                            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="">Add Complaint</span>
                        </Button>
                   } />

            </div>
        </Card>
    )
}

export default ComplaintTopCard