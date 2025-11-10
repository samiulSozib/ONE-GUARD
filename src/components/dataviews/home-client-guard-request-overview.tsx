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

// 🧠 Mock data
const requests = [
    {
        id: 1,
        name: "Annette Black",
        date: "05/24/2025",
        location: "New York City",
        requestedDate: "29 Aug 2025 - 1 Day",
        time: "04:50 PM to 10:00 AM",
        status: "Pending",
        avatar: "/images/avatar.png",
    },
    {
        id: 2,
        name: "Annette Black",
        date: "06/23/2025",
        location: "Boston",
        requestedDate: "29 Aug 2025 - 1 Day",
        time: "04:50 PM to 10:00 AM",
        status: "In progress",
        avatar: "/images/avatar.png",
    },
    {
        id: 3,
        name: "Annette Black",
        date: "04/20/2025",
        location: "Philadelphia",
        requestedDate: "29 Aug 2025 - 1 Day",
        time: "04:50 PM to 10:00 AM",
        status: "Cancelled",
        avatar: "/images/avatar.png",
    },
    {
        id: 4,
        name: "Annette Black",
        date: "04/17/2025",
        location: "Newark, Jersey City",
        requestedDate: "29 Aug 2025 - 1 Day",
        time: "04:50 PM to 10:00 AM",
        status: "Completed",
        avatar: "/images/avatar.png",
    },
];

// 🏷️ Status badge color map
const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    "In progress": "bg-blue-100 text-blue-800",
    Cancelled: "bg-red-100 text-red-800",
    Completed: "bg-green-100 text-green-800",
};

export function ClientGurdRequestOverview() {
    return (
        <Card className="shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                    Client Guard Request Overview
                </CardTitle>
                <Button variant="link" className="text-sm text-black-600 font-medium">
                    View All <ChevronRight />
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Input: 8 columns on sm+ screens */}
                    <div className="sm:col-span-8">
                        <InputGroup>
                            <InputGroupInput placeholder="Client Name..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Status Select: 4 columns on sm+ screens */}
                    <div className="sm:col-span-4">
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>All</SelectLabel>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In progress</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
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
                            {requests.map((req) => (
                                <TableRow key={req.id} className="hover:bg-gray-50">
                                    {/* Client Info */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={req.avatar}
                                                    alt={req.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{req.name}</div>
                                                <div className="text-gray-500 dark:text-gray-300 text-xs">{req.date}</div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Location */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{req.location}</TableCell>

                                    {/* Requested Date & Time */}
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{req.requestedDate}</div>
                                        <div className="text-gray-500 dark:text-gray-300 text-xs">{req.time}</div>
                                    </TableCell>

                                    {/* Status + Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}
                                            >
                                                {req.status}
                                            </span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View details</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit request</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
