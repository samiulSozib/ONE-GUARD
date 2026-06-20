'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import {
    fetchAssignmentSummary,
    fetchAssignmentLogs,
    clearAssignmentData
} from '@/store/slices/shiftLogsSlice'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Clock,
    MapPin,
    CheckCircle,
    XCircle,
    Calendar,
    User,
    Shield,
    Loader2,
    FileText,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { useAppSelector } from '@/hooks/useAppSelector'

interface AssignmentSummaryProps {
    assignmentId: number
}

export function AssignmentSummary({ assignmentId }: AssignmentSummaryProps) {
    const dispatch = useAppDispatch()
    const { assignmentSummary, assignmentLogs, isLoading, error } = useAppSelector(
        (state) => state.shiftLogs
    )
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        if (assignmentId) {
            // Endpoint 4: Fetch Assignment Summary
            dispatch(fetchAssignmentSummary(assignmentId))
            // Endpoint 5: Fetch Assignment Logs
            dispatch(fetchAssignmentLogs({
                assignmentId,
                params: { page: currentPage, per_page: 20 }
            }))
        }

        return () => {
            dispatch(clearAssignmentData())
        }
    }, [dispatch, assignmentId, currentPage])

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A'
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss')
        } catch {
            return dateString
        }
    }

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A'
        const hours = Math.floor(minutes / 60)
        const mins = Math.round(minutes % 60)
        if (hours > 0) {
            return `${hours}h ${mins}m`
        }
        return `${mins}m`
    }

    if (isLoading && !assignmentSummary) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error Loading Assignment Summary
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            dispatch(fetchAssignmentSummary(assignmentId))
                            dispatch(fetchAssignmentLogs({
                                assignmentId,
                                params: { page: currentPage, per_page: 20 }
                            }))
                        }}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (!assignmentSummary) {
        return null
    }

    const { shift_summary, break_details, break_count, logs_count, attendance } = assignmentSummary

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Hours</p>
                                <p className="text-2xl font-bold">
                                    {shift_summary?.formatted_total || 'N/A'}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Net Hours</p>
                                <p className="text-2xl font-bold">
                                    {shift_summary?.formatted_net || 'N/A'}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Breaks</p>
                                <p className="text-2xl font-bold">{break_count || 0}</p>
                                <p className="text-xs text-gray-500">
                                    Total: {formatDuration(shift_summary?.break_time)}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Logs</p>
                                <p className="text-2xl font-bold">{logs_count || 0}</p>
                            </div>
                            <FileText className="h-8 w-8 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Break Details */}
            {break_details && break_details.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Break Details
                        </CardTitle>
                        <CardDescription>
                            {break_details.length} break{break_details.length > 1 ? 's' : ''} taken during the shift
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-3">
                                {break_details.map((breakItem, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">
                                                    Break #{index + 1}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                                <span>From: {formatDateTime(breakItem.start_time)}</span>
                                                <span>To: {formatDateTime(breakItem.end_time)}</span>
                                            </div>
                                            {breakItem.location && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{breakItem.location}</span>
                                                </div>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="mt-2 sm:mt-0">
                                            {breakItem.duration_formatted || formatDuration(breakItem.duration_minutes)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {/* Logs Table */}
            {assignmentLogs && assignmentLogs.logs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Assignment Logs
                        </CardTitle>
                        <CardDescription>
                            All activity logs for this assignment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignmentLogs.logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {formatDateTime(log.action_time)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm truncate max-w-[200px]" title={log.location_address}>
                                                        {log.location_address || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {log.remarks || '-'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>

                        {/* Pagination */}
                        {assignmentLogs.pagination.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-gray-500">
                                    Page {assignmentLogs.pagination.current_page} of {assignmentLogs.pagination.last_page}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === assignmentLogs.pagination.last_page}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}