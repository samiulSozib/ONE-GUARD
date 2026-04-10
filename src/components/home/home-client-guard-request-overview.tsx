"use client";

import Image from "next/image";
import { ChevronRight, MoreHorizontal, Search } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchDashboard } from "@/store/slices/dashboardSlice";
import { RecentClient } from "@/app/types/dashboard";

// Status badge color map
const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    "In progress": "bg-blue-100 text-blue-800",
    Cancelled: "bg-red-100 text-red-800",
    Completed: "bg-gray-100 text-gray-800",
};

export function ClientGuardRequestOverview() {
    const dispatch = useAppDispatch();
    const { data: dashboard, isLoading } = useAppSelector((state) => state.dashboard);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [filteredClients, setFilteredClients] = useState<RecentClient[]>([]);

    // Fetch dashboard data on component mount
    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    useEffect(()=>{
        console.log(dashboard?.ongoing_shifts)
    },[dispatch,dashboard])

    // Filter clients based on search and status
    useEffect(() => {
        if (!dashboard?.recent_clients) {
           // setFilteredClients([]);
            return;
        }

        let filtered = [...dashboard.recent_clients];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(client =>
                client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(client =>
                client.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        //setFilteredClients(filtered);
    }, [dashboard?.recent_clients, searchTerm, statusFilter]);

    // Get client avatar or fallback
    const getClientAvatar = (clientName: string) => {
        // Return default avatar or you can generate initials
        return `/images/avatar.png`;
    };

    // Get client initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <Card className="shadow-sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                        Recent Clients
                    </CardTitle>
                    <Button variant="link" className="text-sm text-black-600 font-medium">
                        View All <ChevronRight />
                    </Button>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Filters Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                        <div className="sm:col-span-8">
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="sm:col-span-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="overflow-x-auto p-4">
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                    Recent Clients
                </CardTitle>
                <Button variant="link" className="text-sm text-black-600 font-medium">
                    View All <ChevronRight />
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Input */}
                    <div className="sm:col-span-8">
                        <InputGroup>
                            <InputGroupInput
                                placeholder="Search by client name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Status Select */}
                    <div className="sm:col-span-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Filter by Status</SelectLabel>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Requested Date & Time</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {dashboard?.recent_clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-gray-400 mb-2">No clients found</div>
                                            <p className="text-sm text-gray-500">
                                                {searchTerm || statusFilter !== "all"
                                                    ? "Try adjusting your search or filters"
                                                    : "No recent clients available"}
                                            </p>
                                        </div>
                                    </TableCell>
                                 </TableRow>
                            ) : (
                                dashboard?.recent_clients.map((client) => (
                                    <TableRow key={client.id} className="hover:bg-gray-50">
                                        {/* Client Info */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                    {getClientAvatar(client.client_name) ? (
                                                        <Image
                                                            src={getClientAvatar(client.client_name)}
                                                            alt={client.client_name}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {getInitials(client.client_name)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {client.client_name}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-300 text-xs">
                                                        ID: {client.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Location */}
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {client.location || "N/A"}
                                        </TableCell>

                                        {/* Requested Date & Time */}
                                        <TableCell>
                                            <div className="font-medium text-gray-900">
                                                {client.requested_date}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-300 text-xs">
                                                {client.requested_time}
                                            </div>
                                        </TableCell>

                                        {/* Status + Actions */}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.status] || statusColors.Completed
                                                        }`}
                                                >
                                                    {client.status}
                                                </span>

                                                {/* <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View details</DropdownMenuItem>
                                                        <DropdownMenuItem>Contact client</DropdownMenuItem>
                                                        <DropdownMenuItem>View contract</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu> */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Summary Footer */}
                {filteredClients.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-gray-500">
                            Showing {filteredClients.length} of {dashboard?.recent_clients?.length || 0} clients
                        </div>
                        <Button variant="ghost" size="sm" className="text-sm">
                            View All Clients
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}