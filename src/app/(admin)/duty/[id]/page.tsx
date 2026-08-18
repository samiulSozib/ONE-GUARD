// app/duty/[id]/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Shield,
    MapPin,
    Building,
    AlertCircle,
    Edit,
    Trash2,
    Loader2,
    ChevronDown,
    FileText,
    CheckCircle,
    XCircle,
    RefreshCw,
    Users,
    Globe,
    User,
    Briefcase,
    CalendarDays,
    CheckCheck
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Redux
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
    fetchDuty,
    deleteDuty,
    toggleDutyStatus,
    clearCurrentDuty,
} from '@/store/slices/dutySlice';
import SweetAlertService from '@/lib/sweetAlert';
import { format } from 'date-fns';
import { DutyEditForm } from '@/components/duty/duty-edit-form';
import Swal from 'sweetalert2';
import { Duty, DutyParams } from '@/app/types/duty';

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
};

const coverageConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    unassigned: {
        label: 'Unassigned',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        icon: <XCircle className="h-3 w-3" />
    },
    partial: {
        label: 'Partial',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        icon: <AlertCircle className="h-3 w-3" />
    },
    covered: {
        label: 'Covered',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        icon: <CheckCircle className="h-3 w-3" />
    },
    not_required: {
        label: 'Not Required',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
        icon: <FileText className="h-3 w-3" />
    },
};

