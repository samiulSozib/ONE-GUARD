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
import { CalendarIcon, Clock, MapPin, Building, Clock as ClockIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateDuty, fetchDuty } from "@/store/slices/dutySlice"
import { fetchSites } from "@/store/slices/siteSlice"
import { fetchSiteLocations } from "@/store/slices/siteLocationSlice"
import { fetchDutyTimeTypes } from "@/store/slices/dutyTimeTypesSlice"
import { Duty } from "@/app/types/duty"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format, parseISO } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { useAppSelector } from "@/hooks/useAppSelector"
import { Site } from "@/app/types/site"
import { SiteLocation } from "@/app/types/siteLocation.types"
import { DutyTimeType } from "@/app/types/dutyTimeType"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"

interface DutyEditFormProps {
    trigger: ReactNode
    duty: Duty
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Zod schema matching the create form
const dutySchema = z.object({
    title: z.string()
        .min(1, { message: "Title is required" })
        .max(200, { message: "Title must be less than 200 characters" }),

    site_id: z.number()
        .min(1, { message: "Site is required" }),

    site_location_id: z.number()
        .min(1, { message: "Location is required" }),

    duty_time_type_id: z.number()
        .min(1, { message: "Duty time type is required" }),

    start_datetime: z.string()
        .min(1, { message: "Start date and time is required" }),

    end_datetime: z.string()
        .min(1, { message: "End date and time is required" }),

    guards_required: z.number()
        .min(1, { message: "At least 1 guard is required" })
        .max(20, { message: "Maximum 20 guards allowed" }),

    duty_type: z.enum(["day", "night"]),

    required_hours: z.number()
        .min(1, { message: "Minimum 1 hour required" })
        .max(24, { message: "Maximum 24 hours allowed" }),

    mandatory_check_in_time: z.string()
        .min(1, { message: "Mandatory check-in time is required" }),

    notes: z.string().optional(),

    status: z.enum(["pending", "approved", "completed"])

}).refine((data) => {
    const start = new Date(data.start_datetime)
    const end = new Date(data.end_datetime)
    return end > start
}, {
    message: "End date/time must be after start date/time",
    path: ["end_datetime"]
})

type DutyFormData = z.infer<typeof dutySchema>

export function DutyEditForm({
    trigger,
    duty,
    isOpen,
    onOpenChange,
    onSuccess
}: DutyEditFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)

    // Redux states for dropdown data
    const { sites, isLoading: sitesLoading } = useAppSelector((state) => state.site)
    const { siteLocations, isLoading: locationsLoading } = useAppSelector((state) => state.siteLocation)
    const { dutyTimeTypes, isLoading: timeTypesLoading } = useAppSelector((state) => state.dutyTimeTypes)

    // Search states for dropdowns
    const [siteSearch, setSiteSearch] = useState("")
    const [locationSearch, setLocationSearch] = useState("")
    const [timeTypeSearch, setTimeTypeSearch] = useState("")

