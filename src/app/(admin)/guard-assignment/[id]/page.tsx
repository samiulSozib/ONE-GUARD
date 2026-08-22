// app/guard-assignment/[id]/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, formatInTimeZone } from 'date-fns-tz';
import Image from "next/image";
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Shield,
    MapPin,
    Building,
    Phone,
    Mail,
    Hash,
    AlertCircle,
    Edit,
    Trash2,
    Loader2,
    ChevronDown,
    FileText,
    CheckCircle,
    XCircle,
    RefreshCw,
    Briefcase,
    CalendarDays,
    Globe,
    Timer,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

// Redux
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
    fetchAssignment,
    deleteAssignment,
    updateAssignmentStatus,
    getStatusDisplay,
    getStatusColor,
} from '@/store/slices/guardAssignmentSlice';
import {
    fetchAssignmentSummary,
    fetchAssignmentLogs,
    clearAssignmentData
} from '@/store/slices/shiftLogsSlice';
import SweetAlertService from '@/lib/sweetAlert';
import { GuardAssignmentEditForm } from '@/components/guard-assignment/guard-assignment-edit-form';
import { ReplaceGuardDialog } from '@/components/guard-assignment/replace-guard-dialog';
import Swal from 'sweetalert2';

// Define the status type
type AssignmentStatus = 'assigned' | 'accepted' | 'checked_in' | 'on_duty' | 'completed' | 'late' | 'no_show' | 'cancelled' | 'replaced';

