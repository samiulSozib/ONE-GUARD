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
import { CalendarIcon, Clock, MapPin, User, Shield, Check, X, Globe, EyeOff, Upload, XCircle, Image as ImageIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { createReport } from "@/store/slices/dutyStatusReportSlice"
import { fetchDuties } from "@/store/slices/dutySlice"
import { fetchGuards } from "@/store/slices/guardSlice"
import { Duty } from "@/app/types/duty"
import { Guard } from "@/app/types/guard"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { useAppSelector } from "@/hooks/useAppSelector"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { Switch } from "@/components/ui/switch"

interface DutyStatusReportCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Zod schema based on CreateDutyStatusReportDto
const dutyStatusReportSchema = z.object({
    duty_id: z.number()
        .min(1, { message: "Duty is required" }),

    guard_id: z.number()
        .min(1, { message: "Guard is required" }),

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

type DutyStatusReportFormData = z.infer<typeof dutyStatusReportSchema>

export function DutyStatusReportCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: DutyStatusReportCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([])

    // Redux states for dropdown data
    const { duties, pagination: dutiesPagination, isLoading: dutiesLoading } = useAppSelector((state) => state.duty)
    const { guards, pagination: guardsPagination, isLoading: guardsLoading } = useAppSelector((state) => state.guard)

    // Search states for comboboxes
    const [dutySearch, setDutySearch] = useState("")
    const [guardSearch, setGuardSearch] = useState("")

    // Location state
    const [useCurrentLocation, setUseCurrentLocation] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<DutyStatusReportFormData>({
        resolver: zodResolver(dutyStatusReportSchema),
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

    // Initial fetch on mount
    useEffect(() => {
        dispatch(fetchDuties({ 
            page: 1, 
            per_page: 10, 
            is_active: true,
            status: "approved"
        }))
        dispatch(fetchGuards({ 
            page: 1, 
            per_page: 10, 
        }))
    }, [dispatch])

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
        
        // Also remove preview if it's an image
        if (mediaPreviews[index]) {
            setMediaPreviews(prev => prev.filter((_, i) => i !== index))
        }
    }

    // Get selected items for display
    const selectedDuty = duties.find((duty: Duty) => duty.id === formValues.duty_id)
    const selectedGuard = guards.find((guard: Guard) => guard.id === formValues.guard_id)

    const onSubmit = async (data: DutyStatusReportFormData) => {
        setIsLoading(true)
        try {
            // Prepare CreateDutyStatusReportDto object
            const submitData = {
                duty_id: data.duty_id,
                guard_id: data.guard_id,
                message: data.message.trim(),
                is_ok: data.is_ok,
                visible_to_client: data.visible_to_client,
                ...(data.latitude && { latitude: data.latitude }),
                ...(data.longitude && { longitude: data.longitude }),
                ...(mediaFiles.length > 0 && { media_files: mediaFiles })
            }

            const result = await dispatch(createReport(submitData))

            if (createReport.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Report Created Successfully',
                    `Duty status report has been submitted successfully.`
                ).then(() => {
                    // Reset all states
                    reset()
                    setMediaFiles([])
                    setMediaPreviews([])
                    setUseCurrentLocation(false)
                    setDutySearch("")
                    setGuardSearch("")
                    
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create duty status report. Please try again."

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
        const hasData = formValues.message.trim() ||
            formValues.duty_id ||
            formValues.guard_id ||
            mediaFiles.length > 0 ||
            formValues.latitude ||
            formValues.longitude

        if (!hasData) {
            reset()
            setMediaFiles([])
            setMediaPreviews([])
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
                setMediaFiles([])
                setMediaPreviews([])
                onOpenChange?.(false)
            }
        })
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
                formValues.longitude

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

    // Format duty display
    const formatDutyDisplay = (duty: Duty) => {
        if (!duty) return ""
        const date = duty.start_datetime ? format(new Date(duty.start_datetime), 'MMM dd') : ''
        const time = duty.start_datetime ? format(new Date(duty.start_datetime), 'HH:mm') : ''
        return `${duty.title} (${date} ${time})`
    }

    // Format guard display
    const formatGuardDisplay = (guard: Guard) => {
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
                    <span className="whitespace-nowrap">Submit Duty Status Report</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Report Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                                    disabled={isLoading || dutiesLoading}
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
                                {errors.duty_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.duty_id.message}</p>
                                )}
                            </div>

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
                                    searchPlaceholder="Search guards..."
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
                                        disabled={isLoading}
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
                                        disabled={isLoading}
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
                                        disabled={isLoading}
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
                                disabled={isLoading}
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
                                    disabled={isLoading || locationLoading}
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
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        label="Longitude"
                                        type="text"
                                        placeholder="e.g., 69.207486"
                                        {...register("longitude")}
                                        error={errors.longitude?.message}
                                        disabled={isLoading}
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
                                        Selected Files ({mediaFiles.length}/5)
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {mediaFiles.map((file, index) => (
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
                                                        removeFile(index)
                                                    }}
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                </Button>
                                                
                                                {/* File preview */}
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

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Submit Report"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}