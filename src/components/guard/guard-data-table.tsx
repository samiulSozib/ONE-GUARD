"use client";

import Image from "next/image";
import { DownloadIcon, EllipsisVertical, ListFilter, Search, Power, MapPin, AlertCircle } from "lucide-react";
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
import { Guard, GuardParams } from "@/app/types/guard";

import { DeleteDialog } from "../shared/delete-dialog";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchGuards, deleteGuard, toggleGuardStatus } from "@/store/slices/guardSlice";
import SweetAlertService from "@/lib/sweetAlert";
import { GuardUpdateForm } from "./guard-update-form";
import Swal from 'sweetalert2';
import { IconCar } from "@tabler/icons-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

declare global {
    interface Window {
        google: typeof google;
        initMap?: () => void;
    }
}

const typeColors: Record<string, string> = {
    "Corporate": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "Unarmed": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    "Armed": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "Security Officer": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "guard": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "admin": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
};

const statusColors: Record<string, string> = {
    "true": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "false": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
};

// Location Map Modal Component
// Location Map Modal Component - With reverse geocoding
// Location Map Modal Component - Using OpenStreetMap Nominatim (Free)
function LocationMapModal({
    isOpen,
    onClose,
    latitude,
    longitude,
    guardName
}: {
    isOpen: boolean;
    onClose: () => void;
    latitude: string | null;
    longitude: string | null;
    guardName: string;
}) {
    const [address, setAddress] = useState<{
        city: string;
        state: string;
        country: string;
        fullAddress: string;
    } | null>(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [addressError, setAddressError] = useState<string | null>(null);

    const hasValidLocation = latitude && longitude && 
        Number(latitude) !== 0 && Number(longitude) !== 0;

    // Reverse geocoding using OpenStreetMap Nominatim (FREE)
    useEffect(() => {
        if (!isOpen || !hasValidLocation) return;

        const fetchAddress = async () => {
            setIsLoadingAddress(true);
            setAddressError(null);
            
            try {
                // Nominatim API - No API key required!
                // Note: Rate limit is 1 request per second
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data && data.address) {
                    const addressComponents = data.address;
                    
                    // Extract city, state, country from response
                    const city = addressComponents.city || 
                                addressComponents.town || 
                                addressComponents.village || 
                                'Not available';
                    
                    const state = addressComponents.state || 'Not available';
                    const country = addressComponents.country || 'Not available';
                    
                    setAddress({
                        city: city,
                        state: state,
                        country: country,
                        fullAddress: data.display_name
                    });
                } else {
                    setAddressError('No address found for these coordinates');
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                setAddressError('Failed to load address information');
            } finally {
                setIsLoadingAddress(false);
            }
        };
        
        fetchAddress();
    }, [isOpen, latitude, longitude, hasValidLocation]);

    const openGoogleMaps = () => {
        if (hasValidLocation) {
            window.open(
                `https://www.google.com/maps?q=${latitude},${longitude}`,
                '_blank'
            );
        }
    };

    const openGoogleMapsDirections = () => {
        if (hasValidLocation) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
                '_blank'
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Guard Location - {guardName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Current Location
                                </p>
                                
                                {!hasValidLocation ? (
                                    <p className="text-sm text-gray-500 mt-1">
                                        No location data available for this guard
                                    </p>
                                ) : isLoadingAddress ? (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <p className="text-sm text-gray-500">Loading address information...</p>
                                        </div>
                                    </div>
                                ) : addressError ? (
                                    <div className="mt-2">
                                        <p className="text-sm text-red-600 mb-2">{addressError}</p>
                                        <div className="mt-2 space-y-1 p-2 bg-white dark:bg-gray-900 rounded">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Coordinates:</span>
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                Latitude: {latitude}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                Longitude: {longitude}
                                            </p>
                                        </div>
                                    </div>
                                ) : address && (
                                    <div className="mt-2 space-y-2">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                📍 Location Details
                                            </p>
                                            <div className="pl-2 space-y-1">
                                                {address.city && address.city !== 'Not available' && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        City: <span className="font-medium">{address.city}</span>
                                                    </p>
                                                )}
                                                {address.state && address.state !== 'Not available' && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        State: <span className="font-medium">{address.state}</span>
                                                    </p>
                                                )}
                                                {address.country && address.country !== 'Not available' && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Country: <span className="font-medium">{address.country}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {address.fullAddress && (
                                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium">Full Address:</span><br />
                                                    {address.fullAddress}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-medium">Coordinates:</span><br />
                                                {latitude}, {longitude}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {hasValidLocation && !isLoadingAddress && !addressError && address && (
                            <div className="flex items-start gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="h-5 w-5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Click the buttons below to view this location on Google Maps or get directions.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {hasValidLocation && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={openGoogleMaps}
                                    className="gap-2"
                                >
                                    <MapPin className="h-4 w-4" />
                                    View on Map
                                </Button>
                                <Button
                                    onClick={openGoogleMapsDirections}
                                    className="gap-2"
                                >
                                    Get Directions
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function GuardDataTable() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get guards from Redux store
    const { guards, pagination, isLoading, error } = useAppSelector((state) => state.guard);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [guardToDelete, setGuardToDelete] = useState<Guard | null>(null);
    const [nameSearch, setNameSearch] = useState("");
    const [idSearch, setIdSearch] = useState("");
    const [phoneSearch, setPhoneSearch] = useState("");
    const [licenseSearch, setLicenseSearch] = useState("");

    // Filter states
    const [issuingSourceFilter, setIssuingSourceFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedGuards, setSelectedGuards] = useState<number[]>([]);

    // Location map modal state
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: string | null;
        lng: string | null;
        name: string;
        id?: number;
    }>({
        lat: null,
        lng: null,
        name: '',
        id: undefined
    });

    // Fetch guards on component mount and when filters change
    useEffect(() => {
        const params: GuardParams = {
            page: pagination.current_page || 1,
            per_page: 10,
            with_live: 1
        };

        // Add search term (combine all search fields)
        if (nameSearch || idSearch || phoneSearch || licenseSearch) {
            params.search = [nameSearch, idSearch, phoneSearch, licenseSearch]
                .filter(Boolean)
                .join(" ");
        }

        // Add city filter
        if (cityFilter !== "all") {
            params.city = cityFilter;
        }

        // Add status filter based on is_active
        if (statusFilter !== "all") {
            params.is_active = statusFilter === "active";
        }

        dispatch(fetchGuards(params));
    }, [dispatch, pagination.current_page, nameSearch, idSearch, phoneSearch, licenseSearch, issuingSourceFilter, cityFilter, statusFilter]);

    const viewDetails = (e: React.MouseEvent, guard: Guard) => {
        e.stopPropagation();
        const encodedGuard = encodeURIComponent(JSON.stringify(guard));
        router.push(`/guards/${guard.id}?guard=${encodedGuard}`);
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

                await SweetAlertService.success(
                    'Guard Deleted',
                    `${guardToDelete.full_name} has been deleted successfully.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true,
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
                await SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the guard. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    const handleStatusToggle = async (e: React.MouseEvent, guard: Guard) => {
        e.stopPropagation();

        const newStatus = !guard.is_active;
        const statusText = newStatus ? 'activate' : 'deactivate';

        // Confirmation dialog with 5 second timer
        const result = await Swal.fire({
            title: `${newStatus ? 'Activate' : 'Deactivate'} Guard`,
            text: `Are you sure you want to ${statusText} ${guard.full_name}? This confirmation will expire in 5 seconds.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus ? '#10b981' : '#6b0016',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${statusText}`,
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                const result = await dispatch(toggleGuardStatus({ id: guard.id, is_active: newStatus }));

                if (toggleGuardStatus.fulfilled.match(result)) {
                    await SweetAlertService.success(
                        'Status Updated',
                        `${guard.full_name} has been ${statusText}d successfully.`,
                        {
                            timer: 2000,
                            showConfirmButton: false,
                            timerProgressBar: true,
                        }
                    );
                } else {
                    await SweetAlertService.error(
                        'Update Failed',
                        'There was an error updating the guard status. Please try again.',
                        {
                            timer: 2000,
                            showConfirmButton: true,
                        }
                    );
                }
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating the guard status. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        } else if (result.dismiss === Swal.DismissReason.timer) {
            await SweetAlertService.info(
                'Confirmation Expired',
                'The confirmation dialog timed out. Please try again.',
                {
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                }
            );
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

    const handleExport = async () => {
        await SweetAlertService.success(
            'Export Started',
            'Your guard data export has been initiated.',
            {
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedGuards.length === 0) {
            await SweetAlertService.warning(
                'No Guards Selected',
                'Please select at least one guard to delete.',
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
            text: `Are you sure you want to delete ${selectedGuards.length} selected guard(s)? This action cannot be undone. This confirmation will expire in 5 seconds.`,
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
                await SweetAlertService.loading('Processing...', 'Please wait while we delete the guards.');

                for (const guardId of selectedGuards) {
                    await dispatch(deleteGuard(guardId));
                }

                SweetAlertService.close();

                await SweetAlertService.success(
                    'Guards Deleted',
                    `${selectedGuards.length} guard(s) have been deleted successfully.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    }
                );

                setSelectedGuards([]);

                dispatch(fetchGuards({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                SweetAlertService.close();
                await SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the guards. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        } else if (result.dismiss === Swal.DismissReason.timer) {
            await SweetAlertService.info(
                'Confirmation Expired',
                'The confirmation dialog timed out. Please try again.',
                {
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                }
            );
        }
    };

    // Get guard type name
    const getGuardTypeName = (guard: Guard) => {
        return guard.user?.role || "Security Officer";
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

    // Edit dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [guardToEdit, setGuardToEdit] = useState<Guard | null>(null);

    const handleEditClick = (guard: Guard) => {
        setGuardToEdit(guard);
        setEditDialogOpen(true);
    };

    const handleOpenLocationModal = (e: React.MouseEvent, guard: Guard) => {
        e.stopPropagation();
        setSelectedLocation({
            lat: guard.last_location?.latitude || null,
            lng: guard.last_location?.longitude || null,
            name: guard.full_name,
        });
        setLocationModalOpen(true);
    };

    return (
        <>
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
                                    placeholder="Employee ID"
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
                                    placeholder="Driver's License..."
                                    value={licenseSearch}
                                    onChange={(e) => setLicenseSearch(e.target.value)}
                                />
                                <InputGroupAddon>
                                    <Search size={16} />
                                </InputGroupAddon>
                            </InputGroup>
                        </div>

                        <div className="sm:col-span-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <span className="ml-2">Loading security officers...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="p-4 text-center text-red-600">
                            Error loading security officers: {error}
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
                                        <TableHead>Officer Name</TableHead>
                                        <TableHead>Employee ID</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Guard Card No</TableHead>
                                        <TableHead>Phone Number</TableHead>
                                        <TableHead>Driver&apos;s License</TableHead>
                                        <TableHead>Issuing Source</TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Online Status</TableHead>
                                        <TableHead>Last Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {guards.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={14} className="text-center py-8">
                                                No security officer found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        guards.map((guard: Guard) => (
                                            <TableRow
                                                key={guard.id}
                                                className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                                                onClick={() => {
                                                    const encodedGuard = encodeURIComponent(JSON.stringify(guard));
                                                    router.push(`/guards/${guard.id}?guard=${encodedGuard}`);
                                                }}
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
                                                            {guard.profile_image ? (
                                                                <Image
                                                                    src={guard.profile_image}
                                                                    alt={guard.full_name || 'Guard'}
                                                                    width={40}
                                                                    height={40}
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <span className="font-bold text-gray-700">
                                                                    {guard.full_name?.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {guard.full_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ID: {guard.guard_code}
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
                                                    {guard.issuing_source ?
                                                        guard.issuing_source.charAt(0).toUpperCase() + guard.issuing_source.slice(1)
                                                        : "N/A"
                                                    }
                                                </TableCell>

                                                {/* City */}
                                                <TableCell className="text-gray-700 dark:text-gray-300">
                                                    {guard.city || "N/A"}
                                                </TableCell>

                                                {/* Country */}
                                                <TableCell className="text-gray-700 dark:text-gray-300">
                                                    {guard.country || "N/A"}
                                                </TableCell>

                                                {/* Online Status */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${guard.online_status === "online"
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                                : guard.online_status === "offline"
                                                                    ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                                    : "bg-gray-100 text-gray-500"
                                                                }`}
                                                        >
                                                            {guard.online_status
                                                                ? guard.online_status.charAt(0).toUpperCase() + guard.online_status.slice(1)
                                                                : "N/A"}
                                                        </span>

                                                        {guard.online_status === "online" && (
                                                            <div className="animate-pulse">
                                                                <IconCar className="w-4 h-4 text-green-500 animate-spin" />
                                                            </div>
                                                        )}

                                                        {guard.online_status === "offline" && (
                                                            <div>
                                                                <IconCar className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Last Location - Map Icon */}
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => handleOpenLocationModal(e, guard)}
                                                        disabled={!guard.last_location?.latitude || !guard.last_location?.longitude}
                                                        title={guard.last_location?.latitude && guard.last_location?.longitude ? "View on map" : "No location available"}
                                                    >
                                                        <MapPin className={`h-5 w-5 ${guard.last_location?.latitude && guard.last_location?.longitude ? 'text-blue-600 hover:text-blue-700' : 'text-gray-300'}`} />
                                                    </Button>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[guard.is_active?.toString() || 'false']
                                                            }`}>
                                                            {guard.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => handleStatusToggle(e, guard)}
                                                            title={guard.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            <Power className={`h-4 w-4 ${guard.is_active ? 'text-green-600' : 'text-gray-400'
                                                                }`} />
                                                        </Button>
                                                    </div>
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
                                                            <DropdownMenuItem onClick={(e) => viewDetails(e, guard)}>
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditClick(guard)}>
                                                                Edit Officer Record
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => handleDeleteClick(e, guard)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                Terminate Officer Record
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

                    <GuardUpdateForm
                        isOpen={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        guardId={guardToEdit?.id || 0}
                        onSuccess={() => {
                            dispatch(fetchGuards({
                                page: pagination.current_page,
                                per_page: 10,
                            }));
                        }}
                        trigger={<div />}
                    />
                </CardContent>
            </Card>

            {/* Location Map Modal */}
            <LocationMapModal
                isOpen={locationModalOpen}
                onClose={() => setLocationModalOpen(false)}
                latitude={selectedLocation.lat}
                longitude={selectedLocation.lng}
                guardName={selectedLocation.name}

            />
        </>
    );
}