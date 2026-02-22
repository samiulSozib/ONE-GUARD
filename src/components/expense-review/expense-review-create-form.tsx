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
import { CalendarIcon, DollarSign, Tag, Building, Users, Search, Receipt } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { createExpenseReview, fetchExpenseReviews } from "@/store/slices/expenseReviewSlice"
import { fetchExpenses } from "@/store/slices/expenseSlice"
import { CreateExpenseReviewDto } from "@/app/types/expenseReview"
import { Expense } from "@/app/types/expense"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { format } from "date-fns"
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

interface ExpenseReviewCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function ExpenseReviewCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: ExpenseReviewCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    // Redux states for dropdown data
    const { expenses, pagination: expensesPagination, isLoading: expensesLoading } = 
        useAppSelector((state) => state.expense)

    // Search states for comboboxes
    const [expenseSearch, setExpenseSearch] = useState("")

    const {
        register,
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

    // Initial fetch on mount
    useEffect(() => {
        dispatch(fetchExpenses({ page: 1, per_page: 10}))
    }, [dispatch])

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

    // Get selected expense for display
    const selectedExpense = expenses.find((exp: Expense) => exp.id === formValues.expense_id)

    // Format currency amount
    const formatAmount = (amount: string | number, currency: string) => {
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
        setIsLoading(true)
        try {
            // Prepare data as per CreateExpenseReviewDto
            const submitData: CreateExpenseReviewDto = {
                expense_id: data.expense_id,
                decision: data.decision,
                remark: data.remark?.trim() ,
            }

            const result = await dispatch(createExpenseReview(submitData))

            if (createExpenseReview.fulfilled.match(result)) {
                const decisionLabel = decisionOptions.find(opt => opt.value === data.decision)?.label || data.decision
                dispatch(fetchExpenseReviews({page:1,per_page:10}))
                
                SweetAlertService.success(
                    'Expense Review Created',
                    `Expense review has been ${decisionLabel.toLowerCase()} successfully.`
                ).then(() => {
                    // Reset all states
                    reset()
                    setExpenseSearch("")
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create expense review. Please try again."

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
        reset()
        setExpenseSearch("")
        onOpenChange?.(false)
    }

    const handleDialogOpenChange = (open: boolean) => {
        if (open) {
            onOpenChange?.(true)
        } else {
            reset()
            setExpenseSearch("")
            onOpenChange?.(false)
        }
    }

    // Get decision color class
    const getDecisionColor = (decision: string) => {
        const option = decisionOptions.find(opt => opt.value === decision)
        return option?.color || "text-gray-600"
    }

    // Get decision background color
    const getDecisionBgColor = (decision: string) => {
        const option = decisionOptions.find(opt => opt.value === decision)
        return option?.bgColor || "bg-gray-100"
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
                    <span className="whitespace-nowrap">Create Expense Review</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                            disabled={isLoading || expensesLoading}
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
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">Title:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.title}</span>
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
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Tag className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {selectedExpense.category.name}
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
                            disabled={isLoading}
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
                            {...register("remark")}
                            disabled={isLoading}
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
                        submitText="Create Review"
                        isSubmitting={isLoading}
                        submitColor={cn(
                            "bg-gradient-to-r",
                            selectedDecision === 'approved' && "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
                            selectedDecision === 'rejected' && "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
                            !selectedDecision && "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        )}
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}

// Add missing Input import
import { Input } from "@/components/ui/input"