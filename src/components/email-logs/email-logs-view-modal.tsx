// components/email-logs/email-logs-view-modal.tsx
'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmailLog } from "@/app/types/emailLog"
import { format } from "date-fns"
import { Calendar, User, Mail, CheckCircle, XCircle, Clock, Eye, Globe, Monitor, Copy, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface EmailLogViewModalProps {
    isOpen: boolean
    onClose: () => void
    log: EmailLog | null
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    sent: { label: "Sent", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
    failed: { label: "Failed", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
    opened: { label: "Opened", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Eye },
}

export function EmailLogViewModal({ isOpen, onClose, log }: EmailLogViewModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null)

    if (!log) return null

    const handleCopy = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A"
        try {
            return format(new Date(dateString), 'MMM dd, yyyy h:mm:ss a')
        } catch {
            return dateString
        }
    }

    const status = statusConfig[log.status] || statusConfig.pending
    const StatusIcon = status.icon

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] w-[90vw] max-w-[90vw] max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-0">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Mail className="h-5 w-5 text-[#5F0015]" />
                                Email Log Details
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("border-0", status.color)}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                </Badge>
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    ID: {log.id}
                                </code>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            ✕
                        </Button>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Recipient Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Recipient Email
                            </label>
                            <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <span className="text-sm font-mono">{log.recipient_email}</span>
                                <button
                                    onClick={() => handleCopy(log.recipient_email, 'email')}
                                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                >
                                    {copiedField === 'email' ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {log.recipient_name && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Recipient Name
                                </label>
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <span className="text-sm">{log.recipient_name}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</label>
                        <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <span className="text-sm">{log.subject}</span>
                            <button
                                onClick={() => handleCopy(log.subject, 'subject')}
                                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                            >
                                {copiedField === 'subject' ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Template Info */}
                    {log.template && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Template Name</label>
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <span className="text-sm">{log.template.name}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Template Code</label>
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <code className="text-sm font-mono">{log.template_code}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Variables Used */}
                    {log.variables && Object.keys(log.variables).length > 0 && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Variables Used</label>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                                <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(log.variables, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Email Body */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Email Body
                        </label>
                        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 max-h-[400px] overflow-y-auto">
                            <div 
                                className="prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: log.body }}
                            />
                        </div>
                    </div>

                    {/* Error Message (if failed) */}
                    {log.status === 'failed' && log.error_message && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <label className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">Error Message</label>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{log.error_message}</p>
                        </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Sent At</label>
                            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                <Calendar className="h-3 w-3" />
                                {formatDate(log.sent_at || log.created_at)}
                            </div>
                        </div>

                        {log.opened_at && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Opened At</label>
                                <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                    <Eye className="h-3 w-3" />
                                    {formatDate(log.opened_at)}
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">IP Address</label>
                            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                <Globe className="h-3 w-3" />
                                {log.ip_address || 'N/A'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">User Agent</label>
                            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                <Monitor className="h-3 w-3" />
                                <span className="truncate" title={log.user_agent}>
                                    {log.user_agent?.substring(0, 50) || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-2 border-t">
                        <div>
                            <span className="font-medium">Created:</span> {formatDate(log.created_at)}
                        </div>
                        <div>
                            <span className="font-medium">Updated:</span> {formatDate(log.updated_at)}
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