// components/job-category/job-category-edit-form.tsx
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
import { Tag, Hash } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateJobCategory } from "@/store/slices/jobCategoriesSlice"
import { JobCategory, UpdateJobCategoryDto } from "@/app/types/jobCategories"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { Input } from "@/components/ui/input"
import { FloatingLabelInput } from "@/components/ui/floating-input"
import { FloatingLabelTextarea } from "@/components/ui/floating-textarea"
import { DialogActionFooter } from "@/components/shared/dialog-action-footer"

// Zod schema
const jobCategorySchema = z.object({
    name: z.string()
        .min(1, { message: "Category name is required" })
        .min(2, { message: "Name must be at least 2 characters" })
        .max(100, { message: "Name must be less than 100 characters" }),
    description: z.string().optional(),
    sort_order: z.string().optional(),
})

type JobCategoryFormData = z.infer<typeof jobCategorySchema>

interface JobCategoryEditFormProps {
    trigger: ReactNode
    category: JobCategory
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function JobCategoryEditForm({
    trigger,
    category,
    isOpen,
    onOpenChange,
    onSuccess
}: JobCategoryEditFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<JobCategoryFormData>({
        resolver: zodResolver(jobCategorySchema),
        defaultValues: {
            name: "",
            description: "",
            sort_order: "",
        },
        mode: "onChange"
    })

    const formValues = watch()

    // Populate form when category changes
    useEffect(() => {
        if (isOpen && category) {
            reset({
                name: category.name || "",
                description: category.description || "",
                sort_order: category.sort_order?.toString() || "",
            })
        }
    }, [isOpen, category, reset])

    const onSubmit = async (data: JobCategoryFormData) => {
        setIsLoading(true)
        try {
            const submitData: UpdateJobCategoryDto = {
                name: data.name.trim(),
                description: data.description?.trim() || null,
                sort_order: data.sort_order ? parseInt(data.sort_order) : undefined,
            }

            const result = await dispatch(updateJobCategory({
                id: category.id,
                data: submitData
            }))

            if (updateJobCategory.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Category Updated',
                    `${data.name} has been updated successfully.`
                ).then(() => {
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to update category. Please try again."

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
        if (!open) {
            const hasChanges = 
                formValues.name !== category.name ||
                formValues.description !== (category.description || "") ||
                formValues.sort_order !== (category.sort_order?.toString() || "")

            if (hasChanges) {
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
                reset()
                onOpenChange?.(false)
            }
        } else {
            onOpenChange?.(true)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Edit Job Category</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Category Name */}
                    <div className="w-full">
                        <FloatingLabelInput
                            label="Category Name *"
                            {...register("name")}
                            error={errors.name?.message}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Sort Order */}
                    <div className="w-full">
                        <div className="space-y-2">
                            <Label htmlFor="sort_order" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sort Order
                            </Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Hash className="h-4 w-4 text-gray-500" />
                                </div>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    placeholder="Enter sort order (optional)"
                                    className="pl-9 h-11"
                                    {...register("sort_order")}
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-xs text-gray-500">Lower numbers appear first</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="w-full">
                        <FloatingLabelTextarea
                            label="Description (Optional)"
                            rows={4}
                            {...register("description")}
                            disabled={isLoading}
                            className="resize-none"
                            placeholder="Enter category description..."
                        />
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Update Category"
                        isSubmitting={isLoading}
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}