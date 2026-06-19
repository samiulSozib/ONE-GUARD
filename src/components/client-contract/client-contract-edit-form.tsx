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
import { CalendarIcon, Building, DollarSign, Clock, FileText, Users, Globe, Plus, X, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { updateContract, fetchContract } from "@/store/slices/clientContractSlice"
import { fetchClients } from "@/store/slices/clientSlice"
import { fetchSites } from "@/store/slices/siteSlice"
import { CreateClientContractDto, CreateClientContractSite, ClientContract } from "@/app/types/clientContract"
import { cn } from "@/lib/utils"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import SweetAlertService from "@/lib/sweetAlert"
import { format } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { Client } from "@/app/types/client"
import { Site } from "@/app/types/site"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClientContractEditFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
    contractId: number
}

interface ClientContractFormData {
    client_id?: number
    name?: string
    type?: "ongoing" | "fixed_term" | "trial" | "one_time"
    start_date?: string
    end_date?: string
    signed_date?: string
    effective_date?: string
    contract_value?: string
    hourly_rate?: string
    overtime_rate?: string
    holiday_rate?: string
    admin_fee_percentage?: string
    billing_cycle?: "weekly" | "bi_weekly" | "monthly" | "quarterly" | "annually"
    payment_terms?: "net_15" | "net_30" | "net_45" | "net_60" | "due_on_receipt"
    currency?: "USD" | "EUR" | "GBP" | "CAD" | "AUD"
    governing_law?: string
    venue_location?: string
    termination_notice_days?: number
    renewal_notice_days?: number
    auto_renew?: boolean
    notes?: string
    sites: {
        id?: number
        site_id?: number
        site_name?: string
        address?: string
        latitude?: number
        longitude?: number
        guards_required?: number
        site_instruction?: string
        pivot?: {
            guards_required?: number
            site_specific_rate?: number
            is_primary?: boolean
        }
    }[]
}

const defaultSite = {
    site_id: undefined,
    site_name: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    guards_required: 1,
    site_instruction: "",
    pivot: {
        guards_required: 1,
        site_specific_rate: undefined,
        is_primary: false
    }
}

