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
import { CalendarIcon, Building, Users, User, AlertTriangle, UploadCloud } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { createIncident } from "@/store/slices/incidentSlice"
import { fetchSites } from "@/store/slices/siteSlice"
import { fetchClients } from "@/store/slices/clientSlice"
import { fetchGuards } from "@/store/slices/guardSlice"
import { fetchSiteLocations } from "@/store/slices/siteLocationSlice"
import { CreateIncidentDto } from "@/app/types/incident"
import { Site } from "@/app/types/site"
import { SiteLocation } from "@/app/types/siteLocation.types"
import { Client } from "@/app/types/client"
import { Guard } from "@/app/types/guard"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { Input } from "@/components/ui/input"

// Incident type options
const incidentTypeOptions = [
    { value: "fire", label: "Fire" },
    { value: "theft", label: "Theft" },
    { value: "accident", label: "Accident" },
    { value: "medical", label: "Medical Emergency" },
    { value: "security_breach", label: "Security Breach" },
    { value: "property_damage", label: "Property Damage" },
    { value: "suspicious_activity", label: "Suspicious Activity" },
    { value: "other", label: "Other" },
]

// Severity options
const severityOptions = [
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
    { value: "minor", label: "Minor" },
]

// Reporter type options
const reporterTypeOptions = [
    { value: "admin", label: "Admin" },
    { value: "guard", label: "Guard" },
    { value: "client", label: "Client" },
    { value: "system", label: "System" },
]

// Zod schema
const incidentSchema = z.object({
    title: z.string()
        .min(1, { message: "Title is required" })
        .max(200, { message: "Title must be less than 200 characters" }),

    site_id: z.number()
        .min(1, { message: "Site is required" }),

    site_location_id: z.union([
        z.number().min(1, { message: "Site location is required" }),
        z.null(),
        z.undefined()
    ]).refine(val => val && val > 0, {
        message: "Site location is required",
    }),

    client_id: z.number()
        .min(1, { message: "Client is required" }),

    guard_id: z.union([z.number(), z.null(), z.undefined()]).optional(),

    duty_id: z.union([z.number(), z.null(), z.undefined()]).optional(),

    reporter_type: z.string()
        .min(1, { message: "Reporter type is required" }),

    reporter_id: z.union([
        z.number().min(1, { message: "Reporter ID is required" }),
        z.null(),
        z.undefined()
    ]).refine(val => val && val > 0, {
        message: "Reporter ID is required",
    }),

    incident_type: z.string()
        .min(1, { message: "Incident type is required" }),

    severity: z.string()
        .min(1, { message: "Severity is required" }),

    incident_place: z.string()
        .min(1, { message: "Incident place is required" }),

    incident_address: z.string()
        .min(1, { message: "Incident address is required" }),

    incident_date: z.string()
        .min(1, { message: "Incident date is required" }),

    incident_time: z.string()
        .min(1, { message: "Incident time is required" }),

    description: z.string()
        .min(1, { message: "Description is required" }),

    injury_or_damage_note: z.union([z.string(), z.null(), z.undefined()]).optional(),

    conversation_note: z.union([z.string(), z.null(), z.undefined()]).optional(),

    note: z.union([z.string(), z.null(), z.undefined()]).optional(),

    latitude: z.union([z.number(), z.null(), z.undefined()]).optional(),
    longitude: z.union([z.number(), z.null(), z.undefined()]).optional(),

    visible_to_client: z.boolean()
})

type IncidentFormData = z.infer<typeof incidentSchema>

