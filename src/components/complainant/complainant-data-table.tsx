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
import { expenses } from "@/app/(admin)/expense/data";
import { IconFileDownload } from "@tabler/icons-react";
import { Expense } from "@/app/types/expense";
import { complainants } from "@/app/(admin)/complainant/data";
import { Complainant } from "@/app/types/complainant";
import ViewClientContent from "../clients/view-client-content";
import { ViewComplainant } from "./view-complainant";




const statusColors: Record<string, string> = {
    "Solved": "bg-green-500 text-white",
    "In Progress": "bg-yellow-300 text-yellow-800",
    "Cancelled": "bg-green-300 text-green-700",
    "Close": "bg-green-300 text-green-700"
};

const priorityColors: Record<string, string> = {
    "Low": "bg-green-500 text-white",
    "High": "bg-red-500 text-white"
};




export function ComplainantDataTable() {


    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedComplainant, setSelectedComplainant] = useState<Complainant | null>(null);

    const viewDetails = (e: React.MouseEvent, complainant: Complainant) => {
        e.preventDefault();
        setSelectedComplainant(complainant);
        setViewDialogOpen(true);
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Complainant | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, complainant: Complainant) => {
        e.stopPropagation();
        setExpenseToDelete(complainant);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (expenseToDelete) {
            // Your delete logic here
            console.log('Deleting client:', expenseToDelete.id);
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
                                <TableHead>Reporter</TableHead>
                                <TableHead>Reporter Name</TableHead>
                                <TableHead>Against</TableHead>
                                <TableHead>Against Name</TableHead>
                                <TableHead>Proprity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Attachment</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {complainants.map((complainant) => (
                                <TableRow
                                    key={complainant.id}
                                    className="hover:bg-gray-50 dark:hover:bg-black"
                                >
                                    {/* Description */}
                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                        {complainant.title}
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {complainant.reporter}
                                    </TableCell>

                                    {/* Time */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {complainant.reporter_name}
                                    </TableCell>

                                    {/* Amount */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {complainant.against}
                                    </TableCell>

                                    {/* Deposit ID */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {complainant.against_name}
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[complainant?.priority] ||
                                                "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {complainant.priority}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[complainant?.status] ||
                                                "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {complainant.status}
                                        </span>
                                    </TableCell>

                                    {/* Attachment */}
                                    <TableCell className="text-green-500">
                                        {complainant.attachment && (
                                            <Button variant="ghost" size="sm" className="flex items-center gap-1">

                                                Download
                                                <IconFileDownload className="h-4 w-4" />
                                            </Button>
                                        )}
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
                                                <DropdownMenuItem onClick={(e) => viewDetails(e, complainant)}>
                                                    View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit complainant</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleDeleteClick(e, complainant)}>
                                                    Delete complainant
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </div>

                <ViewComplainant
                    statusColors={statusColors}
                    priorityColors={priorityColors}
                    isOpen={viewDialogOpen}
                    onOpenChange={setViewDialogOpen}
                    complainant={selectedComplainant}
                    trigger={<div />} // Hidden trigger since we control it programmatically
                />
                
                <DeleteDialog
                    isOpen={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Complainant"
                    description={`Are you sure you want to delete ${expenseToDelete?.reporter_name}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}
