"use client";

import Image from "next/image";
import { ChevronRight, DownloadIcon, Edit, Ellipsis, EllipsisIcon, EllipsisVertical, FilterIcon, ListFilter, MoreHorizontal, Search, StarIcon } from "lucide-react";
import {
    Card,
    CardHeader,
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
import { Guard, GuardParams } from "@/app/types/guard";

import { DeleteDialog } from "../shared/delete-dialog";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchGuards, deleteGuard } from "@/store/slices/guardSlice";
import SweetAlertService from "@/lib/sweetAlert";
import { GuardUpdateForm } from "./guard-update-form";

const typeColors: Record<string, string> = {
    "Corporate": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "Unarmed": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    "Armed": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "Security Officer": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "guard": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "admin": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"

};

const statusColors: Record<string, string> = {
    "On Duty": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "Day off": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "Photo Pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "Late": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "Missed Check-In": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "Off Duty": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    "Available": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
};

// Default avatar for guards without images
const defaultAvatar = "/default-avatar.png";

export function GuardDataTable() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get guards from Redux store
    const { guards, pagination, isLoading, error } = useAppSelector((state) => state.guard);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [guardToDelete, setGuardToDelete] = useState<Guard | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedGuards, setSelectedGuards] = useState<number[]>([]);

    // Search states for different fields
    const [nameSearch, setNameSearch] = useState("");
    const [idSearch, setIdSearch] = useState("");
    const [phoneSearch, setPhoneSearch] = useState("");
    const [licenseSearch, setLicenseSearch] = useState("");

    // Filter states
    const [issuingSourceFilter, setIssuingSourceFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");

    // Fetch guards on component mount and when filters change
    useEffect(() => {
        const params: GuardParams = {
            page: pagination.current_page || 1,
            per_page: 10,
        };

        // Add search term (combine all search fields)
        if (nameSearch || idSearch || phoneSearch || licenseSearch) {
            params.search = [nameSearch, idSearch, phoneSearch, licenseSearch]
                .filter(Boolean)
                .join(" ");
        }

        // Add status filter
        // if (selectedStatus !== "all") {
        //     params.is_active = selectedStatus === "active";
        // }

        // Add guard type filter
        if (selectedType !== "all") {
            params.guard_type_id = parseInt(selectedType);
        }

        dispatch(fetchGuards(params));
    }, [dispatch, pagination.current_page, nameSearch, idSearch, phoneSearch, licenseSearch, selectedStatus, selectedType]);

    const viewDetails = (e: React.MouseEvent, guard: Guard) => {
        e.stopPropagation();
        const encodedGuard = encodeURIComponent(JSON.stringify(guard));
        router.push(`/guards/${guard.id}?guard=${encodedGuard}`);

    };

    const handleEditClick = (e: React.MouseEvent, guard: Guard) => {
        e.stopPropagation();
        router.push(`/guards/edit/${guard.id}`);
    };

    const handleDeleteClick = (e: React.MouseEvent, guard: Guard) => {
        e.stopPropagation();
        setGuardToDelete(guard);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (guardToDelete) {
            try {
                await dispatch(deleteGuard(guardToDelete.id));

                SweetAlertService.success(
                    'Guard Deleted',
                    `${guardToDelete.full_name} has been deleted successfully.`,
                    {
                        timer: 1500,
                        showConfirmButton: false,
                    }
                );

                setDeleteDialogOpen(false);
                setGuardToDelete(null);

                // Refresh the guard list
                dispatch(fetchGuards({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the guard. Please try again.'
                );
            }
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedGuards(guards.map((guard: Guard) => guard.id));
        } else {
            setSelectedGuards([]);
        }
    };

    const handleSelectGuard = (guardId: number, checked: boolean) => {
        if (checked) {
            setSelectedGuards(prev => [...prev, guardId]);
        } else {
            setSelectedGuards(prev => prev.filter(id => id !== guardId));
        }
    };

    const handleExport = () => {
        SweetAlertService.success(
            'Export Started',
            'Your guard data export has been initiated.',
            {
                timer: 1500,
                showConfirmButton: false,
            }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedGuards.length === 0) {
            SweetAlertService.warning(
                'No Guards Selected',
                'Please select at least one guard to delete.'
            );
            return;
        }

        const result = await SweetAlertService.confirm(
            'Bulk Delete Confirmation',
            `Are you sure you want to delete ${selectedGuards.length} selected guard(s)? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                // Delete all selected guards
                for (const guardId of selectedGuards) {
                    await dispatch(deleteGuard(guardId));
                }

                SweetAlertService.success(
                    'Guards Deleted',
                    `${selectedGuards.length} guard(s) have been deleted successfully.`,
                    {
                        timer: 1500,
                        showConfirmButton: false,
                    }
                );

                setSelectedGuards([]);

                // Refresh the guard list
                dispatch(fetchGuards({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the guards. Please try again.'
                );
            }
        }
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get guard type name
    const getGuardTypeName = (guard: Guard) => {
        return guard.user?.role || "Security Officer";
    };

    // Get status display text
    const getStatusDisplay = (guard: Guard) => {
        // This would need to be determined from assignments/attendance data
        // For now, using is_active as a fallback
        if (!guard.is_active) return "Off Duty";

        // You would typically check assignments/attendance here
        // Returning a placeholder for now
        const statuses = ["On Duty", "Available", "Day off", "In Progress"];
        return statuses[guard.id % statuses.length];
    };

    // Get location rating (placeholder - would come from actual data)
    const getLocationRating = (guard: Guard) => {
        const ratings = [4.5, 4.2, 4.7, 4.0, 4.9];
        return ratings[guard.id % ratings.length];
    };

    // Get location icon (placeholder)
    const getLocationIcon = (guard: Guard) => {
        const icons = ["📍", "🏢", "🏨", "🏪", "🏭"];
        return icons[guard.id % icons.length];
    };

    // Get check-in time (placeholder - would come from attendance data)
    const getCheckInTime = (guard: Guard) => {
        const times = ["09:00 AM", "08:30 AM", "10:15 AM", "07:45 AM", "09:30 AM"];
        return times[guard.id % times.length];
    };

    // Handle pagination
    const handlePreviousPage = () => {
        if (pagination.current_page > 1) {
            dispatch(fetchGuards({
                page: pagination.current_page - 1,
                per_page: 10,
            }));
        }
    };

    const handleNextPage = () => {
        if (pagination.current_page < pagination.last_page) {
            dispatch(fetchGuards({
                page: pagination.current_page + 1,
                per_page: 10,
            }));
        }
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
                        checked={selectedGuards.length === guards.length && guards.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="dark:bg-white dark:border-black"
                    />
                    <Label htmlFor="select-all">Select All</Label>
                </div>

                {selectedGuards.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="ml-auto"
                    >
                        Delete Selected ({selectedGuards.length})
                    </Button>
                )}
            </div>

            <CardContent className="p-0">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Inputs */}
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput
                                placeholder="Guard Name..."
                                value={nameSearch}
                                onChange={(e) => setNameSearch(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput
                                placeholder="ID Number..."
                                value={idSearch}
                                onChange={(e) => setIdSearch(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput
                                placeholder="Phone Number..."
                                value={phoneSearch}
                                onChange={(e) => setPhoneSearch(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput
                                placeholder="Driver License..."
                                value={licenseSearch}
                                onChange={(e) => setLicenseSearch(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Filter Selects */}
                    <div className="sm:col-span-3">
                        <Select value={issuingSourceFilter} onValueChange={setIssuingSourceFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Issuing Source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Issuing Source</SelectLabel>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="state">State</SelectItem>
                                    <SelectItem value="federal">Federal</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="sm:col-span-3">
                        <Select value={cityFilter} onValueChange={setCityFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>City</SelectLabel>
                                    <SelectItem value="all">All Cities</SelectItem>
                                    <SelectItem value="new-york">New York</SelectItem>
                                    <SelectItem value="los-angeles">Los Angeles</SelectItem>
                                    <SelectItem value="chicago">Chicago</SelectItem>
                                    <SelectItem value="houston">Houston</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="sm:col-span-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="on-duty">On Duty</SelectItem>
                                    <SelectItem value="off-duty">Off Duty</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="day-off">Day off</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="sm:col-span-3">
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Location</SelectLabel>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    <SelectItem value="downtown">Downtown</SelectItem>
                                    <SelectItem value="suburbs">Suburbs</SelectItem>
                                    <SelectItem value="industrial">Industrial</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading guards...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="p-4 text-center text-red-600">
                        Error loading guards: {error}
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
                                    <TableHead>Guard Name</TableHead>
                                    <TableHead>ID Number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Card Number</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Driver License Number</TableHead>
                                    <TableHead>Issuing Source</TableHead>
                                    <TableHead>City of Residence</TableHead>
                                    <TableHead>Check-In</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {guards.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center py-8">
                                            No guards found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    guards.map((guard: Guard) => (
                                        <TableRow
                                            key={guard.id}
                                            className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                                            onClick={() => router.push(`/guards/${guard.id}`)}
                                        >
                                            {/* Select Checkbox */}
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedGuards.includes(guard.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectGuard(guard.id, checked as boolean)
                                                    }
                                                />
                                            </TableCell>

                                            {/* Guard Name */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                        {guard.full_name ? (
                                                            <span className="font-bold text-gray-700">
                                                                {guard.full_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        ) : (
                                                            <Image
                                                                src={guard.profile_image || defaultAvatar}
                                                                alt={guard.full_name || 'Guard'}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {guard.full_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {guard.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* ID Number */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {guard.employee_company_card_number || "N/A"}
                                            </TableCell>

                                            {/* Type */}
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[getGuardTypeName(guard)]}`}>
                                                    {getGuardTypeName(guard)}
                                                </span>
                                            </TableCell>

                                            {/* Card Number */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {guard.guard_code}
                                            </TableCell>

                                            {/* Phone Number */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {guard.phone}
                                            </TableCell>

                                            {/* Driver License Number */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {guard.driver_license || "N/A"}
                                            </TableCell>

                                            {/* Issuing Source */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {guard.issuing_source || "N/A"}
                                            </TableCell>

                                            {/* City of Residence */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {guard.city || "N/A"}
                                            </TableCell>

                                            {/* Check-In */}
                                            {/* <TableCell>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {getCheckInTime(guard)}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-300 text-xs">
                                                    {formatDate(guard.created_at)}
                                                </div>
                                            </TableCell> */}

                                            {/* Status */}
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[getStatusDisplay(guard)]}`}>
                                                    {getStatusDisplay(guard)}
                                                </span>
                                            </TableCell>

                                            {/* Location + Actions */}
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                        <StarIcon size="14px" />
                                                        {getLocationRating(guard)}
                                                    </span>
                                                    <span className="text-lg">{getLocationIcon(guard)}</span>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <EllipsisVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={(e) => viewDetails(e, guard)}>
                                                                View details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handleEditClick(e, guard)}>
                                                                Edit guard
                                                            </DropdownMenuItem>
                                                            <GuardUpdateForm
                                                                trigger={
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        Edit guard
                                                                    </Button>
                                                                }
                                                                guardId={guard.id}
                                                                onSuccess={() => {
                                                                    console.log('Guard updated successfully')
                                                                }}
                                                            />
                                                            <DropdownMenuItem
                                                                onClick={(e) => handleDeleteClick(e, guard)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                Delete guard
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && !error && guards.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {guards.length} of {pagination.total} guards
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
                    title="Delete Guard"
                    description={`Are you sure you want to delete ${guardToDelete?.full_name}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}