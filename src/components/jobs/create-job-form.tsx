// components/job/job-create-form.tsx
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
import { 
    CalendarIcon, 
    DollarSign, 
    Tag, 
    Users, 
    Briefcase, 
    MapPin
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { createJob } from "@/store/slices/jobSlice"
import { fetchJobCategories } from "@/store/slices/jobCategoriesSlice"
import { CreateJobDto } from "@/app/types/job"
import { JobCategory } from "@/app/types/jobCategories"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"

// Employment types
const employmentTypes = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "temporary", label: "Temporary" },
    { value: "internship", label: "Internship" },
]

// Payment types
const paymentTypes = [
    { value: "hourly", label: "Hourly" },
    { value: "salary", label: "Salary" },
    { value: "fixed", label: "Fixed" },
]

// Simplified Zod schema - only required fields
const jobSchema = z.object({
    title: z.string()
        .min(1, { message: "Job title is required" })
        .min(3, { message: "Title must be at least 3 characters" })
        .max(200, { message: "Title must be less than 200 characters" }),

    category_id: z.number()
        .min(1, { message: "Category is required" }),

    location: z.string()
        .min(1, { message: "Location is required" }),

    employment_type: z.string()
        .min(1, { message: "Employment type is required" }),

    payment_type: z.string()
        .min(1, { message: "Payment type is required" }),

    min_pay_rate: z.string()
        .min(1, { message: "Minimum pay rate is required" })
        .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount" }),

    max_pay_rate: z.string()
        .min(1, { message: "Maximum pay rate is required" })
        .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount" }),

    vacancies: z.string()
        .min(1, { message: "Number of vacancies is required" })
        .regex(/^\d+$/, { message: "Please enter a valid number" }),

    deadline: z.string()
        .min(1, { message: "Application deadline is required" }),

    description: z.string().optional(),
    requirements: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

interface JobCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function JobCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: JobCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    // Redux states for dropdown data
    const { items: categories, isLoading: categoriesLoading } = 
        useAppSelector((state) => state.jobCategories)

    // Search states
    const [categorySearch, setCategorySearch] = useState("")

    // Date state
    const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined)

    // Fetch categories on mount
    useEffect(() => {
        dispatch(fetchJobCategories({ page: 1, per_page: 100 }))
    }, [dispatch])

    // Fetch categories when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (categorySearch.trim() || categorySearch === "") {
                dispatch(fetchJobCategories({
                    page: 1,
                    per_page: 10,
                    search: categorySearch.trim(),
                }))
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [categorySearch, dispatch])

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: "",
            category_id: undefined,
            location: "",
            employment_type: "full_time",
            payment_type: "hourly",
            min_pay_rate: "",
            max_pay_rate: "",
            vacancies: "1",
            deadline: "",
            description: "",
            requirements: "",
        },
        mode: "onChange"
    })

    // Update deadline when date changes
    useEffect(() => {
        if (deadlineDate) {
            setValue('deadline', format(deadlineDate, 'yyyy-MM-dd'), { shouldValidate: true })
        }
    }, [deadlineDate, setValue])

    const formValues = watch()

    const onSubmit = async (data: JobFormData) => {
        setIsLoading(true)
        try {
            // Only send the required fields as per API
            const submitData: CreateJobDto = {
                title: data.title.trim(),
                category_id: data.category_id,
                location: data.location.trim(),
                employment_type: data.employment_type,
                payment_type: data.payment_type,
                min_pay_rate: parseFloat(data.min_pay_rate),
                max_pay_rate: parseFloat(data.max_pay_rate),
                vacancies: parseInt(data.vacancies),
                deadline: data.deadline,
                description: data.description?.trim() || undefined,
                requirements: data.requirements?.trim() || undefined,
            }

            const result = await dispatch(createJob(submitData))

            if (createJob.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Job Created',
                    `${data.title} has been created successfully.`
                ).then(() => {
                    reset()
                    setDeadlineDate(undefined)
                    setCategorySearch("")
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create job. Please try again."

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

    const formatDateDisplay = (date: Date | undefined) => {
        if (!date) return "Select date"
        return format(date, 'MMM dd, yyyy')
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            reset()
            setDeadlineDate(undefined)
            setCategorySearch("")
            onOpenChange?.(false)
        } else {
            onOpenChange?.(true)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Create New Job</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Job Title */}
                    <div className="w-full">
                        <FloatingLabelInput
                            label="Job Title *"
                            {...register("title")}
                            error={errors.title?.message}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Category & Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.category_id || ""}
                                onValueChange={(value) => {
                                    setValue("category_id", Number(value), { shouldValidate: true })
                                }}
                                options={categories.map((cat: JobCategory) => ({
                                    value: cat.id,
                                    label: cat.name,
                                    ...cat
                                }))}
                                onSearch={(search) => {
                                    setCategorySearch(search)
                                    dispatch(fetchJobCategories({
                                        page: 1,
                                        per_page: 10,
                                        search: search,
                                    }))
                                }}
                                placeholder="Select category"
                                disabled={isLoading || categoriesLoading}
                                isLoading={categoriesLoading}
                                emptyMessage={categorySearch ? "No categories found" : "No categories available"}
                                searchPlaceholder="Search categories..."
                                icon={Tag}
                                iconPosition="left"
                            />
                            {errors.category_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.category_id.message}</p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="relative space-y-2">
                             <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Location
                            </Label>
                            <FloatingLabelInput
                                label="Location *"
                                {...register("location")}
                                error={errors.location?.message}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Employment & Payment Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Employment Type */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Employment Type *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.employment_type || ""}
                                onValueChange={(value) => {
                                    setValue("employment_type", value.toString(), { shouldValidate: true })
                                }}
                                options={employmentTypes}
                                onSearch={() => {}}
                                placeholder="Select employment type"
                                disabled={isLoading}
                                emptyMessage="No employment types available"
                                searchPlaceholder="Search..."
                                icon={Briefcase}
                                iconPosition="left"
                            />
                            {errors.employment_type && (
                                <p className="text-sm text-red-500 mt-1">{errors.employment_type.message}</p>
                            )}
                        </div>

                        {/* Payment Type */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Payment Type *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.payment_type || ""}
                                onValueChange={(value) => {
                                    setValue("payment_type", value.toString(), { shouldValidate: true })
                                }}
                                options={paymentTypes}
                                onSearch={() => {}}
                                placeholder="Select payment type"
                                disabled={isLoading}
                                emptyMessage="No payment types available"
                                searchPlaceholder="Search..."
                                icon={DollarSign}
                                iconPosition="left"
                            />
                            {errors.payment_type && (
                                <p className="text-sm text-red-500 mt-1">{errors.payment_type.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Pay Rate Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Min Pay Rate */}
                        <div className="relative">
                            <FloatingLabelInput
                                label="Min Pay Rate *"
                                type="number"
                                step="0.01"
                                {...register("min_pay_rate")}
                                error={errors.min_pay_rate?.message}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Max Pay Rate */}
                        <div className="relative">
                            <FloatingLabelInput
                                label="Max Pay Rate *"
                                type="number"
                                step="0.01"
                                {...register("max_pay_rate")}
                                error={errors.max_pay_rate?.message}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Vacancies & Deadline Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Vacancies */}
                        <div className="relative space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Location
                            </Label>
                            <FloatingLabelInput
                                label="Number of Vacancies *"
                                type="number"
                                {...register("vacancies")}
                                error={errors.vacancies?.message}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Deadline */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Application Deadline *
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-11",
                                            !deadlineDate && "text-muted-foreground"
                                        )}
                                        disabled={isLoading}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formatDateDisplay(deadlineDate)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={deadlineDate}
                                        onSelect={setDeadlineDate}
                                        initialFocus
                                        disabled={{ before: new Date() }}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.deadline && (
                                <p className="text-sm text-red-500 mt-1">{errors.deadline.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="w-full">
                        <FloatingLabelTextarea
                            label="Job Description"
                            rows={4}
                            {...register("description")}
                            disabled={isLoading}
                            className="resize-none"
                            placeholder="Describe the job role, responsibilities, and expectations..."
                        />
                    </div>

                    {/* Requirements */}
                    <div className="w-full">
                        <FloatingLabelTextarea
                            label="Requirements"
                            rows={4}
                            {...register("requirements")}
                            disabled={isLoading}
                            className="resize-none"
                            placeholder="List the requirements, qualifications, and skills needed..."
                        />
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Create Job"
                        isSubmitting={isLoading}
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}