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
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { CalendarIcon, Clock, User, Briefcase } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { createLeave } from "@/store/slices/leaveSlice"
import { fetchGuards } from "@/store/slices/guardSlice"
import { fetchSites } from "@/store/slices/siteSlice"
import { Leave } from "@/app/types/leave"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { useAppSelector } from "@/hooks/useAppSelector"
import { Site } from "@/app/types/site"
import { Guard } from "@/app/types/guard"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface LeaveCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Zod schema for leave validation
const leaveSchema = z.object({
    guard_id: z.number()
        .min(1, { message: "Guard is required" }),

    site_id: z.number()
        .min(1, { message: "Site is required" }),

    leave_type: z.string()
        .min(1, { message: "Leave type is required" }),

    start_date: z.string()
        .min(1, { message: "Start date is required" }),

    end_date: z.string()
        .min(1, { message: "End date is required" }),

    reason: z.string()
        .min(1, { message: "Reason is required" })
        .max(500, { message: "Reason must be less than 500 characters" }),

    calculation_unit: z.string()
        .min(1, { message: "Calculation unit is required" }),

    amount: z.string()
        .min(1, { message: "Amount is required" })
        .regex(/^\d+(\.\d{1,2})?$/, { message: "Amount must be a valid number" }),

    start_time: z.string().optional(),
    end_time: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected", "completed"])

}).refine((data) => {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end >= start
}, {
    message: "End date must be after or equal to start date",
    path: ["end_date"]
})

type LeaveFormData = z.infer<typeof leaveSchema>

// Leave type options
const leaveTypes = [
    { value: "sick", label: "Sick Leave" },
    { value: "annual", label: "Annual Leave" },
    { value: "casual", label: "Casual Leave" },
    { value: "emergency", label: "Emergency Leave" },
    { value: "unpaid", label: "Unpaid Leave" },
    { value: "maternity", label: "Maternity Leave" },
    { value: "paternity", label: "Paternity Leave" },
    { value: "bereavement", label: "Bereavement Leave" },
]

// Calculation unit options
const calculationUnits = [
    { value: "days", label: "Days" },
    { value: "hours", label: "Hours" },
    { value: "half_day", label: "Half Day" },
]

// Status options
const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
]

