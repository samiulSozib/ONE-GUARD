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
import { CalendarIcon, DollarSign, Tag, Building, Users, Receipt, User } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { updateExpenseReview, fetchExpenseReview, fetchExpenseReviews } from "@/store/slices/expenseReviewSlice"
import { fetchExpenses } from "@/store/slices/expenseSlice"
import { ExpenseReview, CreateExpenseReviewDto } from "@/app/types/expenseReview"
import { Expense } from "@/app/types/expense"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format, parseISO } from "date-fns"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Decision options
const decisionOptions = [
    { value: "approved", label: "Approve", color: "text-green-600", bgColor: "bg-green-100" },
    { value: "rejected", label: "Reject", color: "text-red-600", bgColor: "bg-red-100" },
]

// Zod schema
const expenseReviewSchema = z.object({
    expense_id: z.number()
        .min(1, { message: "Expense is required" }),

    decision: z.enum(["approved", "rejected"]),

    remark: z.string()
        .max(500, { message: "Remark must be less than 500 characters" })
        .optional()
        .nullable(),
})

type ExpenseReviewFormData = z.infer<typeof expenseReviewSchema>

interface ExpenseReviewEditFormProps {
    trigger: ReactNode
    expenseReview: ExpenseReview
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function ExpenseReviewEditForm({
    trigger,
    expenseReview,
    isOpen,
    onOpenChange,
    onSuccess
}: ExpenseReviewEditFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)

    // Redux states for dropdown data
    const { expenses, isLoading: expensesLoading } = useAppSelector((state) => state.expense)

    // Search states for comboboxes
    const [expenseSearch, setExpenseSearch] = useState("")

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ExpenseReviewFormData>({
        resolver: zodResolver(expenseReviewSchema),
        defaultValues: {
            expense_id: undefined,
            decision: "approved",
            remark: "",
        },
        mode: "onBlur"
    })

    const formValues = watch()
    const selectedDecision = formValues.decision

