// components/email-template/email-template-edit-form.tsx
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
import { Code, Eye, Send, History } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateEmailTemplate, fetchEmailTemplate, previewEmailTemplate, sendTestEmail } from "@/store/slices/emailTemplateSlice"
import { EmailTemplate, EmailTemplateCategory, UpdateEmailTemplateDto } from "@/app/types/email-template"
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
import { EmailTemplateTestModal } from "./email-template-test-modal"
import { EmailTemplateLogsModal } from "./email-template-logs-modal"

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
    is_active: z.boolean().optional(),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface EmailTemplateEditFormProps {
    trigger: ReactNode
    template: EmailTemplate
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function EmailTemplateEditForm({
    trigger,
    template,
    isOpen,
    onOpenChange,
    onSuccess
}: EmailTemplateEditFormProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [testDialogOpen, setTestDialogOpen] = useState(false)
    const [logsDialogOpen, setLogsDialogOpen] = useState(false)

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
            name: "",
            subject: "",
            category: "general",
            description: "",
            body: "",
            variables: "",
            is_active: true,
        },
        mode: "onChange"
    })

    const formValues = watch()
    const variablesList = formValues.variables
        ? formValues.variables.split(',').map(v => v.trim()).filter(v => v)
        : []

    // Fetch template details when dialog opens
    useEffect(() => {
        if (isOpen && template?.id) {
            loadTemplate()
        }
    }, [isOpen, template?.id])

    const loadTemplate = async () => {
        if (!template?.id) return

        setIsFetching(true)
        try {
            const result = await dispatch(fetchEmailTemplate(template.id))

            if (fetchEmailTemplate.fulfilled.match(result)) {
                const data = result.payload.item

                reset({
                    name: data.name || "",
                    subject: data.subject || "",
                    category: data.category || "general",
                    description: data.description || "",
                    body: data.body || "",
                    variables: data.variables?.join(', ') || "",
                    is_active: data.is_active,
                })
            }
        } catch (error) {
            console.error("Failed to load template:", error)
            SweetAlertService.error('Error', 'Failed to load template details')
        } finally {
            setIsFetching(false)
        }
    }

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
                id: template.id,
                data: { variables: sampleVariables }
            }))
            
            if (previewEmailTemplate.fulfilled.match(result)) {
                const { subject, body } = result.payload
                SweetAlertService.fire({
                    title: 'Email Preview',
                    html: `
                        <div class="text-left">
                            <div class="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <strong class="text-sm">Subject:</strong>
                                <p class="text-sm mt-1">${subject}</p>
                            </div>
                            <div class="prose max-w-none">
                                ${body}
                            </div>
                        </div>
                    `,
                    width: '600px',
                    showConfirmButton: true,
                    confirmButtonText: 'Close',
                })
            }
        } catch (error) {
            console.error('Preview error:', error)
            SweetAlertService.error('Preview Failed', 'Unable to preview template')
        }
    }

    // Handle send test
    const handleSendTest = () => {
        setTestDialogOpen(true)
    }

    // Handle view logs
    const handleViewLogs = () => {
        setLogsDialogOpen(true)
    }

    const onSubmit = async (data: TemplateFormData) => {
        if (!template?.id) return

        setIsLoading(true)
        try {
            const submitData: UpdateEmailTemplateDto = {
                name: data.name.trim(),
                subject: data.subject.trim(),
                body: data.body || "",
                category: data.category as EmailTemplateCategory,
                description: data.description?.trim() || undefined,
                variables: variablesList,
                is_active: data.is_active,
            }

            const result = await dispatch(updateEmailTemplate({
                id: template.id,
                data: submitData
            }))

            if (updateEmailTemplate.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Template Updated',
                    `${data.name} has been updated successfully.`
                ).then(() => {
                    onSuccess?.()
                    onOpenChange?.(false)
                })
            } else {
                throw result.payload
            }
        } catch (error: unknown) {
            let errorMessage = "Failed to update template. Please try again."

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
            const hasChanges = JSON.stringify(formValues) !== JSON.stringify({
                name: template?.name,
                subject: template?.subject,
                category: template?.category,
                description: template?.description,
                body: template?.body,
                variables: template?.variables?.join(', '),
                is_active: template?.is_active,
            })

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
        <>
            <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>

                <DialogContent className="sm:max-w-[800px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 text-lg font-semibold mb-6 pb-2 border-b">
                        <div className="flex items-center gap-2">
                            <Image src="/images/logo.png" alt="" width={24} height={24} />
                            <span className="whitespace-nowrap">Edit Email Template</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePreview}
                                disabled={isLoading || isFetching}
                                className="text-blue-600"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleSendTest}
                                disabled={isLoading || isFetching}
                                className="text-green-600"
                            >
                                <Send className="h-4 w-4 mr-1" />
                                Test
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleViewLogs}
                                disabled={isLoading || isFetching}
                                className="text-purple-600"
                            >
                                <History className="h-4 w-4 mr-1" />
                                Logs
                            </Button>
                        </div>
                    </div>

                    {isFetching ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F0015] mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading template details...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Status Toggle */}
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register("is_active")}
                                        className="rounded border-gray-300 h-4 w-4 text-[#5F0015] focus:ring-[#5F0015]"
                                    />
                                    <span className="text-sm font-medium">Active</span>
                                </label>
                            </div>

                            {/* Template Code (Read-only) */}
                            <div className="w-full">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Template Code
                                </Label>
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 font-mono text-sm">
                                    {template.code}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Template code cannot be changed
                                </p>
                            </div>

                            {/* Template Name */}
                            <div className="w-full">
                                <FloatingLabelInput
                                    label="Template Name *"
                                    {...register("name")}
                                    error={errors.name?.message}
                                    disabled={isLoading}
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

                            {/* Version Info */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Version:</span>
                                    <span className="font-mono text-gray-700 dark:text-gray-300">v{template.version}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500">Last Updated:</span>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {new Date(template.updated_at).toLocaleString()}
                                    </span>
                                </div>
                                {template.created_by && typeof template.created_by !== 'number' && (
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-gray-500">Created By:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {template.created_by.first_name} {template.created_by.last_name}
                                        </span>
                                    </div>
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
                                submitText="Update Template"
                                isSubmitting={isLoading}
                                onSubmit={handleSubmit(onSubmit)}
                            />
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Test Email Modal */}
            <EmailTemplateTestModal
                isOpen={testDialogOpen}
                onClose={() => setTestDialogOpen(false)}
                template={template}
            />

            {/* Logs Modal */}
            <EmailTemplateLogsModal
                isOpen={logsDialogOpen}
                onClose={() => setLogsDialogOpen(false)}
                template={template}
            />
        </>
    )
}