const sourceTypeConfig: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    one_time: { label: 'One Time', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    manual: { label: 'Manual', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300' },
    exception: { label: 'Exception', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
};

export default function DutyViewPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const id = params?.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState("details");

    const { currentDuty, isLoading: storeLoading, error } = useAppSelector(
        (state) => state.duty
    );

    useEffect(() => {
        if (id) {
            loadDuty();
        }
        return () => {
            dispatch(clearCurrentDuty());
        };
    }, [id]);

    const loadDuty = async () => {
        setIsLoading(true);
        try {
            await dispatch(fetchDuty({
                id: parseInt(id),
                params: { include: ['site', 'site_location', 'duty_schedule'] }
            }));
        } catch (error) {
            console.error('Failed to load duty:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentDuty) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteDuty(currentDuty.id)).unwrap();

            await SweetAlertService.success(
                'Duty Deleted',
                `${currentDuty.title} has been deleted successfully.`,
                { timer: 2000 }
            );

            router.push('/duties');
        } catch (error) {
            await SweetAlertService.error(
                'Delete Failed',
                'There was an error deleting the duty. Please try again.'
            );
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleStatusUpdate = async (newStatus: 'pending' | 'approved' | 'completed') => {
        if (!currentDuty) return;

        const statusDisplay = statusConfig[newStatus]?.label || newStatus;
        const currentStatusDisplay = statusConfig[currentDuty.status]?.label || currentDuty.status;

        const result = await Swal.fire({
            title: `Update Status to ${statusDisplay}?`,
            html: `
                <div class="text-left">
                    <p class="mb-2">You are about to change the duty status from:</p>
                    <div class="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg mb-2">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${statusConfig[currentDuty.status]?.color || 'bg-gray-100'}">
                            ${currentStatusDisplay}
                        </span>
                        <span class="text-gray-400">→</span>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${statusConfig[newStatus]?.color || 'bg-gray-100'}">
                            ${statusDisplay}
                        </span>
                    </div>
                    <p class="text-sm text-gray-500">This action will be confirmed in 5 seconds.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'approved' ? '#10b981' : newStatus === 'completed' ? '#3b82f6' : '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, mark as ${statusDisplay}`,
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            setIsUpdating(true);
            try {
                await dispatch(toggleDutyStatus({
                    id: currentDuty.id,
                    status: newStatus
                })).unwrap();

                await SweetAlertService.success(
                    'Status Updated',
                    `Duty status updated to ${statusDisplay}.`,
                    { timer: 2000 }
                );

                await loadDuty();
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating the duty status.'
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

    const formatTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'hh:mm a');
        } catch {
            return dateString;
        }
    };

    const calculateDuration = () => {
        if (!currentDuty?.start_datetime || !currentDuty?.end_datetime) return 'N/A';
        try {
            const start = new Date(currentDuty.start_datetime);
            const end = new Date(currentDuty.end_datetime);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return `${hours.toFixed(1)} hours`;
        } catch {
            return 'N/A';
        }
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status];
        if (!config) {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-0">
                    {status}
                </Badge>
            );
        }
        return (
            <Badge className={`${config.color} border-0 px-3 py-1`}>
                {config.label}
            </Badge>
        );
    };

    const getCoverageBadge = (coverage: string) => {
        const config = coverageConfig[coverage];
        if (!config) {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-0">
                    {coverage}
                </Badge>
            );
        }
        return (
            <Badge className={`${config.color} border-0 px-3 py-1 flex items-center gap-1`}>
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const getSourceTypeBadge = (sourceType: string) => {
        const config = sourceTypeConfig[sourceType];
        if (!config) {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-0">
                    {sourceType}
                </Badge>
            );
        }
        return (
            <Badge className={`${config.color} border-0 px-3 py-1`}>
                {config.label}
            </Badge>
        );
    };

    const getAvailableStatuses = () => {
        if (!currentDuty?.status) return [];
        const currentStatus = currentDuty.status;
        const allStatuses = ['pending', 'approved', 'completed'];
        return allStatuses
            .filter(status => status !== currentStatus)
            .map(status => ({
                status,
                ...statusConfig[status]
            }));
    };

    const canChangeTo = (targetStatus: string) => {
        if (!currentDuty?.status) return false;
        const current = currentDuty.status;
        if (current === targetStatus) return false;
        const validTransitions: Record<string, string[]> = {
            'pending': ['approved', 'completed'],
            'approved': ['completed'],
            'completed': [],
        };
        return validTransitions[current]?.includes(targetStatus) || false;
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

    if (error || !currentDuty) {
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
                            Duty Not Found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            The duty you are looking for does not exist.
                        </p>
                        <Button onClick={() => router.push('/duties')}>
                            Go to Duties
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const availableStatuses = getAvailableStatuses();

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
                    {/* <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(true)}
                        disabled={isDeleting || isUpdating}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button> */}
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <TabsList className="flex-wrap">
                        <TabsTrigger value="details">Duty Details</TabsTrigger>
                        <TabsTrigger value="assignments" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Assignments
                            {currentDuty.assigned_guards_count !== null && currentDuty.assigned_guards_count !== undefined && (
                                <Badge variant="secondary" className="ml-1">
                                    {currentDuty.assigned_guards_count}
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
                                        ${statusConfig[currentDuty.status]?.color || 'bg-gray-100'}
                                    `}>
                                        {statusConfig[currentDuty.status]?.label || currentDuty.status}
                                    </span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 max-h-[300px] overflow-y-auto">
                                {availableStatuses.map((status) => (
                                    canChangeTo(status.status) && (
                                        <DropdownMenuItem
                                            key={status.status}
                                            onClick={() => handleStatusUpdate(status.status as 'pending' | 'approved' | 'completed')}
                                            className="gap-2"
                                        >
                                            <span className={`
                                                w-2 h-2 rounded-full
                                                ${status.color?.split(' ')[0] || 'bg-gray-500'}
                                            `} />
                                            {status.label}
                                        </DropdownMenuItem>
                                    )
                                ))}
                                {availableStatuses.filter(s => canChangeTo(s.status)).length === 0 && (
                                    <DropdownMenuItem disabled className="text-gray-400">
                                        No status changes available
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 mt-0">
                    {/* Title Card */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        <Shield className="h-6 w-6 text-primary" />
                                        {currentDuty.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                                        <Calendar className="h-4 w-4" />
                                        Created {formatDateTime(currentDuty.created_at)}
                                        {currentDuty.source_type && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                {getSourceTypeBadge(currentDuty.source_type)}
                                            </>
                                        )}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(currentDuty.status)}
                                    {currentDuty.is_active ? (
                                        <Badge className="bg-green-100 text-green-800 border-0">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-800 border-0">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Duty Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Duty Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium">{formatDate(currentDuty.duty_date || currentDuty.start_datetime)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Duration</p>
                                        <p className="font-medium">{calculateDuration()}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Start Time
                                        </p>
                                        <p className="font-medium">{formatTime(currentDuty.start_datetime)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            End Time
                                        </p>
                                        <p className="font-medium">{formatTime(currentDuty.end_datetime)}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Guards Required</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            {currentDuty.guards_required}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Required Hours</p>
                                        <p className="font-medium">{currentDuty.required_hours || 'N/A'}</p>
                                    </div>
                                </div>

                                {currentDuty.mandatory_check_in_time && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-gray-500">Mandatory Check-in Time</p>
                                            <p className="font-medium">{formatTime(currentDuty.mandatory_check_in_time)}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Site & Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Site & Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentDuty.site && (
                                    <div>
                                        <p className="text-sm text-gray-500">Site</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Building className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">{currentDuty.site.site_name}</span>
                                        </div>
                                        {currentDuty.site.address && (
                                            <p className="text-sm text-gray-500 mt-1">{currentDuty.site.address}</p>
                                        )}
                                        {currentDuty.site.timezone && (
                                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                                <Globe className="h-3 w-3" />
                                                <span>{currentDuty.site.timezone}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentDuty.site_location && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-gray-500">Location</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{currentDuty.site_location.title}</span>
                                            </div>
                                            {currentDuty.site_location.description && (
                                                <p className="text-sm text-gray-500 mt-1">{currentDuty.site_location.description}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {currentDuty.duty_schedule && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-gray-500">Schedule</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{currentDuty.duty_schedule.title}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {currentDuty.duty_schedule.schedule_type} • {currentDuty.duty_schedule.recurrence_frequency || 'N/A'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coverage Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Coverage Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                    <p className="text-sm text-gray-500">Guards Required</p>
                                    <p className="text-2xl font-bold">{currentDuty.guards_required}</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                    <p className="text-sm text-gray-500">Assigned</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {currentDuty.assigned_guards_count ?? 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                                    <p className="text-sm text-gray-500">Remaining</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {currentDuty.remaining_guards_count ?? currentDuty.guards_required}
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                    <p className="text-sm text-gray-500">Coverage Status</p>
                                    <div className="flex justify-center mt-1">
                                        {getCoverageBadge(currentDuty.coverage_status || 'unassigned')}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {currentDuty.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {currentDuty.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Assignments Tab */}
                {/* <TabsContent value="assignments" className="space-y-6 mt-0">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Guard Assignments
                                    </CardTitle>
                                    <CardDescription>
                                        Guards assigned to this duty
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary">
                                    {currentDuty.assigned_guards_count ?? 0} / {currentDuty.guards_required} assigned
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {currentDuty.assigned_guards_count && currentDuty.assigned_guards_count > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    <User className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">Guard Name</p>
                                                <p className="text-sm text-gray-500">Guard Code</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-0">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    <User className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">Guard Name</p>
                                                <p className="text-sm text-gray-500">Guard Code</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-0">
                                            Active
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Click on a guard assignment to view details
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No Assignments
                                    </h3>
                                    <p className="text-gray-500 text-center">
                                        No guards have been assigned to this duty yet.
                                    </p>
                                    <Button className="mt-4">
                                        <Users className="mr-2 h-4 w-4" />
                                        Assign Guard
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent> */}
            </Tabs>

            {/* Dialogs */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Duty?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the duty{' '}
                            <strong>{currentDuty.title}</strong>.
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
            {currentDuty && (
                <DutyEditForm
                    trigger={<div />}
                    duty={currentDuty}
                    isOpen={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onSuccess={loadDuty}
                />
            )}
        </div>
    );
}
