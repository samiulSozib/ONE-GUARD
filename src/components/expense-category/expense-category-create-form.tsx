'use client'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ReactNode, useState } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { Plus, Shield } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { createExpenseCategory } from "@/store/slices/expenseCategorySlice"
import { ExpenseCategory } from "@/app/types/expenseCategory"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { Switch } from "@/components/ui/switch"

interface ExpenseCategoryCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Zod schema for ExpenseCategory
const expenseCategorySchema = z.object({
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(100, { message: "Name must be less than 100 characters" }),
    description: z.string()
        .max(500, { message: "Description must be less than 500 characters" })
        .optional()
        .nullable(),
    is_active: z.boolean()
})

type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>

export function ExpenseCategoryCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: ExpenseCategoryCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ExpenseCategoryFormData>({
        resolver: zodResolver(expenseCategorySchema),
        defaultValues: {
            name: "",
            description: "",
            is_active: true
        },
        mode: "onBlur"
    })

    const formValues = watch()

    const onSubmit = async (data: ExpenseCategoryFormData) => {
        setIsLoading(true)
        try {
            const submitData: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'> = {
                name: data.name.trim(),
                description: data.description?.trim() || null,
                is_active: data.is_active
            }

            const result = await dispatch(createExpenseCategory(submitData))

            if (createExpenseCategory.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Expense Category Type Created Successfully',
                    `${data.name} has been created successfully.`
                ).then(() => {
                    reset()
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create expense category type. Please try again."

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
        // Check if user has entered any data
        const hasData = formValues.name.trim() ||
            formValues.description?.trim() ||
            !formValues.is_active

        if (!hasData) {
            // No data, just close
            reset()
            onOpenChange?.(false)
            return
        }

        // Has data, show confirmation
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

    // Handle dialog open/close
    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            // Opening the dialog
            onOpenChange?.(true)
        } else {
            // Trying to close the dialog - check for unsaved changes
            const hasData = formValues.name.trim() ||
                formValues.description?.trim() ||
                !formValues.is_active

            if (!hasData) {
                // No unsaved changes, close immediately
                reset()
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
                        reset()
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

            <DialogContent className="sm:max-w-[500px] w-[90vw] max-w-[90vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                     <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add New Expense Category Type</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Name *
                            </Label>
                            <FloatingLabelInput
                                label="Expense Category Type Name"
                                {...register("name")}
                                error={errors.name?.message}
                                disabled={isLoading}
                                placeholder="e.g., Bodyexpense category, Security Expense Category, etc."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter a descriptive name for the expense category type
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description (Optional)
                            </Label>
                            <FloatingLabelTextarea
                                label="Description"
                                {...register("description")}
                                disabled={isLoading}
                                className="min-h-[100px]"
                                placeholder="Describe the responsibilities, qualifications, or special requirements..."
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
                    </div>

                    {/* Status Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </Label>
                                <p className="text-xs text-gray-500">
                                    {formValues.is_active 
                                        ? 'This expense category type will be available for assignment' 
                                        : 'This expense category type will be hidden from assignment'
                                    }
                                </p>
                            </div>
                            <Switch
                                checked={formValues.is_active}
                                onCheckedChange={(checked) => 
                                    setValue("is_active", checked, { shouldValidate: true })
                                }
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Example Preview */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                            Example Format
                        </h4>
                        <div className="text-sm space-y-1">
                            <div className="flex">
                                <span className="text-gray-600 dark:text-gray-400 w-24">Name:</span>
                                <span className="font-medium">Bodyexpense category</span>
                            </div>
                            <div className="flex">
                                <span className="text-gray-600 dark:text-gray-400 w-24">Description:</span>
                                <span className="font-medium">Personal protection and security details</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Create Expense Category"
                        isSubmitting={isLoading}
                        submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}