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
import { Plus, PlusIcon, UploadCloud } from "lucide-react"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"

interface LiveMapDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ClientCreateForm({ trigger, isOpen, onOpenChange }: LiveMapDialogProps) {

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
                <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
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

                    <div className="col-span-1 md:col-span-1">
                        <FloatingLabelSelect label="Language">
                            <option value="">choose...</option>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="md:col-span-1 col-span-1">

                        <FloatingLabelTextarea
                            id="notes"
                            label="Note (Optional)"
                            className="mt-1 w-full h-[120px] resize-none bg-white"
                        />
                    </div>

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

                {/* Complementary Data Section */}
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
                                <PlusIcon color="blue"/>
                                <span className="text-sm font-bold text-blue-500">Select Guard</span>
                            </div>
                        </div>

                    </div>

                    
                    
                </div>

                {/* Footer Actions */}
                <DialogActionFooter />
            </DialogContent>
        </Dialog>
    )
}