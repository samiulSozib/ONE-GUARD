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
import { useState } from "react";
import { Client } from "@/app/types/client";
import { clients } from "@/app/(admin)/clients/data";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FloatingLabelInput } from "../ui/floating-input";
import { Calendar } from "../ui/calender";







const statusColors: Record<string, string> = {
    "Completed": "bg-green-500 text-white",
    "Pending": "bg-yellow-300 text-yellow-800",
    "Running": "bg-green-300 text-green-700"
};

export function ClientDataTable() {

    const router = useRouter()

    const viewDetails = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation(); // Prevent row click when clicking dropdown
        router.push(`/clients/${client.id}`)

    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        setClientToDelete(client);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (clientToDelete) {
            // Your delete logic here
            console.log('Deleting client:', clientToDelete.id);
            setDeleteDialogOpen(false);
            setClientToDelete(null);
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
                            <InputGroupInput placeholder="Client Name..." />
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
                            <InputGroupInput placeholder="Email" />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Status Select: 4 columns on sm+ screens */}
                    <div className="sm:col-span-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <FloatingLabelInput
                                    className="text-start h-9"
                                    label="End Date"
                                    //   value={endDate ? format(endDate, "MM/dd/yyyy") : ""}
                                    readOnly
                                    postfixIcon={<CalendarIcon />}
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    //   selected={endDate}
                                    //   onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="sm:col-span-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <FloatingLabelInput
                                    className="text-start h-9"
                                    label="End Date"
                                    //   value={endDate ? format(endDate, "MM/dd/yyyy") : ""}
                                    readOnly
                                    postfixIcon={<CalendarIcon />}
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    //   selected={endDate}
                                    //   onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
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
                                <TableHead>Client Name</TableHead>
                                <TableHead>ID Number</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Contract Start</TableHead>
                                <TableHead>Contract End</TableHead>
                                <TableHead>Contract Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {clients.map((client) => (
                                <TableRow
                                    key={client.id}
                                    className="hover:bg-gray-50 dark:hover:bg-black"
                                >
                                    {/* Client Name */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={client.avatar}
                                                    alt={client.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {client.name}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* ID Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {client.idNumber}
                                    </TableCell>

                                    {/* Phone Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {client.phoneNumber}
                                    </TableCell>

                                    {/* Email */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {client.email}
                                    </TableCell>

                                    {/* City */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {client.city}
                                    </TableCell>

                                    {/* State */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {client.state}
                                    </TableCell>

                                    {/* Country */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {client.country}
                                    </TableCell>

                                    {/* Contract Start */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {client.contractStartDate}
                                    </TableCell>

                                    {/* Contract End */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {client.contractEndDate}
                                    </TableCell>

                                    {/* Contract Status */}
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.contractStatus] ||
                                                "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {client.contractStatus}
                                        </span>
                                    </TableCell>

                                    {/* Location + Actions */}
                                    <TableCell className="text-right">


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
                                                <DropdownMenuItem>Edit client</DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => handleDeleteClick(e, client)}
                                                >
                                                    Delete client
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
                    title="Delete Client"
                    description={`Are you sure you want to delete ${clientToDelete?.name}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}
