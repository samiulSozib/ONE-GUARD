import React from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { PlusIcon, Sparkles } from 'lucide-react'
import { ClientCreateForm } from './client-create-form'
import { ClientSetupWizard } from './client-setup-wizard'

const ClientTopCard = () => {
    return (
        <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
            <span className='text-lg font-bold dark:text-white'>Clients</span>
            <div className='flex flex-row gap-2 w-full md:w-auto'>
                <ClientSetupWizard
                    trigger={
                        <Button
                            className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm border border-[#5F0015] text-[#5F0015] hover:bg-[#5F0015]/10'
                            variant='outline'
                        >
                            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span>Set up client</span>
                        </Button>
                    }
                />
                <ClientCreateForm
                    trigger={
                        <Button
                            className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-blue-700 text-white'
                            variant='default'
                        >
                            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span>Create Client</span>
                        </Button>
                   } />
            </div>
        </Card>
    )
}

export default ClientTopCard