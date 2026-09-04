'use client'

import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect, useRef } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { MapPin, User, Shield, Check, X, Globe, EyeOff, Upload, XCircle, Image as ImageIcon, Plus } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateReport, deleteMedia, addMedia } from "@/store/slices/dutyStatusReportSlice"
import { fetchDuties } from "@/store/slices/dutySlice"
import { fetchGuards } from "@/store/slices/guardSlice"
import { Duty } from "@/app/types/duty"
import { Guard } from "@/app/types/guard"
import { DutyStatusReport, DutyStatusReportMedia } from "@/app/types/dutyStatusReport"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format, parseISO } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { useAppSelector } from "@/hooks/useAppSelector"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { Switch } from "@/components/ui/switch"
import { DutyCreateForm } from "../duty/duty-create-form"

interface DutyStatusReportEditFormProps {
    trigger: ReactNode
    report: DutyStatusReport
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Zod schema based on UpdateDutyStatusReportDto
const dutyStatusReportEditSchema = z.object({
    duty_id: z.number()
        .optional(),

    guard_id: z.number()
        .optional(),

    message: z.string()
        .min(1, { message: "Message is required" })
        .max(1000, { message: "Message must be less than 1000 characters" }),

    is_ok: z.boolean(),

    latitude: z.string()
        .optional()
        .refine((val) => !val || /^-?\d+(\.\d+)?$/.test(val), {
            message: "Invalid latitude format"
        }),

    longitude: z.string()
        .optional()
        .refine((val) => !val || /^-?\d+(\.\d+)?$/.test(val), {
            message: "Invalid longitude format"
        }),

    visible_to_client: z.boolean()
})

type DutyStatusReportEditFormData = z.infer<typeof dutyStatusReportEditSchema>

export function DutyStatusReportEditForm({
    trigger,
    report,
    isOpen,
    onOpenChange,
    onSuccess
}: DutyStatusReportEditFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Existing media from the report
    const [existingMedia, setExistingMedia] = useState<DutyStatusReportMedia[]>([])
    // New files to be uploaded
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([])

    // Dialog states for create forms
    const [dutyCreateDialogOpen, setDutyCreateDialogOpen] = useState(false)

    // Redux states for dropdown data
    const { duties, isLoading: dutiesLoading } = useAppSelector((state) => state.duty)
    const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard)

    // Search states for comboboxes
    const [dutySearch, setDutySearch] = useState("")
    const [guardSearch, setGuardSearch] = useState("")

