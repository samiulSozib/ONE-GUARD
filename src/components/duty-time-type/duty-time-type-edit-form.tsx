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
import { updateDutyTimeType, fetchDutyTimeType } from "@/store/slices/dutyTimeTypesSlice"
import { DutyTimeType } from "@/app/types/dutyTimeType"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { CustomTimePicker } from "../ui/custom-time-picker"

interface DutyTimeTypeEditFormProps {
    trigger: ReactNode
    dutyTimeType: DutyTimeType
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

const dutyTimeTypeSchema = z.object({
    title: z.string()
        .min(1, { message: "Title is required" })
        .max(100, { message: "Title must be less than 100 characters" }),
    description: z.string().optional(),
    start_time: z.string()
        .min(1, { message: "Start time is required" })
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:mm)" }),
    end_time: z.string()
        .min(1, { message: "End time is required" })
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:mm)" }),
    is_active: z.boolean()
})

type DutyTimeTypeFormData = z.infer<typeof dutyTimeTypeSchema>

export function DutyTimeTypeEditForm({
    trigger,
    dutyTimeType,
    isOpen,
    onOpenChange,
    onSuccess
}: DutyTimeTypeEditFormProps) {
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
    } = useForm<DutyTimeTypeFormData>({
        resolver: zodResolver(dutyTimeTypeSchema),
        defaultValues: {
            title: "",
            description: "",
            start_time: "09:00",
            end_time: "17:00",
            is_active: true
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Fetch duty time type details when dialog opens
    useEffect(() => {
        if (isOpen && dutyTimeType?.id) {
            loadDutyTimeType()
        }
    }, [isOpen, dutyTimeType?.id])

    const loadDutyTimeType = async () => {
        if (!dutyTimeType?.id) return

        setIsFetching(true)
        try {
            const result = await dispatch(fetchDutyTimeType({
                id: dutyTimeType.id,
                params: {}
            }))

            if (fetchDutyTimeType.fulfilled.match(result)) {
                const data = result.payload
                // Populate form with existing data
                reset({
                    title: data.item.title || "",
                    description: data.item.description || "",
                    start_time: data.item.start_time || "09:00",
                    end_time: data.item.end_time || "17:00",
                    is_active: data.item.is_active ?? true
                })
            }
        } catch (error) {
            console.error("Failed to load duty time type:", error)
        } finally {
            setIsFetching(false)
        }
    }

    const formatTimeDisplay = (time: string) => {
        if (!time) return "Select time"
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${period}`
    }

    const onSubmit = async (data: DutyTimeTypeFormData) => {
        if (!dutyTimeType?.id) return

        setIsLoading(true)
        try {
            const submitData: Partial<DutyTimeType> = {
                title: data.title.trim(),
                description: data.description?.trim() || null,
                start_time: data.start_time,
                end_time: data.end_time,
                is_active: data.is_active
            }

            const result = await dispatch(updateDutyTimeType({
                id: dutyTimeType.id,
                data: submitData
            }))

            if (updateDutyTimeType.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Duty Time Type Updated',
                    `${data.title} has been updated successfully.`
                ).then(() => {
                    reset()
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to update duty time type. Please try again."

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
            onOpenChange?.(true)
        } else {
            // Check if form has been modified
            const originalData = {
                title: dutyTimeType?.title || "",
                description: dutyTimeType?.description || "",
                start_time: dutyTimeType?.start_time || "09:00",
                end_time: dutyTimeType?.end_time || "17:00",
                is_active: dutyTimeType?.is_active ?? true
            }

            const currentData = {
                title: formValues.title.trim(),
                description: formValues.description?.trim() || "",
                start_time: formValues.start_time,
                end_time: formValues.end_time,
                is_active: formValues.is_active
            }

            const hasChanges =
                currentData.title !== originalData.title ||
                currentData.description !== originalData.description ||
                currentData.start_time !== originalData.start_time ||
                currentData.end_time !== originalData.end_time ||
                currentData.is_active !== originalData.is_active

            if (!hasChanges) {
                reset()
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
                        onOpenChange?.(false)
                    } else {
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
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Edit Duty Time Type</span>
                </div>

                {isFetching ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading duty time type...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                        {/* Title */}
                        <div className="col-span-2">
                            <FloatingLabelInput
                                label="Title *"
                                {...register("title")}
                                error={errors.title?.message}
                                disabled={isLoading || isFetching}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <FloatingLabelTextarea
                                label="Description"
                                {...register("description")}
                                className="min-h-[100px]"
                                disabled={isLoading || isFetching}
                            />
                        </div>

                        {/* Time Pickers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CustomTimePicker
                                value={formValues.start_time}
                                onChange={(time) => setValue('start_time', time, { shouldValidate: true })}
                                label="Start Time"
                                error={errors.start_time?.message}
                                disabled={isLoading || isFetching}
                                required={true}
                                minuteInterval={30}
                                format12h={true}
                            />
                            <CustomTimePicker
                                value={formValues.end_time}
                                onChange={(time) => setValue('end_time', time, { shouldValidate: true })}
                                label="End Time"
                                error={errors.end_time?.message}
                                disabled={isLoading || isFetching}
                                required={true}
                                minuteInterval={30}
                                format12h={true}
                            />
                        </div>

                        {/* Selected Time Slot Display */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Selected Time Slot:
                                </span>
                                <span className="font-semibold text-blue-900 dark:text-blue-100">
                                    {formatTimeDisplay(formValues.start_time)} - {formatTimeDisplay(formValues.end_time)}
                                </span>
                            </div>
                        </div>

                        {/* Active Checkbox */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                {...register("is_active")}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                disabled={isLoading || isFetching}
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                                Active
                            </Label>
                        </div>
                        {errors.is_active && (
                            <p className="text-sm text-red-500">{errors.is_active.message}</p>
                        )}
                        <p className="text-xs text-gray-500 -mt-2">
                            When active, this duty time type will be available for assignment.
                        </p>

                        <DialogActionFooter
                            cancelText="Cancel"
                            submitText="Update Duty Time Type"
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
