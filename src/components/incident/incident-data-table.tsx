"use client";

import Image from "next/image";
import { CalendarIcon, ChevronRight, Download, DownloadIcon, Ellipsis, EllipsisIcon, EllipsisVertical, File, FilterIcon, ListFilter, MoreHorizontal, Search, StarIcon } from "lucide-react";
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
import { IconFileDownload } from "@tabler/icons-react";
import ViewClientContent from "../clients/view-client-content";
import { incidents } from "@/app/(admin)/incident/data";
import { Incident } from "@/app/types/incident";




export const incidentStatusColors: Record<string, string> = {
    Reviewed: "bg-green-100 text-green-700",
    Unreviewed: "bg-red-100 text-red-700",
};






export function IncidentDataTable() {


    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const router = useRouter()

    const viewDetails = (e: React.MouseEvent, incident: Incident) => {
        e.stopPropagation(); // Prevent row click when clicking dropdown
        router.push(`/incident/${incident.row}`)
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [incidentToDelete, setExpenseToDelete] = useState<Incident | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, incident: Incident) => {
        e.stopPropagation();
        setExpenseToDelete(incident);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (incidentToDelete) {
            // Your delete logic here
            console.log('Deleting client:', incidentToDelete.row);
            setDeleteDialogOpen(false);
            setExpenseToDelete(null);
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
                    <Checkbox id="terms" className="dark:bg-white dark:border-black" />
                    <Label htmlFor="terms">Select</Label>
                </CardTitle>
            </div>

            <CardContent className="p-0">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Input: 8 columns on sm+ screens */}
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Site Name" />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="ID Number" />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Guard Name" />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Client Name" />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    <div className="sm:col-span-3">
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Reporter" />
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <FloatingLabelInput
                                    className="text-start h-9"
                                    label="Date"
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
                                <TableHead>Tracking Code</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Site Name</TableHead>
                                <TableHead>Reporter</TableHead>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Guard Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {incidents.map((incident) => (
                                <TableRow
                                    key={incident.tracking_code + incident.row}
                                    className="hover:bg-gray-50 dark:hover:bg-black"
                                >
                                    <TableCell className="font-medium text-gray-900">
                                        {incident.tracking_code}
                                    </TableCell>

                                    <TableCell className="text-gray-700">
                                        {incident.title}
                                    </TableCell>

                                    <TableCell className="text-gray-700">
                                        {incident.site_name}
                                    </TableCell>

                                    <TableCell className="text-gray-700">
                                        {incident.reporter}
                                    </TableCell>

                                    <TableCell className="text-gray-700">
                                        {incident.client_name}
                                    </TableCell>

                                    <TableCell className="text-gray-700">
                                        {incident.guard_name}
                                    </TableCell>

                                    <TableCell className="text-gray-700">
                                        {incident.date}
                                    </TableCell>

                                    <TableCell className="text-gray-700">
                                        {incident.time}
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={`
                inline-block w-28 text-center px-2 py-1 rounded-full text-xs font-medium
                ${incidentStatusColors[incident.status] || "bg-gray-200 text-gray-700"}
              `}
                                        >
                                            {incident.status}
                                        </span>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <EllipsisVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => viewDetails(e,incident)}>
                                                    View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit incident</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleDeleteClick(e,incident)}>
                                                    Delete incident
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
                    title="Delete Incident"
                    description={`Are you sure you want to delete ${incidentToDelete?.site_name}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}