interface IncidentCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function IncidentCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: IncidentCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [locationSearch, setLocationSearch] = useState("")

    // Redux states for dropdown data
    const { sites, isLoading: sitesLoading } = useAppSelector((state) => state.site)
    const { clients, isLoading: clientsLoading } = useAppSelector((state) => state.client)
    const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard)
    const { siteLocations, isLoading: locationsLoading } = useAppSelector((state) => state.siteLocation)

    // Search states for comboboxes
    const [siteSearch, setSiteSearch] = useState("")
    const [clientSearch, setClientSearch] = useState("")
    const [guardSearch, setGuardSearch] = useState("")

    // Date and time states
    const [incidentDate, setIncidentDate] = useState<Date | undefined>(new Date())
    const [incidentTime, setIncidentTime] = useState<string>(
        format(new Date(), 'HH:mm')
    )

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<IncidentFormData>({
        resolver: zodResolver(incidentSchema),
        defaultValues: {
            title: "",
            site_id: undefined,
            site_location_id: undefined,
            client_id: undefined,
            guard_id: undefined,
            duty_id: undefined,
            reporter_type: "admin",
            reporter_id: 1,
            incident_type: "",
            severity: "",
            incident_place: "",
            incident_address: "",
            incident_date: format(new Date(), 'yyyy-MM-dd'),
            incident_time: format(new Date(), 'HH:mm'),
            description: "",
            injury_or_damage_note: "",
            conversation_note: "",
            note: "",
            latitude: null,
            longitude: null,
            visible_to_client: false,
        },
        mode: "onBlur"
    })

    const formValues = watch()
    const selectedSiteId = watch('site_id')

    // Initial fetch on mount
    useEffect(() => {
        dispatch(fetchSites({ page: 1, per_page: 100 }))
        dispatch(fetchClients({ page: 1, per_page: 100 }))
        dispatch(fetchGuards({ page: 1, per_page: 100 }))
    }, [dispatch])

    // Fetch sites when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (siteSearch.trim() || siteSearch === "") {
                dispatch(fetchSites({
                    page: 1,
                    per_page: 10,
                    search: siteSearch.trim()
                }))
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [siteSearch, dispatch])

    // Fetch clients when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (clientSearch.trim() || clientSearch === "") {
                dispatch(fetchClients({
                    page: 1,
                    per_page: 10,
                    search: clientSearch.trim()
                }))
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [clientSearch, dispatch])

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

    // Fetch site locations when site changes or location search changes
    useEffect(() => {
        if (selectedSiteId) {
            const timer = setTimeout(() => {
                dispatch(fetchSiteLocations({
                    page: 1,
                    per_page: 50,
                    site_id: selectedSiteId,
                    search: locationSearch.trim() || undefined,
                }))
            }, 300)

            return () => clearTimeout(timer)
        }
    }, [selectedSiteId, locationSearch, dispatch])

    // Reset site_location_id when site changes
    useEffect(() => {
        setValue('site_location_id', null)
        setLocationSearch("")
    }, [selectedSiteId, setValue])

    // Update incident_date when date changes
    useEffect(() => {
        if (incidentDate) {
            setValue('incident_date', format(incidentDate, 'yyyy-MM-dd'), { shouldValidate: true })
        }
    }, [incidentDate, setValue])

    // Update incident_time when time changes
    useEffect(() => {
        setValue('incident_time', incidentTime, { shouldValidate: true })
    }, [incidentTime, setValue])

    // Get selected items for display
    const selectedSite = sites.find((site: Site) => site.id === formValues.site_id)
    const selectedClient = clients.find((client: Client) => client.id === formValues.client_id)
    const selectedGuard = guards.find((guard: Guard) => guard.id === formValues.guard_id)

    const formatDateDisplay = (date: Date | undefined) => {
        if (!date) return "Select date"
        return format(date, 'MMM dd, yyyy')
    }

    const onSubmit: SubmitHandler<IncidentFormData> = async (data) => {
        setIsLoading(true)
        try {
            // Prepare data as per CreateIncidentDto
            const submitData: CreateIncidentDto = {
                title: data.title.trim(),
                site_id: data.site_id,
                site_location_id: data.site_location_id!,
                client_id: data.client_id,
                guard_id: data.guard_id || null,
                duty_id: data.duty_id || null,
                reporter_type: data.reporter_type,
                reporter_id: data.reporter_id!,
                incident_type: data.incident_type,
                severity: data.severity,
                incident_place: data.incident_place.trim(),
                incident_address: data.incident_address.trim(),
                incident_date: data.incident_date,
                incident_time: data.incident_time,
                reported_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                description: data.description.trim(),
                injury_or_damage_note: data.injury_or_damage_note?.trim() || null,
                conversation_note: data.conversation_note?.trim() || null,
                note: data.note?.trim() || null,
                latitude: data.latitude || null,
                longitude: data.longitude || null,
                visible_to_client: data.visible_to_client,
                status: "pending",
            }

            const result = await dispatch(createIncident(submitData))

            if (createIncident.fulfilled.match(result)) {
                await SweetAlertService.success(
                    'Incident Created Successfully',
                    `${data.title} has been created successfully.`
                )
                
                // Reset all states
                reset()
                setIncidentDate(new Date())
                setIncidentTime(format(new Date(), 'HH:mm'))
                setSiteSearch("")
                setClientSearch("")
                setGuardSearch("")
                setLocationSearch("")
                onSuccess?.()
                onOpenChange?.(false)
                
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create incident. Please try again."

            if (typeof error === 'string') {
                errorMessage = error
            } else if (error instanceof Error) {
                errorMessage = error.message
            } else if (error && typeof error === 'object') {
                if ('message' in error && typeof error.message === 'string') {
                    errorMessage = error.message
                }
            }

            await SweetAlertService.error('Creation Failed', errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        const hasData = formValues.title?.trim() ||
            formValues.site_id ||
            formValues.client_id ||
            formValues.description?.trim() ||
            formValues.incident_place?.trim()

        if (!hasData) {
            reset()
            setIncidentDate(new Date())
            setIncidentTime(format(new Date(), 'HH:mm'))
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
                setIncidentDate(new Date())
                setIncidentTime(format(new Date(), 'HH:mm'))
                onOpenChange?.(false)
            }
        })
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            onOpenChange?.(true)
        } else {
            const hasData = formValues.title?.trim() ||
                formValues.site_id ||
                formValues.client_id ||
                formValues.description?.trim() ||
                formValues.incident_place?.trim()

            if (!hasData) {
                reset()
                setIncidentDate(new Date())
                setIncidentTime(format(new Date(), 'HH:mm'))
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
                        setIncidentDate(new Date())
                        setIncidentTime(format(new Date(), 'HH:mm'))
                        onOpenChange?.(false)
                    }
                })
            }
        }
    }

    // Filter site locations to show only active ones and format for dropdown
    const locationOptions = siteLocations
        .map((location: SiteLocation) => ({
            value: location.id,
            label: location.title || location.title || `Location ${location.id}`,
            ...location
        }))

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1000px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add New Incident</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title - Full width */}
                    <div className="w-full">
                        <FloatingLabelInput
                            label="Incident Title *"
                            {...register("title")}
                            error={errors.title?.message}
                            disabled={isLoading}
                        />
                    </div>

                    {/* First Row: Site, Site Location, Client - 3 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Site */}
                        <div className="space-y-2">
                            <Label htmlFor="site" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Site *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.site_id || ""}
                                onValueChange={(value) => {
                                    setValue("site_id", Number(value), { shouldValidate: true })
                                }}
                                options={sites.map((site: Site) => ({
                                    value: site.id,
                                    label: site.site_name || site.title || `Site ${site.id}`,
                                    ...site
                                }))}
                                onSearch={(search) => {
                                    setSiteSearch(search)
                                    dispatch(fetchSites({
                                        page: 1,
                                        per_page: 10,
                                        search: search
                                    }))
                                }}
                                placeholder="Select site"
                                disabled={isLoading || sitesLoading}
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

                        {/* Site Location - Now properly fetched by site_id */}
                        <div className="space-y-2">
                            <Label htmlFor="site_location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Site Location *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.site_location_id || ""}
                                onValueChange={(value) => {
                                    setValue(
                                        "site_location_id",
                                        value ? Number(value) : null,
                                        { shouldValidate: true }
                                    )
                                }}
                                options={locationOptions}
                                onSearch={(search) => {
                                    setLocationSearch(search)
                                }}
                                placeholder="Select location"
                                disabled={isLoading || !selectedSiteId || locationsLoading}
                                isLoading={locationsLoading}
                                emptyMessage={!selectedSiteId 
                                    ? "Select a site first" 
                                    : locationSearch 
                                        ? "No locations found" 
                                        : "No locations available"
                                }
                                searchPlaceholder="Search locations..."
                                icon={Building}
                                iconPosition="left"
                                displayValue={(value, options) => {
                                    if (!value) return "Select location"
                                    const option = options.find(opt => opt.value === value)
                                    return option?.label || "Select location"
                                }}
                            />
                            {errors.site_location_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.site_location_id.message}</p>
                            )}
                        </div>

                        {/* Client */}
                        <div className="space-y-2">
                            <Label htmlFor="client" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Client *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.client_id || ""}
                                onValueChange={(value) => {
                                    setValue("client_id", Number(value), { shouldValidate: true })
                                }}
                                options={clients.map((client: Client) => ({
                                    value: client.id,
                                    label: `${client.full_name} (${client.client_code})`,
                                    ...client
                                }))}
                                onSearch={(search) => {
                                    setClientSearch(search)
                                    dispatch(fetchClients({
                                        page: 1,
                                        per_page: 10,
                                        search: search
                                    }))
                                }}
                                placeholder="Select client"
                                disabled={isLoading || clientsLoading}
                                isLoading={clientsLoading}
                                emptyMessage={clientSearch ? "No clients found" : "No clients available"}
                                searchPlaceholder="Search clients..."
                                icon={Users}
                                iconPosition="left"
                                displayValue={(value, options) => {
                                    if (!value) return "Select client"
                                    const option = options.find(opt => opt.value === value)
                                    return option?.label || "Select client"
                                }}
                            />
                            {errors.client_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.client_id.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Second Row: Guard, Reporter Type, Reporter ID - 3 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Guard */}
                        <div className="space-y-2">
                            <Label htmlFor="guard" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Guard (Optional)
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.guard_id || ""}
                                onValueChange={(value) => {
                                    setValue(
                                        "guard_id",
                                        value ? Number(value) : null,
                                        { shouldValidate: true }
                                    )
                                }}
                                options={guards.map((guard: Guard) => ({
                                    value: guard.id,
                                    label: `${guard.full_name} (${guard.guard_code})`,
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
                                    if (!value) return "Select guard (optional)"
                                    const option = options.find(opt => opt.value === value)
                                    return option?.label || "Select guard"
                                }}
                            />
                        </div>

                        {/* Reporter Type */}
                        <div className="space-y-2">
                            <Label htmlFor="reporter_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reporter Type *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.reporter_type || ""}
                                onValueChange={(value) => {
                                    setValue("reporter_type", value.toString(), { shouldValidate: true })
                                }}
                                options={reporterTypeOptions}
                                onSearch={() => {}}
                                placeholder="Select reporter type"
                                disabled={isLoading}
                                emptyMessage="No options available"
                                searchPlaceholder="Search..."
                                icon={User}
                                iconPosition="left"
                                displayValue={(value, options) => {
                                    if (!value) return "Select reporter type"
                                    const option = options.find(opt => opt.value === value)
                                    return option?.label || "Select reporter type"
                                }}
                            />
                            {errors.reporter_type && (
                                <p className="text-sm text-red-500 mt-1">{errors.reporter_type.message}</p>
                            )}
                        </div>

                        {/* Reporter ID */}
                        <div className="space-y-2">
                            <Label htmlFor="reporter_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reporter ID *
                            </Label>
                            <Input
                                id="reporter_id"
                                type="number"
                                min="1"
                                placeholder="Enter reporter ID"
                                className="h-11"
                                {...register("reporter_id", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.reporter_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.reporter_id.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Rest of the form remains the same... */}
                    {/* Third Row: Incident Type, Severity, Date, Time - 4 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Incident Type */}
                        <div className="space-y-2">
                            <Label htmlFor="incident_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Incident Type *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.incident_type || ""}
                                onValueChange={(value) => {
                                    setValue("incident_type", value.toString(), { shouldValidate: true })
                                }}
                                options={incidentTypeOptions}
                                onSearch={() => {}}
                                placeholder="Select type"
                                disabled={isLoading}
                                emptyMessage="No options available"
                                searchPlaceholder="Search..."
                                icon={AlertTriangle}
                                iconPosition="left"
                                displayValue={(value, options) => {
                                    if (!value) return "Select type"
                                    const option = options.find(opt => opt.value === value)
                                    return option?.label || "Select type"
                                }}
                            />
                            {errors.incident_type && (
                                <p className="text-sm text-red-500 mt-1">{errors.incident_type.message}</p>
                            )}
                        </div>

                        {/* Severity */}
                        <div className="space-y-2">
                            <Label htmlFor="severity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Severity *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.severity || ""}
                                onValueChange={(value) => {
                                    setValue("severity", value.toString(), { shouldValidate: true })
                                }}
                                options={severityOptions}
                                onSearch={() => {}}
                                placeholder="Select severity"
                                disabled={isLoading}
                                emptyMessage="No options available"
                                searchPlaceholder="Search..."
                                icon={AlertTriangle}
                                iconPosition="left"
                                displayValue={(value, options) => {
                                    if (!value) return "Select severity"
                                    const option = options.find(opt => opt.value === value)
                                    return option?.label || "Select severity"
                                }}
                            />
                            {errors.severity && (
                                <p className="text-sm text-red-500 mt-1">{errors.severity.message}</p>
                            )}
                        </div>

                        {/* Incident Date */}
                        <div className="space-y-2">
                            <Label htmlFor="incident_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Incident Date *
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-11",
                                            !incidentDate && "text-muted-foreground"
                                        )}
                                        disabled={isLoading}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                        {formatDateDisplay(incidentDate)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={incidentDate}
                                        onSelect={setIncidentDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.incident_date && (
                                <p className="text-sm text-red-500 mt-1">{errors.incident_date.message}</p>
                            )}
                        </div>

                        {/* Incident Time */}
                        <div className="space-y-2">
                            <Label htmlFor="incident_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Incident Time *
                            </Label>
                            <Input
                                id="incident_time"
                                type="time"
                                className="h-11"
                                value={incidentTime}
                                onChange={(e) => setIncidentTime(e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.incident_time && (
                                <p className="text-sm text-red-500 mt-1">{errors.incident_time.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Fourth Row: Incident Place and Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <FloatingLabelInput
                                label="Incident Place *"
                                {...register("incident_place")}
                                error={errors.incident_place?.message}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <FloatingLabelInput
                                label="Incident Address *"
                                {...register("incident_address")}
                                error={errors.incident_address?.message}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Description - Full width */}
                    <div className="w-full">
                        <FloatingLabelTextarea
                            label="Description *"
                            rows={3}
                            {...register("description")}
                            //error={errors.description?.message}
                            disabled={isLoading}
                            className="resize-none"
                            placeholder="Describe what happened..."
                        />
                    </div>

                    {/* Fifth Row: Injury/Damage Note and Conversation Note - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <FloatingLabelTextarea
                                label="Injury or Damage Note"
                                rows={3}
                                {...register("injury_or_damage_note")}
                                disabled={isLoading}
                                className="resize-none"
                                placeholder="Describe any injuries or damages..."
                            />
                        </div>

                        <div className="space-y-2">
                            <FloatingLabelTextarea
                                label="Conversation Note"
                                rows={3}
                                {...register("conversation_note")}
                                disabled={isLoading}
                                className="resize-none"
                                placeholder="Record any conversations..."
                            />
                        </div>
                    </div>

                    {/* Sixth Row: Additional Note and File Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <FloatingLabelTextarea
                                label="Additional Note (Optional)"
                                rows={3}
                                {...register("note")}
                                disabled={isLoading}
                                className="resize-none"
                                placeholder="Any additional notes..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Incident Media (Optional)
                            </Label>
                            <div className="flex flex-col justify-center items-center border-2 border-dashed border-gray-300 bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 hover:border-gray-400 transition h-full min-h-[120px]">
                                <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mb-2" />
                                <p className="text-gray-600 font-medium text-sm sm:text-base text-center">Upload Files</p>
                                <button
                                    type="button"
                                    className="mt-2 px-3 py-1 text-xs sm:text-sm border rounded-md border-gray-300 hover:bg-gray-500 whitespace-nowrap"
                                    disabled={isLoading}
                                >
                                    Select files
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visible to Client Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="visible_to_client"
                            {...register("visible_to_client")}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <Label htmlFor="visible_to_client" className="text-sm text-gray-700 dark:text-gray-300">
                            Make this incident visible to client
                        </Label>
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Create Incident"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                        //onCancel={handleCancel}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}