    // Fetch expenses when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (expenseSearch.trim() || expenseSearch === "") {
                dispatch(fetchExpenses({
                    page: 1,
                    per_page: 10,
                    search: expenseSearch.trim(),
                }))
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [expenseSearch, dispatch])

    // Load expense review data when dialog opens
    useEffect(() => {
        if (isOpen && expenseReview?.id) {
            loadExpenseReview()
        }
    }, [isOpen, expenseReview?.id])

    const loadExpenseReview = async () => {
        if (!expenseReview?.id) return

        setIsFetching(true)
        try {
            const result = await dispatch(fetchExpenseReview({
                id: expenseReview.id,
                params: { include: ['expense', 'reviewer'] }
            }))

            if (fetchExpenseReview.fulfilled.match(result)) {
                const data = result.payload.item

                // Populate form with existing data
                reset({
                    expense_id: data.expense_id,
                    decision: data.decision as "approved" | "rejected",
                    remark: data.remark || "",
                })

                
            }
        } catch (error) {
            console.error("Failed to load expense review:", error)
            SweetAlertService.error('Error', 'Failed to load expense review details')
        } finally {
            setIsFetching(false)
        }
    }

    // Get selected expense for display - first try from form, then from expenseReview
    const selectedExpense = expenses.find((exp: Expense) => exp.id === formValues.expense_id) 

    // Format currency amount
    const formatAmount = (amount: string | number, currency: string = 'USD') => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
        const symbol = getCurrencySymbol(currency)
        return `${symbol} ${numAmount.toFixed(2)}`
    }

    // Get currency symbol
    const getCurrencySymbol = (currency: string) => {
        const currencySymbols: Record<string, string> = {
            USD: "$", EUR: "€", GBP: "£", AFN: "؋", INR: "₹", PKR: "₨"
        }
        return currencySymbols[currency] || currency
    }

    // Format date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy')
        } catch (error) {
            return dateString
        }
    }

    const onSubmit = async (data: ExpenseReviewFormData) => {
        if (!expenseReview?.id) return

        setIsLoading(true)
        try {
            const submitData: CreateExpenseReviewDto = {
                expense_id: data.expense_id,
                decision: data.decision,
                remark: data.remark?.trim(),
            }

            const result = await dispatch(updateExpenseReview({
                id: expenseReview.id,
                data: submitData
            }))

            if (updateExpenseReview.fulfilled.match(result)) {
                const decisionLabel = decisionOptions.find(opt => opt.value === data.decision)?.label || data.decision
                dispatch(fetchExpenseReviews({ page: 1, per_page: 10 }))
                
                SweetAlertService.success(
                    'Expense Review Updated',
                    `Expense review has been updated to ${decisionLabel.toLowerCase()}.`
                ).then(() => {
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to update expense review. Please try again."

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
            // Check if there are unsaved changes
            const hasChanges = 
                formValues.expense_id !== expenseReview.expense_id ||
                formValues.decision !== expenseReview.decision ||
                formValues.remark !== (expenseReview.remark || "")

            if (!hasChanges) {
                reset()
                setExpenseSearch("")
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
                        setExpenseSearch("")
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

            <DialogContent className="sm:max-w-[700px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Edit Expense Review</span>
                </div>

                {isFetching ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading expense review details...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Review ID and Metadata */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Review ID:</span>
                                <Badge variant="outline" className="font-mono">#{expenseReview.id}</Badge>
                            </div>
                            {expenseReview.reviewer && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Reviewer:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {expenseReview.reviewer.email || expenseReview.reviewer.first_name || 'Unknown'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Created At */}
                        {expenseReview.created_at && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Reviewed on:</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {format(new Date(expenseReview.created_at), 'MMM dd, yyyy • HH:mm')}
                                </span>
                            </div>
                        )}

                        {/* Expense Selection - Searchable */}
                        <div className="space-y-2">
                            <Label htmlFor="expense" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select Expense *
                            </Label>
                            <SearchableDropdownWithIcon
                                value={formValues.expense_id || ""}
                                onValueChange={(value) => {
                                    setValue("expense_id", Number(value), { shouldValidate: true })
                                }}
                                options={expenses.map((exp: Expense) => ({
                                    value: exp.id,
                                    label: `${exp.title} - ${formatAmount(exp.amount, exp.currency)}`,
                                    expense: exp
                                }))}
                                onSearch={(search) => {
                                    setExpenseSearch(search)
                                    dispatch(fetchExpenses({
                                        page: 1,
                                        per_page: 10,
                                        search: search,
                                    }))
                                }}
                                placeholder="Search expenses by title..."
                                disabled={isLoading || isFetching || expensesLoading}
                                isLoading={expensesLoading}
                                emptyMessage={expenseSearch ? "No expenses found" : "No expenses available"}
                                searchPlaceholder="Search expenses..."
                                icon={Receipt}
                                iconPosition="left"
                                displayValue={(value, options) => {
                                    if (!value) return "Select an expense"
                                    const option = options.find(opt => opt.value === value)
                                    return option?.label || "Select an expense"
                                }}
                            />
                            {errors.expense_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.expense_id.message}</p>
                            )}
                        </div>

                        {/* Selected Expense Details - Show when expense is selected */}
                        {selectedExpense && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Expense Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Title:</span>
                                        <span className="font-medium text-gray-900 dark:text-white truncate">{selectedExpense.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatAmount(selectedExpense.amount, selectedExpense.currency)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Site:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {selectedExpense.site?.site_name || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(selectedExpense.expense_date)}
                                        </span>
                                    </div>
                                    {selectedExpense.category && (
                                        <div className="flex items-center gap-2 md:col-span-2">
                                            <Tag className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {typeof selectedExpense.category === 'object' 
                                                    ? selectedExpense.category.name 
                                                    : selectedExpense.category}
                                            </Badge>
                                        </div>
                                    )}
                                    
                                </div>
                            </div>
                        )}

                        {/* Decision - Radio Group */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Decision *
                            </Label>
                            <RadioGroup
                                value={formValues.decision}
                                onValueChange={(value: "approved" | "rejected") => {
                                    setValue("decision", value, { shouldValidate: true })
                                }}
                                className="flex flex-col sm:flex-row gap-4"
                                disabled={isLoading || isFetching}
                            >
                                {decisionOptions.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem 
                                            value={option.value} 
                                            id={`decision-${option.value}`}
                                            className={cn(
                                                "border-2",
                                                option.value === 'approved' && "border-green-500 text-green-500",
                                                option.value === 'rejected' && "border-red-500 text-red-500"
                                            )}
                                        />
                                        <Label 
                                            htmlFor={`decision-${option.value}`}
                                            className={cn(
                                                "font-medium cursor-pointer px-3 py-1 rounded-full text-sm",
                                                option.bgColor,
                                                option.color
                                            )}
                                        >
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            {errors.decision && (
                                <p className="text-sm text-red-500 mt-1">{errors.decision.message}</p>
                            )}
                        </div>

                        {/* Remark - Optional */}
                        <div className="w-full">
                            <FloatingLabelTextarea
                                label="Remark (Optional)"
                                rows={4}
                                // {...register("remark")}
                                disabled={isLoading || isFetching}
                                className="resize-none"
                                placeholder="Enter any remarks, notes, or comments about this review..."
                            />
                            {errors.remark && (
                                <p className="text-sm text-red-500 mt-1">{errors.remark.message}</p>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <DialogActionFooter
                            cancelText="Cancel"
                            submitText="Update Review"
                            isSubmitting={isLoading}
                            submitColor={cn(
                                "bg-gradient-to-r",
                                selectedDecision === 'approved' && "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
                                selectedDecision === 'rejected' && "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                            )}
                            onSubmit={handleSubmit(onSubmit)}
                        />
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

// Add missing Input import
import { Input } from "@/components/ui/input"