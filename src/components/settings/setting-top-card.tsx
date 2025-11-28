import React from 'react'
import { Card, CardHeader } from '../ui/card'
import { ButtonGroup } from '../ui/button-group'
import { Button } from '../ui/button'
import { IconBrandGoogleMaps } from '@tabler/icons-react'
import { PlusIcon, MapPin, Users, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const SettingTopCard = () => {
    return (
        <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
            {/* Button Group Section */}
            <div className='flex flex-row gap-3'>
                <span className='text-lg font-bold dark:text-white'>Settings</span>
                
         
            </div>
            {/* Action Buttons Section */}
            <div className='flex flex-row gap-2 w-full md:w-auto'>

                

            </div>
        </Card>
    )
}

export default SettingTopCard