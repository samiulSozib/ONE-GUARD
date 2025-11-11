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
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calender"
import { format } from "date-fns"
import Image from "next/image"
import React, { ReactNode, useState } from "react"
import { FloatingLabelInput } from "../ui/floating-input"
import { DialogActionFooter } from "../shared/dialog-action-footer"

interface AddAvailabilityFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

export function AddAvailabilityForm({
    trigger,
    isOpen,
    onOpenChange,
}: AddAvailabilityFormProps) {
    const [dates, setDates] = useState(
        weekDays.map(() => ({ start: undefined as Date | undefined, end: undefined as Date | undefined }))
    )

    const handleDateChange = (index: number, type: "start" | "end", date?: Date) => {
        const updated = [...dates]
        updated[index][type] = date
        setDates(updated)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[700px] w-[95vw] mx-auto max-h-[85vh] overflow-y-auto p-5 dark:bg-gray-900 rounded-2xl">
                
                {/* Header */}
                <DialogHeader className="flex flex-row items-center gap-2 mb-4">
                    <Image src="/images/logo.png" alt="logo" width={28} height={28} />
                    <DialogTitle className="text-lg font-semibold">Add Availability</DialogTitle>
                </DialogHeader>

                {/* Days with Start/End Date */}
                <div className="grid grid-cols-1 gap-3">
                    {weekDays.map((day, i) => (
                        <div
                            key={day}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4"
                        >
                            {/* Day label */}
                            <div className="w-full sm:w-[120px] font-semibold text-center text-black-600 dark:text-white bg-[#1890FF1F] rounded-md p-2">
                                {day}
                            </div>

                            {/* Start Date */}
                            <div className="flex-1 w-full">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FloatingLabelInput
                                            className="text-start"
                                            label="Start Date"
                                            value={dates[i].start ? format(dates[i].start, "MM/dd/yyyy") : ""}
                                            readOnly
                                            postfixIcon={<CalendarIcon />}
                                        />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dates[i].start}
                                            onSelect={(date) => handleDateChange(i, "start", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* End Date */}
                            <div className="flex-1 w-full">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FloatingLabelInput
                                            className="text-start"
                                            label="End Date"
                                            value={dates[i].end ? format(dates[i].end, "MM/dd/yyyy") : ""}
                                            readOnly
                                            postfixIcon={<CalendarIcon />}
                                        />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dates[i].end}
                                            onSelect={(date) => handleDateChange(i, "end", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <DialogActionFooter  />
            </DialogContent>
        </Dialog>
    )
}
