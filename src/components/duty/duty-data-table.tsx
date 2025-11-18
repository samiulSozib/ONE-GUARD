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
import { Duty } from "@/app/types/duty";
import ViewClientContent from "../clients/view-client-content";
import { duties } from "@/app/(admin)/duty/data";




const statusColors: Record<string, string> = {
    "Shift completed": "bg-green-500 text-white",
    "Late": "bg-yellow-300 text-yellow-800",
    "On Duty": "bg-green-300 text-green-700",
    "In Progress": "bg-yellow-200 text-yellow-500",
    "Missed Check-in": "bg-red-300 text-red-500"
};





export function DutyDataTable() {


    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedDuty, setSelectedDuty] = useState<Duty | null>(null);

    const viewDetails = (e: React.MouseEvent, duty: Duty) => {
        e.preventDefault();
        setSelectedDuty(duty);
        setViewDialogOpen(true);
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [dutyToDelete, setExpenseToDelete] = useState<Duty | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, duty: Duty) => {
        e.stopPropagation();
        setExpenseToDelete(duty);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (dutyToDelete) {
            // Your delete logic here
            console.log('Deleting client:', dutyToDelete.row);
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
                    <div className="sm:col-span-4">
                        <InputGroup>
                            <InputGroupInput placeholder="Title" />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-4">
                        <InputGroup>
                            <InputGroupInput placeholder="Deposit ID" />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>


                    {/* Status Select: 4 columns on sm+ screens */}
                    <div className="sm:col-span-4">
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
                </div>


                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Guard</TableHead>
                                <TableHead>Mandatory Check-in</TableHead>
                                <TableHead>Required Hours</TableHead>
                                <TableHead>Check-In</TableHead>
                                <TableHead>Check-Out</TableHead>
                                <TableHead>Total Working Hours</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {duties.map((duty) => (
                                <TableRow
                                    key={duty.row}
                                    className="hover:bg-gray-50 dark:hover:bg-black"
                                >
                                    {/* Description */}
                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                        {duty.title}
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {duty.date}
                                    </TableCell>

                                    {/* Time */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {duty.site}
                                    </TableCell>

                                    {/* Amount */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {duty.guard_name}
                                    </TableCell>

                                    {/* Deposit ID */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {duty.mandatory_check_in}
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {duty.required_hours}
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {duty.check_in}
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {duty.check_out}
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {duty.total_working_hours}
                                    </TableCell>



                                    <TableCell>
                                        <span
                                            className={`
      inline-block
      w-28      /* FIXED WIDTH */
      text-center
      px-2 py-1 
      rounded-full 
      text-xs 
      font-medium
      ${statusColors[duty?.status] || "bg-gray-100 text-gray-800"}
    `}
                                        >
                                            {duty.status}
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
                                                <DropdownMenuItem onClick={(e) => viewDetails(e, duty)}>
                                                    View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit duty</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleDeleteClick(e, duty)}>
                                                    Delete duty
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
                    title="Delete Duty"
                    description={`Are you sure you want to delete ${dutyToDelete?.title}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}
