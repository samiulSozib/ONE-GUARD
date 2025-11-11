import React from 'react'
import { Card } from '../ui/card'
import { ButtonGroup } from '../ui/button-group'
import { Button } from '../ui/button'
import { IconBrandGoogleMaps } from '@tabler/icons-react'
import { PlusIcon, MapPin, Users, User } from 'lucide-react'
import { GuardLiveMap } from './guard-live-map-dialog'
import { GuardCreateForm } from './guard-create-form'

const GuardTopCard = () => {
    return (
        <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
            {/* Button Group Section */}
            <ButtonGroup
                orientation="horizontal"
                aria-label="View type controls"
                className="w-full md:w-auto justify-center md:justify-start"
            >
                <Button
                    variant="outline"
                    className='flex-1 md:flex-initial text-xs sm:text-sm bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900'
                >
                    <span className="">Guards</span>
                </Button>
                <Button
                    variant="outline"
                    className='flex-1 md:flex-initial text-xs sm:text-sm'
                >
                    <span className="">Employees</span>
                </Button>
            </ButtonGroup>

            {/* Action Buttons Section */}
            <div className='flex flex-row gap-2 w-full md:w-auto'>
                <GuardLiveMap
                    trigger={
                        <Button
                            className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm bg-[#B5A28A] hover:bg-blue-700 text-white'
                            variant='default'
                        >
                            <IconBrandGoogleMaps className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="">Live Map</span>
                        </Button>
                    }
                />
                <GuardCreateForm
                    trigger={
                        <Button
                            className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-blue-700 text-white'
                            variant='default'
                        >
                            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="">Create Guard</span>
                        </Button>
                    } />

            </div>
        </Card>
    )
}

export default GuardTopCard