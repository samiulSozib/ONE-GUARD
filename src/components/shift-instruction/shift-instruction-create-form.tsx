// components/duty-instruction/shift-instruction-create-form.tsx
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
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { createInstruction } from "@/store/slices/shiftInstruction"
import { fetchDuties } from "@/store/slices/dutySlice"
import { fetchSites } from "@/store/slices/siteSlice"
import { fetchSiteLocations } from "@/store/slices/siteLocationSlice"
import { fetchAssignments } from "@/store/slices/guardAssignmentSlice"
import { fetchGuards } from "@/store/slices/guardSlice"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { Switch } from "../ui/switch"
import { Badge } from "../ui/badge"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import { SearchableDropdown, SearchableDropdownOption } from "../ui/searchable-dropdown"
import { Building, Users, MapPin, Calendar, UserCheck } from "lucide-react"
import { Duty } from "@/app/types/duty"
import { Site } from "@/app/types/site"
import { SiteLocation } from "@/app/types/siteLocation.types"
import { Guard } from "@/app/types/guard"
import { GuardAssignment } from "@/app/types/guardAssignment"
import { RootState } from "@/store/store"

interface ShiftInstructionCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Simple validation - only title required
const instructionSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    instructionable_type: z.string().optional(),
    instructionable_id: z.number().optional(),
    instruction_type: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    is_mandatory: z.boolean().optional(),
    requires_photo: z.boolean().optional(),
    requires_signature: z.boolean().optional(),
    requires_confirmation: z.boolean().optional(),
    order: z.number().optional(),
})

type InstructionFormData = z.infer<typeof instructionSchema>

