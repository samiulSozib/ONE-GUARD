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
import { CalendarIcon, Plus, PlusIcon, UploadCloud } from "lucide-react"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import SiteAddForm from "../shared/site-add-form"

interface LeaveCreateDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function LeaveCreateForm({ trigger, isOpen, onOpenChange }: LeaveCreateDialogProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[80vw] max-w-[80vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add Leave</span>
                </div>

                {/* First Row */}
                <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    
                    <div className="col-span-1">
                        <FloatingLabelSelect label="Guard">
                            <option value="">choose...</option>
                            <option value="male">Guard 1</option>
                            <option value="female">Guard 2</option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelSelect label="Leave Type">
                            <option value="">choose...</option>
                            <option value="male">Annual </option>
                            <option value="female">Sick </option>
                            <option value="female">Unpadi </option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelSelect label="Calculation Unit">
                            <option value="">choose...</option>
                            <option value="male">Daily </option>
                            <option value="female">Weekly </option>
                            <option value="female">Monthly </option>
                        </FloatingLabelSelect>
                    </div>

                    <div className="col-span-1">
                        <FloatingLabelInput label="Amount (number)" />
                    </div>

                    <div className="col-span-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <FloatingLabelInput
                                    className="text-start"
                                    label="Contract Start Date"
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
                                    label="Contract End Date"
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

                </div>

               
                {/* Footer Actions */}
                <DialogActionFooter />
            </DialogContent>
        </Dialog>
    )
}