// components/email-template/email-template-logs-modal.tsx
'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmailTemplate, EmailTemplateLog } from "@/app/types/email-template"
import { useEffect, useState } from "react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { fetchEmailTemplateLogs } from "@/store/slices/emailTemplateSlice"
import { format } from "date-fns"
import { Loader2, Mail, CheckCircle, XCircle, Clock, Eye, EyeOff, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailTemplateLogsModalProps {
    isOpen: boolean
    onClose: () => void
    template: EmailTemplate | null
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    sent: { label: "Sent", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
    failed: { label: "Failed", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
    opened: { label: "Opened", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Eye },
}

export function EmailTemplateLogsModal({ isOpen, onClose, template }: EmailTemplateLogsModalProps) {
    const dispatch = useAppDispatch()
    const [logs, setLogs] = useState<EmailTemplateLog[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10,
    })
    const [expandedLogId, setExpandedLogId] = useState<number | null>(null)

    useEffect(() => {
        if (isOpen && template) {
            loadLogs()
        }
    }, [isOpen, template, pagination.current_page])

    const loadLogs = async () => {
        if (!template) return

        setIsLoading(true)
        try {
            const result = await dispatch(fetchEmailTemplateLogs({
                id: template.id,
                params: {
                    page: pagination.current_page,
                    per_page: pagination.per_page,
                }
            }))

            if (fetchEmailTemplateLogs.fulfilled.match(result)) {
                setLogs(result.payload.items)
                setPagination(result.payload.data)
            }
        } catch (error) {
            console.error("Failed to load logs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = () => {
        loadLogs()
    }

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, current_page: page }))
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A"
        try {
            return format(new Date(dateString), 'MMM dd, yyyy h:mm:ss a')
        } catch {
            return dateString
        }
    }

    if (!template) return null

    const StatusIcon = (status: string) => {
        const config = statusConfig[status] || statusConfig.pending
        const Icon = config.icon
        return <Icon className="h-3 w-3" />
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] w-[90vw] max-w-[90vw] max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-0">
                <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-[#5F0015]" />
                                Email Logs - {template.name}
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                History of emails sent using this template
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6">
                    {isLoading && logs.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No logs found</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                No emails have been sent using this template yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => {
                                const status = statusConfig[log.status] || statusConfig.pending
                                const StatusIconComponent = status.icon
                                const isExpanded = expandedLogId === log.id

                                return (
                                    <div
                                        key={log.id}
                                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        {/* Log Header */}
                                        <div
                                            className="p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                        >
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-1 rounded-full", status.color)}>
                                                        <StatusIconComponent className="h-3 w-3" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            To: {log.recipient_email}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Subject: {log.subject}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className={cn("border-0", status.color)}>
                                                        {status.label}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(log.sent_at || log.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Log Details (Expanded) */}
                                        {isExpanded && (
                                            <div className="p-4 border-t bg-white dark:bg-gray-900 space-y-3">
                                                {/* Recipient Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500">To</label>
                                                        <p className="text-sm text-gray-900 dark:text-white">{log.recipient_email}</p>
                                                        {log.recipient_name && (
                                                            <>
                                                                <label className="text-xs font-medium text-gray-500 mt-2 block">Name</label>
                                                                <p className="text-sm text-gray-900 dark:text-white">{log.recipient_name}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500">Subject</label>
                                                        <p className="text-sm text-gray-900 dark:text-white">{log.subject}</p>
                                                    </div>
                                                </div>

                                                {/* Variables */}
                                                {log.variables && Object.keys(log.variables).length > 0 && (
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500">Variables Used</label>
                                                        <div className="mt-1 bg-gray-50 dark:bg-gray-800 rounded p-2">
                                                            <pre className="text-xs font-mono overflow-x-auto">
                                                                {JSON.stringify(log.variables, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Email Body Preview */}
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500">Email Body Preview</label>
                                                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded max-h-[200px] overflow-y-auto">
                                                        <div 
                                                            className="prose prose-sm max-w-none dark:prose-invert text-xs"
                                                            dangerouslySetInnerHTML={{ __html: log.body }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Error Message (if failed) */}
                                                {log.status === 'failed' && log.error_message && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                                                        <label className="text-xs font-medium text-red-600 dark:text-red-400">Error</label>
                                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{log.error_message}</p>
                                                    </div>
                                                )}

                                                {/* Metadata */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs text-gray-500 border-t">
                                                    <div>
                                                        <span className="font-medium">Sent:</span> {formatDate(log.sent_at || log.created_at)}
                                                    </div>
                                                    {log.opened_at && (
                                                        <div>
                                                            <span className="font-medium">Opened:</span> {formatDate(log.opened_at)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-medium">IP Address:</span> {log.ip_address || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Message ID:</span> {log.message_id || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="text-sm text-gray-500">
                                        Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                        {pagination.total} logs
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.current_page === 1}
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm px-3">
                                            Page {pagination.current_page} of {pagination.last_page}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.current_page === pagination.last_page}
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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