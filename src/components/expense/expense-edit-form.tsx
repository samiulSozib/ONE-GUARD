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
import { CalendarIcon, DollarSign, Tag, Building, Users, UploadCloud } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { updateExpense, fetchExpense } from "@/store/slices/expenseSlice"
import { fetchSites } from "@/store/slices/siteSlice"
import { fetchGuards } from "@/store/slices/guardSlice"
import { fetchExpenseCategorys } from "@/store/slices/expenseCategorySlice"
import { Expense, CreateExpenseDto } from "@/app/types/expense"
import { ExpenseCategory } from "@/app/types/expenseCategory"
import { Site } from "@/app/types/site"
import { Guard } from "@/app/types/guard"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format, parseISO } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { Input } from "@/components/ui/input"

// Currency options
const currencyOptions = [
    { value: "USD", label: "USD - US Dollar", symbol: "$" },
    { value: "EUR", label: "EUR - Euro", symbol: "€" },
    { value: "GBP", label: "GBP - British Pound", symbol: "£" },
    { value: "AFN", label: "AFN - Afghan Afghani", symbol: "؋" },
    { value: "INR", label: "INR - Indian Rupee", symbol: "₹" },
    { value: "PKR", label: "PKR - Pakistani Rupee", symbol: "₨" },
]

