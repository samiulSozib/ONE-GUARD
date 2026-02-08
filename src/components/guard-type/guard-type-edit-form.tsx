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
import { Shield, Check, X } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateGuardType, fetchGuardType } from "@/store/slices/guardTypeSlice"
import { GuardType } from "@/app/types/guard-type"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { DialogActionFooter } from "../shared/dialog-action-footer"

interface GuardTypeEditFormProps {
    trigger: ReactNode
    guardType: GuardType
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

const guardTypeSchema = z.object({
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(100, { message: "Name must be less than 100 characters" }),
    description: z.string()
        .max(500, { message: "Description must be less than 500 characters" })
        .optional()
        .nullable(),
    is_active: z.boolean()
})

type GuardTypeFormData = z.infer<typeof guardTypeSchema>

export function GuardTypeEditForm({
    trigger,
    guardType,
    isOpen,
    onOpenChange,
    onSuccess
}: GuardTypeEditFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<GuardTypeFormData>({
        resolver: zodResolver(guardTypeSchema),
        defaultValues: {
            name: "",
            description: "",
            is_active: true
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Fetch guard type details when dialog opens
    useEffect(() => {
        if (isOpen && guardType?.id) {
            loadGuardType()
        }
    }, [isOpen, guardType?.id])

    const loadGuardType = async () => {
        if (!guardType?.id) return
        
        setIsFetching(true)
        try {
            const result = await dispatch(fetchGuardType({ 
                id: guardType.id, 
                params: {} 
            }))

            if (fetchGuardType.fulfilled.match(result)) {
                const data = result.payload
                console.log("Fetched guard type data:", data)
                // Populate form with existing data
                reset({
                    name: data.item.name || "",
                    description: data.item.description || "",
                    is_active: data.item.is_active ?? true
                })
            }
        } catch (error) {
            console.error("Failed to load guard type:", error)
            SweetAlertService.error('Error', 'Failed to load guard type details')
        } finally {
            setIsFetching(false)
        }
    }

    const onSubmit = async (data: GuardTypeFormData) => {
        if (!guardType?.id) return
        
        setIsLoading(true)
        try {
            const submitData: Partial<GuardType> = {
                name: data.name.trim(),
                description: data.description?.trim() || null,
                is_active: data.is_active
            }

            const result = await dispatch(updateGuardType({
                id: guardType.id,
                data: submitData
            }))

            if (updateGuardType.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Guard Type Updated',
                    `${data.name} has been updated successfully.`
                ).then(() => {
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to update guard type. Please try again."

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

    // Handle dialog open/close
    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            // Opening the dialog
            onOpenChange?.(true)
        } else {
            // Check if form has been modified
            const originalData = {
                name: guardType?.name || "",
                description: guardType?.description || "",
                is_active: guardType?.is_active ?? true
            }

            const currentData = {
                name: formValues.name.trim(),
                description: formValues.description?.trim() || "",
                is_active: formValues.is_active
            }

            const hasChanges = 
                currentData.name !== originalData.name ||
                currentData.description !== originalData.description ||
                currentData.is_active !== originalData.is_active

            if (!hasChanges) {
                // No changes, just close
                onOpenChange?.(false)
            } else {
                // Has unsaved changes, show confirmation
                SweetAlertService.confirm(
                    'Discard Changes?',
                    'You have unsaved changes. Are you sure you want to close?',
                    'Yes, discard',
                    'No, keep'
                ).then((result) => {
                    if (result.isConfirmed) {
                        onOpenChange?.(false)
                    } else {
                        // User cancelled, keep dialog open
                        onOpenChange?.(true)
                    }
                })
            }
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={handleDialogOpenChange}
        >
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] w-[90vw] max-w-[90vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <span className="whitespace-nowrap">Edit Guard Type</span>
                </div>

                {isFetching ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading guard type...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
                            <div className="col-span-2">
                                <FloatingLabelInput
                                    label="Name *"
                                    {...register("name")}
                                    error={errors.name?.message}
                                    disabled={isLoading || isFetching}
                                    placeholder="Enter guard type name"
                                />
                            </div>
                        </div>

                        <div>
                            <FloatingLabelTextarea
                                label="Description"
                                {...register("description")}
                                className="min-h-[100px]"
                                disabled={isLoading || isFetching}
                                placeholder="Enter description for this guard type"
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    Maximum 500 characters
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formValues.description?.length || 0}/500
                                </p>
                            </div>
                        </div>

                        {/* Status Section - Similar to DutyTimeTypeEditForm */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Status *
                            </Label>
                            <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
                                <Button
                                    type="button"
                                    variant={formValues.is_active ? "default" : "ghost"}
                                    className={cn(
                                        "flex-1 transition-all duration-200",
                                        formValues.is_active 
                                            ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300" 
                                            : ""
                                    )}
                                    onClick={() => setValue("is_active", true, { shouldValidate: true })}
                                    disabled={isLoading || isFetching}
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Active
                                </Button>
                                <Button
                                    type="button"
                                    variant={!formValues.is_active ? "default" : "ghost"}
                                    className={cn(
                                        "flex-1 transition-all duration-200",
                                        !formValues.is_active 
                                            ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300" 
                                            : ""
                                    )}
                                    onClick={() => setValue("is_active", false, { shouldValidate: true })}
                                    disabled={isLoading || isFetching}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Inactive
                                </Button>
                            </div>
                            {errors.is_active && (
                                <p className="text-sm text-red-500">{errors.is_active.message}</p>
                            )}
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Current Status:</span>
                                <span className={cn(
                                    "font-semibold",
                                    formValues.is_active ? "text-green-600" : "text-red-600"
                                )}>
                                    {formValues.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {/* Guard Type Information */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                Guard Type Information
                            </h4>
                            <div className="text-sm space-y-1">
                                <div className="flex">
                                    <span className="text-gray-600 dark:text-gray-400 w-24">ID:</span>
                                    <span className="font-medium">#{guardType.id}</span>
                                </div>
                                {guardType.created_at && (
                                    <div className="flex">
                                        <span className="text-gray-600 dark:text-gray-400 w-24">Created:</span>
                                        <span className="font-medium">
                                            {new Date(guardType.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogActionFooter
                            cancelText="Cancel"
                            submitText="Update Guard Type"
                            isSubmitting={isLoading}
                            submitColor="bg-blue-600 hover:bg-blue-700"
                            onSubmit={handleSubmit(onSubmit)}
                        />
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}