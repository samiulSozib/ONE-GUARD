// components/email-template/email-template-create-form.tsx
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
import { Tag, Code, FileText, Eye, Send } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { createEmailTemplate, previewEmailTemplate } from "@/store/slices/emailTemplateSlice"
import { CreateEmailTemplateDto, EmailTemplateCategory } from "@/app/types/email-template"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SweetAlertService from "@/lib/sweetAlert"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import { Badge } from "../ui/badge"
import TiptapEditor from "../ui/tiptap-editor"

// Category options
const categoryOptions = [
    { value: "guard", label: "Guard" },
    { value: "client", label: "Client" },
    { value: "job", label: "Job" },
    { value: "system", label: "System" },
    { value: "general", label: "General" },
]

// Zod schema
const templateSchema = z.object({
    code: z.string()
        .min(1, { message: "Template code is required" })
        .regex(/^[a-z0-9_]+$/, { message: "Use only lowercase letters, numbers, and underscores" })
        .min(3, { message: "Code must be at least 3 characters" })
        .max(50, { message: "Code must be less than 50 characters" }),

    name: z.string()
        .min(1, { message: "Template name is required" })
        .min(3, { message: "Name must be at least 3 characters" })
        .max(100, { message: "Name must be less than 100 characters" }),

    subject: z.string()
        .min(1, { message: "Email subject is required" })
        .max(200, { message: "Subject must be less than 200 characters" }),

    category: z.string()
        .min(1, { message: "Category is required" }),

    description: z.string().optional(),
    body: z.string().optional(),
    variables: z.string().optional(),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface EmailTemplateCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function EmailTemplateCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess
}: EmailTemplateCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<TemplateFormData>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            code: "",
            name: "",
            subject: "",
            category: "general",
            description: "",
            body: "",
            variables: "",
        },
        mode: "onChange"
    })

    const formValues = watch()
    const variablesList = formValues.variables
        ? formValues.variables.split(',').map(v => v.trim()).filter(v => v)
        : []

    // Handle preview
    const handlePreview = async () => {
        // Create a sample variables object from the variables list
        const sampleVariables: Record<string, string> = {}
        variablesList.forEach(variable => {
            sampleVariables[variable] = `[Sample ${variable}]`
        })
        
        // Add common sample variables if not present
        if (!sampleVariables.app_name) sampleVariables.app_name = "1Guard Security"
        
        try {
            const result = await dispatch(previewEmailTemplate({
                id: 0, // This is for preview only, we'll use a temp endpoint or handle differently
                data: { variables: sampleVariables }
            }))
            
            // Since preview requires an existing template ID, we'll handle preview differently
            // For now, just show a simulated preview or disable preview for new templates
            SweetAlertService.info(
                'Preview Available After Save',
                'You can preview this template after saving it. Continue to create the template first.'
            )
        } catch (error) {
            console.error('Preview error:', error)
        }
    }

    const onSubmit = async (data: TemplateFormData) => {
        setIsLoading(true)
        try {
            const submitData: CreateEmailTemplateDto = {
                code: data.code.trim(),
                name: data.name.trim(),
                subject: data.subject.trim(),
                body: data.body || "",
                category: data.category as EmailTemplateCategory,
                description: data.description?.trim() || undefined,
                variables: variablesList,
                is_active: true,
            }

            const result = await dispatch(createEmailTemplate(submitData))

            if (createEmailTemplate.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Template Created',
                    `${data.name} has been created successfully.`
                ).then(() => {
                    reset()
                    setPreviewData(null)
                    setShowPreview(false)
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to create template. Please try again."

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

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            reset()
            setPreviewData(null)
            setShowPreview(false)
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

            <DialogContent className="sm:max-w-[800px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Create Email Template</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Template Code */}
                    <div className="w-full">
                        <FloatingLabelInput
                            label="Template Code *"
                            {...register("code")}
                            error={errors.code?.message}
                            disabled={isLoading}
                            placeholder="e.g., welcome_email"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Use only lowercase letters, numbers, and underscores. This will be used as a unique identifier.
                        </p>
                    </div>

                    {/* Template Name */}
                    <div className="w-full">
                        <FloatingLabelInput
                            label="Template Name *"
                            {...register("name")}
                            error={errors.name?.message}
                            disabled={isLoading}
                            placeholder="e.g., Welcome Email"
                        />
                    </div>

                    {/* Category & Subject Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category *
                            </Label>
                            <Select
                                value={formValues.category}
                                onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full h-11">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                            )}
                        </div>

                        {/* Subject */}
                        <div className="relative">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Subject *
                            </Label>
                            <FloatingLabelInput
                                label="Email Subject *"
                                {...register("subject")}
                                error={errors.subject?.message}
                                disabled={isLoading}
                                placeholder="Welcome to {{ app_name }}"
                            />
                        </div>
                    </div>

                    {/* Variables */}
                    <div className="w-full">
                        <FloatingLabelInput
                            label="Variables (comma-separated)"
                            {...register("variables")}
                            error={errors.variables?.message}
                            disabled={isLoading}
                            placeholder="full_name, email, app_name"
                        />
                        {variablesList.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {variablesList.map((variable) => (
                                    <Badge key={variable} variant="secondary" className="font-mono text-xs">
                                        {`{{${variable}}}`}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Define variables that can be used in the template body and subject.
                        </p>
                    </div>

                    {/* Description */}
                    <div className="w-full">
                        <FloatingLabelTextarea
                            label="Description"
                            {...register("description")}
                            // error={errors.description?.message}
                            disabled={isLoading}
                            placeholder="Describe what this template is used for..."
                            rows={3}
                        />
                    </div>

                    {/* Email Body with TinyMCE */}
                    <div className="w-full">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Email Body
                        </Label>
                        {mounted && (
                            <TiptapEditor
                                content={watch("body") || ""}
                                onChange={(content) => {
                                    setValue("body", content, { shouldValidate: true })
                                }}
                                editable={!isLoading}
                                placeholder="Write email content... Use {{variables}} for dynamic content"
                            />
                        )}
                        {!mounted && (
                            <textarea
                                rows={6}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm"
                                placeholder="Loading editor..."
                                disabled
                            />
                        )}
                    </div>

                    {/* Variables Hint */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Available Variables
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {variablesList.length > 0 ? (
                                variablesList.map((variable) => (
                                    <Badge key={variable} variant="outline" className="font-mono text-xs bg-white dark:bg-gray-800">
                                        {`{{${variable}}}`}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    No variables defined yet. Add variables above to use them in your template.
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            Use double curly braces to insert variables in your email content.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <DialogActionFooter
                        cancelText="Cancel"
                        submitText="Create Template"
                        isSubmitting={isLoading}
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}