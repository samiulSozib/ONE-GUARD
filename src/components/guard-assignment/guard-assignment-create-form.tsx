'use client'

import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { fetchGuards } from "@/store/slices/guardSlice"
import { fetchDuties } from "@/store/slices/dutySlice"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { useAppSelector } from "@/hooks/useAppSelector"
import { Guard } from "@/app/types/guard"
import { Duty, DutyParams } from "@/app/types/duty"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { User, Briefcase } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createAssignment, fetchAssignments } from "@/store/slices/guardAssignmentSlice"

interface GuardAssignmentCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Zod schema for guard assignment validation
const guardAssignmentSchema = z.object({
    guard_id: z.number()
        .min(1, { message: "Guard is required" }),

    duty_id: z.number()
        .min(1, { message: "Duty is required" }),

    start_date: z.string()
        .min(1, { message: "Start date is required" }),

    end_date: z.string()
        .min(1, { message: "End date is required" }),

    status: z.enum(["assigned", "active", "completed", "cancelled"])
}).refine((data) => {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end >= start
}, {
    message: "End date must be after or equal to start date",
    path: ["end_date"]
})

type GuardAssignmentFormData = z.infer<typeof guardAssignmentSchema>

// Status options
const statusOptions = [
    { value: "assigned", label: "Assigned" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
]

export function GuardAssignmentCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: GuardAssignmentCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    // Redux states for dropdown data
    const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard)
    const { duties, isLoading: dutiesLoading } = useAppSelector((state) => state.duty)

    // Search states for comboboxes
    const [guardSearch, setGuardSearch] = useState("")
    const [dutySearch, setDutySearch] = useState("")

    // Date states
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<GuardAssignmentFormData>({
        resolver: zodResolver(guardAssignmentSchema),
        defaultValues: {
            guard_id: 0,
            duty_id: 0,
            start_date: "",
            end_date: "",
            status: "assigned"
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Fetch initial data when dialog opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchGuards({ page: 1, per_page: 100 }))
            dispatch(fetchDuties({ page: 1, per_page: 100 }))
        }
    }, [isOpen, dispatch])

    // Fetch duties when guard is selected
    useEffect(() => {
        if (formValues.guard_id && formValues.guard_id > 0) {
            const params: DutyParams = {
                page: 1,
                per_page: 100,
                guard_id: formValues.guard_id // Using guard_id as params
            }
            dispatch(fetchDuties(params))
        }
    }, [formValues.guard_id, dispatch])

    // Search effects for dropdowns
    useEffect(() => {
        const timer = setTimeout(() => {
            if (guardSearch.trim() || guardSearch === "") {
                dispatch(fetchGuards({
                    page: 1,
                    per_page: 10,
                    search: guardSearch.trim()
                }))
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [guardSearch, dispatch])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (dutySearch.trim() || dutySearch === "") {
                const params: DutyParams = {
                    page: 1,
                    per_page: 10,
                    status: 'approved',
                    search: dutySearch.trim()
                }
                dispatch(fetchDuties(params))
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [dutySearch, dispatch])

    // Update start_date field when date changes
    useEffect(() => {
        if (startDate) {
            setValue('start_date', format(startDate, 'yyyy-MM-dd'), { shouldValidate: true })
        }
    }, [startDate, setValue])

    // Update end_date field when date changes
    useEffect(() => {
        if (endDate) {
            setValue('end_date', format(endDate, 'yyyy-MM-dd'), { shouldValidate: true })
        }
    }, [endDate, setValue])

    // Format functions for display
    const formatGuardDisplay = (guard: Partial<Guard>) => {
        if (!guard) return ""
        return `${guard.full_name || 'Unknown'} (${guard.guard_code || 'No Code'})`
    }

    const formatDutyDisplay = (duty: Partial<Duty>) => {
        if (!duty) return ""
        return `${duty.title || 'Untitled Duty'} (${duty.duty_type || 'N/A'})`
    }

    const formatDateDisplay = (date: Date | null) => {
        if (!date) return "Select date"
        return format(date, 'MMM dd, yyyy')
    }

    const onSubmit = async (data: GuardAssignmentFormData) => {
        setIsLoading(true)
        try {
            // Prepare data for API - exactly matching the required format
            const submitData = {
                guard_id: data.guard_id,
                duty_id: data.duty_id,
                start_date: data.start_date,
                end_date: data.end_date,
                status: data.status
            }

            const result = await dispatch(createAssignment(submitData))

            if (createAssignment.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Guard Assignment Created',
                    'Guard has been assigned to duty successfully.'
                ).then(() => {
                    // Reset all states
                    reset()
                    setStartDate(null)
                    setEndDate(null)
                    setGuardSearch("")
                    setDutySearch("")
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create guard assignment. Please try again."

            if (typeof error === 'string') {
                errorMessage = error
            } else if (error instanceof Error) {
                errorMessage = error.message
            } else if (error && typeof error === 'object') {
                if ('message' in error && typeof error.message === 'string') {
                    errorMessage = error.message
                }
            }

            SweetAlertService.error('Creation Failed', errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when dialog closes
            reset()
            setStartDate(null)
            setEndDate(null)
            setGuardSearch("")
            setDutySearch("")
        }
        onOpenChange?.(open)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Assign Guard to Duty</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Assignment Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                            {/* Guard Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Guard <span className="text-red-500">*</span>
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.guard_id || 0}
                                    onValueChange={(value) => {
                                        setValue("guard_id", Number(value), { shouldValidate: true })
                                        // Reset duty when guard changes
                                        setValue("duty_id", 0)
                                        setDutySearch("")
                                    }}
                                    options={guards.map((guard: Guard) => ({
                                        value: guard.id,
                                        label: formatGuardDisplay(guard),
                                        ...guard
                                    }))}
                                    onSearch={(search) => {
                                        setGuardSearch(search)
                                        dispatch(fetchGuards({
                                            page: 1,
                                            per_page: 10,
                                            search: search
                                        }))
                                    }}
                                    placeholder="Select guard"
                                    disabled={isLoading || guardsLoading}
                                    isLoading={guardsLoading}
                                    emptyMessage={guardSearch ? "No guards found" : "No guards available"}
                                    searchPlaceholder="Search guards by name or code..."
                                    icon={User}
                                    iconPosition="left"
                                    displayValue={(value, options) => {
                                        if (!value || value === 0) return "Select guard"
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select guard"
                                    }}
                                />
                                {errors.guard_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.guard_id.message}</p>
                                )}
                            </div>

                            {/* Duty Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Duty <span className="text-red-500">*</span>
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.duty_id || 0}
                                    onValueChange={(value) => {
                                        setValue("duty_id", Number(value), { shouldValidate: true })
                                    }}
                                    options={duties.map((duty: Duty) => ({
                                        value: duty.id,
                                        label: formatDutyDisplay(duty),
                                        ...duty
                                    }))}
                                    onSearch={(search) => {
                                        setDutySearch(search)
                                        const params: DutyParams = {
                                            page: 1,
                                            per_page: 10,
                                            status: 'approved',
                                            search: search
                                        }
                                        if (formValues.guard_id && formValues.guard_id > 0) {
                                            params.guard_id = formValues.guard_id
                                        }
                                        dispatch(fetchDuties(params))
                                    }}
                                    placeholder={formValues.guard_id && formValues.guard_id > 0 ? "Select duty" : "Select guard first"}
                                    disabled={isLoading || dutiesLoading || !formValues.guard_id || formValues.guard_id === 0}
                                    isLoading={dutiesLoading}
                                    emptyMessage={
                                        !formValues.guard_id || formValues.guard_id === 0
                                            ? "Select a guard first"
                                            : dutySearch
                                                ? "No duties found for this guard"
                                                : "No duties available for this guard"
                                    }
                                    searchPlaceholder="Search duties..."
                                    icon={Briefcase}
                                    iconPosition="left"
                                    displayValue={(value, options) => {
                                        if (!value || value === 0) {
                                            return formValues.guard_id && formValues.guard_id > 0
                                                ? "Select duty"
                                                : "Select guard first"
                                        }
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select duty"
                                    }}
                                />
                                {errors.duty_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.duty_id.message}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {formValues.guard_id && formValues.guard_id > 0
                                        ? "Showing duties assigned to selected guard"
                                        : "Select a guard to see available duties"}
                                </p>
                            </div>

                            {/* Start Date */}
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Start Date <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-11",
                                                !startDate && "text-muted-foreground"
                                            )}
                                            disabled={isLoading}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDateDisplay(startDate)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate || undefined}
                                            onSelect={(date: Date | undefined) => setStartDate(date || null)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.start_date && (
                                    <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>
                                )}
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    End Date <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-11",
                                                !endDate && "text-muted-foreground"
                                            )}
                                            disabled={isLoading}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDateDisplay(endDate)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate || undefined}
                                            onSelect={(date: Date | undefined) => setEndDate(date || null)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.end_date && (
                                    <p className="text-sm text-red-500 mt-1">{errors.end_date.message}</p>
                                )}
                            </div>

                            {/* Status Dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formValues.status}
                                    onValueChange={(value: "assigned" | "active" | "completed" | "cancelled") =>
                                        setValue("status", value, { shouldValidate: true })
                                    }
                                >
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            {statusOptions.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Create Assignment"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}