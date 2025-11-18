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

interface DutyCreateDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DutyCreateForm({ trigger, isOpen, onOpenChange }: DutyCreateDialogProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[80vw] max-w-[80vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add Duty</span>
                </div>

                {/* First Row */}
                <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    
                    <div className="col-span-1">
                        <FloatingLabelInput label="Title" />
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelSelect label="Site">
                            <option value="">choose...</option>
                            <option value="male">USD </option>
                            <option value="female">TK </option>
                        </FloatingLabelSelect>
                    </div>
                    <div className="col-span-1">
                        <FloatingLabelSelect label="Guard">
                            <option value="">choose...</option>
                            <option value="male">USD </option>
                            <option value="female">TK </option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelInput label="Required Hours" />
                    </div>

                   
                    <div className="col-span-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <FloatingLabelInput
                                    className="text-start"
                                    label="Duty Date"
                                    readOnly
                                    postfixIcon={<CalendarIcon />}
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="col-span-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <FloatingLabelInput
                                    className="text-start"
                                    label="Mandatory Check in"
                                    readOnly
                                    postfixIcon={<CalendarIcon />}
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
               

                     <div className="col-span-2">
                        <FloatingLabelTextarea label="Note (optional)" rows={4}/>
                    </div>

                </div>

               
                {/* Footer Actions */}
                <DialogActionFooter />
            </DialogContent>
        </Dialog>
    )
}