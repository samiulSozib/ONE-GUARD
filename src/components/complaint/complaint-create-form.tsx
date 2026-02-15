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
import { AlertTriangle, Shield, Building, User, MapPin, Lock, Unlock, Search, Users } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { createComplaint } from "@/store/slices/complaintSlice"
import { fetchSites } from "@/store/slices/siteSlice"
import { fetchSiteLocations } from "@/store/slices/siteLocationSlice"
import { fetchGuards } from "@/store/slices/guardSlice"
import { fetchClients } from "@/store/slices/clientSlice"
import { Complaint, CreateComplaintDto } from "@/app/types/complaint"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { useAppSelector } from "@/hooks/useAppSelector"
import { Site } from "@/app/types/site"
import { SiteLocation } from "@/app/types/siteLocation.types"
import { Guard } from "@/app/types/guard"
import { Client } from "@/app/types/client"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

interface ComplaintCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Zod schema for Complaint - Modified for guard reported by and client against
const complaintSchema = z.object({
    title: z.string()
        .min(1, { message: "Title is required" })
        .max(200, { message: "Title must be less than 200 characters" }),

    priority: z.enum(["low", "medium", "high"]),

    status: z.enum(["open", "in_progress", "resolved", "closed"]),

    reported_by_type: z.enum(["guard"]), // Fixed to only guard

    reported_by_id: z.number()
        .min(1, { message: "Guard is required" }),

    against_type: z.enum(["client"]), // Fixed to only client

    against_id: z.number()
        .min(1, { message: "Client is required" }),

    site_id: z.number()
        .min(1, { message: "Site is required" }),

    site_location_id: z.number()
        .optional()
        .nullable(),

    notes: z.string()
        .max(500, { message: "Notes must be less than 500 characters" })
        .optional()
        .nullable(),

    is_visible_to_client: z.boolean(),

    is_visible_to_guard: z.boolean(),
})

type ComplaintFormData = z.infer<typeof complaintSchema>

