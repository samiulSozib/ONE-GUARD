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
import { CalendarIcon, Plus, PlusIcon, Search, UploadCloud } from "lucide-react"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import SiteAddForm from "../shared/site-add-form"

interface ExpenseCreateDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ComplainantCreateForm({ trigger, isOpen, onOpenChange }: ExpenseCreateDialogProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[80vw] max-w-[80vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add Complainant</span>
                </div>

                {/* First Row */}
                <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    
                    <div className="col-span-2">
                        <FloatingLabelInput label="Title" />
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelSelect label="Reporter" prefixIcon={<Search className="h-4 w-4"/>}>
                            <option value="">choose...</option>
                            <option value="male">USD </option>
                            <option value="female">TK </option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelInput label="Reporter name" />
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelSelect label="Against" prefixIcon={<Search className="h-4 w-4"/>}>
                            <option value="">choose...</option>
                            <option value="male">USD </option>
                            <option value="female">TK </option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelInput label="Against name" />
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelSelect label="Priority" >
                            <option value="">choose...</option>
                            <option value="male">High </option>
                            <option value="female">Low </option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelSelect label="Status" >
                            <option value="">choose...</option>
                            <option value="male">High </option>
                            <option value="female">Low </option>
                        </FloatingLabelSelect>
                    </div>
                

                     <div className="col-span-1 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 bg-white rounded-xl p-4 sm:p-6 hover:border-gray-400 transition">
                                <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mb-2" />
                                <p className="text-gray-600 font-medium text-sm sm:text-base text-center">Upload Attachment</p>
                                <button className="mt-2 px-3 py-1 text-xs sm:text-sm border rounded-md border-gray-300 hover:bg-gray-50 whitespace-nowrap">
                                    Select file
                                </button>
                            </div>

                     <div className="col-span-1">
                        <FloatingLabelTextarea label="Amount (number)" rows={4}/>
                    </div>

                </div>

               
                {/* Footer Actions */}
                <DialogActionFooter />
            </DialogContent>
        </Dialog>
    )
}