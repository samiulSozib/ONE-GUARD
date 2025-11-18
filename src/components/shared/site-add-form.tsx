import React from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'
import { PlusIcon, Search } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'

const SiteAddForm = () => {
    return (
        <div className="mb-6 bg-[#1890FF1F] dark:bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-lg font-semibold mb-4">Site Details</h3>

            <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4">

                <div className="col-span-1">
                    <label htmlFor="" className="text-xs text-gray-600">Site Name</label>
                    <Input className="bg-white" />
                </div>

                <div className="col-span-1">
                    <label htmlFor="" className="text-xs text-gray-600">Site Instraction</label>
                    <Input className="bg-white" />
                </div>

                <div className="col-span-1">
                    <label htmlFor="" className="text-xs text-gray-600">Address</label>
                    <Input className="bg-white" />
                </div>

                <div className="col-span-1">
                    <label htmlFor="" className="text-xs text-gray-600">Number of Guard Required</label>
                    <Input className="bg-white" />
                </div>

                <div className="col-span-1 md:col-span-1">
                    <label htmlFor="" className="text-xs text-gray-600">Number of Guard Required</label>

                    <Select>
                        <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select a fruit" className="bg-white" />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectGroup className="bg-white">
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-1 md:col-span-1 flex md:mt-5 items-center">
                    <div className="flex flex-row gap-3 items-center">
                        <PlusIcon color="blue" />
                        <span className="text-sm font-bold text-blue-500">Select Guard</span>
                    </div>
                </div>



            </div>

            <div className='grid grid-cols-1 xs:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 bg-white dark:bg-gray-700 p-3 min-h-[300px] rounded-md'>
                <div className='col-span-1'>
                    <label htmlFor="" className='font-bold text-md mb-2'>Location</label>
                    <InputGroup>
                        <InputGroupInput placeholder="Client Name..." />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
                <div className='col-span-1 bg-gray-500 rounded-md p-2'>
                    <p>Google map here</p>
                </div>
            </div>



        </div>
    )
}

export default SiteAddForm
