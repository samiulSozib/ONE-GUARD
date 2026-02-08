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
import { CalendarIcon, Clock, MapPin, User, Shield, Check, X, Globe, EyeOff, Upload, XCircle, Image as ImageIcon, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateReport, fetchReport, deleteMedia, addMedia } from "@/store/slices/dutyStatusReportSlice"
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

interface DutyStatusReportEditFormProps {
    trigger: ReactNode
    report: DutyStatusReport
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Zod schema based on UpdateDutyStatusReportDto
const dutyStatusReportEditSchema = z.object({
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

    visible_to_client: z.boolean(),

    guard_id: z.number()
        .optional(),

    duty_id: z.number()
        .optional(),
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
    const [newMediaFiles, setNewMediaFiles] = useState<File[]>([])
    const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([])

    // Redux states for dropdown data
    const { duties, isLoading: dutiesLoading } = useAppSelector((state) => state.duty)
    const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard)
    const { currentReport } = useAppSelector((state) => state.dutyStatusReport)

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
            message: "",
            is_ok: true,
            latitude: "",
            longitude: "",
            visible_to_client: true,
            guard_id: undefined,
            duty_id: undefined
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
            if (dutySearch.trim() || dutySearch === "") {
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
    }, [dutySearch, dispatch])

    // Fetch guards when search changes
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

