// components/dashboard/pending-checkouts.tsx
"use client";

import { AlertCircle, PlusIcon } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { JSX, useEffect } from "react";
import { IconCircleFilled, IconClock, IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchDashboard } from "@/store/slices/dashboardSlice";
import { OngoingShift } from "@/app/types/dashboard";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

// Status badge color map based on status_color from API
const statusColorMap: Record<string, string> = {
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    success: "bg-green-50 text-green-700 border-green-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    primary: "bg-purple-50 text-purple-700 border-purple-200",
    default: "bg-gray-50 text-gray-700 border-gray-200",
};

// Status icon map based on shift_status
const statusIconMap: Record<string, JSX.Element> = {
    active: <IconCircleFilled className="w-3.5 h-3.5 text-green-500" />,
    assigned: <IconCircleFilled className="w-3.5 h-3.5 text-yellow-500" />,
    accepted: <IconCircleFilled className="w-3.5 h-3.5 text-blue-500" />,
    checked_in: <IconCircleFilled className="w-3.5 h-3.5 text-green-500" />,
    on_break: <IconClock className="w-3.5 h-3.5 text-gray-500" />,
    checked_out: <IconCircleFilled className="w-3.5 h-3.5 text-gray-400" />,
    completed: <IconCheck className="w-3.5 h-3.5 text-green-500" />,
    cancelled: <IconX className="w-3.5 h-3.5 text-red-500" />,
};

// Helper to get icon based on status
const getStatusIcon = (shiftStatus: string, statusColor: string | null) => {
    if (statusColor === 'danger') {
        return <IconAlertCircle className="w-3.5 h-3.5 text-red-500" />;
    }
    return statusIconMap[shiftStatus] || <IconCircleFilled className="w-3.5 h-3.5 text-gray-400" />;
};

// Format time for display
const formatTime = (time: string | null) => {
    if (!time) return 'N/A';
    return time;
};