export function ComplaintCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: ComplaintCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    // Redux states for dropdown data
    const { sites, isLoading: sitesLoading } = useAppSelector((state) => state.site)
    const { siteLocations, isLoading: locationsLoading } = useAppSelector((state) => state.siteLocation)
    const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard)
    const { clients, isLoading: clientsLoading } = useAppSelector((state) => state.client)

    // Search states for comboboxes
    const [siteSearch, setSiteSearch] = useState("")
    const [locationSearch, setLocationSearch] = useState("")
    const [guardSearch, setGuardSearch] = useState("")
    const [clientSearch, setClientSearch] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ComplaintFormData>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            title: "",
            priority: "medium",
            status: "open",
            reported_by_type: "guard", // Fixed to guard
            reported_by_id: 0,
            against_type: "client", // Fixed to client
            against_id: 0,
            site_id: undefined,
            site_location_id: undefined,
            notes: "",
            is_visible_to_client: true,
            is_visible_to_guard: false
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Fetch initial data when dialog opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }))
            dispatch(fetchGuards({ page: 1, per_page: 100,  }))
            dispatch(fetchClients({ page: 1, per_page: 100,}))
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
        } else {
            // Clear site locations if no site selected
            setValue("site_location_id", undefined)
        }
    }, [formValues.site_id, dispatch])

    // Search effects for all dropdowns
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

    useEffect(() => {
        if (formValues.site_id) {
            const timer = setTimeout(() => {
                dispatch(fetchSiteLocations({
                    page: 1,
                    per_page: 10,
                    is_active: true,
                    search: locationSearch.trim(),
                    site_id: formValues.site_id
                }))
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [locationSearch, formValues.site_id, dispatch])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (guardSearch.trim() || guardSearch === "") {
                dispatch(fetchGuards({
                    page: 1,
                    per_page: 10,
                    //is_active: true,
                    search: guardSearch.trim()
                }))
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [guardSearch, dispatch])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (clientSearch.trim() || clientSearch === "") {
                dispatch(fetchClients({
                    page: 1,
                    per_page: 10,
                    //is_active: true,
                    search: clientSearch.trim()
                }))
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [clientSearch, dispatch])

    // Format functions for display
    const formatGuardDisplay = (guard: Partial<Guard>) => {
        if (!guard) return ""
        return `${guard.full_name || 'Unknown'} (${guard.guard_code || 'No Code'})`
    }

    const formatClientDisplay = (client: Partial<Client>) => {
        if (!client) return ""
        return `${client.full_name || 'Unknown'} (${client.company_name || 'No Company'})`
    }

    const formatSiteDisplay = (site: Partial<Site>) => {
        if (!site) return ""
        return `${site.title || 'Untitled Site'} (${site.site_name || 'No Code'})`
    }

    const formatLocationDisplay = (location: Partial<SiteLocation>) => {
        if (!location) return ""
        return `${location.title || 'Untitled Location'}`
    }

    const onSubmit = async (data: ComplaintFormData) => {
        setIsLoading(true)
        try {
            const submitData: CreateComplaintDto = {
                title: data.title.trim(),
                priority: data.priority,
                status: data.status,
                reported_by_type: data.reported_by_type,
                reported_by_id: data.reported_by_id,
                against_type: data.against_type,
                against_id: data.against_id,
                site_id: data.site_id,
                site_location_id: data.site_location_id || undefined,
                notes: data.notes?.trim() || null,
                is_visible_to_client: data.is_visible_to_client,
                is_visible_to_guard: data.is_visible_to_guard
            }

            const result = await dispatch(createComplaint(submitData))

            if (createComplaint.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Complaint Created Successfully',
                    `Complaint has been created successfully.`
                ).then(() => {
                    reset()
                    // Clear all search states
                    setSiteSearch("")
                    setLocationSearch("")
                    setGuardSearch("")
                    setClientSearch("")
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create complaint. Please try again."

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
        const hasData = formValues.title.trim() ||
            formValues.site_id ||
            formValues.reported_by_id > 0 ||
            formValues.against_id > 0 ||
            formValues.notes?.trim()

        if (!hasData) {
            reset()
            setSiteSearch("")
            setLocationSearch("")
            setGuardSearch("")
            setClientSearch("")
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
                setSiteSearch("")
                setLocationSearch("")
                setGuardSearch("")
                setClientSearch("")
                onOpenChange?.(false)
            }
        })
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            onOpenChange?.(true)
        } else {
            const hasData = formValues.title.trim() ||
                formValues.site_id ||
                formValues.reported_by_id > 0 ||
                formValues.against_id > 0 ||
                formValues.notes?.trim()

            if (!hasData) {
                reset()
                setSiteSearch("")
                setLocationSearch("")
                setGuardSearch("")
                setClientSearch("")
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
                        setSiteSearch("")
                        setLocationSearch("")
                        setGuardSearch("")
                        setClientSearch("")
                        onOpenChange?.(false)
                    } else {
                        onOpenChange?.(true)
                    }
                })
            }
        }
    }

    // Priority colors
    const priorityColors = {
        low: "bg-green-100 text-green-800 border-green-200",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        high: "bg-red-100 text-red-800 border-red-200"
    }

    // Status colors
    const statusColors = {
        open: "bg-yellow-100 text-yellow-800 border-yellow-200",
        in_progress: "bg-blue-100 text-blue-800 border-blue-200",
        resolved: "bg-green-100 text-green-800 border-green-200",
        closed: "bg-gray-100 text-gray-800 border-gray-200"
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[80vw] max-w-[80vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <span className="whitespace-nowrap">Create New Complaint</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Title - Full width */}
                            <div className="md:col-span-2">
                                <FloatingLabelInput
                                    label="Complaint Title *"
                                    {...register("title")}
                                    error={errors.title?.message}
                                    disabled={isLoading}
                                    placeholder="Enter complaint title"
                                />
                            </div>

                            {/* Priority */}
                            <div className="space-y-2">
                                <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Priority *
                                </Label>
                                <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
                                    {(["low", "medium", "high"] as const).map((priority) => (
                                        <Button
                                            key={priority}
                                            type="button"
                                            variant={formValues.priority === priority ? "default" : "ghost"}
                                            className={cn(
                                                "flex-1 transition-all duration-200 capitalize border",
                                                formValues.priority === priority ? priorityColors[priority] : ""
                                            )}
                                            onClick={() => setValue("priority", priority, { shouldValidate: true })}
                                            disabled={isLoading}
                                        >
                                            {priority}
                                        </Button>
                                    ))}
                                </div>
                                {errors.priority && (
                                    <p className="text-sm text-red-500 mt-1">{errors.priority.message}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status *
                                </Label>
                                <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
                                    {(["open", "in_progress", "resolved", "closed"] as const).map((status) => (
                                        <Button
                                            key={status}
                                            type="button"
                                            variant={formValues.status === status ? "default" : "ghost"}
                                            className={cn(
                                                "flex-1 transition-all duration-200 capitalize border",
                                                formValues.status === status ? statusColors[status] : ""
                                            )}
                                            onClick={() => setValue("status", status, { shouldValidate: true })}
                                            disabled={isLoading}
                                        >
                                            {status.replace('_', ' ')}
                                        </Button>
                                    ))}
                                </div>
                                {errors.status && (
                                    <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Parties Involved */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Parties Involved
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Reported By - Guard */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Reported By (Guard) *
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.reported_by_id || ""}
                                    onValueChange={(value) => {
                                        setValue("reported_by_id", Number(value), { shouldValidate: true })
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
                                            //is_active: true,
                                            search: search
                                        }))
                                    }}
                                    placeholder="Select guard"
                                    disabled={isLoading || guardsLoading}
                                    isLoading={guardsLoading}
                                    emptyMessage={guardSearch ? "No guards found" : "No guards available"}
                                    searchPlaceholder="Search guards by name or code..."
                                    icon={Shield}
                                    iconPosition="left"
                                    displayValue={(value, options) => {
                                        if (!value) return "Select guard"
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select guard"
                                    }}
                                />
                                {errors.reported_by_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.reported_by_id.message}</p>
                                )}
                            </div>

                            {/* Against - Client */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Against (Client) *
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.against_id || ""}
                                    onValueChange={(value) => {
                                        setValue("against_id", Number(value), { shouldValidate: true })
                                    }}
                                    options={clients.map((client: Client) => ({
                                        value: client.id,
                                        label: formatClientDisplay(client),
                                        ...client
                                    }))}
                                    onSearch={(search) => {
                                        setClientSearch(search)
                                        dispatch(fetchClients({
                                            page: 1,
                                            per_page: 10,
                                            //is_active: true,
                                            search: search
                                        }))
                                    }}
                                    placeholder="Select client"
                                    disabled={isLoading || clientsLoading}
                                    isLoading={clientsLoading}
                                    emptyMessage={clientSearch ? "No clients found" : "No clients available"}
                                    searchPlaceholder="Search clients by name or company..."
                                    icon={Users}
                                    iconPosition="left"
                                    displayValue={(value, options) => {
                                        if (!value) return "Select client"
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select client"
                                    }}
                                />
                                {errors.against_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.against_id.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Site Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Site Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Site */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Site *
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.site_id || ""}
                                    onValueChange={(value) => {
                                        const siteId = Number(value)
                                        setValue("site_id", siteId, { shouldValidate: true })
                                        // Reset location when site changes
                                        setValue("site_location_id", undefined)
                                        setLocationSearch("")
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

                            {/* Site Location (Optional) */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Location (Optional)
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.site_location_id || ""}
                                    onValueChange={(value) => {
                                        setValue("site_location_id", Number(value), { shouldValidate: true })
                                    }}
                                    options={siteLocations.map((location: SiteLocation) => ({
                                        value: location.id,
                                        label: formatLocationDisplay(location),
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
                                                site_id: formValues.site_id // Filter by selected site
                                            }))
                                        }
                                    }}
                                    placeholder={formValues.site_id ? "Select location" : "Select site first"}
                                    disabled={isLoading || locationsLoading || !formValues.site_id}
                                    isLoading={locationsLoading}
                                    emptyMessage={
                                        !formValues.site_id
                                            ? "Select a site first"
                                            : locationSearch
                                                ? "No locations found"
                                                : "No locations available for this site"
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional - specific location within the site
                                </p>
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
                                label="Enter complaint details, observations, or additional information..."
                                rows={4}
                                {...register("notes")}
                                disabled={isLoading}
                                className="resize-none"
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    Maximum 500 characters
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formValues.notes?.length || 0}/500
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visibility Settings */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Visibility Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {formValues.is_visible_to_client ? (
                                            <Unlock className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Lock className="h-4 w-4 text-gray-500" />
                                        )}
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Visible to Client
                                        </Label>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Client can view this complaint
                                    </p>
                                </div>
                                <Switch
                                    checked={formValues.is_visible_to_client}
                                    onCheckedChange={(checked) =>
                                        setValue("is_visible_to_client", checked, { shouldValidate: true })
                                    }
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {formValues.is_visible_to_guard ? (
                                            <Unlock className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Lock className="h-4 w-4 text-gray-500" />
                                        )}
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Visible to Guard
                                        </Label>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Guard can view this complaint
                                    </p>
                                </div>
                                <Switch
                                    checked={formValues.is_visible_to_guard}
                                    onCheckedChange={(checked) =>
                                        setValue("is_visible_to_guard", checked, { shouldValidate: true })
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                            Complaint Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">Title:</span>
                                <span className="ml-2 font-medium">{formValues.title || "Not set"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Priority:</span>
                                <span className={cn("ml-2 font-medium capitalize px-2 py-0.5 rounded text-xs", priorityColors[formValues.priority])}>
                                    {formValues.priority}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={cn("ml-2 font-medium capitalize px-2 py-0.5 rounded text-xs", statusColors[formValues.status])}>
                                    {formValues.status.replace('_', ' ')}
                                </span>
                            </div>
                            {formValues.reported_by_id > 0 && (
                                <div>
                                    <span className="text-gray-500">Reported by:</span>
                                    <span className="ml-2 font-medium">
                                        {guards.find(g => g.id === formValues.reported_by_id)?.full_name || "Guard"}
                                    </span>
                                </div>
                            )}
                            {formValues.against_id > 0 && (
                                <div>
                                    <span className="text-gray-500">Against:</span>
                                    <span className="ml-2 font-medium">
                                        {clients.find(c => c.id === formValues.against_id)?.full_name || "Client"}
                                    </span>
                                </div>
                            )}
                            {formValues.site_id && (
                                <div>
                                    <span className="text-gray-500">Site:</span>
                                    <span className="ml-2 font-medium">
                                        {sites.find(s => s.id === formValues.site_id)?.title || "Site"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Create Complaint"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}