export function LeaveCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: LeaveCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    // Redux states for dropdown data
    const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard)
    const { sites, isLoading: sitesLoading } = useAppSelector((state) => state.site)

    // Search states for comboboxes - exactly like complaint form
    const [guardSearch, setGuardSearch] = useState("")
    const [siteSearch, setSiteSearch] = useState("")

    // Date states
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [startTime, setStartTime] = useState("09:00")
    const [endTime, setEndTime] = useState("17:00")

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<LeaveFormData>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            guard_id: undefined,
            site_id: undefined,
            leave_type: "",
            start_date: "",
            end_date: "",
            reason: "",
            calculation_unit: "days",
            amount: "",
            start_time: "09:00",
            end_time: "17:00",
            status: "pending"
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Fetch initial data when dialog opens - exactly like complaint form
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchGuards({ page: 1, per_page: 100 }))
            dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }))
        }
    }, [isOpen, dispatch])

    // Search effects for all dropdowns - exactly like complaint form
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
            if (siteSearch.trim() || siteSearch === "") {
                dispatch(fetchSites({
                    page: 1,
                    per_page: 10,
                    is_active: true,
                    search: siteSearch.trim()
                }))
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [siteSearch, dispatch])

    // Format functions for display - exactly like complaint form pattern
    const formatGuardDisplay = (guard: Partial<Guard>) => {
        if (!guard) return ""
        return `${guard.full_name || 'Unknown'} (${guard.guard_code || 'No Code'})`
    }

    const formatSiteDisplay = (site: Partial<Site>) => {
        if (!site) return ""
        return `${site.title || 'Untitled Site'} (${site.site_name || 'No Code'})`
    }

    // Update start_date field when date changes
    useEffect(() => {
        if (startDate) {
            const datetime = new Date(startDate)
            const [hours, minutes] = startTime.split(':').map(Number)
            datetime.setHours(hours, minutes, 0, 0)
            setValue('start_date', format(datetime, 'yyyy-MM-dd HH:mm:ss'), { shouldValidate: true })
        }
    }, [startDate, startTime, setValue])

    // Update end_date field when date changes
    useEffect(() => {
        if (endDate) {
            const datetime = new Date(endDate)
            const [hours, minutes] = endTime.split(':').map(Number)
            datetime.setHours(hours, minutes, 0, 0)
            setValue('end_date', format(datetime, 'yyyy-MM-dd HH:mm:ss'), { shouldValidate: true })
        }
    }, [endDate, endTime, setValue])

    // Generate time options
    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2)
        const minute = (i % 2) * 30
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    })

    const formatTimeDisplay = (time: string) => {
        if (!time) return "Select time"
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${period}`
    }

    const formatDateDisplay = (date: Date | undefined) => {
        if (!date) return "Select date"
        return format(date, 'MMM dd, yyyy')
    }

    // Handle time selection
    const handleTimeSelect = (field: 'start_date' | 'end_date', time: string) => {
        if (field === 'start_date') {
            setStartTime(time)
        } else {
            setEndTime(time)
        }
    }

    const onSubmit = async (data: LeaveFormData) => {
        setIsLoading(true)
        try {
            // Prepare data for API
            const submitData: Omit<Leave, 'id' | 'created_at' | 'site' | 'reviewer' | 'total_days'> = {
                guard_id: data.guard_id,
                site_id: data.site_id,
                leave_type: data.leave_type,
                start_date: data.start_date,
                end_date: data.end_date,
                reason: data.reason.trim(),
                status: data.status,
                review_note: null
            }

            const result = await dispatch(createLeave(submitData))

            if (createLeave.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Leave Request Created',
                    'Leave request has been created successfully.'
                ).then(() => {
                    // Reset all states
                    reset()
                    setStartDate(undefined)
                    setEndDate(undefined)
                    setStartTime("09:00")
                    setEndTime("17:00")
                    setGuardSearch("")
                    setSiteSearch("")
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create leave request. Please try again."

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

    const handleCancel = () => {
        const hasData = formValues.guard_id ||
            formValues.site_id ||
            formValues.leave_type ||
            startDate ||
            endDate ||
            formValues.reason.trim() ||
            formValues.amount

        if (!hasData) {
            reset()
            setStartDate(undefined)
            setEndDate(undefined)
            onOpenChange?.(false)
            return
        }

        SweetAlertService.confirm(
            'Discard Changes?',
            'You have unsaved changes. Are you sure you want to close?',
            'Yes, discard',
            'No, keep'
        ).then((result) => {
            if (result.isConfirmed) {
                reset()
                setStartDate(undefined)
                setEndDate(undefined)
                onOpenChange?.(false)
            }
        })
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            onOpenChange?.(true)
        } else {
            const hasData = formValues.guard_id ||
                formValues.site_id ||
                formValues.leave_type ||
                startDate ||
                endDate ||
                formValues.reason.trim() ||
                formValues.amount

            if (!hasData) {
                reset()
                setStartDate(undefined)
                setEndDate(undefined)
                onOpenChange?.(false)
            } else {
                SweetAlertService.confirm(
                    'Discard Changes?',
                    'You have unsaved changes. Are you sure you want to close?',
                    'Yes, discard',
                    'No, keep'
                ).then((result) => {
                    if (result.isConfirmed) {
                        reset()
                        setStartDate(undefined)
                        setEndDate(undefined)
                        onOpenChange?.(false)
                    } else {
                        onOpenChange?.(true)
                    }
                })
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Create Leave Request</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Leave Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Guard Selection - Exactly like complaint form pattern */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Guard <span className="text-red-500">*</span>
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.guard_id || ""}
                                    onValueChange={(value) => {
                                        setValue("guard_id", Number(value), { shouldValidate: true })
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
                                        if (!value) return "Select guard"
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select guard"
                                    }}
                                />
                                {errors.guard_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.guard_id.message}</p>
                                )}
                            </div>

                            {/* Site Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Site <span className="text-red-500">*</span>
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.site_id || ""}
                                    onValueChange={(value) => {
                                        setValue("site_id", Number(value), { shouldValidate: true })
                                    }}
                                    options={sites.map((site: Site) => ({
                                        value: site.id,
                                        label: formatSiteDisplay(site),
                                        ...site
                                    }))}
                                    onSearch={(search) => {
                                        setSiteSearch(search)
                                        dispatch(fetchSites({
                                            page: 1,
                                            per_page: 10,
                                            is_active: true,
                                            search: search
                                        }))
                                    }}
                                    placeholder="Select site"
                                    disabled={isLoading || sitesLoading}
                                    isLoading={sitesLoading}
                                    emptyMessage={siteSearch ? "No sites found" : "No sites available"}
                                    searchPlaceholder="Search sites by name or code..."
                                    icon={Briefcase}
                                    iconPosition="left"
                                    displayValue={(value, options) => {
                                        if (!value) return "Select site"
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select site"
                                    }}
                                />
                                {errors.site_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.site_id.message}</p>
                                )}
                            </div>

                            {/* Leave Type Dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="leave_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Leave Type <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formValues.leave_type}
                                    onValueChange={(value) => setValue("leave_type", value, { shouldValidate: true })}
                                >
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Leave Types</SelectLabel>
                                            {leaveTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.leave_type && (
                                    <p className="text-sm text-red-500 mt-1">{errors.leave_type.message}</p>
                                )}
                            </div>

                            {/* Calculation Unit Dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="calculation_unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Calculation Unit <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formValues.calculation_unit}
                                    onValueChange={(value) => setValue("calculation_unit", value, { shouldValidate: true })}
                                >
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Units</SelectLabel>
                                            {calculationUnits.map((unit) => (
                                                <SelectItem key={unit.value} value={unit.value}>
                                                    {unit.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.calculation_unit && (
                                    <p className="text-sm text-red-500 mt-1">{errors.calculation_unit.message}</p>
                                )}
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <FloatingLabelInput
                                    label="Amount *"
                                    type="text"
                                    placeholder="0.00"
                                    {...register("amount")}
                                    error={errors.amount?.message}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Status Dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formValues.status}
                                    onValueChange={(value: "pending" | "approved" | "rejected" | "completed") => 
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

                    {/* Date & Time Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Leave Duration
                        </h3>

                        {/* Start Date & Time */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Start Date & Time
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date" className="text-sm font-medium">
                                        Date *
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
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_time" className="text-sm font-medium">
                                        Time *
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-11"
                                                disabled={isLoading}
                                            >
                                                <Clock className="mr-2 h-4 w-4" />
                                                {formatTimeDisplay(startTime)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <div className="max-h-[200px] overflow-y-auto p-3">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                                    {timeOptions.map((time) => (
                                                        <Button
                                                            key={`start-${time}`}
                                                            type="button"
                                                            variant={startTime === time ? "default" : "ghost"}
                                                            className="justify-center text-xs py-2 h-8"
                                                            onClick={() => handleTimeSelect('start_date', time)}
                                                            disabled={isLoading}
                                                        >
                                                            {formatTimeDisplay(time)}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        {/* End Date & Time */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                End Date & Time
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="end_date" className="text-sm font-medium">
                                        Date *
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
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time" className="text-sm font-medium">
                                        Time *
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-11"
                                                disabled={isLoading}
                                            >
                                                <Clock className="mr-2 h-4 w-4" />
                                                {formatTimeDisplay(endTime)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <div className="max-h-[200px] overflow-y-auto p-3">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                                    {timeOptions.map((time) => (
                                                        <Button
                                                            key={`end-${time}`}
                                                            type="button"
                                                            variant={endTime === time ? "default" : "ghost"}
                                                            className="justify-center text-xs py-2 h-8"
                                                            onClick={() => handleTimeSelect('end_date', time)}
                                                            disabled={isLoading}
                                                        >
                                                            {formatTimeDisplay(time)}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Leave Reason
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reason <span className="text-red-500">*</span>
                            </Label>
                            <FloatingLabelTextarea
                                label="Provide detailed reason for leave..."
                                rows={4}
                                {...register("reason")}
                                disabled={isLoading}
                                className="resize-none"
                            />
                            {errors.reason && (
                                <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
                            )}
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    Maximum 500 characters
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formValues.reason?.length || 0}/500
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Create Leave Request"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}