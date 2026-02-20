"use client";

import Image from "next/image";
import { DownloadIcon, EllipsisVertical, ListFilter, Search, CalendarIcon, Eye, EyeOff } from "lucide-react";
import {
    Card,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { Incident, IncidentParams } from "@/app/types/incident";

import { DeleteDialog } from "../shared/delete-dialog";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchIncidents, deleteIncident, updateIncidentStatus, toggleClientVisibility } from "@/store/slices/incidentSlice";
import SweetAlertService from "@/lib/sweetAlert";
// import { IncidentUpdateForm } from "./incident-edit-form";
import Swal from 'sweetalert2';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calender";
import { format } from "date-fns";
import { FloatingLabelInput } from "../ui/floating-input";

// Status color mapping
export const incidentStatusColors: Record<string, string> = {
    "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "acknowledged": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "investigating": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "resolved": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "closed": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    "rejected": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

// Severity color mapping
export const severityColors: Record<string, string> = {
    "critical": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "high": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "low": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "minor": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
};

export function IncidentDataTable() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get incidents from Redux store
    const { incidents, pagination, isLoading, error } = useAppSelector((state) => state.incident);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);
    
    // Search states - reduced to essential ones
    const [trackingSearch, setTrackingSearch] = useState("");
    const [titleSearch, setTitleSearch] = useState("");
    
    // Filter states - simplified
    const [severityFilter, setSeverityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    
    // Selection state
    const [selectedIncidents, setSelectedIncidents] = useState<number[]>([]);

    // Fetch incidents on component mount and when filters change
    useEffect(() => {
        const params: IncidentParams = {
            page: pagination.current_page || 1,
            per_page: 10,
        };

        // Add search terms
        const searchTerms = [trackingSearch, titleSearch]
            .filter(Boolean)
            .join(" ");
        
        if (searchTerms) {
            params.search = searchTerms;
        }

        // Add filters
        if (severityFilter !== "all") {
            params.severity = severityFilter;
        }

        if (statusFilter !== "all") {
            params.status = statusFilter;
        }

        if (dateFilter) {
            params.incident_date = format(dateFilter, "yyyy-MM-dd");
        }

        dispatch(fetchIncidents(params));
    }, [
        dispatch, 
        pagination.current_page, 
        trackingSearch, 
        titleSearch,
        severityFilter,
        statusFilter,
        dateFilter
    ]);

    const viewDetails = (e: React.MouseEvent, incident: Incident) => {
        e.stopPropagation();
        const encodedIncident = encodeURIComponent(JSON.stringify(incident));
        router.push(`/incident/${incident.id}?incident=${encodedIncident}`);
    };

    const handleDeleteClick = (e: React.MouseEvent, incident: Incident) => {
        e.stopPropagation();
        setIncidentToDelete(incident);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (incidentToDelete) {
            try {
                await dispatch(deleteIncident(incidentToDelete.id));

                await SweetAlertService.success(
                    'Incident Deleted',
                    `Incident ${incidentToDelete.tracking_code} has been deleted successfully.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    }
                );

                setDeleteDialogOpen(false);
                setIncidentToDelete(null);

                // Refresh the incident list
                dispatch(fetchIncidents({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                await SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the incident. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    const handleStatusUpdate = async (e: React.MouseEvent, incident: Incident, newStatus: string) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: `Update Incident Status`,
            text: `Are you sure you want to change status to "${newStatus}"? This confirmation will expire in 5 seconds.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update',
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                const resultAction = await dispatch(updateIncidentStatus({ 
                    id: incident.id, 
                    status: newStatus 
                }));

                if (updateIncidentStatus.fulfilled.match(resultAction)) {
                    await SweetAlertService.success(
                        'Status Updated',
                        `Incident ${incident.tracking_code} status has been updated to "${newStatus}".`,
                        {
                            timer: 2000,
                            showConfirmButton: false,
                            timerProgressBar: true,
                        }
                    );
                }
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating the incident status. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    const handleToggleVisibility = async (e: React.MouseEvent, incident: Incident) => {
        e.stopPropagation();
        
        const newVisibility = !incident.visible_to_client;
        const action = newVisibility ? 'show' : 'hide';

        const result = await Swal.fire({
            title: `${newVisibility ? 'Show' : 'Hide'} Incident to Client`,
            text: `Are you sure you want to ${action} this incident to the client? This confirmation will expire in 5 seconds.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newVisibility ? '#10b981' : '#6b0016',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${action}`,
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                const resultAction = await dispatch(toggleClientVisibility({ 
                    id: incident.id, 
                    visible_to_client: newVisibility 
                }));

                if (toggleClientVisibility.fulfilled.match(resultAction)) {
                    await SweetAlertService.success(
                        'Visibility Updated',
                        `Incident is now ${newVisibility ? 'visible' : 'hidden'} to the client.`,
                        {
                            timer: 2000,
                            showConfirmButton: false,
                            timerProgressBar: true,
                        }
                    );
                }
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating client visibility. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIncidents(incidents.map((incident: Incident) => incident.id));
        } else {
            setSelectedIncidents([]);
        }
    };

    const handleSelectIncident = (incidentId: number, checked: boolean) => {
        if (checked) {
            setSelectedIncidents(prev => [...prev, incidentId]);
        } else {
            setSelectedIncidents(prev => prev.filter(id => id !== incidentId));
        }
    };

    const handleExport = async () => {
        await SweetAlertService.success(
            'Export Started',
            'Your incident data export has been initiated.',
            {
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIncidents.length === 0) {
            await SweetAlertService.warning(
                'No Incidents Selected',
                'Please select at least one incident to delete.',
                {
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                }
            );
            return;
        }

        const result = await Swal.fire({
            title: 'Bulk Delete Confirmation',
            text: `Are you sure you want to delete ${selectedIncidents.length} selected incident(s)? This action cannot be undone. This confirmation will expire in 5 seconds.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6b0016',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                await SweetAlertService.loading('Processing...', 'Please wait while we delete the incidents.');

                for (const incidentId of selectedIncidents) {
                    await dispatch(deleteIncident(incidentId));
                }

                SweetAlertService.close();

                await SweetAlertService.success(
                    'Incidents Deleted',
                    `${selectedIncidents.length} incident(s) have been deleted successfully.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    }
                );

                setSelectedIncidents([]);

                dispatch(fetchIncidents({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                SweetAlertService.close();

                await SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the incidents. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    // Handle pagination
    const handlePreviousPage = () => {
        if (pagination.current_page > 1) {
            dispatch(fetchIncidents({
                page: pagination.current_page - 1,
                per_page: 10,
            }));
        }
    };

    const handleNextPage = () => {
        if (pagination.current_page < pagination.last_page) {
            dispatch(fetchIncidents({
                page: pagination.current_page + 1,
                per_page: 10,
            }));
        }
    };

    // Edit dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [incidentToEdit, setIncidentToEdit] = useState<Incident | null>(null);

    const handleEditClick = (incident: Incident) => {
        setIncidentToEdit(incident);
        setEditDialogOpen(true);
    };

    const handleEditSuccess = () => {
        dispatch(fetchIncidents({
            page: pagination.current_page,
            per_page: 10,
        }));
    };

    // Format date and time
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="shadow-sm rounded-2xl">
            {/* Header */}
            <div className="bg-[#F4F6F8] p-5 -mt-6 rounded-t-md flex flex-row items-center gap-4 w-full justify-between md:justify-start">
                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <ListFilter size="14px" />
                    Filters
                </CardTitle>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExport}
                    className="text-sm flex items-center gap-1 dark:text-black"
                >
                    <DownloadIcon size="14px" />
                    Export
                </Button>

                <div className="text-sm flex items-center gap-1 dark:text-black">
                    <Checkbox
                        id="select-all"
                        checked={selectedIncidents.length === incidents.length && incidents.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="dark:bg-white dark:border-black"
                    />
                    <Label htmlFor="select-all">Select All</Label>
                </div>

                {selectedIncidents.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="ml-auto"
                    >
                        Delete Selected ({selectedIncidents.length})
                    </Button>
                )}
            </div>

            <CardContent className="p-0">
                {/* Filters - Simplified */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Inputs */}
                    <div className="sm:col-span-4">
                        <InputGroup>
                            <InputGroupInput
                                placeholder="Search by tracking code or title..."
                                value={trackingSearch || titleSearch}
                                onChange={(e) => {
                                    setTrackingSearch(e.target.value);
                                    setTitleSearch(e.target.value);
                                }}
                            />
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Severity Filter */}
                    <div className="sm:col-span-2">
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Severity</SelectLabel>
                                    <SelectItem value="all">All Severities</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="minor">Minor</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="sm:col-span-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                    <SelectItem value="investigating">Investigating</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="sm:col-span-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <FloatingLabelInput
                                    className="text-start h-9"
                                    label="Incident Date"
                                    value={dateFilter ? format(dateFilter, "MM/dd/yyyy") : ""}
                                    readOnly
                                    postfixIcon={<CalendarIcon />}
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={dateFilter}
                                    onSelect={setDateFilter}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {dateFilter && (
                        <div className="sm:col-span-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDateFilter(undefined)}
                                className="text-red-600"
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading incidents...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="p-4 text-center text-red-600">
                        Error loading incidents: {error}
                    </div>
                )}

                {/* Table */}
                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <span className="sr-only">Select</span>
                                    </TableHead>
                                    <TableHead>Tracking Code</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Site</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Guard</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Client Visibility</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {incidents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8">
                                            No incidents found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    incidents.map((incident: Incident) => (
                                        <TableRow
                                            key={incident.id}
                                            className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                                            onClick={() => {
                                                const encodedIncident = encodeURIComponent(JSON.stringify(incident));
                                                router.push(`/incident/${incident.id}?incident=${encodedIncident}`);
                                            }}
                                        >
                                            {/* Select Checkbox */}
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIncidents.includes(incident.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectIncident(incident.id, checked as boolean)
                                                    }
                                                />
                                            </TableCell>

                                            {/* Tracking Code */}
                                            <TableCell className="font-medium text-gray-900">
                                                {incident.tracking_code}
                                            </TableCell>

                                            {/* Title */}
                                            <TableCell className="text-gray-700">
                                                {incident.title}
                                            </TableCell>

                                            {/* Site */}
                                            <TableCell className="text-gray-700">
                                                {incident.site?.site_name || "N/A"}
                                            </TableCell>

                                            {/* Client */}
                                            <TableCell className="text-gray-700">
                                                {incident.client?.full_name || "N/A"}
                                            </TableCell>

                                            {/* Guard */}
                                            <TableCell className="text-gray-700">
                                                {incident.guard?.full_name || "N/A"}
                                            </TableCell>

                                            {/* Severity */}
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    severityColors[incident.severity] || "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {incident.severity?.charAt(0).toUpperCase() + incident.severity?.slice(1)}
                                                </span>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell className="text-gray-700">
                                                {formatDate(incident.incident_date)}
                                            </TableCell>

                                            {/* Status with Dropdown */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        incidentStatusColors[incident.status] || "bg-gray-100 text-gray-800"
                                                    }`}>
                                                        {incident.status?.charAt(0).toUpperCase() + incident.status?.slice(1)}
                                                    </span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                <EllipsisVertical className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            <DropdownMenuItem onClick={(e) => handleStatusUpdate(e, incident, "acknowledged")}>
                                                                Acknowledge
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handleStatusUpdate(e, incident, "investigating")}>
                                                                Start Investigation
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handleStatusUpdate(e, incident, "resolved")}>
                                                                Mark as Resolved
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handleStatusUpdate(e, incident, "closed")}>
                                                                Close
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>

                                            {/* Client Visibility Toggle */}
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => handleToggleVisibility(e, incident)}
                                                    title={incident.visible_to_client ? 'Hide from client' : 'Show to client'}
                                                >
                                                    {incident.visible_to_client ? (
                                                        <Eye className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </Button>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <EllipsisVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={(e) => viewDetails(e, incident)}>
                                                            View details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditClick(incident)}>
                                                            Edit incident
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => handleDeleteClick(e, incident)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            Delete incident
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && !error && incidents.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {incidents.length} of {pagination.total} incidents
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === 1}
                                onClick={handlePreviousPage}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={handleNextPage}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                <DeleteDialog
                    isOpen={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Incident"
                    description={`Are you sure you want to delete incident ${incidentToDelete?.tracking_code}? This action cannot be undone.`}
                />

                {/* <IncidentUpdateForm
                    isOpen={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    incidentId={incidentToEdit?.id || 0}
                    onSuccess={handleEditSuccess}
                    trigger={<div />}
                /> */}
            </CardContent>
        </Card>
    );
}