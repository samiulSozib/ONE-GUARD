import { DialogActionFooter } from '@/components/shared/dialog-action-footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import { FloatingLabelSelect } from '@/components/ui/floating-select';
import { FloatingLabelTextarea } from '@/components/ui/floating-textarea';
import { Switch } from '@/components/ui/switch';
import { Camera } from 'lucide-react';
import React, { useRef, useState } from 'react'

const General = () => {

    const fileRef = useRef(null);
    const [image, setImage] = useState(null);


    return (
        <div className='grid grid-cols-12 md:grid-cols-12 gap-4'>
            <div className='col-span-12 md:col-span-4'>
                <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow p-6 flex flex-col items-center gap-4">

                    {/* Avatar Block */}
                    <div className="relative">
                        <Avatar className="w-32 h-32 border shadow-sm">
                            <AvatarImage src={image || "/placeholder.png"} alt="Profile" />
                            <AvatarFallback>IMG</AvatarFallback>
                        </Avatar>

                        {/* Update Button Overlay */}
                        <button
                            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-full opacity-0 hover:opacity-100 transition"
                        >
                            <Camera className="text-white w-6 h-6" />
                            <span className="text-white text-sm">Update photo</span>
                        </button>

                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif"
                            className="hidden"
                            ref={fileRef}
                        />
                    </div>

                    {/* Allowed Files */}
                    <p className="text-center text-gray-500 text-sm">
                        Allowed *.jpeg, *.jpg, *.png, *.gif
                        <br /> Max size of 3.1 MB
                    </p>

                    {/* Public Profile Toggle */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Public Profile</span>
                        <Switch defaultChecked />
                    </div>
                </div>
            </div>
            <div className="col-span-12 md:col-span-8">
                <div className="grid grid-cols-12 gap-4 border-2 rounded-xl">

                    {/* Section 1 */}
                    <div className="col-span-12 sm:col-span-6 lg:col-span-6 rounded-xl p-4">
                        <FloatingLabelInput label='First Name' />
                    </div>

                    <div className="col-span-12 sm:col-span-6 lg:col-span-6 rounded-xl p-4">
                        <FloatingLabelInput label='Last Name' />
                    </div>


                    <div className="col-span-12 sm:col-span-6 lg:col-span-6 rounded-xl p-4">
                        <FloatingLabelInput label='Email Address' />
                    </div>

                    <div className="col-span-12 sm:col-span-6 lg:col-span-6 rounded-xl p-4">
                        <FloatingLabelInput label='Phone' />
                    </div>

                    <div className="col-span-12 sm:col-span-6 lg:col-span-6 rounded-xl p-4">
                        <FloatingLabelSelect label="Country">
                            <option value="">choose...</option>
                            <option value="male">USA</option>
                            <option value="female">Afghanistan</option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-12 sm:col-span-6 lg:col-span-6 rounded-xl p-4">
                        <FloatingLabelSelect label="State">
                            <option value="">choose...</option>
                            <option value="male">USA</option>
                            <option value="female">Afghanistan</option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-12 sm:col-span-6 lg:col-span-6 rounded-xl p-4">
                        <FloatingLabelSelect label="City">
                            <option value="">choose...</option>
                            <option value="male">USA</option>
                            <option value="female">Afghanistan</option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-12 sm:col-span-6 lg:col-span-6 rounded-xl p-4">
                        <FloatingLabelInput label='Zip Code' />
                    </div>

                    <div className="col-span-12 sm:col-span-12 lg:col-span-12 rounded-xl p-4">
                        <FloatingLabelInput label='Address' />
                    </div>

                    <div className="col-span-12 sm:col-span-12 lg:col-span-12 rounded-xl p-4">
                        <FloatingLabelTextarea label='About' />
                    </div>



                </div>
            </div>
            <div className="col-span-12 flex justify-end">
                <Button className='bg-green-600 text-white'>Save Changes</Button>
            </div>

        </div>
    )
}

export default General