    // Date and time states
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined)
    const [startTime, setStartTime] = useState("09:00")
    const [endTime, setEndTime] = useState("17:00")
    const [checkInTime, setCheckInTime] = useState("08:45")

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<DutyFormData>({
        resolver: zodResolver(dutySchema),
        defaultValues: {
            title: "",
            site_id: undefined,
            site_location_id: undefined,
            duty_time_type_id: undefined,
            start_datetime: "",
            end_datetime: "",
            guards_required: 1,
            duty_type: "day",
            required_hours: 8,
            mandatory_check_in_time: "",
            notes: "",
            status: "pending"
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Fetch duty details when dialog opens
    useEffect(() => {
        if (isOpen && duty?.id) {
            loadDuty()
        }
    }, [isOpen, duty?.id])

    // Fetch dropdown data when needed
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }))
            dispatch(fetchDutyTimeTypes({ page: 1, per_page: 100, is_active: true }))
        }
    }, [isOpen, dispatch])

    // Fetch site locations when site is selected
    useEffect(() => {
        if (formValues.site_id) {
            dispatch(fetchSiteLocations({
                page: 1,
                per_page: 100,
                is_active: true,
                site_id: formValues.site_id
            }))
        }
    }, [formValues.site_id, dispatch])

    const loadDuty = async () => {
    if (!duty?.id) return

    setIsFetching(true)
    try {
        const result = await dispatch(fetchDuty({
            id: duty.id,
            params: {}
        }))

        if (fetchDuty.fulfilled.match(result)) {
            const data = result.payload.item

            // Parse dates and times
            const startDatetime = parseISO(data.start_datetime)
            const endDatetime = parseISO(data.end_datetime)
            
            // Note: mandatory_check_in_time might not be in your response yet
            // If it's not present, you can set a default or omit it
            const checkInDatetime = data.mandatory_check_in_time ? parseISO(data.mandatory_check_in_time) : null

            // Set date states
            setStartDate(startDatetime)
            setEndDate(endDatetime)
            setCheckInDate(checkInDatetime || undefined)

            // Set time states
            setStartTime(format(startDatetime, 'HH:mm'))
            setEndTime(format(endDatetime, 'HH:mm'))
            setCheckInTime(checkInDatetime ? format(checkInDatetime, 'HH:mm') : "08:45")

            // Set site search for dropdown display
            const selectedSite = sites.find(s => s.id === data.site?.id)
            if (selectedSite) {
                setSiteSearch(selectedSite.site_name || "")
            }

            // Populate form with existing data
            reset({
                title: data.title || "",
                site_id: data.site?.id || undefined,
                site_location_id: data.site_location?.id || undefined,
                duty_time_type_id: data.duty_time_type_id || undefined,
                start_datetime: data.start_datetime || "",
                end_datetime: data.end_datetime || "",
                guards_required: data.guards_required || 1,
                duty_type: (data.duty_type as "day" | "night") || "day",
                required_hours: data.required_hours || 8,
                mandatory_check_in_time: data.mandatory_check_in_time || "",
                notes: data.notes || "",
                status: (data.status as "pending" | "approved" | "completed") || "pending"
            })
        }
    } catch (error) {
        console.error("Failed to load duty:", error)
        SweetAlertService.error('Error', 'Failed to load duty details')
    } finally {
        setIsFetching(false)
    }
}

    // Update datetime fields when date or time changes
    useEffect(() => {
        if (startDate) {
            const datetime = new Date(startDate)
            const [hours, minutes] = startTime.split(':').map(Number)
            datetime.setHours(hours, minutes, 0, 0)
            setValue('start_datetime', format(datetime, 'yyyy-MM-dd HH:mm:ss'), { shouldValidate: true })
        }
    }, [startDate, startTime, setValue])

    useEffect(() => {
        if (endDate) {
            const datetime = new Date(endDate)
            const [hours, minutes] = endTime.split(':').map(Number)
            datetime.setHours(hours, minutes, 0, 0)
            setValue('end_datetime', format(datetime, 'yyyy-MM-dd HH:mm:ss'), { shouldValidate: true })
        }
    }, [endDate, endTime, setValue])

    useEffect(() => {
        if (checkInDate) {
            const datetime = new Date(checkInDate)
            const [hours, minutes] = checkInTime.split(':').map(Number)
            datetime.setHours(hours, minutes, 0, 0)
            setValue('mandatory_check_in_time', format(datetime, 'yyyy-MM-dd HH:mm:ss'), { shouldValidate: true })
        }
    }, [checkInDate, checkInTime, setValue])

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
    const handleTimeSelect = (field: 'start_datetime' | 'end_datetime' | 'mandatory_check_in_time', time: string) => {
        if (field === 'start_datetime') {
            setStartTime(time)
        } else if (field === 'end_datetime') {
            setEndTime(time)
        } else {
            setCheckInTime(time)
        }
    }

    const onSubmit = async (data: DutyFormData) => {
        if (!duty?.id) return

        setIsLoading(true)
        try {
            const submitData: Partial<Duty> = {
                title: data.title.trim(),
                site_id: data.site_id,
                site_location_id: data.site_location_id,
                duty_time_type_id: data.duty_time_type_id,
                start_datetime: data.start_datetime,
                end_datetime: data.end_datetime,
                guards_required: data.guards_required,
                duty_type: data.duty_type,
                required_hours: data.required_hours,
                mandatory_check_in_time: data.mandatory_check_in_time,
                notes: data.notes?.trim() || null,
                status: data.status
            }

            const result = await dispatch(updateDuty({
                id: duty.id,
                data: submitData
            }))

            if (updateDuty.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Duty Updated',
                    `${data.title} has been updated successfully.`
                ).then(() => {
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to update duty. Please try again."

            if (typeof error === 'string') {
                errorMessage = error
            } else if (error instanceof Error) {
                errorMessage = error.message
            } else if (error && typeof error === 'object') {
                if ('message' in error && typeof error.message === 'string') {
                    errorMessage = error.message
                }
            }

            SweetAlertService.error('Update Failed', errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // const handleDialogOpenChange = (open: boolean) => {
    //     if (open) {
    //         onOpenChange?.(true)
    //     } else {
    //         // Check if form has been modified
    //         const originalData = {
    //             title: duty?.title || "",
    //             site_id: duty?.site?.id || undefined,
    //             site_location_id: duty?.site_location?.id || undefined,
    //             duty_time_type_id: duty?.duty_time_type_id || undefined,
    //             start_datetime: duty?.start_datetime || "",
    //             end_datetime: duty?.end_datetime || "",
    //             guards_required: duty?.guards_required || 1,
    //             duty_type: duty?.duty_type || "day",
    //             required_hours: duty?.required_hours || 8,
    //             mandatory_check_in_time: duty?.mandatory_check_in_time || "",
    //             notes: duty?.notes || "",
    //             status: duty?.status || "pending"
    //         }

    //         const currentData = {
    //             title: formValues.title.trim(),
    //             site_id: formValues.site_id,
    //             site_location_id: formValues.site_location_id,
    //             duty_time_type_id: formValues.duty_time_type_id,
    //             start_datetime: formValues.start_datetime,
    //             end_datetime: formValues.end_datetime,
    //             guards_required: formValues.guards_required,
    //             duty_type: formValues.duty_type,
    //             required_hours: formValues.required_hours,
    //             mandatory_check_in_time: formValues.mandatory_check_in_time,
    //             notes: formValues.notes || "",
    //             status: formValues.status
    //         }

    //         const hasChanges =
    //             currentData.title !== originalData.title ||
    //             currentData.site_id !== originalData.site_id ||
    //             currentData.site_location_id !== originalData.site_location_id ||
    //             currentData.duty_time_type_id !== originalData.duty_time_type_id ||
    //             currentData.start_datetime !== originalData.start_datetime ||
    //             currentData.end_datetime !== originalData.end_datetime ||
    //             currentData.guards_required !== originalData.guards_required ||
    //             currentData.duty_type !== originalData.duty_type ||
    //             currentData.required_hours !== originalData.required_hours ||
    //             currentData.mandatory_check_in_time !== originalData.mandatory_check_in_time ||
    //             currentData.notes !== originalData.notes ||
    //             currentData.status !== originalData.status

    //         if (!hasChanges) {
    //             onOpenChange?.(false)
    //         } 
    //         else {
    //             SweetAlertService.confirm(
    //                 'Discard Changes?',
    //                 'You have unsaved changes. Are you sure you want to close?',
    //                 'Yes, discard',
    //                 'No, keep'
    //             ).then((result) => {
    //                 if (result.isConfirmed) {
    //                     reset()
    //                     onOpenChange?.(false)
    //                 } else {
    //                     onOpenChange?.(true)
    //                 }
    //             })
    //         }
    //     }
    // }

    const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
        reset()
    }
    onOpenChange?.(open)
}

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[80vw] max-w-[80vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Edit Duty</span>
                </div>

                {isFetching ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading duty details...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Duty Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {/* Title */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <FloatingLabelInput
                                        label="Title"
                                        {...register("title")}
                                        error={errors.title?.message}
                                        disabled={isLoading || isFetching}
                                    />
                                </div>

                                {/* Site */}
                                <div className="space-y-2">
                                    <Label htmlFor="site" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Site *
                                    </Label>
                                    <SearchableDropdownWithIcon
                                        value={formValues.site_id || ""}
                                        onValueChange={(value) => {
                                            const siteId = Number(value)
                                            setValue("site_id", siteId, { shouldValidate: true })
                                            setValue("site_location_id", 0)
                                            setLocationSearch("")
                                        }}
                                        options={sites.map((site: Site) => ({
                                            value: site.id,
                                            label: site.title||site.site_name ,
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
                                        disabled={isLoading || isFetching || sitesLoading}
                                        isLoading={sitesLoading}
                                        emptyMessage={siteSearch ? "No sites found" : "No sites available"}
                                        searchPlaceholder="Search sites..."
                                        icon={Building}
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

                                {/* Site Location */}
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Location *
                                    </Label>
                                    <SearchableDropdownWithIcon
                                        value={formValues.site_location_id || ""}
                                        onValueChange={(value) => {
                                            setValue("site_location_id", Number(value), { shouldValidate: true })
                                        }}
                                        options={siteLocations.map((location: SiteLocation) => ({
                                            value: location.id,
                                            label: location.title,
                                            ...location
                                        }))}
                                        onSearch={(search) => {
                                            if (formValues.site_id) {
                                                setLocationSearch(search)
                                                dispatch(fetchSiteLocations({
                                                    page: 1,
                                                    per_page: 10,
                                                    is_active: true,
                                                    search: search,
                                                    site_id: formValues.site_id
                                                }))
                                            }
                                        }}
                                        placeholder={formValues.site_id ? "Select location" : "Select site first"}
                                        disabled={isLoading || isFetching || locationsLoading || !formValues.site_id}
                                        isLoading={locationsLoading}
                                        emptyMessage={
                                            !formValues.site_id
                                                ? "Select a site first"
                                                : locationSearch
                                                    ? "No locations found"
                                                    : "No locations available"
                                        }
                                        searchPlaceholder="Search locations..."
                                        icon={MapPin}
                                        iconPosition="left"
                                        displayValue={(value, options) => {
                                            if (!value) return formValues.site_id ? "Select location" : "Select site first"
                                            const option = options.find(opt => opt.value === value)
                                            return option?.label || "Select location"
                                        }}
                                    />
                                    {errors.site_location_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.site_location_id.message}</p>
                                    )}
                                </div>

                                {/* Duty Time Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="timeType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Duty Time Type *
                                    </Label>
                                    <SearchableDropdownWithIcon
                                        value={formValues.duty_time_type_id || ""}
                                        onValueChange={(value) => {
                                            setValue("duty_time_type_id", Number(value), { shouldValidate: true })
                                        }}
                                        options={dutyTimeTypes.map((type: DutyTimeType) => ({
                                            value: type.id,
                                            label: `${type.title} (${type.start_time} - ${type.end_time})`,
                                            ...type
                                        }))}
                                        onSearch={(search) => {
                                            setTimeTypeSearch(search)
                                            dispatch(fetchDutyTimeTypes({
                                                page: 1,
                                                per_page: 10,
                                                is_active: true,
                                                search: search
                                            }))
                                        }}
                                        placeholder="Select time type"
                                        disabled={isLoading || isFetching || timeTypesLoading}
                                        isLoading={timeTypesLoading}
                                        emptyMessage={timeTypeSearch ? "No time types found" : "No time types available"}
                                        searchPlaceholder="Search time types..."
                                        icon={ClockIcon}
                                        iconPosition="left"
                                        displayValue={(value, options) => {
                                            if (!value) return "Select time type"
                                            const option = options.find(opt => opt.value === value)
                                            return option?.label || "Select time type"
                                        }}
                                    />
                                    {errors.duty_time_type_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.duty_time_type_id.message}</p>
                                    )}
                                </div>

                                {/* Guards Required */}
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        label="Guards Required"
                                        type="number"
                                        min="1"
                                        max="20"
                                        {...register("guards_required", { valueAsNumber: true })}
                                        error={errors.guards_required?.message}
                                        disabled={isLoading || isFetching}
                                    />
                                </div>

                                {/* Required Hours */}
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        label="Required Hours"
                                        type="number"
                                        min="1"
                                        max="24"
                                        step="0.5"
                                        {...register("required_hours", { valueAsNumber: true })}
                                        error={errors.required_hours?.message}
                                        disabled={isLoading || isFetching}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Duty Type Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Duty Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {/* Duty Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="duty_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Duty Type *
                                    </Label>
                                    <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
                                        <Button
                                            type="button"
                                            variant={formValues.duty_type === "day" ? "default" : "ghost"}
                                            className="flex-1 transition-all duration-200"
                                            onClick={() => setValue("duty_type", "day", { shouldValidate: true })}
                                            disabled={isLoading || isFetching}
                                        >
                                            Day
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formValues.duty_type === "night" ? "default" : "ghost"}
                                            className="flex-1 transition-all duration-200"
                                            onClick={() => setValue("duty_type", "night", { shouldValidate: true })}
                                            disabled={isLoading || isFetching}
                                        >
                                            Night
                                        </Button>
                                    </div>
                                    {errors.duty_type && (
                                        <p className="text-sm text-red-500 mt-1">{errors.duty_type.message}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status *
                                    </Label>
                                    <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
                                        <Button
                                            type="button"
                                            variant={formValues.status === "pending" ? "default" : "ghost"}
                                            className="flex-1 transition-all duration-200"
                                            onClick={() => setValue("status", "pending", { shouldValidate: true })}
                                            disabled={isLoading || isFetching}
                                        >
                                            Pending
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formValues.status === "approved" ? "default" : "ghost"}
                                            className="flex-1 transition-all duration-200"
                                            onClick={() => setValue("status", "approved", { shouldValidate: true })}
                                            disabled={isLoading || isFetching}
                                        >
                                            Approved
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formValues.status === "completed" ? "default" : "ghost"}
                                            className="flex-1 transition-all duration-200"
                                            onClick={() => setValue("status", "completed", { shouldValidate: true })}
                                            disabled={isLoading || isFetching}
                                        >
                                            Completed
                                        </Button>
                                    </div>
                                    {errors.status && (
                                        <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Date & Time
                            </h3>

                            {/* Start Date & Time */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Start Date & Time
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Date *
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                                        !startDate && "text-muted-foreground"
                                                    )}
                                                    disabled={isLoading || isFetching}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
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
                                        <Label htmlFor="start_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Time *
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                    disabled={isLoading || isFetching}
                                                >
                                                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
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
                                                                className="justify-center text-xs py-2 h-8 transition-all duration-150 hover:scale-[1.02]"
                                                                onClick={() => handleTimeSelect('start_datetime', time)}
                                                                disabled={isLoading || isFetching}
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
                                        <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Date *
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                                        !endDate && "text-muted-foreground"
                                                    )}
                                                    disabled={isLoading || isFetching}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
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
                                        <Label htmlFor="end_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Time *
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                    disabled={isLoading || isFetching}
                                                >
                                                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
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
                                                                className="justify-center text-xs py-2 h-8 transition-all duration-150 hover:scale-[1.02]"
                                                                onClick={() => handleTimeSelect('end_datetime', time)}
                                                                disabled={isLoading || isFetching}
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

                            {/* Check-in Date & Time */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Mandatory Check-in
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="checkin_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                                    disabled={isLoading || isFetching}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                    {formatDateDisplay(checkInDate)}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={checkInDate}
                                                    onSelect={setCheckInDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="checkin_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Time *
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                    disabled={isLoading || isFetching}
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
                                                                onClick={() => handleTimeSelect('mandatory_check_in_time', time)}
                                                                disabled={isLoading || isFetching}
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

                        {/* Notes Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Additional Information
                            </h3>
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Notes (Optional)
                                </Label>
                                <FloatingLabelTextarea
                                    label="Add any additional notes or instructions..."
                                    rows={3}
                                    {...register("notes")}
                                    disabled={isLoading || isFetching}
                                    className="resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <DialogActionFooter
                            cancelText="Cancel"
                            submitText="Update Duty"
                            isSubmitting={isLoading}
                            submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            onSubmit={handleSubmit(onSubmit)}
                        />
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}