export function ShiftInstructionCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: ShiftInstructionCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [dropdownOptions, setDropdownOptions] = useState<SearchableDropdownOption[]>([])

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<InstructionFormData>({
        defaultValues: {
            title: "",
            instructionable_type: "duty",
            instructionable_id: undefined,
            instruction_type: "patrol",
            description: "",
            priority: "medium",
            is_mandatory: true,
            requires_photo: true,
            requires_signature: false,
            requires_confirmation: false,
            order: 0,
        },
        mode: "onBlur"
    })

    const formValues = watch()
    const selectedType = formValues.instructionable_type

    // Get items from Redux
    const duties = useAppSelector((state: RootState) => state.duty.duties)
    const guards = useAppSelector((state: RootState) => state.guard.guards)
    const guardAssignments = useAppSelector((state: RootState) => state.guardAssignment.assignments)
    const sites = useAppSelector((state: RootState) => state.site.sites)
    const siteLocations = useAppSelector((state: RootState) => state.siteLocation.siteLocations)

        // Fetch data when dialog opens
    useEffect(() => {
        //if (isOpen) {
            console.log("Dialog opened, fetching data...")
            dispatch(fetchDuties({ page: 1, per_page: 100 }))
            dispatch(fetchGuards({ page: 1, per_page: 100 }))
            dispatch(fetchAssignments({ page: 1, per_page: 100 }))
            dispatch(fetchSites({ page: 1, per_page: 100 }))
            dispatch(fetchSiteLocations({ page: 1, per_page: 100 }))
        //}
    }, [ dispatch])

    // Update dropdown options when selected type changes or data changes
    useEffect(() => {
        const updateOptions = () => {
            console.log("Updating options for type:", selectedType)
            
            switch(selectedType) {
                case "duty":
                    const dutyOptions = duties.map((item: Duty) => ({ 
                        value: item.id, 
                        label: item.title 
                    }))
                    console.log("Duty options:", dutyOptions)
                    setDropdownOptions(dutyOptions)
                    break
                case "guard":
                    const guardOptions = guards.map((item: Guard) => ({ 
                        value: item.id, 
                        label: item.name || item.full_name || `Guard ${item.id}` 
                    }))
                    console.log("Guard options:", guardOptions)
                    setDropdownOptions(guardOptions)
                    break
                case "guard_assignment":
                    const assignmentOptions = guardAssignments.map((item: GuardAssignment) => ({ 
                        value: item.id, 
                        label: item.duty?.title || `Assignment ${item.id}` 
                    }))
                    console.log("Assignment options:", assignmentOptions)
                    setDropdownOptions(assignmentOptions)
                    break
                case "site":
                    const siteOptions = sites.map((item: Site) => ({ 
                        value: item.id, 
                        label: item.site_name || item.title || `Site ${item.id}` 
                    }))
                    console.log("Site options:", siteOptions)
                    setDropdownOptions(siteOptions)
                    break
                case "site_location":
                    const locationOptions = siteLocations.map((item: SiteLocation) => ({ 
                        value: item.id, 
                        label: item.title 
                    }))
                    console.log("Location options:", locationOptions)
                    setDropdownOptions(locationOptions)
                    break
                default:
                    setDropdownOptions([])
            }
        }

        updateOptions()
    }, [selectedType, duties, guards, guardAssignments, sites, siteLocations])



    // Reset instructionable_id when type changes
    useEffect(() => {
        setValue("instructionable_id", undefined)
    }, [selectedType, setValue])

    const onSubmit = async (data: InstructionFormData) => {
        if (!data.instructionable_id) {
            SweetAlertService.error('Error', 'Please select an item')
            return
        }

        setIsLoading(true)
        try {
            const submitData = {
                instructionable_type: data.instructionable_type || "duty",
                instructionable_id: data.instructionable_id,
                instruction_type: data.instruction_type || "patrol",
                title: data.title.trim(),
                description: data.description || "",
                priority: (data.priority || "medium") as 'low' | 'medium' | 'high' | 'urgent',
                is_mandatory: data.is_mandatory ?? true,
                requires_photo: data.requires_photo ?? true,
                requires_signature: data.requires_signature ?? false,
                requires_confirmation: data.requires_confirmation ?? false,
                order: data.order ?? 0,
            }

            const result = await dispatch(createInstruction(submitData))

            if (createInstruction.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Instruction Created',
                    `${data.title} has been created successfully.`
                ).then(() => {
                    reset()
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            SweetAlertService.error('Creation Failed', 'Failed to create instruction. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        if (!formValues.title?.trim()) {
            reset()
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
                onOpenChange?.(false)
            }
        })
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (!open && formValues.title?.trim()) {
            SweetAlertService.confirm(
                'Discard Changes?',
                'You have unsaved changes. Are you sure you want to close?',
                'Yes, discard',
                'No, keep'
            ).then((result) => {
                if (result.isConfirmed) {
                    reset()
                    onOpenChange?.(false)
                } else {
                    onOpenChange?.(true)
                }
            })
        } else {
            onOpenChange?.(open)
        }
    }

    const getSelectedConfig = () => {
        switch(selectedType) {
            case "duty":
                return { label: "Duty", icon: Calendar }
            case "guard":
                return { label: "Guard", icon: Users }
            case "guard_assignment":
                return { label: "Guard Assignment", icon: UserCheck }
            case "site":
                return { label: "Site", icon: Building }
            case "site_location":
                return { label: "Site Location", icon: MapPin }
            default:
                return { label: "Duty", icon: Calendar }
        }
    }

    const selectedConfig = getSelectedConfig()
    const SelectedIcon = selectedConfig.icon

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] w-[80vw] max-w-[80vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add Shift Instruction</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Basic Information
                        </h3>
                        <div className="space-y-4">
                            {/* Title - Required */}
                            <FloatingLabelInput
                                label="Title *"
                                {...register("title")}
                                error={errors.title?.message}
                                disabled={isLoading}
                            />

                            {/* Instructionable Type - Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Type *
                                </Label>
                                <Select
                                    value={formValues.instructionable_type}
                                    onValueChange={(value) => {
                                        setValue("instructionable_type", value)
                                    }}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Types</SelectLabel>
                                            <SelectItem value="duty">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Duty</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="guard">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span>Guard</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="guard_assignment">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4" />
                                                    <span>Guard Assignment</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="site">
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4" />
                                                    <span>Site</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="site_location">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>Site Location</span>
                                                </div>
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Searchable Dropdown for Items */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select {selectedConfig.label} *
                                </Label>
                                <SearchableDropdown
                                    options={dropdownOptions}
                                    value={formValues.instructionable_id || ""}
                                     onValueChange={(value) => {
        //console.log("Selected value:", value);
        setValue("instructionable_id", typeof value === 'string' ? parseInt(value) : value);
    }}
                                    placeholder={`Search ${selectedConfig.label.toLowerCase()}...`}
                                    disabled={isLoading}
                                    //icon={SelectedIcon}
                                />
                                {dropdownOptions.length === 0 && (
                                    <p className="text-sm text-yellow-500 mt-1">
                                        Loading {selectedConfig.label.toLowerCase()} list...
                                    </p>
                                )}
                            </div>

                            {/* Instruction Type - Text Input */}
                            <FloatingLabelInput
                                label="Instruction Type"
                                placeholder="e.g., patrol, inspection, report"
                                {...register("instruction_type")}
                                disabled={isLoading}
                            />

                            {/* Priority - Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Priority
                                </Label>
                                <Select
                                    value={formValues.priority}
                                    onValueChange={(value: "low" | "medium" | "high" | "urgent") => 
                                        setValue("priority", value)
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Order */}
                            <FloatingLabelInput
                                label="Display Order"
                                type="number"
                                {...register("order", { valueAsNumber: true })}
                                disabled={isLoading}
                            />

                            {/* Description */}
                            <FloatingLabelTextarea
                                label="Description"
                                rows={4}
                                {...register("description")}
                                disabled={isLoading}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Requirements
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Mandatory Instruction</Label>
                                    <p className="text-sm text-gray-500">Guard must complete this instruction</p>
                                </div>
                                <Switch
                                    checked={formValues.is_mandatory ?? true}
                                    onCheckedChange={(checked) => setValue("is_mandatory", checked)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Requires Photo</Label>
                                    <p className="text-sm text-gray-500">Guard must upload a photo as proof</p>
                                </div>
                                <Switch
                                    checked={formValues.requires_photo ?? true}
                                    onCheckedChange={(checked) => setValue("requires_photo", checked)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Requires Signature</Label>
                                    <p className="text-sm text-gray-500">Guard must provide a signature</p>
                                </div>
                                <Switch
                                    checked={formValues.requires_signature ?? false}
                                    onCheckedChange={(checked) => setValue("requires_signature", checked)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Requires Confirmation</Label>
                                    <p className="text-sm text-gray-500">Guard must confirm completion</p>
                                </div>
                                <Switch
                                    checked={formValues.requires_confirmation ?? false}
                                    onCheckedChange={(checked) => setValue("requires_confirmation", checked)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary Badges */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Summary
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(formValues.is_mandatory ?? true) && (
                                <Badge variant="destructive">Mandatory</Badge>
                            )}
                            {(formValues.requires_photo ?? true) && (
                                <Badge className="bg-blue-500">Photo Required</Badge>
                            )}
                            {(formValues.requires_signature ?? false) && (
                                <Badge className="bg-purple-500">Signature Required</Badge>
                            )}
                            {(formValues.requires_confirmation ?? false) && (
                                <Badge className="bg-green-500">Confirmation Required</Badge>
                            )}
                            <Badge variant="outline" className="border-orange-500 text-orange-500">
                                Priority: {(formValues.priority || "medium").toUpperCase()}
                            </Badge>
                            {formValues.instruction_type && (
                                <Badge variant="outline" className="border-blue-500 text-blue-500">
                                    Type: {formValues.instruction_type.toUpperCase()}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Create Instruction"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}