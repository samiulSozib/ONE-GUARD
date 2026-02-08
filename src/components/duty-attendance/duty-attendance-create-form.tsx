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
import { CalendarIcon, Clock, MapPin, User, Shield } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { createAttendance } from "@/store/slices/dutyAttendenceSlice"
import { fetchGuards } from "@/store/slices/guardSlice"
import { fetchDuties } from "@/store/slices/dutySlice"
import { CreateDutyAttendanceDto } from "@/app/types/dutyAttendance"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { useAppSelector } from "@/hooks/useAppSelector"
import { Guard } from "@/app/types/guard"
import { Duty } from "@/app/types/duty"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface DutyAttendanceCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
    preSelectedDuty?: number // Optional: pre-select a duty
    preSelectedGuard?: number // Optional: pre-select a guard
}

// Zod schema for duty attendance
const dutyAttendanceSchema = z.object({
    guard_id: z.number()
        .min(1, { message: "Guard is required" }),

    duty_id: z.number()
        .min(1, { message: "Duty is required" }),

    check_in_time: z.string()
        .min(1, { message: "Check-in time is required" }),

    check_out_time: z.string()
        .min(1, { message: "Check-out time is required" }),

    status: z.enum(["present", "absent", "late", "half_day", "leave"]),

    latitude: z.string().optional(),
    longitude: z.string().optional(),

    remarks: z.string()
        .max(500, { message: "Remarks must be less than 500 characters" })
        .optional()
}).refine((data) => {
    const checkIn = new Date(data.check_in_time)
    const checkOut = new Date(data.check_out_time)
    return checkOut > checkIn
}, {
    message: "Check-out time must be after check-in time",
    path: ["check_out_time"]
})

type DutyAttendanceFormData = z.infer<typeof dutyAttendanceSchema>

