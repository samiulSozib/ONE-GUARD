'use client'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ReactNode } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelSelect } from "../ui/floating-select"
import { Textarea } from "../ui/textarea"
import { Plus, UploadCloud } from "lucide-react"

interface LiveMapDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function GuardCreateForm({ trigger, isOpen, onOpenChange }: LiveMapDialogProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add Guard</span>
                    <span className="text-gray-400">#GRD-0007</span>
                </div>

                {/* First Row */}
                <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                    <div className="col-span-1">
                        <FloatingLabelInput label="Full Name" />
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelInput label="Phone number" />
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelInput label="Email (optional)" />
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelSelect label="Gender">
                            <option value="">choose...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </FloatingLabelSelect>
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelSelect label="Country">
                            <option value="">choose...</option>
                            <option value="us">United States</option>
                            <option value="uk">United Kingdom</option>
                        </FloatingLabelSelect>
                    </div>

                {/* Second Row */}
                    <div className="col-span-1">
                        <FloatingLabelInput label="City" />
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelInput label="Guard Card Number" />
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelInput label="Driver License Number" />
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelSelect label="Having State">
                            <option value="">choose...</option>
                            <option value="state1">State 1</option>
                            <option value="state2">State 2</option>
                        </FloatingLabelSelect>
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelSelect label="Guard Type">
                            <option value="">choose...</option>
                            <option value="type1">Type 1</option>
                            <option value="type2">Type 2</option>
                        </FloatingLabelSelect>
                    </div>

                {/* Third Row */}
                    <div className="col-span-1">
                        <FloatingLabelInput label="Height" />
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelInput label="Weight" />
                    </div>
                    <div className="col-span-1 md:col-span-1">
                        <FloatingLabelSelect label="Language">
                            <option value="">choose...</option>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                        </FloatingLabelSelect>
                    </div>
                    <div className="col-span-1 md:col-span-1">
                        <FloatingLabelSelect label="Language">
                            <option value="">choose...</option>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                        </FloatingLabelSelect>
                    </div>
                    <div className="col-span-1 md:col-span-1">
                        <FloatingLabelSelect label="Language">
                            <option value="">choose...</option>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                        </FloatingLabelSelect>
                    </div>
                </div>

                {/* Complementary Data Section */}
                <div className="mb-6 bg-[#1890FF1F] dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                    <h3 className="text-lg font-semibold mb-4">Complementary Data</h3>
                    
                    <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                        <div className="col-span-1">
                            <FloatingLabelSelect label="Join Date">
                                <option value="">Select</option>
                                <option value="date1">Date 1</option>
                            </FloatingLabelSelect>
                        </div>
                        <div className="col-span-1">
                            <FloatingLabelSelect label="Currency">
                                <option value="">Select</option>
                                <option value="usd">USD</option>
                                <option value="eur">EUR</option>
                            </FloatingLabelSelect>
                        </div>
                        <div className="col-span-1">
                            <FloatingLabelSelect label="Pay Per Hour">
                                <option value="">Select</option>
                                <option value="20">$20/hr</option>
                                <option value="25">$25/hr</option>
                            </FloatingLabelSelect>
                        </div>
                        <div className="col-span-1">
                            <FloatingLabelSelect label="Country">
                                <option value="">Select</option>
                                <option value="us">United States</option>
                            </FloatingLabelSelect>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                        <div className="col-span-1">
                            <FloatingLabelSelect label="State">
                                <option value="">Select</option>
                                <option value="state1">State 1</option>
                            </FloatingLabelSelect>
                        </div>
                        <div className="col-span-1">
                            <FloatingLabelInput label="City" />
                        </div>
                        <div className="col-span-1">
                            <FloatingLabelInput label="Zip Code" />
                        </div>
                        <div className="col-span-1">
                            <FloatingLabelInput label="Address" />
                        </div>
                    </div>

                    <div className="bg-[#E9F4FF] p-3 sm:p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                            {/* Notes Section */}
                            <div className="md:col-span-1 lg:col-span-2 col-span-1">
                                <label htmlFor="notes" className="text-sm text-gray-600">
                                    Note (optional)
                                </label>
                                <Textarea
                                    id="notes"
                                    placeholder="Write something..."
                                    className="mt-1 w-full h-[120px] resize-none bg-white"
                                />
                            </div>

                            {/* Guard Documents Upload */}
                            <div className="col-span-1 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 bg-white rounded-xl p-4 sm:p-6 hover:border-gray-400 transition">
                                <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mb-2" />
                                <p className="text-gray-600 font-medium text-sm sm:text-base text-center">Guard Documents</p>
                                <button className="mt-2 px-3 py-1 text-xs sm:text-sm border rounded-md border-gray-300 hover:bg-gray-50 whitespace-nowrap">
                                    Select file
                                </button>
                            </div>

                            {/* Profile Photo Upload */}
                            <div className="col-span-1 flex justify-center items-center">
                                <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px] rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white hover:border-gray-400 transition">
                                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 mb-1" />
                                    <p className="text-xs sm:text-sm text-gray-600 text-center px-1">Profile photo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <DialogClose asChild>
                        <Button variant="outline" size="lg" type="button" className="w-full sm:w-auto dark:border-red-600">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" size="lg" variant="default" className="w-full sm:w-auto bg-green-600 dark:bg-gray-700 dark:text-white">
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}