    const loadReport = async () => {
        if (!report?.id) return

        setIsFetching(true)
        try {
            const result = await dispatch(fetchReport({
                id: report.id,
                params: { include: ['media'] }
            }))

            if (fetchReport.fulfilled.match(result)) {
                const data = result.payload.item
                
                // Set existing media
                setExistingMedia(data.media || [])
                
                // Get duty and guard data from the fetched report
                const reportDuty = data.duty
                const reportGuard = data.guard
                
                // Set search values for dropdown display
                if (reportDuty) {
                    setDutySearch(formatDutyDisplay(reportDuty))
                }
                if (reportGuard) {
                    setGuardSearch(formatGuardDisplay(reportGuard))
                }

                // Populate form with existing data
                reset({
                    message: data.message || "",
                    is_ok: data.is_ok || true,
                    latitude: data.latitude || "",
                    longitude: data.longitude || "",
                    visible_to_client: data.visible_to_client !== undefined ? data.visible_to_client : true,
                    guard_id: data?.guard?.id || undefined,
                    duty_id: data?.duty?.id || undefined
                })
            }
        } catch (error) {
            console.error("Failed to load report:", error)
            SweetAlertService.error('Error', 'Failed to load report details')
        } finally {
            setIsFetching(false)
        }
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

    // Handle new file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newFiles = Array.from(files)
        const totalFiles = newMediaFiles.length + newFiles.length
        
        // Limit to 5 total new files
        if (totalFiles > 5) {
            SweetAlertService.error(
                'File Limit Exceeded',
                'Maximum 5 new files allowed. Please select fewer files.'
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
            setNewMediaFiles(prev => [...prev, ...validFiles])
            
            // Create previews for images
            validFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        setNewMediaPreviews(prev => [...prev, reader.result as string])
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

    // Remove new file
    const removeNewFile = (index: number) => {
        setNewMediaFiles(prev => prev.filter((_, i) => i !== index))
        
        // Also remove preview if it's an image
        if (newMediaPreviews[index]) {
            setNewMediaPreviews(prev => prev.filter((_, i) => i !== index))
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
                    
                    // Remove from local state
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

    // Get selected items for display
    const selectedDuty = duties.find((duty: Duty) => duty.id === formValues.duty_id)
    const selectedGuard = guards.find((guard: Guard) => guard.id === formValues.guard_id)

    const onSubmit = async (data: DutyStatusReportEditFormData) => {
        if (!report?.id) return

        setIsLoading(true)
        try {
            // Prepare UpdateDutyStatusReportDto object
            const submitData = {
                message: data.message.trim(),
                is_ok: data.is_ok,
                visible_to_client: data.visible_to_client,
                ...(data.latitude && { latitude: data.latitude }),
                ...(data.longitude && { longitude: data.longitude }),
                ...(data.guard_id && { guard_id: data.guard_id }),
                ...(data.duty_id && { duty_id: data.duty_id })
            }

            // First update the report
            const result = await dispatch(updateReport({
                id: report.id,
                data: submitData
            }))

            if (updateReport.fulfilled.match(result)) {
                // Then upload new media files if any
                if (newMediaFiles.length > 0) {
                    await dispatch(addMedia({
                        id: report.id,
                        files: newMediaFiles
                    }))
                }

                SweetAlertService.success(
                    'Report Updated Successfully',
                    `Duty status report has been updated successfully.`
                ).then(() => {
                    // Reset new media states
                    setNewMediaFiles([])
                    setNewMediaPreviews([])
                    
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

    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            onOpenChange?.(true)
        } else {
            // Check if form has been modified
            const originalData = {
                message: report?.message || "",
                is_ok: report?.is_ok || true,
                latitude: report?.latitude || "",
                longitude: report?.longitude || "",
                visible_to_client: report?.visible_to_client !== undefined ? report.visible_to_client : true,
                guard_id: report?.guard_id || undefined,
                duty_id: report?.duty_id || undefined
            }

            const currentData = {
                message: formValues.message.trim(),
                is_ok: formValues.is_ok,
                latitude: formValues.latitude || "",
                longitude: formValues.longitude || "",
                visible_to_client: formValues.visible_to_client,
                guard_id: formValues.guard_id,
                duty_id: formValues.duty_id
            }

            const hasChanges =
                currentData.message !== originalData.message ||
                currentData.is_ok !== originalData.is_ok ||
                currentData.latitude !== originalData.latitude ||
                currentData.longitude !== originalData.longitude ||
                currentData.visible_to_client !== originalData.visible_to_client ||
                currentData.guard_id !== originalData.guard_id ||
                currentData.duty_id !== originalData.duty_id ||
                newMediaFiles.length > 0

            if (!hasChanges) {
                onOpenChange?.(false)
            } else {
                SweetAlertService.confirm(
                    'Discard Changes?',
                    'You have unsaved changes. Are you sure you want to close?',
                    'Yes, discard',
                    'No, keep'
                ).then((result) => {
                    if (result.isConfirmed) {
                        // Reset only new media, keep existing form data
                        setNewMediaFiles([])
                        setNewMediaPreviews([])
                        onOpenChange?.(false)
                    } else {
                        onOpenChange?.(true)
                    }
                })
            }
        }
    }

    // Format duty display
    const formatDutyDisplay = (duty: Partial<Duty>) => {
        if (!duty) return ""
        const date = duty.start_datetime ? format(new Date(duty.start_datetime), 'MMM dd') : ''
        const time = duty.start_datetime ? format(new Date(duty.start_datetime), 'HH:mm') : ''
        return `${duty.title} (${date} ${time})`
    }

    // Format guard display
    const formatGuardDisplay = (guard: Partial<Guard>) => {
        if (!guard) return ""
        return `${guard.full_name} (${guard.guard_code || 'No Code'})`
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
                                {/* Duty Selection (Optional) */}
                                <div className="space-y-2">
                                    <Label htmlFor="duty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Duty
                                    </Label>
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
                                        placeholder="Select duty (optional)"
                                        disabled={isLoading || isFetching || dutiesLoading}
                                        isLoading={dutiesLoading}
                                        emptyMessage={dutySearch ? "No duties found" : "No duties available"}
                                        searchPlaceholder="Search duties..."
                                        icon={Shield}
                                        iconPosition="left"
                                        displayValue={(value, options) => {
                                            if (!value) return "Select duty (optional)"
                                            const option = options.find(opt => opt.value === value)
                                            return option?.label || "Select duty (optional)"
                                        }}
                                    />
                                </div>

                                {/* Guard Selection (Optional) */}
                                <div className="space-y-2">
                                    <Label htmlFor="guard" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Guard
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
                                        placeholder="Select guard (optional)"
                                        disabled={isLoading || isFetching || guardsLoading}
                                        isLoading={guardsLoading}
                                        emptyMessage={guardSearch ? "No guards found" : "No guards available"}
                                        searchPlaceholder="Search guards..."
                                        icon={User}
                                        iconPosition="left"
                                        displayValue={(value, options) => {
                                            if (!value) return "Select guard (optional)"
                                            const option = options.find(opt => opt.value === value)
                                            return option?.label || "Select guard (optional)"
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
                                    //error={errors.message?.message}
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
                                            Update location coordinates
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
                                    Update location coordinates for accurate reporting. Leave empty to keep current location.
                                </p>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Media Attachments
                            </h3>
                            
                            {/* Existing Media */}
                            {existingMedia.length > 0 && (
                                <div className="mb-6">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                                        Existing Media ({existingMedia.length})
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                                        {existingMedia.map((media) => (
                                            <div 
                                                key={media.id}
                                                className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
                                            >
                                                {/* Remove button */}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeExistingMedia(media.id)}
                                                    disabled={isLoading || isFetching}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                                
                                                {/* Media preview */}
                                                <div className="aspect-square flex items-center justify-center">
                                                    {media.type === 'image' ? (
                                                        <div 
                                                            className="w-full h-full bg-cover bg-center"
                                                            style={{ backgroundImage: `url(${media.thumbnail_url || media.url})` }}
                                                        />
                                                    ) : (
                                                        <div className="p-4 text-center">
                                                            <div className="h-8 w-8 mx-auto text-gray-400 mb-2">
                                                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
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

                            {/* Add New Media */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Add New Media (Optional)
                                </Label>
                                
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

                                {/* New file previews */}
                                {newMediaFiles.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            New Files to Upload ({newMediaFiles.length}/5)
                                        </Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {newMediaFiles.map((file, index) => (
                                                <div 
                                                    key={index}
                                                    className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
                                                >
                                                    {/* Remove button */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeNewFile(index)
                                                        }}
                                                        disabled={isLoading || isFetching}
                                                    >
                                                        <XCircle className="h-3 w-3" />
                                                    </Button>
                                                    
                                                    {/* File preview */}
                                                    <div className="aspect-square flex items-center justify-center">
                                                        {file.type.startsWith('image/') && newMediaPreviews[index] ? (
                                                            <div 
                                                                className="w-full h-full bg-cover bg-center"
                                                                style={{ backgroundImage: `url(${newMediaPreviews[index]})` }}
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
    )
}