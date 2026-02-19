"use client";

import Image from "next/image";
import { DownloadIcon, EllipsisVertical, ListFilter, Search, Power } from "lucide-react";
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
import { Client, ClientParams } from "@/app/types/client";

import { DeleteDialog } from "../shared/delete-dialog";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchClients, deleteClient, toggleClientStatus } from "@/store/slices/clientSlice";
import SweetAlertService from "@/lib/sweetAlert";
import { ClientUpdateForm } from "./client-edit-form";
import Swal from 'sweetalert2';

const statusColors: Record<string, string> = {
    "true": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "false": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
};

// Default avatar for clients without images
const defaultAvatar = "/default-avatar.png";

export function ClientDataTable() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get clients from Redux store
    const { clients, pagination, isLoading, error } = useAppSelector((state) => state.client);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [nameSearch, setNameSearch] = useState("");
    const [codeSearch, setCodeSearch] = useState("");
    const [phoneSearch, setPhoneSearch] = useState("");
    const [emailSearch, setEmailSearch] = useState("");

    // Filter states
    const [cityFilter, setCityFilter] = useState("all");
    const [countryFilter, setCountryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedClients, setSelectedClients] = useState<number[]>([]);

    // Fetch clients on component mount and when filters change
    useEffect(() => {
        const params: ClientParams = {
            page: pagination.current_page || 1,
            per_page: 10,
        };

        // Add search term (combine all search fields)
        if (nameSearch || codeSearch || phoneSearch || emailSearch) {
            params.search = [nameSearch, codeSearch, phoneSearch, emailSearch]
                .filter(Boolean)
                .join(" ");
        }

        // Add city filter
        if (cityFilter !== "all") {
            params.city = cityFilter;
        }

        // Add country filter
        if (countryFilter !== "all") {
            params.country = countryFilter;
        }

        // Add status filter based on is_active
        if (statusFilter !== "all") {
            params.is_active = statusFilter === "active";
        }

        dispatch(fetchClients(params));
    }, [dispatch, pagination.current_page, nameSearch, codeSearch, phoneSearch, emailSearch, cityFilter, countryFilter, statusFilter]);

    const viewDetails = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        const encodedClient = encodeURIComponent(JSON.stringify(client));
        router.push(`/clients/${client.id}?client=${encodedClient}`);
    };

    const handleDeleteClick = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        setClientToDelete(client);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (clientToDelete) {
            try {
                await dispatch(deleteClient(clientToDelete.id));

                await SweetAlertService.success(
                    'Client Deleted',
                    `${clientToDelete.full_name} has been deleted successfully.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    }
                );

                setDeleteDialogOpen(false);
                setClientToDelete(null);

                // Refresh the client list
                dispatch(fetchClients({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                await SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the client. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    const handleStatusToggle = async (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();

        const newStatus = !client.is_active;
        const statusText = newStatus ? 'activate' : 'deactivate';

        // Confirmation dialog with 5 second timer
        const result = await Swal.fire({
            title: `${newStatus ? 'Activate' : 'Deactivate'} Client`,
            text: `Are you sure you want to ${statusText} ${client.full_name}? This confirmation will expire in 5 seconds.`,
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
                const resultAction = await dispatch(toggleClientStatus({ id: client.id, is_active: newStatus }));

                if (toggleClientStatus.fulfilled.match(resultAction)) {
                    await SweetAlertService.success(
                        'Status Updated',
                        `${client.full_name} has been ${statusText}d successfully.`,
                        {
                            timer: 2000,
                            showConfirmButton: false,
                            timerProgressBar: true,
                        }
                    );
                    // Refresh the client list
                    dispatch(fetchClients({
                        page: pagination.current_page,
                        per_page: 10,
                    }));
                } else {
                    await SweetAlertService.error(
                        'Update Failed',
                        'There was an error updating the client status. Please try again.',
                        {
                            timer: 2000,
                            showConfirmButton: true,
                        }
                    );
                }
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating the client status. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        } else if (result.dismiss === Swal.DismissReason.timer) {
            // Handle timer expiration
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
            setSelectedClients(clients.map((client: Client) => client.id));
        } else {
            setSelectedClients([]);
        }
    };

    const handleSelectClient = (clientId: number, checked: boolean) => {
        if (checked) {
            setSelectedClients(prev => [...prev, clientId]);
        } else {
            setSelectedClients(prev => prev.filter(id => id !== clientId));
        }
    };

    const handleExport = async () => {
        await SweetAlertService.success(
            'Export Started',
            'Your client data export has been initiated.',
            {
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedClients.length === 0) {
            await SweetAlertService.warning(
                'No Clients Selected',
                'Please select at least one client to delete.',
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
            text: `Are you sure you want to delete ${selectedClients.length} selected client(s)? This action cannot be undone. This confirmation will expire in 5 seconds.`,
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
                // Show loading state
                await SweetAlertService.loading('Processing...', 'Please wait while we delete the clients.');

                // Delete all selected clients
                for (const clientId of selectedClients) {
                    await dispatch(deleteClient(clientId));
                }

                // Close loading alert
                SweetAlertService.close();

                await SweetAlertService.success(
                    'Clients Deleted',
                    `${selectedClients.length} client(s) have been deleted successfully.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    }
                );

                setSelectedClients([]);

                // Refresh the client list
                dispatch(fetchClients({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                // Close loading alert if open
                SweetAlertService.close();

                await SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the clients. Please try again.',
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

    // Get unique cities for filter
    const getUniqueCities = () => {
        const cities = clients.map(client => client.city).filter(Boolean);
        return [...new Set(cities)];
    };

    // Get unique countries for filter
    const getUniqueCountries = () => {
        const countries = clients.map(client => client.country).filter(Boolean);
        return [...new Set(countries)];
    };

    // Handle pagination
    const handlePreviousPage = () => {
        if (pagination.current_page > 1) {
            dispatch(fetchClients({
                page: pagination.current_page - 1,
                per_page: 10,
            }));
        }
    };

    const handleNextPage = () => {
        if (pagination.current_page < pagination.last_page) {
            dispatch(fetchClients({
                page: pagination.current_page + 1,
                per_page: 10,
            }));
        }
    };

    // Edit dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

    const handleEditClick = (client: Client) => {
        setClientToEdit(client);
        setEditDialogOpen(true);
    };

    const handleEditSuccess = () => {
        // Refresh the client list after successful update
        dispatch(fetchClients({
            page: pagination.current_page,
            per_page: 10,
        }));
    };

    // Format date
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
                        checked={selectedClients.length === clients.length && clients.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="dark:bg-white dark:border-black"
                    />
                    <Label htmlFor="select-all">Select All</Label>
                </div>

                {selectedClients.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="ml-auto"
                    >
                        Delete Selected ({selectedClients.length})
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
                                placeholder="Client Name..."
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
                                placeholder="Client Code..."
                                value={codeSearch}
                                onChange={(e) => setCodeSearch(e.target.value)}
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
                                placeholder="Email..."
                                value={emailSearch}
                                onChange={(e) => setEmailSearch(e.target.value)}
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
                                    <SelectItem value="all">All Status</SelectItem>
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
                        <span className="ml-2">Loading clients...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="p-4 text-center text-red-600">
                        Error loading clients: {error}
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
                                    <TableHead>Client Name</TableHead>
                                    <TableHead>Client Code</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {clients.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            No clients found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    clients.map((client: Client) => (
                                        <TableRow
                                            key={client.id}
                                            className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                                            onClick={() => {
                                                const encodedClient = encodeURIComponent(JSON.stringify(client));
                                                router.push(`/clients/${client.id}?client=${encodedClient}`);
                                            }}
                                        >
                                            {/* Select Checkbox */}
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedClients.includes(client.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectClient(client.id, checked as boolean)
                                                    }
                                                />
                                            </TableCell>

                                            {/* Client Name */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                        {client.profile_image ? (
                                                            <Image
                                                                src={client.profile_image}
                                                                alt={client.full_name || 'Client'}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <span className="font-bold text-gray-700">
                                                                {client.full_name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {client.full_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {client.client_code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Client Code */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.client_code}
                                            </TableCell>

                                            {/* Phone Number */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.phone}
                                            </TableCell>

                                            {/* Email */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.email}
                                            </TableCell>

                                            {/* City */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.city || "N/A"}
                                            </TableCell>

                                            {/* Country */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.country || "N/A"}
                                            </TableCell>

                                            {/* Created Date */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {formatDate(client.created_at)}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.is_active?.toString() || 'false']
                                                        }`}>
                                                        {client.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => handleStatusToggle(e, client)}
                                                        title={client.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className={`h-4 w-4 ${client.is_active ? 'text-green-600' : 'text-gray-400'
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
                                                        <DropdownMenuItem onClick={(e) => viewDetails(e, client)}>
                                                            View details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditClick(client)}>
                                                            Edit client
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => handleDeleteClick(e, client)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            Delete client
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
                {!isLoading && !error && clients.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {clients.length} of {pagination.total} clients
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
                    title="Delete Client"
                    description={`Are you sure you want to delete ${clientToDelete?.full_name}? This action cannot be undone.`}
                />

                <ClientUpdateForm
                    isOpen={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    clientId={clientToEdit?.id || 0}
                    onSuccess={handleEditSuccess}
                    trigger={<div />}
                />
            </CardContent>
        </Card>
    );
}