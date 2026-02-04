"use client";

import Image from "next/image";
import { CalendarIcon, ChevronRight, DownloadIcon, Ellipsis, EllipsisIcon, EllipsisVertical, FilterIcon, ListFilter, MoreHorizontal, Search, StarIcon } from "lucide-react";
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

import { DeleteDialog } from "../shared/delete-dialog";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FloatingLabelInput } from "../ui/floating-input";
import { Calendar } from "../ui/calender";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchClients, deleteClient } from "@/store/slices/clientSlice";
import { Client } from "@/app/types/client";
import SweetAlertService from "@/lib/sweetAlert";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchSites } from "@/store/slices/siteSlice";

// Default avatar for clients without images
const defaultAvatar = "/default-avatar.png";

export function ClientDataTable() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get clients from Redux store
    const { clients, pagination, isLoading, error } = useAppSelector((state) => state.client);
    const {sites}=useAppSelector((state)=>state.site)

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedClients, setSelectedClients] = useState<number[]>([]);

    // Fetch clients on component mount
    useEffect(() => {
        dispatch(fetchClients({
            page: 1,
            per_page: 10,
            search: searchTerm,
        }));
    }, [dispatch, searchTerm]);

    useEffect(() => {
        dispatch(fetchSites({
            page: 1,
            per_page: 15,
            search: searchTerm,
        }));
    }, [dispatch, searchTerm]);

    useEffect(()=>{
        console.log(sites)
    },[dispatch,sites])

    const viewDetails = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();

        // Encode the client object as a URL parameter
        const encodedClient = encodeURIComponent(JSON.stringify(client));
        router.push(`/clients/${client.id}?client=${encodedClient}`);
    };

    const handleEditClick = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        router.push(`/clients/edit/${client.id}`);
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

                SweetAlertService.success(
                    'Client Deleted',
                    `${clientToDelete.full_name} has been deleted successfully.`,
                    {
                        timer: 1500,
                        showConfirmButton: false,
                    }
                );

                setDeleteDialogOpen(false);
                setClientToDelete(null);

                // Refresh the client list
                dispatch(fetchClients({
                    page: 1,
                    per_page: 10,
                    search: searchTerm,
                }));
            } catch (error) {
                SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the client. Please try again.'
                );
            }
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
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

    const handleExport = () => {
        // Export logic here
        SweetAlertService.success(
            'Export Started',
            'Your client data export has been initiated.',
            {
                timer: 1500,
                showConfirmButton: false,
            }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedClients.length === 0) {
            SweetAlertService.warning(
                'No Clients Selected',
                'Please select at least one client to delete.'
            );
            return;
        }

        const result = await SweetAlertService.confirm(
            'Bulk Delete Confirmation',
            `Are you sure you want to delete ${selectedClients.length} selected client(s)? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                // Delete all selected clients
                for (const clientId of selectedClients) {
                    await dispatch(deleteClient(clientId));
                }

                SweetAlertService.success(
                    'Clients Deleted',
                    `${selectedClients.length} client(s) have been deleted successfully.`,
                    {
                        timer: 1500,
                        showConfirmButton: false,
                    }
                );

                setSelectedClients([]);

                // Refresh the client list
                dispatch(fetchClients({
                    page: 1,
                    per_page: 10,
                    search: searchTerm,
                }));
            } catch (error) {
                SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the clients. Please try again.'
                );
            }
        }
    };

    // Filter clients based on search and status
    const filteredClients = clients.filter((client: Client) => {
        const matchesSearch = searchTerm === "" ||
            client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone?.includes(searchTerm) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.client_code?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === "all" ||
            (selectedStatus === "active" && client.is_active) ||
            (selectedStatus === "inactive" && !client.is_active);

        return matchesSearch && matchesStatus;
    });

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status color
    const getStatusColor = (isActive: boolean) => {
        return isActive
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    };

    return (
        <Card className="shadow-sm rounded-2xl">
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
                                placeholder="Search clients..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    <div className="sm:col-span-3">
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="all">All Clients</SelectItem>
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

                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Client Code</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredClients.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            No clients found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClients.map((client: Client) => (
                                        <TableRow
                                            key={client.id}
                                            className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                                            onClick={() => router.push(`/clients/${client.id}`)}
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



                                            {/* Full Name */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                        {client.full_name ? (
                                                            <span className="font-bold text-gray-700">
                                                                {client.full_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        ) : (
                                                            <Image
                                                                src={defaultAvatar}
                                                                alt={client.full_name || 'Client'}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {client.full_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {client.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {/* Client Code */}
                                            <TableCell className="font-medium">
                                                {client.client_code}
                                            </TableCell>

                                            {/* Phone */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.phone}
                                            </TableCell>

                                            {/* Email */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.email}
                                            </TableCell>

                                            {/* City */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.city}
                                            </TableCell>

                                            {/* Country */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {client.country}
                                            </TableCell>

                                            {/* Created Date */}
                                            <TableCell className="text-gray-700 dark:text-gray-300">
                                                {formatDate(client.created_at)}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.is_active)}`}
                                                >
                                                    {client.is_active ? "Active" : "Inactive"}
                                                </span>
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
                                                        <DropdownMenuItem
                                                            onClick={(e) => viewDetails(e, client)}
                                                        >
                                                            View details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => handleEditClick(e, client)}
                                                        >
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
                {!isLoading && !error && filteredClients.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {filteredClients.length} of {pagination.total} clients
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === 1}
                                onClick={() => dispatch(fetchClients({
                                    page: pagination.current_page - 1,
                                    per_page: 10,
                                    search: searchTerm,
                                }))}
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
                                onClick={() => dispatch(fetchClients({
                                    page: pagination.current_page + 1,
                                    per_page: 10,
                                    search: searchTerm,
                                }))}
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
            </CardContent>
        </Card>
    );
}