export function ClientContractEditForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess,
    contractId
}: ClientContractEditFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
    const [initialized, setInitialized] = useState(false)
    const [contractData, setContractData] = useState<ClientContract | null>(null)

    const { clients, isLoading: clientsLoading } = useAppSelector((state) => state.client)
    const { sites, isLoading: sitesLoading } = useAppSelector((state) => state.site)
    const { currentContract } = useAppSelector((state) => state.clientContract)

    const [clientSearch, setClientSearch] = useState("")
    const [siteSearch, setSiteSearch] = useState("")

    const [startDate, setStartDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()
    const [signedDate, setSignedDate] = useState<Date | undefined>()
    const [effectiveDate, setEffectiveDate] = useState<Date | undefined>()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        control,
        formState: { errors },
    } = useForm<ClientContractFormData>({
        defaultValues: {
            client_id: undefined,
            name: "",
            type: "ongoing",
            start_date: "",
            end_date: "",
            signed_date: "",
            effective_date: "",
            contract_value: "",
            hourly_rate: "",
            overtime_rate: "",
            holiday_rate: "",
            admin_fee_percentage: "",
            billing_cycle: "monthly",
            payment_terms: "net_30",
            currency: "USD",
            governing_law: "",
            venue_location: "",
            termination_notice_days: 30,
            renewal_notice_days: 30,
            auto_renew: false,
            notes: "",
            sites: [{ ...defaultSite }]
        }
    })

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "sites"
    })

    const formValues = watch()

    // Fetch contract data when dialog opens
    useEffect(() => {
        if (isOpen && contractId && !initialized) {
            fetchContractData(contractId)
        }
    }, [isOpen, contractId, initialized])

    // Fetch clients and sites
    useEffect(() => {
        dispatch(fetchClients({ page: 1, per_page: 10, search: clientSearch }))
        dispatch(fetchSites({ page: 1, per_page: 10, search: siteSearch }))
    }, [dispatch])

    const fetchContractData = async (id: number) => {
        setIsFetching(true)
        try {
            const result = await dispatch(fetchContract({ 
                id, 
                params: { include: ['client', 'sites', 'created_by', 'updated_by'] } 
            }))
            
            if (fetchContract.fulfilled.match(result)) {
                const contract = result.payload.item
                setContractData(contract)
                populateForm(contract)
                setInitialized(true)
            }
        } catch (error) {
            console.error('Failed to fetch contract:', error)
            SweetAlertService.error(
                'Error',
                'Failed to load contract data. Please try again.'
            )
        } finally {
            setIsFetching(false)
        }
    }

    const populateForm = (contract: ClientContract) => {
        // Basic info - get client_id from client object
        if (contract.client) {
            setValue('client_id', contract.client.id)
        }

        // Contract name
        setValue('name', contract.name || '')

        // Contract type
        if (contract.type) {
            setValue('type', contract.type as any)
        }

        // Dates
        if (contract.start_date) {
            const date = new Date(contract.start_date)
            setStartDate(date)
            setValue('start_date', format(date, 'yyyy-MM-dd'))
        }
        
        if (contract.end_date) {
            const date = new Date(contract.end_date)
            setEndDate(date)
            setValue('end_date', format(date, 'yyyy-MM-dd'))
        }
        
        if (contract.signed_date) {
            const date = new Date(contract.signed_date)
            setSignedDate(date)
            setValue('signed_date', format(date, 'yyyy-MM-dd'))
        }
        
        if (contract.effective_date) {
            const date = new Date(contract.effective_date)
            setEffectiveDate(date)
            setValue('effective_date', format(date, 'yyyy-MM-dd'))
        }

        // Financial
        setValue('contract_value', contract.contract_value?.toString() || '')
        setValue('hourly_rate', contract.hourly_rate?.toString() || '')
        setValue('overtime_rate', contract.overtime_rate?.toString() || '')
        setValue('holiday_rate', contract.holiday_rate?.toString() || '')
        setValue('admin_fee_percentage', contract.admin_fee_percentage?.toString() || '')

        // Billing & Terms
        setValue('billing_cycle', (contract.billing_cycle as any) || 'monthly')
        setValue('payment_terms', (contract.payment_terms as any) || 'net_30')
        setValue('currency', (contract.currency as any) || 'USD')
        setValue('governing_law', contract.governing_law || '')
        setValue('venue_location', contract.venue_location || '')
        setValue('termination_notice_days', contract.termination_notice_days || 30)
        setValue('renewal_notice_days', contract.renewal_notice_days || 30)
        setValue('auto_renew', contract.auto_renew || false)
        setValue('notes', contract.notes || '')

        // Sites - handle the nested structure
        if (contract.sites && contract.sites.length > 0) {
            const sitesData = contract.sites.map((siteItem: any) => {
                const site = siteItem.site || siteItem
                const pivot = siteItem.pivot || {}
                
                return {
                    id: siteItem.id || site.id,
                    site_id: site.id,
                    site_name: site.site_name || '',
                    address: site.address || '',
                    latitude: site.latitude ? parseFloat(String(site.latitude)) : undefined,
                    longitude: site.longitude ? parseFloat(String(site.longitude)) : undefined,
                    guards_required: pivot.guards_required || site.guards_required || 1,
                    site_instruction: site.site_instruction || '',
                    pivot: {
                        guards_required: pivot.guards_required || site.guards_required || 1,
                        site_specific_rate: pivot.site_specific_rate ? parseFloat(String(pivot.site_specific_rate)) : undefined,
                        is_primary: pivot.is_primary || false
                    }
                }
            })
            replace(sitesData)
        } else {
            replace([{ ...defaultSite }])
        }
    }

    // Search debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchClients({ page: 1, per_page: 10, search: clientSearch.trim() || undefined }))
        }, 300)
        return () => clearTimeout(timer)
    }, [clientSearch, dispatch])

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchSites({ page: 1, per_page: 10, search: siteSearch.trim() || undefined }))
        }, 300)
        return () => clearTimeout(timer)
    }, [siteSearch, dispatch])

    // Update form values when dates change
    useEffect(() => {
        if (startDate) setValue('start_date', format(startDate, 'yyyy-MM-dd'))
    }, [startDate, setValue])

    useEffect(() => {
        if (endDate) setValue('end_date', format(endDate, 'yyyy-MM-dd'))
        else setValue('end_date', undefined)
    }, [endDate, setValue])

    useEffect(() => {
        if (signedDate) setValue('signed_date', format(signedDate, 'yyyy-MM-dd'))
        else setValue('signed_date', undefined)
    }, [signedDate, setValue])

    useEffect(() => {
        if (effectiveDate) setValue('effective_date', format(effectiveDate, 'yyyy-MM-dd'))
        else setValue('effective_date', undefined)
    }, [effectiveDate, setValue])

    const formatDateDisplay = (date: Date | undefined) => {
        if (!date) return "Select date"
        return format(date, 'MMM dd, yyyy')
    }

    const validateForm = (data: ClientContractFormData): boolean => {
        const errors: { [key: string]: string } = {}

        if (!data.client_id) {
            errors.client_id = "Client is required"
        }

        if (!data.name || data.name.trim() === "") {
            errors.name = "Contract name is required"
        }

        if (!data.start_date) {
            errors.start_date = "Start date is required"
        }

        if (!data.sites || data.sites.length === 0) {
            errors.sites = "At least one site is required"
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const onSubmit = async (data: ClientContractFormData) => {
        if (!validateForm(data)) {
            return
        }

        setIsLoading(true)

        try {
            const sitesData: CreateClientContractSite[] = data.sites.map(site => {
                if (site.site_id) {
                    return {
                        site_id: site.site_id,
                        pivot: {
                            guards_required: site.pivot?.guards_required || site.guards_required || 1,
                            site_specific_rate: site.pivot?.site_specific_rate,
                            is_primary: site.pivot?.is_primary || false
                        }
                    }
                } else {
                    return {
                        site_name: site.site_name || '',
                        address: site.address || '',
                        latitude: site.latitude,
                        longitude: site.longitude,
                        guards_required: site.guards_required || 1,
                        site_instruction: site.site_instruction || '',
                        pivot: {
                            guards_required: site.pivot?.guards_required || site.guards_required || 1,
                            site_specific_rate: site.pivot?.site_specific_rate,
                            is_primary: site.pivot?.is_primary || false
                        }
                    }
                }
            })

            const submitData: CreateClientContractDto = {
                client_id: data.client_id!,
                name: data.name!,
                type: data.type || "ongoing",
                start_date: data.start_date!,
                end_date: data.end_date || undefined,
                signed_date: data.signed_date || undefined,
                effective_date: data.effective_date || undefined,
                contract_value: data.contract_value ? parseFloat(data.contract_value) : undefined,
                hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : undefined,
                overtime_rate: data.overtime_rate ? parseFloat(data.overtime_rate) : undefined,
                holiday_rate: data.holiday_rate ? parseFloat(data.holiday_rate) : undefined,
                admin_fee_percentage: data.admin_fee_percentage ? parseFloat(data.admin_fee_percentage) : undefined,
                billing_cycle: data.billing_cycle || "monthly",
                payment_terms: data.payment_terms || "net_30",
                currency: data.currency || "USD",
                governing_law: data.governing_law || undefined,
                venue_location: data.venue_location || undefined,
                termination_notice_days: data.termination_notice_days || 30,
                renewal_notice_days: data.renewal_notice_days || 30,
                auto_renew: data.auto_renew || false,
                notes: data.notes || undefined,
                sites: sitesData
            }

            const result = await dispatch(updateContract({ id: contractId, data: submitData }))

            if (updateContract.fulfilled.match(result)) {
                await SweetAlertService.success(
                    'Contract Updated Successfully',
                    `Contract "${data.name}" has been updated successfully.`
                )
                setInitialized(false)
                setContractData(null)
                onSuccess?.()
                onOpenChange?.(false)
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            await SweetAlertService.error(
                'Contract Update Failed',
                "Failed to update contract. Please try again."
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        const hasChanges = formValues.name || formValues.notes
        
        if (!hasChanges && !initialized) {
            handleClose()
            return
        }

        SweetAlertService.confirm(
            'Discard Changes?',
            'You have unsaved changes. Are you sure you want to close?',
            'Yes, discard',
            'No, keep'
        ).then((result) => {
            if (result.isConfirmed) {
                handleClose()
            }
        })
    }

    const handleClose = () => {
        reset()
        setValidationErrors({})
        setStartDate(undefined)
        setEndDate(undefined)
        setSignedDate(undefined)
        setEffectiveDate(undefined)
        setInitialized(false)
        setContractData(null)
        onOpenChange?.(false)
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            handleCancel()
        } else {
            onOpenChange?.(true)
        }
    }

    // Loading state
    if (isFetching) {
        return (
            <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-lg font-medium">Loading contract...</span>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // If not initialized and not fetching, return null or loading state
    if (!isFetching && !initialized && isOpen) {
        return (
            <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-lg font-medium">Loading contract...</span>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Edit Client Contract</span>
                    {contractData?.contract_number && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                            #{contractData.contract_number}
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-500" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Client *
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.client_id?.toString() || ""}
                                    onValueChange={(value) => {
                                        setValue("client_id", Number(value))
                                        if (validationErrors.client_id) {
                                            setValidationErrors(prev => ({ ...prev, client_id: "" }))
                                        }
                                    }}
                                    options={clients?.map((client: Client) => ({
                                        value: client.id,
                                        label: `${client.company_name || client.full_name} (${client.client_code})`
                                    })) || []}
                                    onSearch={setClientSearch}
                                    placeholder="Select client"
                                    disabled={isLoading || clientsLoading}
                                    isLoading={clientsLoading}
                                    emptyMessage={clientSearch ? "No clients found" : "No clients available"}
                                    searchPlaceholder="Search clients..."
                                    icon={Users}
                                    iconPosition="left"
                                />
                                {validationErrors.client_id && (
                                    <p className="text-sm text-red-500 mt-1">{validationErrors.client_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contract Name *
                                </Label>
                                <FloatingLabelInput
                                    label="Enter contract name..."
                                    {...register("name")}
                                    onChange={(e) => {
                                        setValue("name", e.target.value)
                                        if (validationErrors.name) {
                                            setValidationErrors(prev => ({ ...prev, name: "" }))
                                        }
                                    }}
                                    disabled={isLoading}
                                />
                                {validationErrors.name && (
                                    <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contract Type
                                </Label>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="grid grid-cols-2 md:grid-cols-4 gap-2"
                                            disabled={isLoading}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="ongoing" id="edit-ongoing" />
                                                <Label htmlFor="edit-ongoing" className="cursor-pointer text-sm">Ongoing</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="fixed_term" id="edit-fixed_term" />
                                                <Label htmlFor="edit-fixed_term" className="cursor-pointer text-sm">Fixed Term</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="trial" id="edit-trial" />
                                                <Label htmlFor="edit-trial" className="cursor-pointer text-sm">Trial</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="one_time" id="edit-one_time" />
                                                <Label htmlFor="edit-one_time" className="cursor-pointer text-sm">One Time</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-gray-500" />
                                Contract Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Start Date *
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                                disabled={isLoading}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                {formatDateDisplay(startDate)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={(date) => {
                                                    setStartDate(date)
                                                    if (validationErrors.start_date) {
                                                        setValidationErrors(prev => ({ ...prev, start_date: "" }))
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {validationErrors.start_date && (
                                        <p className="text-sm text-red-500 mt-1">{validationErrors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        End Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                                disabled={isLoading}
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
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Signed Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600",
                                                    !signedDate && "text-muted-foreground"
                                                )}
                                                disabled={isLoading}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                {formatDateDisplay(signedDate)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={signedDate}
                                                onSelect={setSignedDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Effective Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-11 border-gray-300 dark:border-gray-600",
                                                    !effectiveDate && "text-muted-foreground"
                                                )}
                                                disabled={isLoading}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                {formatDateDisplay(effectiveDate)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={effectiveDate}
                                                onSelect={setEffectiveDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-gray-500" />
                                Financial Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Contract Value
                                    </Label>
                                    <FloatingLabelInput
                                        label="Enter amount..."
                                        type="number"
                                        step="0.01"
                                        {...register("contract_value")}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Hourly Rate
                                    </Label>
                                    <FloatingLabelInput
                                        label="Enter rate..."
                                        type="number"
                                        step="0.01"
                                        {...register("hourly_rate")}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Overtime Rate
                                    </Label>
                                    <FloatingLabelInput
                                        label="Enter rate..."
                                        type="number"
                                        step="0.01"
                                        {...register("overtime_rate")}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Holiday Rate
                                    </Label>
                                    <FloatingLabelInput
                                        label="Enter rate..."
                                        type="number"
                                        step="0.01"
                                        {...register("holiday_rate")}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Admin Fee (%)
                                    </Label>
                                    <FloatingLabelInput
                                        label="Enter percentage..."
                                        type="number"
                                        step="0.01"
                                        {...register("admin_fee_percentage")}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Currency
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="currency"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                    <SelectItem value="GBP">GBP</SelectItem>
                                                    <SelectItem value="CAD">CAD</SelectItem>
                                                    <SelectItem value="AUD">AUD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Billing & Terms */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-500" />
                                Billing & Terms
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Billing Cycle
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="billing_cycle"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select billing cycle" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                                    <SelectItem value="annually">Annually</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Payment Terms
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="payment_terms"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select payment terms" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="net_15">Net 15</SelectItem>
                                                    <SelectItem value="net_30">Net 30</SelectItem>
                                                    <SelectItem value="net_45">Net 45</SelectItem>
                                                    <SelectItem value="net_60">Net 60</SelectItem>
                                                    <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Termination Notice (Days)
                                    </Label>
                                    <FloatingLabelInput
                                        label="Enter days..."
                                        type="number"
                                        {...register("termination_notice_days", { valueAsNumber: true })}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Renewal Notice (Days)
                                    </Label>
                                    <FloatingLabelInput
                                        label="Enter days..."
                                        type="number"
                                        {...register("renewal_notice_days", { valueAsNumber: true })}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Controller
                                        control={control}
                                        name="auto_renew"
                                        render={({ field }) => (
                                            <>
                                                <Switch
                                                    id="edit-auto_renew"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isLoading}
                                                />
                                                <Label htmlFor="edit-auto_renew" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                                    Auto Renew Contract
                                                </Label>
                                            </>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Globe className="h-5 w-5 text-gray-500" />
                                Legal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Governing Law
                                    </Label>
                                    <FloatingLabelInput
                                        label="e.g., California, New York..."
                                        {...register("governing_law")}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Venue Location
                                    </Label>
                                    <FloatingLabelInput
                                        label="e.g., Sacramento County..."
                                        {...register("venue_location")}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sites */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Building className="h-5 w-5 text-gray-500" />
                                    Sites
                                    <span className="text-sm text-red-500">*</span>
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ ...defaultSite })}
                                    disabled={isLoading || fields.length >= 10}
                                    className="text-xs"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Site
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {validationErrors.sites && (
                                <p className="text-sm text-red-500">{validationErrors.sites}</p>
                            )}

                            {fields.map((field, index) => (
                                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">Site #{index + 1}</h4>
                                        <div className="flex items-center gap-2">
                                            {field.id && (
                                                <span className="text-xs text-gray-400">
                                                    ID: {field.id}
                                                </span>
                                            )}
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                    disabled={isLoading}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-medium">
                                                Select Existing Site (Optional)
                                            </Label>
                                            <SearchableDropdownWithIcon
                                                value={formValues.sites?.[index]?.site_id?.toString() || ""}
                                                onValueChange={(value) => {
                                                    setValue(`sites.${index}.site_id`, Number(value))
                                                    // Clear site fields if existing site selected
                                                    if (value) {
                                                        setValue(`sites.${index}.site_name`, "")
                                                        setValue(`sites.${index}.address`, "")
                                                        setValue(`sites.${index}.latitude`, undefined)
                                                        setValue(`sites.${index}.longitude`, undefined)
                                                    }
                                                }}
                                                options={sites?.map((site: Site) => ({
                                                    value: site.id,
                                                    label: `${site.site_name} (${site.address || 'No address'})`
                                                })) || []}
                                                onSearch={setSiteSearch}
                                                placeholder="Select existing site or create new"
                                                disabled={isLoading || sitesLoading}
                                                isLoading={sitesLoading}
                                                emptyMessage={siteSearch ? "No sites found" : "No sites available"}
                                                searchPlaceholder="Search sites..."
                                                icon={Building}
                                                iconPosition="left"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Site Name (if new)
                                            </Label>
                                            <FloatingLabelInput
                                                label="Enter site name..."
                                                {...register(`sites.${index}.site_name`)}
                                                disabled={isLoading || !!formValues.sites?.[index]?.site_id}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Address
                                            </Label>
                                            <FloatingLabelInput
                                                label="Enter address..."
                                                {...register(`sites.${index}.address`)}
                                                disabled={isLoading || !!formValues.sites?.[index]?.site_id}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Latitude
                                            </Label>
                                            <FloatingLabelInput
                                                label="e.g., 40.7128"
                                                type="number"
                                                step="any"
                                                {...register(`sites.${index}.latitude`, { valueAsNumber: true })}
                                                disabled={isLoading || !!formValues.sites?.[index]?.site_id}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Longitude
                                            </Label>
                                            <FloatingLabelInput
                                                label="e.g., -74.0060"
                                                type="number"
                                                step="any"
                                                {...register(`sites.${index}.longitude`, { valueAsNumber: true })}
                                                disabled={isLoading || !!formValues.sites?.[index]?.site_id}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Guards Required
                                            </Label>
                                            <FloatingLabelInput
                                                label="Number of guards..."
                                                type="number"
                                                min="1"
                                                {...register(`sites.${index}.guards_required`, { valueAsNumber: true })}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Site Specific Rate
                                            </Label>
                                            <FloatingLabelInput
                                                label="Enter rate..."
                                                type="number"
                                                step="0.01"
                                                {...register(`sites.${index}.pivot.site_specific_rate`, { valueAsNumber: true })}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2 pt-6">
                                            <Controller
                                                control={control}
                                                name={`sites.${index}.pivot.is_primary`}
                                                render={({ field }) => (
                                                    <>
                                                        <Switch
                                                            id={`edit-sites.${index}.is_primary`}
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            disabled={isLoading}
                                                        />
                                                        <Label htmlFor={`edit-sites.${index}.is_primary`} className="text-sm font-medium cursor-pointer">
                                                            Primary Site
                                                        </Label>
                                                    </>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-medium">
                                                Site Instructions
                                            </Label>
                                            <FloatingLabelTextarea
                                                label="Enter special instructions..."
                                                rows={2}
                                                {...register(`sites.${index}.site_instruction`)}
                                                disabled={isLoading}
                                                className="resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-500" />
                                Additional Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <FloatingLabelTextarea
                                    label="Enter any additional notes or comments..."
                                    rows={4}
                                    {...register("notes")}
                                    disabled={isLoading}
                                    className="resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Update Contract"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}