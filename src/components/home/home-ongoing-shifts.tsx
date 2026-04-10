// components/dashboard/ongoing-shifts.tsx
"use client";

import Image from "next/image";
import { ChevronRight, MoreHorizontal, PlusIcon, Search, AlertCircle, CheckCircle, Loader, Coffee, Circle } from "lucide-react";
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
import { JSX, useEffect, useState } from "react";
import { IconCar, IconCircleFilled, IconClock } from "@tabler/icons-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchDashboard } from "@/store/slices/dashboardSlice";
import { OngoingShift } from "@/app/types/dashboard";

// Status badge color map
const statusColors: Record<string, string> = {
    SOS: "bg-red-100 text-red-800",
    "On Duty": "bg-green-100 text-green-800",
    "On Way": "bg-blue-100 text-blue-800",
    "On Break": "bg-gray-100 text-gray-800",
    "assigned": "bg-yellow-100 text-yellow-800",
    "checked_in": "bg-green-100 text-green-800",
    "on_break": "bg-gray-100 text-gray-800",
    "checked_out": "bg-gray-100 text-gray-600",
};

// Status icon map
const statusIcons: Record<string, JSX.Element> = {
    SOS: <IconCircleFilled className="w-4 h-4 text-red-500" />,
    "On Duty": <IconCircleFilled className="w-4 h-4 text-green-500" />,
    "On Way": <IconCar className="w-4 h-4 text-blue-500 animate-spin" />,
    "On Break": <IconClock className="w-4 h-4 text-gray-500" />,
    "assigned": <IconCircleFilled className="w-4 h-4 text-yellow-500" />,
    "checked_in": <IconCircleFilled className="w-4 h-4 text-green-500" />,
    "on_break": <IconClock className="w-4 h-4 text-gray-500" />,
    "checked_out": <IconCircleFilled className="w-4 h-4 text-gray-400" />,
};

// Format status for display
const formatStatus = (status: string | null): string => {
    if (!status) return "Unknown";
    return status.replace(/_/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

export function OnGoingShifts() {
    const dispatch = useAppDispatch();
    const { data: dashboard, isLoading } = useAppSelector((state) => state.dashboard);

    // Fetch dashboard data on component mount
    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    // Get ongoing shifts directly from dashboard state (no local state needed)
    const ongoingShifts: OngoingShift[] = dashboard?.ongoing_shifts || [];

    // Get guard avatar or fallback
    const getGuardAvatar = (guardName: string | null) => {
        return `/images/avatar.png`;
    };

    // Get guard initials
    const getInitials = (name: string | null) => {
        if (!name) return "G";
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <Card className="shadow-sm rounded-2xl pt-2">
                <CardHeader className="flex flex-row items-center justify-between mt-2">
                    <CardTitle>
                        <div className="flex flex-col items-start gap-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </CardTitle>
                    <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>

                <CardContent className="p-2">
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div>
                                        <Skeleton className="h-4 w-24 mb-1" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-10 w-full mt-2 rounded-md" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm rounded-2xl pt-2">
            <CardHeader className="flex flex-row items-center justify-between mt-2">
                <CardTitle>
                    <div className="flex flex-col items-start gap-2">
                        <span className="font-bold text-lg">Ongoing Shifts</span>
                        <span className="text-sm text-gray-500">
                            {ongoingShifts.length} Ongoing {ongoingShifts.length === 1 ? 'Shift' : 'Shifts'}
                        </span>
                    </div>
                </CardTitle>
                <Button variant="link" className="text-sm text-black-600 font-medium">
                    <PlusIcon />
                </Button>
            </CardHeader>

            <CardContent className="p-2">
                <div className="overflow-x-auto">
                    <Table>
                        <TableBody>
                            {ongoingShifts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-8">
                                        <div className="flex flex-col items-center justify-center">
                                            <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">No ongoing shifts</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ongoingShifts.map((shift, index) => {
                                    const status = shift.status || 'assigned';
                                    const displayStatus = formatStatus(status);
                                    
                                    return (
                                        <TableRow key={shift.assignment_id || index} className="hover:bg-gray-50">
                                            {/* Guard Info */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                        {getGuardAvatar(shift.guard_name) ? (
                                                            <Image
                                                                src={getGuardAvatar(shift.guard_name)}
                                                                alt={shift.guard_name || 'Guard'}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {getInitials(shift.guard_name)}
                                                            </span>
                                                        )}
                                                        {/* Online status dot - show when checked in */}
                                                        {status === 'checked_in' && (
                                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {shift.guard_name || 'Unknown Guard'}
                                                        </div>
                                                        <div className="text-gray-500 dark:text-gray-300 text-xs">
                                                            {shift.mission || 'No mission assigned'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Status + Icon */}
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-center justify-end gap-2">
                                                    {statusIcons[status] || <IconCircleFilled className="w-4 h-4 text-gray-400" />}
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            statusColors[status] || statusColors.assigned
                                                        }`}
                                                    >
                                                        {displayStatus}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                {ongoingShifts.length > 0 && (
                    <Button className="w-full mt-2" variant="outline">
                        View All ({ongoingShifts.length})
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}