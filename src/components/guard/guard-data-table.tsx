"use client";

import Image from "next/image";
import { ChevronRight, DownloadIcon, Ellipsis, EllipsisIcon, EllipsisVertical, FilterIcon, ListFilter, MoreHorizontal, Search, StarIcon } from "lucide-react";
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
import { Guard } from "@/app/types/guard";

import { guards } from "@/app/(admin)/guards/data";
import { DeleteDialog } from "../shared/delete-dialog";
import { useState } from "react";





const typeColors: Record<string, string> = {
    Corporate: "bg-blue-100 text-blue-800",
    Unarmed: "bg-gray-100 text-gray-800",
    Armed: "bg-red-100 text-red-800"
};

const statusColors: Record<string, string> = {
    "On Duty": "bg-green-100 text-green-800",
    "Day off": "bg-gray-100 text-gray-800",
    "In Progress (PhotoPending)": "bg-yellow-100 text-yellow-800",
    "Late (Arrived 12:11 AM)": "bg-orange-100 text-orange-800",
    "Missed Check-In": "bg-red-100 text-red-800",
    "Off Duty": "bg-gray-100 text-gray-800"
};

export function GuardDataTable() {

    const router = useRouter()

    const viewDetails = (e: React.MouseEvent, guard: Guard) => {
        e.stopPropagation(); // Prevent row click when clicking dropdown
        router.push(`/guards/${guard.id}`)

    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [guardToDelete, setGuardToDelete] = useState<Guard | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, guard: Guard) => {
        e.stopPropagation();
        setGuardToDelete(guard);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (guardToDelete) {
            // Your delete logic here
            console.log('Deleting guard:', guardToDelete.id);
            setDeleteDialogOpen(false);
            setGuardToDelete(null);
        }
    };


    return (
        <Card className="shadow-sm rounded-2xl">
            <div className="bg-[#F4F6F8] p-5 -mt-6 rounded-t-md flex flex-row items-center gap-4 w-full justify-between md:justify-start">
                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <ListFilter size="14px" />
                    Filters
                </CardTitle>

                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <DownloadIcon size="14px" />
                    Export
                </CardTitle>

                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <Checkbox id="terms" className="dark:bg-white dark:border-black"/>
                    <Label htmlFor="terms">Select</Label>
                </CardTitle>
            </div>

            <CardContent className="p-0">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Input: 8 columns on sm+ screens */}
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Guard Name..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Id Number..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Phone Number..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Driver Licence Number..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Status Select: 4 columns on sm+ screens */}
                    <div className="sm:col-span-3">
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
                    <div className="sm:col-span-3">
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
                    <div className="sm:col-span-3">
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
                    <div className="sm:col-span-3">
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
                                <TableHead>Guard Name</TableHead>
                                <TableHead>ID Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Card Number</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Driver License Number</TableHead>
                                <TableHead>Issuing State</TableHead>
                                <TableHead>City of Residence</TableHead>
                                <TableHead>Check-In</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {guards.map((guard) => (
                                <TableRow key={guard.id} className="hover:bg-gray-50 dark:hover:bg-black">
                                    {/* Guard Name */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={guard.avatar}
                                                    alt={guard.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{guard.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* ID Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard._id}</TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[guard.type]}`}>
                                            {guard.type}
                                        </span>
                                    </TableCell>

                                    {/* Card Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.cardNumber}</TableCell>

                                    {/* Phone Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.phoneNumber}</TableCell>

                                    {/* Driver License Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.driverLicenseNumber}</TableCell>

                                    {/* Issuing State */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.issuingState}</TableCell>

                                    {/* City of Residence */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.city}</TableCell>

                                    {/* Check-In */}
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{guard.checkInTime}</div>
                                        {guard.checkInTime && (
                                            <div className="text-gray-500 dark:text-gray-300 text-xs">{guard.checkInTime}</div>
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[guard.status]}`}>
                                            {guard.status}
                                        </span>
                                    </TableCell>

                                    {/* Location + Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2"><StarIcon size="14px" /> {guard.locationRating}</span>
                                            <span>{guard.locationIcon}</span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <EllipsisVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => viewDetails(e, guard)}>View details</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit guard</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => handleDeleteClick(e, guard)}>Delete guard</DropdownMenuItem>
                                                </DropdownMenuContent>

                                            </DropdownMenu>
                                        </div>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DeleteDialog
                    isOpen={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Guard"
                    description={`Are you sure you want to delete ${guardToDelete?.name}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}
