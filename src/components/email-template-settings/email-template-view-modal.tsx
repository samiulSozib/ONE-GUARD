// components/email-template/email-template-view-modal.tsx
'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmailTemplate, EmailTemplateCategory } from "@/app/types/email-template"
import { format } from "date-fns"
import { Calendar, User, Code, Tag, FileText, Mail, Eye, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface EmailTemplateViewModalProps {
    isOpen: boolean
    onClose: () => void
    template: EmailTemplate | null
}

// Category config
const categoryConfig: Record<EmailTemplateCategory, { label: string; color: string; icon: typeof Tag }> = {
    guard: { label: "Guard", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Tag },
    client: { label: "Client", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: Tag },
    job: { label: "Job", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: Tag },
    system: { label: "System", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", icon: Tag },
    general: { label: "General", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Tag },
}

export function EmailTemplateViewModal({ isOpen, onClose, template }: EmailTemplateViewModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null)

    if (!template) return null

    const handleCopy = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy h:mm a')
        } catch {
            return dateString
        }
    }

    const CategoryIcon = categoryConfig[template.category]?.icon || Tag

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] w-[90vw] max-w-[90vw] max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-0">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Mail className="h-5 w-5 text-[#5F0015]" />
                                {template.name}
                            </DialogTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {template.code}
                                </code>
                                <Badge variant="outline" className={cn("border-0", categoryConfig[template.category]?.color)}>
                                    <CategoryIcon className="h-3 w-3 mr-1" />
                                    {categoryConfig[template.category]?.label}
                                </Badge>
                                <Badge variant="outline" className={template.is_active 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0"
                                }>
                                    {template.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            ✕
                        </Button>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Subject
                            </label>
                            <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <span className="text-sm font-mono truncate">{template.subject}</span>
                                <button
                                    onClick={() => handleCopy(template.subject, 'subject')}
                                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                >
                                    {copiedField === 'subject' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Code className="h-3 w-3" />
                                Version
                            </label>
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <span className="text-sm font-mono">v{template.version}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {template.description && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Description
                            </label>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{template.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Variables */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Code className="h-3 w-3" />
                            Available Variables
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            {template.variables && template.variables.length > 0 ? (
                                template.variables.map((variable) => (
                                    <Badge key={variable} variant="secondary" className="font-mono text-xs">
                                        {`{{${variable}}}`}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No variables defined</span>
                            )}
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Email Body
                        </label>
                        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 max-h-[400px] overflow-y-auto">
                            <div 
                                className="prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: template.body || '<p class="text-gray-400 italic">No content</p>' }}
                            />
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Created</label>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(template.created_at)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Last Updated</label>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(template.updated_at)}
                                </div>
                            </div>
                            {template.created_by && typeof template.created_by !== 'number' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500">Created By</label>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <User className="h-3 w-3" />
                                        {template.created_by.first_name} {template.created_by.last_name}
                                    </div>
                                </div>
                            )}
                            {template.updated_by && typeof template.updated_by !== 'number' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500">Updated By</label>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <User className="h-3 w-3" />
                                        {template.updated_by.first_name} {template.updated_by.last_name}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-end">
                        <Button onClick={onClose} variant="outline">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}