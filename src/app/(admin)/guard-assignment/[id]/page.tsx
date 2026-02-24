'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
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
    CheckCircle,
    XCircle,
    AlertCircle,
    Edit,
    Trash2,
    PlayCircle,
    Ban,
    CheckCheck,
    Loader2
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

// Redux
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { fetchAssignment, deleteAssignment, updateAssignmentStatus } from '@/store/slices/guardAssignmentSlice'
import SweetAlertService from '@/lib/sweetAlert'
import { format } from 'date-fns'
import { GuardAssignmentEditForm } from '@/components/guard-assignment/guard-assignment-edit-form'

// Status configuration
const statusConfig = {
    assigned: {
        label: 'Assigned',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: AlertCircle,
    },
    active: {
        label: 'Active',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: PlayCircle,
    },
    completed: {
        label: 'Completed',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: CheckCheck,
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Ban,
    },
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
                'The guard assignment has been deleted successfully.',
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

    const handleStatusUpdate = async (status: 'assigned' | 'active' | 'completed' | 'cancelled') => {
        if (!currentAssignment) return

        setIsUpdating(true)
        try {
            await dispatch(updateAssignmentStatus({
                id: currentAssignment.id,
                status
            })).unwrap()

            await SweetAlertService.success(
                'Status Updated',
                `Assignment status has been updated to ${statusConfig[status].label}.`,
                { timer: 2000 }
            )

            // Reload assignment to get fresh data
            await loadAssignment()
        } catch (error) {
            await SweetAlertService.error(
                'Update Failed',
                'There was an error updating the assignment status. Please try again.'
            )
        } finally {
            setIsUpdating(false)
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

    const getStatusIcon = () => {
        if (!currentAssignment?.status) return null
        const config = statusConfig[currentAssignment.status as keyof typeof statusConfig]
        const Icon = config?.icon || AlertCircle
        return <Icon className="h-4 w-4" />
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
                            The guard assignment youre looking for does not exist or you do not have permission to view it.
                        </p>
                        <Button onClick={() => router.push('/guard-assignments')}>
                            Go to Assignments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const StatusIcon = statusConfig[currentAssignment.status as keyof typeof statusConfig]?.icon || AlertCircle

    return (
        <div className="container mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header with back button and actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-fit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                {/* <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(true)}
                        disabled={isUpdating}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={isDeleting || isUpdating}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div> */}
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Title Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-primary" />
                                    Guard Assignment #{currentAssignment.id}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    Created on {formatDateTime(currentAssignment.created_at)}
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className={`
                                    ${statusConfig[currentAssignment.status as keyof typeof statusConfig]?.color || 'bg-gray-100'}
                                    px-3 py-1 text-sm font-medium flex items-center gap-1 w-fit
                                `}
                            >
                                <StatusIcon className="h-3.5 w-3.5" />
                                {statusConfig[currentAssignment.status as keyof typeof statusConfig]?.label || currentAssignment.status}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Status Update Buttons */}
                {currentAssignment.status !== 'completed' && currentAssignment.status !== 'cancelled' && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Update Status:</span>
                                {currentAssignment.status === 'assigned' && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleStatusUpdate('active')}
                                        disabled={isUpdating}
                                    >
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Start Assignment
                                    </Button>
                                )}
                                {currentAssignment.status === 'active' && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="bg-purple-600 hover:bg-purple-700"
                                            onClick={() => handleStatusUpdate('completed')}
                                            disabled={isUpdating}
                                        >
                                            <CheckCheck className="mr-2 h-4 w-4" />
                                            Mark Completed
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => handleStatusUpdate('cancelled')}
                                            disabled={isUpdating}
                                        >
                                            <Ban className="mr-2 h-4 w-4" />
                                            Cancel Assignment
                                        </Button>
                                    </>
                                )}
                                {currentAssignment.status === 'assigned' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                        disabled={isUpdating}
                                    >
                                        <Ban className="mr-2 h-4 w-4" />
                                        Cancel Assignment
                                    </Button>
                                )}
                                {isUpdating && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Updating...
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                <Avatar className="h-16 w-16 border-2 border-gray-200">
                                    <AvatarImage 
                                        src={currentAssignment.guard?.profile_image} 
                                        alt={currentAssignment.guard?.full_name}
                                    />
                                    <AvatarFallback className="bg-primary/10">
                                        {currentAssignment.guard?.full_name?.charAt(0) || 'G'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">
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
                                {currentAssignment.guard?.city && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span>
                                            {[currentAssignment.guard.city, currentAssignment.guard.country]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </span>
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
                                {currentAssignment.duty?.duty_type && (
                                    <Badge 
                                        variant="outline"
                                        className={`
                                            mt-1
                                            ${currentAssignment.duty.duty_type === 'day' 
                                                ? 'bg-sky-100 text-sky-800 border-sky-200' 
                                                : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                            }
                                        `}
                                    >
                                        {currentAssignment.duty.duty_type === 'day' ? 'Day Shift' : 'Night Shift'}
                                    </Badge>
                                )}
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
                                {currentAssignment.duty?.required_hours && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Required Hours:</span>
                                        <span className="font-medium">{currentAssignment.duty.required_hours} hours</span>
                                    </div>
                                )}
                                {currentAssignment.duty?.site_id && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Site ID:</span>
                                        <span className="font-medium">#{currentAssignment.duty.site_id}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assignment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Assignment Period
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Start Date</p>
                                <p className="font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {formatDate(currentAssignment.start_date)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">End Date</p>
                                <p className="font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {formatDate(currentAssignment.end_date)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Duration</p>
                                <p className="font-medium flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    {calculateDuration()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information Tabs */}
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Additional Details</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Assignment ID</p>
                                        <p className="font-mono text-sm">#{currentAssignment.id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Created At</p>
                                        <p>{formatDateTime(currentAssignment.created_at)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Guard ID</p>
                                        <p>#{currentAssignment.guard_id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Duty ID</p>
                                        <p>#{currentAssignment.duty_id}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="timeline">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <div className="w-0.5 h-12 bg-gray-200" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Assignment Created</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateTime(currentAssignment.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                                            <div className="w-0.5 h-12 bg-gray-200" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Status Changed to {statusConfig[currentAssignment.status as keyof typeof statusConfig]?.label}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateTime(currentAssignment.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the guard assignment
                            and remove all associated data.
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
                    onSuccess={async () => {
                        await loadAssignment()
                    }}
                />
            )}
        </div>
    )
}