// Status configuration - using the same config as data table
const statusConfig: Record<AssignmentStatus, { label: string; color: string }> = {
    assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    checked_in: { label: 'Checked In', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    on_duty: { label: 'On Duty', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
    late: { label: 'Late', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    no_show: { label: 'No Show', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    cancelled: { label: 'Cancelled', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    replaced: { label: 'Replaced', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' }
};

// Status badge variants for different UI contexts
const statusBadgeVariant: Record<AssignmentStatus, 'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning'> = {
    assigned: 'default',
    accepted: 'success',
    checked_in: 'secondary',
    on_duty: 'success',
    completed: 'outline',
    late: 'warning',
    no_show: 'destructive',
    cancelled: 'destructive',
    replaced: 'secondary'
};

// Profile Image Component with fallback
const GuardProfileImage = ({ guard }: { guard: any }) => {
    const [imageError, setImageError] = useState(false);

    const getProfileImageUrl = (guard: any) => {
        if (!guard) return null;
        if (guard.profile_image_url) {
            return guard.profile_image_url;
        }
        if (guard.profile_image) {
            const imagePath = guard.profile_image.replace(/\/\//g, '/');
            return `${process.env.NEXT_PUBLIC_API_URL || ''}/${imagePath}`;
        }
        return null;
    };

    const imageUrl = getProfileImageUrl(guard);
    const name = guard?.full_name || 'Guard';
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    // Generate consistent color based on name
    const getColorFromName = (name: string) => {
        const colors = [
            'from-blue-400 to-blue-600',
            'from-purple-400 to-purple-600',
            'from-green-400 to-green-600',
            'from-red-400 to-red-600',
            'from-pink-400 to-pink-600',
            'from-indigo-400 to-indigo-600',
            'from-teal-400 to-teal-600',
            'from-orange-400 to-orange-600',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const colorClass = getColorFromName(name);

    if (imageUrl && !imageError) {
        return (
            <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div className={`h-16 w-16 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center text-white text-xl font-semibold border-2 border-gray-200 dark:border-gray-700`}>
            {initials || 'G'}
        </div>
    );
};

export default function GuardAssignmentViewPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const id = params?.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Get current user timezone
    const currentUserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [currentTime, setCurrentTime] = useState(format(new Date(), 'HH:mm:ss'));

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(format(new Date(), 'HH:mm:ss'));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const { currentAssignment, isLoading: storeLoading, error } = useAppSelector(
        (state) => state.guardAssignment
    );
    const { assignmentSummary, assignmentLogs, isLoading: shiftLogsLoading } = useAppSelector(
        (state) => state.shiftLogs
    );

    useEffect(() => {
        if (id) {
            loadAssignment();
        }
        return () => {
            dispatch(clearAssignmentData());
        };
    }, [id]);

    const loadAssignment = async () => {
        setIsLoading(true);
        try {
            await dispatch(fetchAssignment({
                id: parseInt(id),
                params: { include: ['guard', 'duty'] }
            }));
        } catch (error) {
            console.error('Failed to load assignment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadShiftLogs = async (assignmentId: number) => {
        dispatch(fetchAssignmentSummary(assignmentId));
        dispatch(fetchAssignmentLogs({
            assignmentId,
            params: { page: currentPage, per_page: 20 }
        }));
    };

    useEffect(() => {
        if (currentAssignment?.id) {
            loadShiftLogs(currentAssignment.id);
        }
    }, [currentAssignment?.id, currentPage]);

    const handleDelete = async () => {
        if (!currentAssignment) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteAssignment(currentAssignment.id)).unwrap();

            await SweetAlertService.success(
                'Assignment Deleted',
                'The officer assignment has been deleted successfully.',
                { timer: 2000 }
            );

            router.push('/guard-assignments');
        } catch (error) {
            await SweetAlertService.error(
                'Delete Failed',
                'There was an error deleting the assignment. Please try again.'
            );
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleStatusUpdate = async (newStatus: AssignmentStatus) => {
        if (!currentAssignment) return;

        const statusDisplay = getStatusDisplay(newStatus);
        const currentStatusDisplay = getStatusDisplay(currentAssignment.status as AssignmentStatus);

        const result = await Swal.fire({
            title: `Update Status to ${statusDisplay}?`,
            html: `
                <div class="text-left">
                    <p class="mb-2">You are about to change the assignment status from:</p>
                    <div class="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg mb-2">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentAssignment.status as AssignmentStatus)}">
                            ${currentStatusDisplay}
                        </span>
                        <span class="text-gray-400">→</span>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(newStatus)}">
                            ${statusDisplay}
                        </span>
                    </div>
                    <p class="text-sm text-gray-500">This action will be confirmed in 5 seconds.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update',
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            setIsUpdating(true);
            try {
                await dispatch(updateAssignmentStatus({
                    id: currentAssignment.id,
                    status: newStatus
                })).unwrap();

                await SweetAlertService.success(
                    'Status Updated',
                    `Assignment status updated to ${statusDisplay}.`,
                    { timer: 2000 }
                );

                await loadAssignment();
                if (currentAssignment?.id) {
                    loadShiftLogs(currentAssignment.id);
                }
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating the assignment status.'
                );
            } finally {
                setIsUpdating(false);
            }
        } else if (result.dismiss === Swal.DismissReason.timer) {
            await SweetAlertService.info(
                'Confirmation Expired',
                'The confirmation dialog timed out. Please try again.',
                { timer: 2000 }
            );
        }
    };

    const handleReplaceSuccess = () => {
        loadAssignment();
        if (currentAssignment?.id) {
            loadShiftLogs(currentAssignment.id);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPP');
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPP p');
        } catch {
            return dateString;
        }
    };

    // Convert to site timezone
    const convertToSiteTimezone = (dateString: string, formatStr: string, timezone: string): string => {
        try {
            const date = new Date(dateString);
            return formatInTimeZone(date, timezone, formatStr);
        } catch (error) {
            return dateString;
        }
    };

    // Convert to user timezone
    const convertToUserTimezone = (dateString: string, formatStr: string): string => {
        try {
            const date = new Date(dateString);
            return formatInTimeZone(date, currentUserTimezone, formatStr);
        } catch (error) {
            return dateString;
        }
    };

    // Get time difference
    const getTimeDifference = (siteTimezone: string | null | undefined): string => {
        if (!siteTimezone) return 'N/A';

        try {
            const now = new Date();

            const siteTimeStr = now.toLocaleString('en-US', {
                timeZone: siteTimezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            const [siteHours, siteMinutes] = siteTimeStr.split(':').map(Number);
            const siteTotalMinutes = siteHours * 60 + siteMinutes;

            const userHours = now.getHours();
            const userMinutes = now.getMinutes();
            const userTotalMinutes = userHours * 60 + userMinutes;

            let diffMinutes = siteTotalMinutes - userTotalMinutes;

            if (diffMinutes > 720) diffMinutes -= 1440;
            if (diffMinutes < -720) diffMinutes += 1440;

            if (diffMinutes === 0) return 'Same';

            const sign = diffMinutes > 0 ? '+' : '';
            const absMinutes = Math.abs(diffMinutes);
            const hours = Math.floor(absMinutes / 60);
            const minutes = absMinutes % 60;

            if (minutes === 0) {
                return `${sign}${hours}h`;
            }
            return `${sign}${hours}h ${minutes}m`;
        } catch (error) {
            return 'N/A';
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const calculateDuration = () => {
        if (!currentAssignment?.start_date || !currentAssignment?.end_date) return 'N/A';

        try {
            const start = new Date(currentAssignment.start_date);
            const end = new Date(currentAssignment.end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return `${days} day${days !== 1 ? 's' : ''}`;
        } catch {
            return 'N/A';
        }
    };

    const getActionBadge = (action: string) => {
        const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
            check_in: {
                label: 'Check In',
                color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
                icon: <CheckCircle className="h-3 w-3" />
            },
            check_out: {
                label: 'Check Out',
                color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
                icon: <XCircle className="h-3 w-3" />
            },
            break: {
                label: 'Break',
                color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
                icon: <Clock className="h-3 w-3" />
            },
            patrol: {
                label: 'Patrol',
                color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
                icon: <Shield className="h-3 w-3" />
            },
            incident: {
                label: 'Incident',
                color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
                icon: <AlertCircle className="h-3 w-3" />
            }
        };
        return configs[action] || {
            label: action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' '),
            color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300',
            icon: <FileText className="h-3 w-3" />
        };
    };

    // Get available statuses (all except current)
    const getAvailableStatuses = () => {
        if (!currentAssignment?.status) return [];
        const currentStatus = currentAssignment.status as AssignmentStatus;
        return Object.entries(statusConfig)
            .filter(([status]) => status !== currentStatus)
            .map(([status, config]) => ({
                status: status as AssignmentStatus,
                ...config
            }));
    };

    if (isLoading || storeLoading) {
        return (
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Skeleton className="h-10 w-32" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !currentAssignment) {
        return (
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Assignment Not Found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            The officer assignment you are looking for does not exist.
                        </p>
                        <Button onClick={() => router.push('/guard-assignments')}>
                            Go to Assignments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentStatus = currentAssignment.status as AssignmentStatus;
    const availableStatuses = getAvailableStatuses();
    const siteTimezone = currentAssignment.duty?.site?.timezone || 'UTC';
    const timeDiff = getTimeDifference(siteTimezone);

    // Format times in site and user timezones
    const siteStartTime = currentAssignment.duty?.start_datetime
        ? convertToSiteTimezone(currentAssignment.duty.start_datetime, 'hh:mm a', siteTimezone)
        : 'N/A';
    const siteEndTime = currentAssignment.duty?.end_datetime
        ? convertToSiteTimezone(currentAssignment.duty.end_datetime, 'hh:mm a', siteTimezone)
        : 'N/A';
    const userStartTime = currentAssignment.duty?.start_datetime
        ? convertToUserTimezone(currentAssignment.duty.start_datetime, 'hh:mm a')
        : 'N/A';
    const userEndTime = currentAssignment.duty?.end_datetime
        ? convertToUserTimezone(currentAssignment.duty.end_datetime, 'hh:mm a')
        : 'N/A';

    return (
        <div className="container mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-fit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(true)}
                        disabled={isDeleting || isUpdating}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setReplaceDialogOpen(true)}
                        disabled={isDeleting || isUpdating}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Replace Guard
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={isDeleting || isUpdating}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <Tabs defaultValue="details" className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <TabsList className="flex-wrap">
                        <TabsTrigger value="details">Assignment Details</TabsTrigger>
                        <TabsTrigger value="shift-logs" className="flex items-center gap-2">
                            Shift Logs
                            {assignmentSummary && assignmentSummary.logs_count > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {assignmentSummary.logs_count}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Status Badge with Dropdown */}
                    <div className="flex items-center gap-2">
                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    disabled={isUpdating}
                                >
                                    <span className={`
                                        px-2 py-0.5 rounded-full text-xs font-medium
                                        ${getStatusColor(currentStatus)}
                                    `}>
                                        {getStatusDisplay(currentStatus)}
                                    </span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 max-h-[300px] overflow-y-auto">
                                {availableStatuses.map((status) => (
                                    <DropdownMenuItem
                                        key={status.status}
                                        onClick={() => handleStatusUpdate(status.status)}
                                        className="gap-2"
                                    >
                                        <span className={`
                                            w-2 h-2 rounded-full
                                            ${status.color.split(' ')[0]}
                                        `} />
                                        {status.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 mt-0">
                    {/* Title Card with Status */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        <Shield className="h-6 w-6 text-primary" />
                                        Assignment #{currentAssignment.id}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                                        <Calendar className="h-4 w-4" />
                                        Created {formatDateTime(currentAssignment.created_at)}
                                        {currentAssignment.duty?.duty_schedule?.title && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <Briefcase className="h-4 w-4" />
                                                Schedule: {currentAssignment.duty.duty_schedule.title}
                                            </>
                                        )}
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant={statusBadgeVariant[currentStatus] || 'default'}
                                    className="text-sm px-3 py-1"
                                >
                                    {getStatusDisplay(currentStatus)}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Timezone Info Card */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="pt-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Site Timezone:</span>
                                    <Badge variant="outline" className="font-mono">
                                        {siteTimezone}
                                    </Badge>
                                </div>
                                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Site Time:</span>
                                    <Badge variant="outline" className="font-mono border-emerald-300 text-emerald-600 bg-emerald-50">
                                        {siteStartTime} - {siteEndTime}
                                    </Badge>
                                </div>
                                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Timezone:</span>
                                    <Badge variant="outline" className="font-mono">
                                        {currentUserTimezone.split('/').pop()}
                                    </Badge>
                                </div>
                                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-emerald-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Time:</span>
                                    <Badge variant="outline" className="font-mono border-emerald-300 text-emerald-600 bg-emerald-50">
                                        {userStartTime} - {userEndTime}
                                    </Badge>
                                </div>
                                {timeDiff !== 'Same' && timeDiff !== 'N/A' && (
                                    <>
                                        <Separator orientation="vertical" className="h-6 hidden sm:block" />
                                        <div className="flex items-center gap-2">
                                            <Timer className="h-4 w-4 text-amber-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diff:</span>
                                            <Badge variant="outline" className={`font-mono ${
                                                timeDiff.startsWith('+') ? 'border-blue-300 text-blue-600 bg-blue-50' :
                                                timeDiff.startsWith('-') ? 'border-amber-300 text-amber-600 bg-amber-50' :
                                                'border-gray-300 text-gray-500'
                                            }`}>
                                                {timeDiff}
                                            </Badge>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Current time: {currentTime} {currentUserTimezone}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Guard Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Guard Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <GuardProfileImage guard={currentAssignment.guard} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold truncate">
                                            {currentAssignment.guard?.full_name || `Guard #${currentAssignment.guard_id}`}
                                        </h3>
                                        {currentAssignment.guard?.guard_code && (
                                            <Badge variant="outline" className="mt-1">
                                                <Hash className="h-3 w-3 mr-1" />
                                                {currentAssignment.guard.guard_code}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {currentAssignment.guard?.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                                            <span className="truncate">{currentAssignment.guard.phone}</span>
                                        </div>
                                    )}
                                    {currentAssignment.guard?.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                                            <span className="truncate">{currentAssignment.guard.email}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Duty Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Duty Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {currentAssignment.duty?.title || `Duty #${currentAssignment.duty_id}`}
                                    </h3>
                                    {currentAssignment.duty?.duty_schedule?.title && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            <CalendarDays className="h-3 w-3 inline mr-1" />
                                            Schedule: {currentAssignment.duty.duty_schedule.title}
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    {currentAssignment.duty?.site && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-600">Site:</span>
                                                <span className="font-medium ml-1">
                                                    {currentAssignment.duty.site.site_name}
                                                </span>
                                                {currentAssignment.duty.site.address && (
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {currentAssignment.duty.site.address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {currentAssignment.duty?.site_location && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-medium">
                                                {currentAssignment.duty.site_location.title}
                                            </span>
                                        </div>
                                    )}
                                    {currentAssignment.duty?.site?.timezone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Globe className="h-4 w-4 text-gray-500 shrink-0" />
                                            <span className="text-gray-600">Timezone:</span>
                                            <span className="font-medium">
                                                {currentAssignment.duty.site.timezone}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {currentAssignment.duty?.start_datetime && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-gray-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-600">Starts:</span>
                                                <span className="font-medium ml-1">
                                                    {formatDateTime(currentAssignment.duty.start_datetime)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {currentAssignment.duty?.end_datetime && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-gray-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-600">Ends:</span>
                                                <span className="font-medium ml-1">
                                                    {formatDateTime(currentAssignment.duty.end_datetime)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {currentAssignment.duty?.guards_required && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4 text-gray-500 shrink-0" />
                                        <span className="text-gray-600">Guards Required:</span>
                                        <span className="font-medium">{currentAssignment.duty.guards_required}</span>
                                        {currentAssignment.duty.assigned_guards_count !== undefined && (
                                            <span className="text-gray-500 text-xs ml-1">
                                                ({currentAssignment.duty.assigned_guards_count} assigned)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Assignment Period */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Assignment Period
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="font-medium">{formatDate(currentAssignment.start_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">End Date</p>
                                    <p className="font-medium">{formatDate(currentAssignment.end_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium">{calculateDuration()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Shift Logs Tab */}
                <TabsContent value="shift-logs" className="space-y-6 mt-0">
                    {shiftLogsLoading ? (
                        <Card>
                            <CardContent className="py-12 flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                                <p className="text-gray-500">Loading shift logs...</p>
                            </CardContent>
                        </Card>
                    ) : assignmentSummary ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">Total Hours</p>
                                                <p className="text-2xl font-bold">
                                                    {assignmentSummary.shift_summary?.formatted_total || 'N/A'}
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
                                                    {assignmentSummary.shift_summary?.formatted_net || 'N/A'}
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
                                                <p className="text-2xl font-bold">{assignmentSummary.break_count || 0}</p>
                                                <p className="text-xs text-gray-500">
                                                    Total: {formatDuration(assignmentSummary.shift_summary?.break_time)}
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
                                                <p className="text-2xl font-bold">{assignmentSummary.logs_count || 0}</p>
                                            </div>
                                            <FileText className="h-8 w-8 text-purple-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Break Details */}
                            {assignmentSummary.break_details && assignmentSummary.break_details.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Break Details
                                        </CardTitle>
                                        <CardDescription>
                                            {assignmentSummary.break_details.length} break{assignmentSummary.break_details.length > 1 ? 's' : ''} taken during the shift
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[200px]">
                                            <div className="space-y-3">
                                                {assignmentSummary.break_details.map((breakItem, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-gray-500" />
                                                                <span className="text-sm font-medium">
                                                                    Break #{index + 1}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                            {assignmentLogs && assignmentLogs.logs.length > 0 ? (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Assignment Logs
                                                </CardTitle>
                                                <CardDescription>
                                                    All activity logs for this assignment
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary">
                                                {assignmentLogs.pagination.total} logs
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0 sm:p-6">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Action</TableHead>
                                                        <TableHead>Time</TableHead>
                                                        <TableHead className="hidden sm:table-cell">Location</TableHead>
                                                        <TableHead className="hidden md:table-cell">Remarks</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {assignmentLogs.logs.map((log) => {
                                                        const actionConfig = getActionBadge(log.action);
                                                        return (
                                                            <TableRow key={log.id}>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={actionConfig.color}
                                                                    >
                                                                        <span className="flex items-center gap-1">
                                                                            {actionConfig.icon}
                                                                            <span className="hidden xs:inline">{actionConfig.label}</span>
                                                                        </span>
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium">
                                                                            {formatDateTime(log.action_time)}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="hidden sm:table-cell">
                                                                    <div className="flex flex-col max-w-[200px]">
                                                                        <span className="text-sm truncate" title={log.location_address}>
                                                                            {log.location_address || 'N/A'}
                                                                        </span>
                                                                        {log.latitude && log.longitude && (
                                                                            <span className="text-xs text-gray-500">
                                                                                {parseFloat(log.latitude).toFixed(4)}, {parseFloat(log.longitude).toFixed(4)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="hidden md:table-cell">
                                                                    <span className="text-sm">
                                                                        {log.remarks || '-'}
                                                                    </span>
                                                                    {log.metadata?.battery_level && (
                                                                        <span className="text-xs text-gray-500 block">
                                                                            🔋 {log.metadata.battery_level}%
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Pagination */}
                                        {assignmentLogs.pagination.last_page > 1 && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 sm:px-0">
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
                            ) : (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No Logs Found
                                        </h3>
                                        <p className="text-gray-500 text-center">
                                            No shift logs have been recorded for this assignment yet.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Data Available
                                </h3>
                                <p className="text-gray-500 text-center">
                                    No shift log data found for this assignment.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        if (currentAssignment?.id) {
                                            loadShiftLogs(currentAssignment.id);
                                        }
                                    }}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Retry
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the assignment for{' '}
                            <strong>{currentAssignment.guard?.full_name || `Guard #${currentAssignment.guard_id}`}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Form Dialog */}
            {currentAssignment && (
                <GuardAssignmentEditForm
                    trigger={<div />}
                    assignment={currentAssignment}
                    isOpen={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onSuccess={loadAssignment}
                />
            )}

            {/* Replace Guard Dialog */}
            {currentAssignment && (
                <ReplaceGuardDialog
                    isOpen={replaceDialogOpen}
                    onOpenChange={setReplaceDialogOpen}
                    assignment={currentAssignment}
                    onSuccess={handleReplaceSuccess}
                />
            )}
        </div>
    );
}
