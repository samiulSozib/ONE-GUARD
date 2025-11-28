import { DialogActionFooter } from '@/components/shared/dialog-action-footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import { FloatingLabelSelect } from '@/components/ui/floating-select';
import { FloatingLabelTextarea } from '@/components/ui/floating-textarea';
import { Switch } from '@/components/ui/switch';
import { Camera } from 'lucide-react';
import React, { useRef, useState } from 'react'

const TwilioSettings = () => {
    return (
        <div className='grid grid-cols-12 md:grid-cols-12 gap-4'>
            
            <div className="col-span-12 md:col-span-12">
                <div className="grid grid-cols-12 gap-2 border-2 dark:border-gray-700 rounded-xl p-2">

                    {/* Section 1 */}
                    <div className="col-span-12 sm:col-span-12 lg:col-span-12 rounded-xl p-2">
                        <FloatingLabelInput label='Twilio SID' />
                    </div>

                    <div className="col-span-12 sm:col-span-12 lg:col-span-12 rounded-xl p-2">
                        <FloatingLabelInput label='Twilio Token' />
                    </div>

                    <div className="col-span-12 sm:col-span-12 lg:col-span-12 rounded-xl p-2">
                        <FloatingLabelInput label='Twilio From Number' />
                    </div>

                </div>
            </div>
            <div className="col-span-12 flex justify-end">
                <Button className='bg-green-600 hover:bg-green-700 text-white'>Save</Button>
            </div>

        </div>
    )
}

export default TwilioSettings