export function PendingCheckouts() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { data: dashboard, isLoading } = useAppSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    const pendingCheckouts = dashboard?.pending_checkouts?.list || [];
    const stats = dashboard?.pending_checkouts || { count: 0, critical: 0, warning: 0, info: 0 };

    const getInitials = (name: string | null) => {
        if (!name) return "G";
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleRowClick = (assignmentId: number) => {
        router.push(`/guard-assignment/${assignmentId}`);
    };

    const handleViewAllClick = () => {
        router.push('/guard-assignment?filter=pending-checkout');
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <Card className="shadow-sm rounded-2xl pt-2 border border-gray-100">
                <CardHeader className="flex flex-row items-center justify-between mt-2 px-4">
                    <CardTitle>
                        <div className="flex flex-col items-start gap-1">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardTitle>
                    <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>

                <CardContent className="p-0">
                    <div className="px-4 py-6">
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-2 border-b-2 border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div>
                                            <Skeleton className="h-4 w-32 mb-1" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="h-10 w-full mt-4 rounded-md" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm rounded-2xl pt-2 border border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between mt-2 px-4">
                <CardTitle>
                    <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold text-lg text-gray-900">Pending Checkouts</span>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                {stats.count} {stats.count === 1 ? 'Checkout' : 'Checkouts'} pending
                            </span>
                            {stats.critical > 0 && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-2 py-0 h-5">
                                    <IconAlertCircle className="w-3 h-3 mr-1" />
                                    {stats.critical} Critical
                                </Badge>
                            )}
                            {stats.warning > 0 && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] px-2 py-0 h-5">
                                    {stats.warning} Warning
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                    <PlusIcon className="h-4 w-4 text-gray-500" />
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableBody>
                            {pendingCheckouts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                                                <IconCheck className="h-6 w-6 text-green-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-600">No pending checkouts</p>
                                            <p className="text-xs text-gray-400 mt-1">All shifts have been checked out</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pendingCheckouts.map((shift: OngoingShift, index: number) => {
                                    const statusColor = shift.status_color || 'warning';
                                    const shiftStatus = shift.shift_status || 'active';
                                    const isOverdue = shift.is_overdue || false;

                                    return (
                                        <TableRow
                                            key={shift.assignment_id || index}
                                            className="hover:bg-gray-50/80 cursor-pointer transition-all duration-200 border-b-2 border-gray-200 last:border-0"
                                            onClick={() => handleRowClick(shift.assignment_id)}
                                        >
                                            {/* Guard Info - Smaller width */}
                                            <TableCell className="py-3 px-4 w-3/5">
                                                <div className="flex items-center gap-3">
                                                    {/* Initials Avatar - Small */}
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-yellow-700">
                                                            {getInitials(shift.guard_name)}
                                                        </span>
                                                    </div>

                                                    {/* Guard Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="font-medium text-gray-900 text-sm truncate max-w-[120px]">
                                                                {shift.guard_name || 'Unknown Guard'}
                                                            </span>
                                                            {isOverdue && (
                                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0 h-4 font-medium">
                                                                    <IconAlertCircle className="w-2.5 h-2.5 mr-0.5" />
                                                                    Overdue
                                                                </Badge>
                                                            )}
                                                            {statusColor === 'critical' && (
                                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0 h-4 font-medium">
                                                                    <IconAlertCircle className="w-2.5 h-2.5 mr-0.5" />
                                                                    Critical
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                            <span className="text-xs text-gray-600 truncate max-w-[140px]">
                                                                {shift.mission || 'No mission'}
                                                            </span>
                                                            {shift.checked_in_at && (
                                                                <>
                                                                    <span className="text-gray-300 text-[10px]">•</span>
                                                                    <span className="text-[10px] text-yellow-600 flex items-center gap-1 font-medium">
                                                                        <IconClock className="w-2.5 h-2.5" />
                                                                        In: {formatTime(shift.checked_in_at)}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <IconClock className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-600 font-medium text-[10px]">
                                                                    {formatTime(shift.shift_start)} – {formatTime(shift.shift_end)}
                                                                </span>
                                                            </span>

                                                            {shift.minutes_overdue > 0 && (
                                                                <>
                                                                    <span className="text-gray-300">|</span>
                                                                    <span className="text-red-500 font-medium flex items-center gap-1 text-[10px]">
                                                                        <IconAlertCircle className="w-3 h-3" />
                                                                        {shift.minutes_overdue}m overdue
                                                                    </span>
                                                                </>
                                                            )}

                                                            <span className="text-gray-300">|</span>
                                                            <span className="text-gray-500 capitalize flex items-center gap-1 text-[10px]">
                                                                <span className={`w-1 h-1 rounded-full ${
                                                                    shiftStatus === 'active' ? 'bg-yellow-500' :
                                                                    shiftStatus === 'assigned' ? 'bg-yellow-500' :
                                                                    shiftStatus === 'accepted' ? 'bg-blue-500' :
                                                                    'bg-gray-400'
                                                                }`} />
                                                                {shiftStatus}
                                                            </span>

                                                            <span className="text-gray-300">|</span>
                                                            <span className="text-gray-400 font-mono text-[9px]">
                                                                #{String(shift.assignment_id).padStart(4, '0')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Status Badge - Smaller width */}
                                            <TableCell className="py-3 px-4 w-2/5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${statusColorMap[statusColor] || statusColorMap.warning} px-2.5 py-1 text-[11px] font-medium border whitespace-nowrap`}
                                                    >
                                                        <span className="flex items-center gap-1.5">
                                                            <IconClock className="w-3.5 h-3.5 text-yellow-500" />
                                                            <span className="truncate max-w-[100px]">
                                                                Pending Checkout
                                                            </span>
                                                        </span>
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {pendingCheckouts.length > 0 && (
                    <div className="px-4 py-3 border-t-2 border-gray-200 bg-gray-50/50 rounded-b-2xl">
                        <Button
                            className="w-full text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                            variant="ghost"
                            onClick={handleViewAllClick}
                        >
                            View All ({pendingCheckouts.length}) 
                            <span className="ml-2 text-gray-400">→</span>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}