export function DutyAttendanceCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess,
    preSelectedDuty,
    preSelectedGuard
}: DutyAttendanceCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [useCurrentLocation, setUseCurrentLocation] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)

    // Redux states for dropdown data
    const { guards, pagination: guardsPagination, isLoading: guardsLoading } = useAppSelector((state) => state.guard)
    const { duties, pagination: dutiesPagination, isLoading: dutiesLoading } = useAppSelector((state) => state.duty)

    // Search states for comboboxes
    const [guardSearch, setGuardSearch] = useState("")
    const [dutySearch, setDutySearch] = useState("")

    // Date and time states
    const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date())
    const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(new Date())
    const [checkInTime, setCheckInTime] = useState(() => {
        const now = new Date()
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    })
    const [checkOutTime, setCheckOutTime] = useState(() => {
        const later = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours later
        return `${later.getHours().toString().padStart(2, '0')}:${later.getMinutes().toString().padStart(2, '0')}`
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
        trigger: triggerValidation,
    } = useForm<DutyAttendanceFormData>({
        resolver: zodResolver(dutyAttendanceSchema),
        defaultValues: {
            guard_id: preSelectedGuard || undefined,
            duty_id: preSelectedDuty || undefined,
            check_in_time: "",
            check_out_time: "",
            status: "present",
            latitude: "",
            longitude: "",
            remarks: ""
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Initial fetch on mount
    useEffect(() => {
        dispatch(fetchGuards({
            page: 1,
            per_page: 10,
            search: preSelectedGuard ? "" : guardSearch
        }))
        dispatch(fetchDuties({
            page: 1,
            per_page: 10,
            is_active: true,
            search: preSelectedDuty ? "" : dutySearch
        }))
    }, [dispatch, preSelectedGuard, preSelectedDuty])

    // Pre-select values if provided
    useEffect(() => {
        if (preSelectedGuard) {
            setValue("guard_id", preSelectedGuard, { shouldValidate: true })
        }
        if (preSelectedDuty) {
            setValue("duty_id", preSelectedDuty, { shouldValidate: true })
        }
    }, [preSelectedGuard, preSelectedDuty, setValue])

    // Fetch guards when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchGuards({
                page: 1,
                per_page: 10,
                search: guardSearch.trim()
            }))
        }, 300)

        return () => clearTimeout(timer)
    }, [guardSearch, dispatch])

    // Fetch duties when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchDuties({
                page: 1,
                per_page: 10,
                is_active: true,
                search: dutySearch.trim()
            }))
        }, 300)

        return () => clearTimeout(timer)
    }, [dutySearch, dispatch])

    // Get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser")
            return
        }

        setLocationError(null)
        setIsLoading(true)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude.toString()
                const longitude = position.coords.longitude.toString()

                setValue("latitude", latitude, { shouldValidate: true })
                setValue("longitude", longitude, { shouldValidate: true })
                setIsLoading(false)
            },
            (error) => {
                setLocationError(`Unable to get location: ${error.message}`)
                setIsLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )
    }

    // Auto-get location when toggle is enabled
    useEffect(() => {
        if (useCurrentLocation) {
            getCurrentLocation()
        } else {
            setValue("latitude", "", { shouldValidate: true })
            setValue("longitude", "", { shouldValidate: true })
            setLocationError(null)
        }
    }, [useCurrentLocation, setValue])

    // Update form values when date or time changes
    useEffect(() => {
        if (checkInDate && checkInTime) {
            const checkInDatetime = new Date(checkInDate);
            const [hours, minutes] = checkInTime.split(':').map(Number);
            checkInDatetime.setHours(hours, minutes, 0, 0);
            
            setValue('check_in_time', format(checkInDatetime, 'yyyy-MM-dd HH:mm:ss'), {
                shouldValidate: true,
            });
        }
    }, [checkInDate, checkInTime, setValue]);

    useEffect(() => {
        if (checkOutDate && checkOutTime) {
            const checkOutDatetime = new Date(checkOutDate);
            const [hours, minutes] = checkOutTime.split(':').map(Number);
            checkOutDatetime.setHours(hours, minutes, 0, 0);
            
            setValue('check_out_time', format(checkOutDatetime, 'yyyy-MM-dd HH:mm:ss'), {
                shouldValidate: true,
            });
        }
    }, [checkOutDate, checkOutTime, setValue]);

    // Get selected items for display
    const selectedGuard = guards.find((guard: Guard) => guard.id === formValues.guard_id)
    const selectedDuty = duties.find((duty: Duty) => duty.id === formValues.duty_id)

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
    const handleTimeSelect = (field: 'check_in_time' | 'check_out_time', time: string) => {
        if (field === 'check_in_time') {
            setCheckInTime(time)
        } else {
            setCheckOutTime(time)
        }
    }

    // Handle date selection
    const handleDateSelect = (field: 'check_in_time' | 'check_out_time', date: Date | undefined) => {
        if (field === 'check_in_time') {
            setCheckInDate(date)
        } else {
            setCheckOutDate(date)
        }
    }

    const onSubmit = async (data: DutyAttendanceFormData) => {
        setIsLoading(true)
        
        // Validate that datetime values are properly set
        if (!data.check_in_time || !data.check_out_time) {
            SweetAlertService.error(
                'Validation Error', 
                'Please ensure both check-in and check-out times are selected'
            )
            setIsLoading(false)
            return
        }

        // Additional validation for datetime format
        if (isNaN(new Date(data.check_in_time).getTime()) || isNaN(new Date(data.check_out_time).getTime())) {
            SweetAlertService.error(
                'Invalid Date/Time Format', 
                'Please select valid date and time values'
            )
            setIsLoading(false)
            return
        }

        try {
            // Prepare data for submission
            const submitData: CreateDutyAttendanceDto = {
                guard_id: data.guard_id,
                duty_id: data.duty_id,
                check_in_time: data.check_in_time,
                check_out_time: data.check_out_time,
                status: data.status,
                latitude: data.latitude || undefined,
                longitude: data.longitude || undefined,
                remarks: data.remarks?.trim() || undefined
            }

            console.log('Submitting data:', submitData) // For debugging

            const result = await dispatch(createAttendance(submitData))

            if (createAttendance.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Attendance Recorded Successfully',
                    `Attendance for guard has been recorded successfully.`
                ).then(() => {
                    // Reset all states
                    reset()
                    setCheckInDate(new Date())
                    setCheckOutDate(new Date())
                    setCheckInTime(() => {
                        const now = new Date()
                        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
                    })
                    setCheckOutTime(() => {
                        const later = new Date(Date.now() + 8 * 60 * 60 * 1000)
                        return `${later.getHours().toString().padStart(2, '0')}:${later.getMinutes().toString().padStart(2, '0')}`
                    })
                    setUseCurrentLocation(false)
                    setLocationError(null)
                    setGuardSearch("")
                    setDutySearch("")
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to record attendance. Please try again."

            if (typeof error === 'string') {
                errorMessage = error
            } else if (error instanceof Error) {
                errorMessage = error.message
            } else if (error && typeof error === 'object') {
                if ('message' in error && typeof error.message === 'string') {
                    errorMessage = error.message
                }
            }

            SweetAlertService.error('Attendance Failed', errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        const hasData = formValues.guard_id ||
            formValues.duty_id ||
            formValues.latitude ||
            formValues.longitude ||
            formValues.remarks?.trim()

        if (!hasData) {
            reset()
            setCheckInDate(new Date())
            setCheckOutDate(new Date())
            setUseCurrentLocation(false)
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
                setCheckInDate(new Date())
                setCheckOutDate(new Date())
                setUseCurrentLocation(false)
                onOpenChange?.(false)
            }
        })
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            onOpenChange?.(true)
        } else {
            const hasData = formValues.guard_id ||
                formValues.duty_id ||
                formValues.latitude ||
                formValues.longitude ||
                formValues.remarks?.trim()

            if (!hasData) {
                reset()
                setCheckInDate(new Date())
                setCheckOutDate(new Date())
                setUseCurrentLocation(false)
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
                        setCheckInDate(new Date())
                        setCheckOutDate(new Date())
                        setUseCurrentLocation(false)
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

            <DialogContent className="sm:max-w-[700px] w-[90vw] max-w-[90vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Record Duty Attendance</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Guard & Duty Selection */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Attendance Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Guard Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="guard" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Guard *
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.guard_id || ""}
                                    onValueChange={(value) => {
                                        setValue("guard_id", Number(value), { shouldValidate: true })
                                    }}
                                    options={guards.map((guard: Guard) => ({
                                        value: guard.id,
                                        label: `${guard.full_name} ${guard.guard_code} (${guard.guard_type || 'No Badge'})`,
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
                                    disabled={isLoading || guardsLoading || !!preSelectedGuard}
                                    isLoading={guardsLoading}
                                    emptyMessage={guardSearch ? "No guards found" : "No guards available"}
                                    searchPlaceholder="Search guards..."
                                    icon={Shield}
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

                            {/* Duty Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="duty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Duty *
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.duty_id || ""}
                                    onValueChange={(value) => {
                                        setValue("duty_id", Number(value), { shouldValidate: true })
                                    }}
                                    options={duties.map((duty: Duty) => ({
                                        value: duty.id,
                                        label: `${duty.title} (${format(new Date(duty.start_datetime), 'MMM dd')})`,
                                        ...duty
                                    }))}
                                    onSearch={(search) => {
                                        setDutySearch(search)
                                        dispatch(fetchDuties({
                                            page: 1,
                                            per_page: 10,
                                            is_active: true,
                                            search: search
                                        }))
                                    }}
                                    placeholder="Select duty"
                                    disabled={isLoading || dutiesLoading || !!preSelectedDuty}
                                    isLoading={dutiesLoading}
                                    emptyMessage={dutySearch ? "No duties found" : "No duties available"}
                                    searchPlaceholder="Search duties..."
                                    icon={User}
                                    iconPosition="left"
                                    displayValue={(value, options) => {
                                        if (!value) return "Select duty"
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select duty"
                                    }}
                                />
                                {errors.duty_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.duty_id.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Attendance Status
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status *
                            </Label>
                            <RadioGroup
                                value={formValues.status}
                                onValueChange={(value: "present" | "absent" | "late" | "half_day" | "leave") =>
                                    setValue("status", value, { shouldValidate: true })
                                }
                                className="grid grid-cols-2 md:grid-cols-5 gap-2"
                                disabled={isLoading}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="present" id="present" />
                                    <Label htmlFor="present" className="cursor-pointer text-sm">
                                        Present
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="absent" id="absent" />
                                    <Label htmlFor="absent" className="cursor-pointer text-sm">
                                        Absent
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="late" id="late" />
                                    <Label htmlFor="late" className="cursor-pointer text-sm">
                                        Late
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="half_day" id="half_day" />
                                    <Label htmlFor="half_day" className="cursor-pointer text-sm">
                                        Half Day
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="leave" id="leave" />
                                    <Label htmlFor="leave" className="cursor-pointer text-sm">
                                        Leave
                                    </Label>
                                </div>
                            </RadioGroup>
                            {errors.status && (
                                <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Date & Time Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Check-in & Check-out Times
                        </h3>

                        {/* Check-in Time */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Check-in Time *
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="check_in_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date *
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                                    !checkInDate && "text-muted-foreground"
                                                )}
                                                disabled={isLoading}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                {formatDateDisplay(checkInDate)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={checkInDate}
                                                onSelect={(date) => handleDateSelect('check_in_time', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="check_in_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Time *
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                disabled={isLoading}
                                            >
                                                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                                {formatTimeDisplay(checkInTime)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <div className="max-h-[200px] overflow-y-auto p-3">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                                    {timeOptions.map((time) => (
                                                        <Button
                                                            key={`checkin-${time}`}
                                                            type="button"
                                                            variant={checkInTime === time ? "default" : "ghost"}
                                                            className="justify-center text-xs py-2 h-8 transition-all duration-150 hover:scale-[1.02]"
                                                            onClick={() => handleTimeSelect('check_in_time', time)}
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

                        {/* Check-out Time */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Check-out Time *
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="check_out_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date *
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                                    !checkOutDate && "text-muted-foreground"
                                                )}
                                                disabled={isLoading}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                {formatDateDisplay(checkOutDate)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={checkOutDate}
                                                onSelect={(date) => handleDateSelect('check_out_time', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="check_out_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Time *
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                disabled={isLoading}
                                            >
                                                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                                {formatTimeDisplay(checkOutTime)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <div className="max-h-[200px] overflow-y-auto p-3">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                                    {timeOptions.map((time) => (
                                                        <Button
                                                            key={`checkout-${time}`}
                                                            type="button"
                                                            variant={checkOutTime === time ? "default" : "ghost"}
                                                            className="justify-center text-xs py-2 h-8 transition-all duration-150 hover:scale-[1.02]"
                                                            onClick={() => handleTimeSelect('check_out_time', time)}
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

                        {/* Display current datetime values for debugging */}
                        {formValues.check_in_time && formValues.check_out_time && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">Check-in:</span> {formValues.check_in_time}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 mt-1">
                                    <span className="font-medium">Check-out:</span> {formValues.check_out_time}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Location Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Location Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Use Current Location
                                    </span>
                                </div>
                                <Switch
                                    checked={useCurrentLocation}
                                    onCheckedChange={setUseCurrentLocation}
                                    disabled={isLoading}
                                />
                            </div>

                            {useCurrentLocation && (
                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Current Location
                                            </p>
                                            {formValues.latitude && formValues.longitude ? (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Lat: {formValues.latitude}, Long: {formValues.longitude}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Fetching location...
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={getCurrentLocation}
                                            disabled={isLoading}
                                            className="text-xs"
                                        >
                                            Refresh
                                        </Button>
                                    </div>
                                    {locationError && (
                                        <p className="text-sm text-red-500">{locationError}</p>
                                    )}
                                </div>
                            )}

                            {/* Manual Location Input */}
                            {!useCurrentLocation && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FloatingLabelInput
                                        label="Latitude (Optional)"
                                        type="text"
                                        {...register("latitude")}
                                        error={errors.latitude?.message}
                                        disabled={isLoading}
                                        placeholder="e.g., 40.7128"
                                    />
                                    <FloatingLabelInput
                                        label="Longitude (Optional)"
                                        type="text"
                                        {...register("longitude")}
                                        error={errors.longitude?.message}
                                        disabled={isLoading}
                                        placeholder="e.g., -74.0060"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Remarks Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Additional Information
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Remarks (Optional)
                            </Label>
                            <FloatingLabelTextarea
                                label="Add any remarks or notes about this attendance..."
                                rows={3}
                                {...register("remarks")}
                                disabled={isLoading}
                                className="resize-none"
                            />
                            {errors.remarks && (
                                <p className="text-sm text-red-500 mt-1">{errors.remarks.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Record Attendance"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}