// Zod schema
const expenseSchema = z.object({
    title: z.string()
        .min(1, { message: "Title is required" })
        .max(200, { message: "Title must be less than 200 characters" }),

    expense_category_id: z.number()
        .min(1, { message: "Category is required" }),

    site_id: z.number()
        .min(1, { message: "Site is required" }),

    guard_id: z.number()
        .min(1, { message: "Guard is required" }),

    amount: z.string()
        .min(1, { message: "Amount is required" })
        .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount" }),

    currency: z.string()
        .min(1, { message: "Currency is required" }),

    description: z.string().optional(),

    expense_date: z.string()
        .min(1, { message: "Expense date is required" }),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseEditFormProps {
    trigger: ReactNode
    expense: Expense
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function ExpenseEditForm({
    trigger,
    expense,
    isOpen,
    onOpenChange,
    onSuccess
}: ExpenseEditFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)

    // Redux states for dropdown data
    const { expenseCategories, isLoading: categoriesLoading } = 
        useAppSelector((state) => state.expenseCategory)
    const { sites, isLoading: sitesLoading } = 
        useAppSelector((state) => state.site)
    const { guards, isLoading: guardsLoading } = 
        useAppSelector((state) => state.guard)

    // Search states for comboboxes
    const [categorySearch, setCategorySearch] = useState("")
    const [siteSearch, setSiteSearch] = useState("")
    const [guardSearch, setGuardSearch] = useState("")

    // Date state
    const [expenseDate, setExpenseDate] = useState<Date | undefined>(undefined)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            title: "",
            expense_category_id: undefined,
            site_id: undefined,
            guard_id: undefined,
            amount: "",
            currency: "USD",
            description: "",
            expense_date: "",
        },
        mode: "onBlur"
    })

    const formValues = watch()

    // Fetch dropdown data when dialog opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchExpenseCategorys({ page: 1, per_page: 100 }))
            dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }))
            dispatch(fetchGuards({ page: 1, per_page: 100 }))
        }
    }, [isOpen, dispatch])

    // Fetch expense details when dialog opens
    useEffect(() => {
        if (isOpen && expense?.id) {
            loadExpense()
        }
    }, [isOpen, expense?.id])

    // Fetch categories when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (categorySearch.trim() || categorySearch === "") {
                dispatch(fetchExpenseCategorys({
                    page: 1,
                    per_page: 10,
                    search: categorySearch.trim()
                }))
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [categorySearch, dispatch])

    // Fetch sites when search changes
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

    // Update expense_date when date changes
    useEffect(() => {
        if (expenseDate) {
            setValue('expense_date', format(expenseDate, 'yyyy-MM-dd'), { shouldValidate: true })
        }
    }, [expenseDate, setValue])

    const loadExpense = async () => {
        if (!expense?.id) return

        setIsFetching(true)
        try {
            const result = await dispatch(fetchExpense({
                id: expense.id,
                params: { include: ['category', 'site', 'guard'] }
            }))

            if (fetchExpense.fulfilled.match(result)) {
                const data = result.payload.item

                // Parse date
                const expenseDateParsed = data.expense_date ? parseISO(data.expense_date) : new Date()
                setExpenseDate(expenseDateParsed)

                // Get IDs from nested objects
                const categoryId = data.category?.id
                const siteId = data.site?.id
                
                // Set search values for dropdown display
                if (data.category) {
                    setCategorySearch(data.category.name || "")
                }

                if (data.site) {
                    setSiteSearch(data.site.site_name || data.site.title || "")
                }

                // Populate form with existing data - use IDs from nested objects
                reset({
                    title: data.title || "",
                    expense_category_id: categoryId,
                    site_id: siteId,
                    //guard_id: data.guard?.id, // Guard ID from nested object
                    amount: data.amount?.toString() || "",
                    currency: data.currency || "USD",
                    description: data.description || "",
                    expense_date: data.expense_date ? format(parseISO(data.expense_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                })
            }
        } catch (error) {
            console.error("Failed to load expense:", error)
            SweetAlertService.error('Error', 'Failed to load expense details')
        } finally {
            setIsFetching(false)
        }
    }

    const formatDateDisplay = (date: Date | undefined) => {
        if (!date) return "Select date"
        return format(date, 'MMM dd, yyyy')
    }

    const onSubmit = async (data: ExpenseFormData) => {
        if (!expense?.id) return

        setIsLoading(true)
        try {
            const submitData: CreateExpenseDto = {
                title: data.title.trim(),
                expense_category_id: data.expense_category_id,
                site_id: data.site_id,
                guard_id: data.guard_id,
                amount: data.amount,
                currency: data.currency,
                description: data.description?.trim() || null,
                expense_date: data.expense_date,
            }

            const result = await dispatch(updateExpense({
                id: expense.id,
                data: submitData
            }))

            if (updateExpense.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Expense Updated',
                    `${data.title} has been updated successfully.`
                ).then(() => {
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to update expense. Please try again."

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
        if (open) {
            onOpenChange?.(true)
        } else {
            // Get original IDs from nested objects
            const originalCategoryId = expense?.category?.id
            const originalSiteId = expense?.site?.id
           // const originalGuardId = expense?.guard?.id

            const originalData = {
                title: expense?.title || "",
                expense_category_id: originalCategoryId,
                site_id: originalSiteId,
                //guard_id: originalGuardId,
                amount: expense?.amount?.toString() || "",
                currency: expense?.currency || "USD",
                description: expense?.description || "",
                expense_date: expense?.expense_date ? format(parseISO(expense.expense_date), 'yyyy-MM-dd') : "",
            }

            const currentData = {
                title: formValues.title.trim(),
                expense_category_id: formValues.expense_category_id,
                site_id: formValues.site_id,
                guard_id: formValues.guard_id,
                amount: formValues.amount,
                currency: formValues.currency,
                description: formValues.description || "",
                expense_date: formValues.expense_date,
            }

            const hasChanges =
                currentData.title !== originalData.title ||
                currentData.expense_category_id !== originalData.expense_category_id ||
                currentData.site_id !== originalData.site_id ||
                //currentData.guard_id !== originalData.guard_id ||
                currentData.amount !== originalData.amount ||
                currentData.currency !== originalData.currency ||
                currentData.description !== originalData.description ||
                currentData.expense_date !== originalData.expense_date

            if (!hasChanges) {
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
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[900px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Edit Expense</span>
                </div>

                {isFetching ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading expense details...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title - Full width */}
                        <div className="w-full">
                            <FloatingLabelInput
                                label="Expense Title *"
                                {...register("title")}
                                error={errors.title?.message}
                                disabled={isLoading || isFetching}
                            />
                        </div>

                        {/* First Row: Category, Site, Guard - 3 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Expense Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Category *
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.expense_category_id || ""}
                                    onValueChange={(value) => {
                                        setValue("expense_category_id", Number(value), { shouldValidate: true })
                                    }}
                                    options={expenseCategories.map((cat: ExpenseCategory) => ({
                                        value: cat?.id,
                                        label: cat?.name || '',
                                        ...cat
                                    }))}
                                    onSearch={(search) => {
                                        setCategorySearch(search)
                                        dispatch(fetchExpenseCategorys({
                                            page: 1,
                                            per_page: 10,
                                            search: search
                                        }))
                                    }}
                                    placeholder="Select category"
                                    disabled={isLoading || isFetching || categoriesLoading}
                                    isLoading={categoriesLoading}
                                    emptyMessage={categorySearch ? "No categories found" : "No categories available"}
                                    searchPlaceholder="Search categories..."
                                    icon={Tag}
                                    iconPosition="left"
                                    displayValue={(value, options) => {
                                        if (!value) return "Select category"
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select category"
                                    }}
                                />
                                {errors.expense_category_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.expense_category_id.message}</p>
                                )}
                            </div>

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
                                            is_active: true,
                                            search: search
                                        }))
                                    }}
                                    placeholder="Select site"
                                    disabled={isLoading || isFetching || sitesLoading}
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

                            {/* Guard */}
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
                                    disabled={isLoading || isFetching || guardsLoading}
                                    isLoading={guardsLoading}
                                    emptyMessage={guardSearch ? "No guards found" : "No guards available"}
                                    searchPlaceholder="Search guards..."
                                    icon={Users}
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
                        </div>

                        {/* Second Row: Amount, Currency, Date - 3 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Amount *
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <DollarSign className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="pl-9 h-11"
                                        {...register("amount")}
                                        disabled={isLoading || isFetching}
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
                                )}
                            </div>

                            {/* Currency */}
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Currency *
                                </Label>
                                <SearchableDropdownWithIcon
                                    value={formValues.currency || ""}
                                    onValueChange={(value) => {
                                        setValue("currency", value.toString(), { shouldValidate: true })
                                    }}
                                    options={currencyOptions.map(currency => ({
                                        value: currency.value,
                                        label: currency.label,
                                        symbol: currency.symbol
                                    }))}
                                    onSearch={() => {}} // No search needed for currencies
                                    placeholder="Select currency"
                                    disabled={isLoading || isFetching}
                                    emptyMessage="No currencies available"
                                    searchPlaceholder="Search currencies..."
                                    icon={DollarSign}
                                    iconPosition="left"
                                    displayValue={(value, options) => {
                                        if (!value) return "Select currency"
                                        const option = options.find(opt => opt.value === value)
                                        return option?.label || "Select currency"
                                    }}
                                />
                                {errors.currency && (
                                    <p className="text-sm text-red-500 mt-1">{errors.currency.message}</p>
                                )}
                            </div>

                            {/* Expense Date */}
                            <div className="space-y-2">
                                <Label htmlFor="expense_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Expense Date *
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-11",
                                                !expenseDate && "text-muted-foreground"
                                            )}
                                            disabled={isLoading || isFetching}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                            {formatDateDisplay(expenseDate)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={expenseDate}
                                            onSelect={setExpenseDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.expense_date && (
                                    <p className="text-sm text-red-500 mt-1">{errors.expense_date.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Description - Full width */}
                        <div className="w-full">
                            <FloatingLabelTextarea
                                label="Description (Optional)"
                                rows={4}
                                {...register("description")}
                                disabled={isLoading || isFetching}
                                className="resize-none"
                                placeholder="Enter expense description, notes, or additional details..."
                            />
                        </div>

                        {/* Footer Actions */}
                        <DialogActionFooter
                            cancelText="Cancel"
                            submitText="Update Expense"
                            isSubmitting={isLoading}
                            submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            onSubmit={handleSubmit(onSubmit)}
                        />
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}