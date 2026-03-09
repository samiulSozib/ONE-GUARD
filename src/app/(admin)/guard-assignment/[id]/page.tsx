'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
    ChevronDown
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Redux
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { fetchAssignment, deleteAssignment, updateAssignmentStatus } from '@/store/slices/guardAssignmentSlice'
import SweetAlertService from '@/lib/sweetAlert'
import { format } from 'date-fns'
import { GuardAssignmentEditForm } from '@/components/guard-assignment/guard-assignment-edit-form'
import Swal from 'sweetalert2'

// Define the status type
type AssignmentStatus = 'assigned' | 'accepted' | 'checked_in' | 'on_duty' | 'completed' | 'late' | 'no_show' | 'cancelled' | 'replaced'

// Status configuration
const statusConfig: Record<AssignmentStatus, { label: string; color: string }> = {
    assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
    checked_in: { label: 'Checked In', color: 'bg-purple-100 text-purple-800' },
    on_duty: { label: 'On Duty', color: 'bg-emerald-100 text-emerald-800' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    late: { label: 'Late', color: 'bg-yellow-100 text-yellow-800' },
    no_show: { label: 'No Show', color: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelled', color: 'bg-orange-100 text-orange-800' },
    replaced: { label: 'Replaced', color: 'bg-indigo-100 text-indigo-800' }
}

export default function GuardAssignmentViewPage() {
    const params = useParams()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const id = params?.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const { currentAssignment, isLoading: storeLoading, error } = useAppSelector(
        (state) => state.guardAssignment
    )

    useEffect(() => {
        if (id) {
            loadAssignment()
        }
    }, [id])

    const loadAssignment = async () => {
        setIsLoading(true)
        try {
            await dispatch(fetchAssignment({
                id: parseInt(id),
                params: { include: ['guard', 'duty'] }
            }))
        } catch (error) {
            console.error('Failed to load assignment:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!currentAssignment) return

        setIsDeleting(true)
        try {
            await dispatch(deleteAssignment(currentAssignment.id)).unwrap()
            
            await SweetAlertService.success(
                'Assignment Deleted',
                'The officer assignment has been deleted successfully.',
                { timer: 2000 }
            )
            
            router.push('/guard-assignments')
        } catch (error) {
            await SweetAlertService.error(
                'Delete Failed',
                'There was an error deleting the assignment. Please try again.'
            )
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleStatusUpdate = async (newStatus: AssignmentStatus) => {
        if (!currentAssignment) return

        const statusDisplay = statusConfig[newStatus].label

        const result = await Swal.fire({
            title: 'Update Status',
            text: `Mark this assignment as ${statusDisplay}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update',
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
        });

        if (result.isConfirmed) {
            setIsUpdating(true)
            try {
                await dispatch(updateAssignmentStatus({
                    id: currentAssignment.id,
                    status: newStatus
                })).unwrap()

                await SweetAlertService.success(
                    'Status Updated',
                    `Assignment status updated to ${statusDisplay}.`,
                    { timer: 2000 }
                )

                await loadAssignment()
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating the assignment status.'
                )
            } finally {
                setIsUpdating(false)
            }
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        try {
            return format(new Date(dateString), 'PPP')
        } catch {
            return dateString
        }
    }

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A'
        try {
            return format(new Date(dateString), 'PPP p')
        } catch {
            return dateString
        }
    }

    const calculateDuration = () => {
        if (!currentAssignment?.start_date || !currentAssignment?.end_date) return 'N/A'
        
        try {
            const start = new Date(currentAssignment.start_date)
            const end = new Date(currentAssignment.end_date)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            return `${days} day${days !== 1 ? 's' : ''}`
        } catch {
            return 'N/A'
        }
    }

    // Get available statuses (all except current)
    const getAvailableStatuses = () => {
        if (!currentAssignment?.status) return []
        const currentStatus = currentAssignment.status as AssignmentStatus
        return Object.entries(statusConfig)
            .filter(([status]) => status !== currentStatus)
            .map(([status, config]) => ({
                status: status as AssignmentStatus,
                ...config
            }))
    }

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
        )
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
        )
    }

    const currentStatus = currentAssignment.status as AssignmentStatus
    const availableStatuses = getAvailableStatuses()

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

                <div className="flex items-center gap-2">
                    
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

            {/* Main Content */}
            <div className="space-y-6">
                {/* Title Card with Status */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-primary" />
                                    Assignment #{currentAssignment.id}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    Created {formatDateTime(currentAssignment.created_at)}
                                </CardDescription>
                            </div>
                            
                            {/* Status Badge with Dropdown */}
                            <div className="flex items-center gap-2">
                                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <span className={`
                                                px-2 py-0.5 rounded-full text-xs font-medium
                                                ${statusConfig[currentStatus]?.color || 'bg-gray-100'}
                                            `}>
                                                {statusConfig[currentStatus]?.label || currentStatus}
                                            </span>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
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
                    </CardHeader>
                </Card>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Officer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Officer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16 border-2 border-gray-200">
                                    <AvatarFallback className="bg-primary/10">
                                        {currentAssignment.guard?.full_name?.charAt(0) || 'G'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">
                                        {currentAssignment.guard?.full_name || `Officer #${currentAssignment.guard_id}`}
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
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span>{currentAssignment.guard.phone}</span>
                                    </div>
                                )}
                                {currentAssignment.guard?.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-gray-500" />
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
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                {currentAssignment.duty?.start_datetime && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Starts:</span>
                                        <span className="font-medium">
                                            {formatDateTime(currentAssignment.duty.start_datetime)}
                                        </span>
                                    </div>
                                )}
                                {currentAssignment.duty?.end_datetime && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Ends:</span>
                                        <span className="font-medium">
                                            {formatDateTime(currentAssignment.duty.end_datetime)}
                                        </span>
                                    </div>
                                )}
                            </div>
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
            </div>

            {/* Dialogs */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                        <AlertDialogDescription>
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
        </div>
    )
}