    // Location state
    const [locationLoading, setLocationLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<DutyStatusReportEditFormData>({
        resolver: zodResolver(dutyStatusReportEditSchema),
        defaultValues: {
            duty_id: undefined,
            guard_id: undefined,
            message: "",
            is_ok: true,
            latitude: "",
            longitude: "",
            visible_to_client: true
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Fetch report details when dialog opens
    useEffect(() => {
        if (isOpen && report?.id) {
            loadReport()
        }
    }, [isOpen, report?.id])

    // Fetch dropdown data when dialog opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchDuties({
                page: 1,
                per_page: 1000,
                is_active: true,
                status: "approved"
            }))
            dispatch(fetchGuards({
                page: 1,
                per_page: 1000,
            }))
        }
    }, [isOpen, dispatch])

    // Fetch duties when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen && (dutySearch.trim() || dutySearch === "")) {
                dispatch(fetchDuties({
                    page: 1,
                    per_page: 10,
                    is_active: true,
                    status: "approved",
                    search: dutySearch.trim()
                }))
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [dutySearch, dispatch, isOpen])

    // Fetch guards when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen && (guardSearch.trim() || guardSearch === "")) {
                dispatch(fetchGuards({
                    page: 1,
                    per_page: 10,
                    search: guardSearch.trim()
                }))
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [guardSearch, dispatch, isOpen])

    const loadReport = async () => {
        if (!report?.id) return

        setIsFetching(true)
        try {
            // Get the report data from the passed report prop directly
            const data = report

            // Set existing media
            setExistingMedia(data.media || [])

            // Get duty and guard data from the report
            const reportDuty = data.duty
            const reportGuard = data.guard

            // Set search values for dropdown display
            if (reportDuty) {
                setDutySearch(formatGuardDisplayFromReport(reportDuty))
            }
            if (reportGuard) {
                // Fix: Use the guard data from the report
                setGuardSearch(formatGuardDisplayFromReport(reportGuard))
            }

            // Populate form with existing data
            reset({
                message: data.message || "",
                is_ok: data.is_ok || true,
                latitude: data.latitude ? String(data.latitude) : "",
                longitude: data.longitude ? String(data.longitude) : "",
                visible_to_client: data.visible_to_client !== undefined ? data.visible_to_client : true,
                guard_id: data?.guard?.id || data.guard_id || undefined,
                duty_id: data?.duty?.id || data.duty_id || undefined
            })
        } catch (error) {
            console.error("Failed to load report:", error)
            SweetAlertService.error('Error', 'Failed to load report details')
        } finally {
            setIsFetching(false)
        }
    }

    // Handle duty creation success
    const handleDutyCreated = () => {
        dispatch(fetchDuties({
            page: 1,
            per_page: 10,
            is_active: true,
            status: "approved",
            search: dutySearch.trim()
        }))
        setDutyCreateDialogOpen(false)
    }

    // Get current location
    const getCurrentLocation = () => {
        setLocationLoading(true)

        if (!navigator.geolocation) {
            SweetAlertService.error(
                'Location Error',
                'Geolocation is not supported by your browser.'
            )
            setLocationLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6)
                const lng = position.coords.longitude.toFixed(6)

                setValue('latitude', lat, { shouldValidate: true })
                setValue('longitude', lng, { shouldValidate: true })
                setLocationLoading(false)

                SweetAlertService.success(
                    'Location Captured',
                    `Latitude: ${lat}, Longitude: ${lng}`
                )
            },
            (error) => {
                setLocationLoading(false)
                let errorMessage = "Unable to retrieve your location."

                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location permission denied. Please enable location services."
                        break
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable."
                        break
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out."
                        break
                }

                SweetAlertService.error('Location Error', errorMessage)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newFiles = Array.from(files)
        const totalFiles = mediaFiles.length + newFiles.length

        // Limit to 5 files
        if (totalFiles > 5) {
            SweetAlertService.error(
                'File Limit Exceeded',
                'Maximum 5 files allowed. Please select fewer files.'
            )
            return
        }

        // Validate file types and size
        const validFiles: File[] = []
        const invalidFiles: string[] = []

        newFiles.forEach(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mpeg']
            const maxSize = 10 * 1024 * 1024 // 10MB

            if (!validTypes.includes(file.type)) {
                invalidFiles.push(`${file.name} - Invalid file type`)
            } else if (file.size > maxSize) {
                invalidFiles.push(`${file.name} - File too large (max 10MB)`)
            } else {
                validFiles.push(file)
            }
        })

        if (invalidFiles.length > 0) {
            SweetAlertService.error(
                'Invalid Files',
                invalidFiles.join('<br>')
            )
        }

        if (validFiles.length > 0) {
            setMediaFiles(prev => [...prev, ...validFiles])

            // Create previews for images
            validFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        setMediaPreviews(prev => [...prev, reader.result as string])
                    }
                    reader.readAsDataURL(file)
                }
            })
        }

        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Remove file
    const removeFile = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index))

        if (mediaPreviews[index]) {
            setMediaPreviews(prev => prev.filter((_, i) => i !== index))
        }
    }

    // Remove existing media
    const removeExistingMedia = async (mediaId: number) => {
        if (!report?.id) return

        SweetAlertService.confirm(
            'Delete Media',
            'Are you sure you want to delete this media file?',
            'Yes, delete',
            'No, keep'
        ).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await dispatch(deleteMedia({
                        reportId: report.id,
                        mediaId: mediaId
                    })).unwrap()

                    setExistingMedia(prev => prev.filter(media => media.id !== mediaId))

                    SweetAlertService.success(
                        'Media Deleted',
                        'Media file has been deleted successfully.'
                    )
                } catch (error) {
                    SweetAlertService.error('Delete Failed', 'Failed to delete media file')
                }
            }
        })
    }

    // Format duty display
    const formatDutyDisplay = (duty: Duty) => {
        if (!duty) return ""
        const date = duty.start_datetime ? format(new Date(duty.start_datetime), 'MMM dd') : ''
        const time = duty.start_datetime ? format(new Date(duty.start_datetime), 'HH:mm') : ''
        return `${duty.title} (${date} ${time})`
    }

    // Format guard display from report data (handles both type)
    const formatGuardDisplayFromReport = (guard: any) => {
        if (!guard) return ""
        return `${guard.full_name} (${guard.guard_code || 'No Code'})`
    }

    // Format guard display for dropdown (expects Guard from guard slice)
    const formatGuardDisplay = (guard: Guard) => {
        if (!guard) return ""
        return `${guard.full_name} (${guard.guard_code || 'No Code'})`
    }

    const onSubmit = async (data: DutyStatusReportEditFormData) => {
        if (!report?.id) return

        setIsLoading(true)
        try {
            const submitData: {
                message: string;
                is_ok: boolean;
                visible_to_client: boolean;
                latitude?: string;
                longitude?: string;
                guard_id?: number;
                duty_id?: number;
            } = {
                message: data.message.trim(),
                is_ok: data.is_ok,
                visible_to_client: data.visible_to_client,
            }

            if (data.latitude && data.latitude.trim()) {
                submitData.latitude = data.latitude.trim()
            }
            if (data.longitude && data.longitude.trim()) {
                submitData.longitude = data.longitude.trim()
            }
            if (data.guard_id) {
                submitData.guard_id = data.guard_id
            }
            if (data.duty_id) {
                submitData.duty_id = data.duty_id
            }

            const result = await dispatch(updateReport({
                id: report.id,
                data: submitData
            }))

            if (updateReport.fulfilled.match(result)) {
                // Upload new media files if any
                if (mediaFiles.length > 0) {
                    await dispatch(addMedia({
                        id: report.id,
                        files: mediaFiles
                    }))
                }

                SweetAlertService.success(
                    'Report Updated Successfully',
                    `Duty status report has been updated successfully.`
                ).then(() => {
                    setMediaFiles([])
                    setMediaPreviews([])
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to update duty status report. Please try again."
            if (typeof error === 'string') {
                errorMessage = error
            } else if (error instanceof Error) {
                errorMessage = error.message
            } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
                errorMessage = error.message
            }
            SweetAlertService.error('Update Failed', errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            onOpenChange?.(true)
        } else {
            const hasData = formValues.message.trim() ||
                formValues.duty_id ||
                formValues.guard_id ||
                mediaFiles.length > 0 ||
                formValues.latitude ||
                formValues.longitude ||
                existingMedia.length > 0

            if (!hasData) {
                reset()
                setMediaFiles([])
                setMediaPreviews([])
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
                        setMediaFiles([])
                        setMediaPreviews([])
                        onOpenChange?.(false)
                    } else {
                        onOpenChange?.(true)
                    }
                })
            }
        }
    }

    // Custom render for Duty dropdown with plus icon
    const renderDutyDropdown = () => (
        <div className="space-y-2">
            <Label htmlFor="duty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Duty
            </Label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <SearchableDropdownWithIcon
                        value={formValues.duty_id || ""}
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
                            dispatch(fetchDuties({
                                page: 1,
                                per_page: 10,
                                is_active: true,
                                status: "approved",
                                search: search
                            }))
                        }}
                        placeholder="Select duty"
                        disabled={isLoading || isFetching || dutiesLoading}
                        isLoading={dutiesLoading}
                        emptyMessage={dutySearch ? "No duties found" : "No duties available"}
                        searchPlaceholder="Search duties..."
                        icon={Shield}
                        iconPosition="left"
                        displayValue={(value, options) => {
                            if (!value) return "Select duty"
                            const option = options.find(opt => opt.value === value)
                            return option?.label || "Select duty"
                        }}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-10 w-10"
                    onClick={() => setDutyCreateDialogOpen(true)}
                    disabled={isLoading}
                    title="Create new duty"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>

                <DialogContent className="sm:max-w-[700px] w-[90vw] max-w-[90vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                        <Image src="/images/logo.png" alt="" width={24} height={24} />
                        <span className="whitespace-nowrap">Edit Duty Status Report</span>
                    </div>

                    {isFetching ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading report details...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Report Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {/* Duty Selection with Plus Button */}
                                    <div className="space-y-2">
                                        {renderDutyDropdown()}
                                    </div>

                                    {/* Guard Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="guard" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Officer
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
                                            placeholder="Select officer"
                                            disabled={isLoading || isFetching || guardsLoading}
                                            isLoading={guardsLoading}
                                            emptyMessage={guardSearch ? "No officers found" : "No officers available"}
                                            searchPlaceholder="Search officers..."
                                            icon={User}
                                            iconPosition="left"
                                            displayValue={(value, options) => {
                                                if (!value) return "Select officer"
                                                const option = options.find(opt => opt.value === value)
                                                return option?.label || "Select officer"
                                            }}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Status *
                                        </Label>
                                        <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
                                            <Button
                                                type="button"
                                                variant={formValues.is_ok ? "default" : "ghost"}
                                                className={cn(
                                                    "flex-1 transition-all duration-200",
                                                    formValues.is_ok
                                                        ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                                                        : ""
                                                )}
                                                onClick={() => setValue("is_ok", true, { shouldValidate: true })}
                                                disabled={isLoading || isFetching}
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                All OK
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={!formValues.is_ok ? "default" : "ghost"}
                                                className={cn(
                                                    "flex-1 transition-all duration-200",
                                                    !formValues.is_ok
                                                        ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
                                                        : ""
                                                )}
                                                onClick={() => setValue("is_ok", false, { shouldValidate: true })}
                                                disabled={isLoading || isFetching}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Issue
                                            </Button>
                                        </div>
                                        {errors.is_ok && (
                                            <p className="text-sm text-red-500 mt-1">{errors.is_ok.message}</p>
                                        )}
                                    </div>

                                    {/* Visibility */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Visibility
                                        </Label>
                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                {formValues.visible_to_client ? (
                                                    <Globe className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                                )}
                                                <span className="text-sm">
                                                    {formValues.visible_to_client ? 'Visible to client' : 'Hidden from client'}
                                                </span>
                                            </div>
                                            <Switch
                                                checked={formValues.visible_to_client}
                                                onCheckedChange={(checked) =>
                                                    setValue("visible_to_client", checked, { shouldValidate: true })
                                                }
                                                disabled={isLoading || isFetching}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Report Message
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Message *
                                    </Label>
                                    <FloatingLabelTextarea
                                        label="Describe the duty status, any issues, or observations..."
                                        rows={4}
                                        {...register("message")}
                                        disabled={isLoading || isFetching}
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formValues.message.length}/1000 characters
                                    </p>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Location (Optional)
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Add location coordinates
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={getCurrentLocation}
                                            disabled={isLoading || isFetching || locationLoading}
                                            className="h-9"
                                        >
                                            {locationLoading ? "Getting location..." : "Use current location"}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <FloatingLabelInput
                                                label="Latitude"
                                                type="text"
                                                placeholder="e.g., 34.555349"
                                                {...register("latitude")}
                                                error={errors.latitude?.message}
                                                disabled={isLoading || isFetching}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <FloatingLabelInput
                                                label="Longitude"
                                                type="text"
                                                placeholder="e.g., 69.207486"
                                                {...register("longitude")}
                                                error={errors.longitude?.message}
                                                disabled={isLoading || isFetching}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Add precise location coordinates for accurate reporting. Optional but recommended.
                                    </p>
                                </div>
                            </div>

                            {/* Media Upload Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Media Attachments (Optional)
                                </h3>
                                <div className="space-y-4">
                                    {/* Existing Media */}
                                    {existingMedia.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Existing Media ({existingMedia.length})
                                            </Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {existingMedia.map((media) => (
                                                    <div
                                                        key={media.id}
                                                        className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeExistingMedia(media.id)}
                                                            disabled={isLoading || isFetching}
                                                        >
                                                            <XCircle className="h-3 w-3" />
                                                        </Button>

                                                        <div className="aspect-square flex items-center justify-center">
                                                            {media.type === 'image' ? (
                                                                <div
                                                                    className="w-full h-full bg-cover bg-center"
                                                                    style={{ backgroundImage: `url(${media.thumbnail_url || media.url})` }}
                                                                />
                                                            ) : (
                                                                <div className="p-4 text-center">
                                                                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate px-2">
                                                                        Video
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* File upload area */}
                                    <div
                                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*,video/*"
                                            multiple
                                            className="hidden"
                                            disabled={isLoading || isFetching}
                                        />
                                        <div className="space-y-3">
                                            <Upload className="h-10 w-10 mx-auto text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Drop files here or click to upload
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Images (JPEG, PNG, GIF, WebP) and Videos (MP4, MPEG)
                                                    <br />
                                                    Max 5 files, 10MB each
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* File previews */}
                                    {mediaFiles.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                New Files to Upload ({mediaFiles.length}/5)
                                            </Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {mediaFiles.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                removeFile(index)
                                                            }}
                                                            disabled={isLoading || isFetching}
                                                        >
                                                            <XCircle className="h-3 w-3" />
                                                        </Button>

                                                        <div className="aspect-square flex items-center justify-center">
                                                            {file.type.startsWith('image/') && mediaPreviews[index] ? (
                                                                <div
                                                                    className="w-full h-full bg-cover bg-center"
                                                                    style={{ backgroundImage: `url(${mediaPreviews[index]})` }}
                                                                />
                                                            ) : (
                                                                <div className="p-4 text-center">
                                                                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate px-2">
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Report Information (Read-only) */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Report Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Report ID:</span>
                                        <span className="ml-2 font-medium">#{report.id}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Created:</span>
                                        <span className="ml-2 font-medium">
                                            {format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}
                                        </span>
                                    </div>
                                    {report.updated_at && (
                                        <div className="md:col-span-2">
                                            <span className="text-gray-500">Last Updated:</span>
                                            <span className="ml-2 font-medium">
                                                {format(parseISO(report.updated_at), 'MMM dd, yyyy HH:mm')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <DialogActionFooter
                                cancelText="Cancel"
                                submitText="Update Report"
                                isSubmitting={isLoading}
                                submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                onSubmit={handleSubmit(onSubmit)}
                            />
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Duty Create Dialog */}
            <DutyCreateForm
                trigger={<div />}
                isOpen={dutyCreateDialogOpen}
                onOpenChange={setDutyCreateDialogOpen}
                onSuccess={handleDutyCreated}
            />
        </>
    )
}
