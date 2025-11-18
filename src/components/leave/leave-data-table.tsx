"use client";

import Image from "next/image";
import { CalendarIcon, ChevronRight, DownloadIcon, Ellipsis, EllipsisIcon, EllipsisVertical, FilterIcon, ListFilter, MoreHorizontal, PlusIcon, Search, StarIcon } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FloatingLabelInput } from "../ui/floating-input";
import { Calendar } from "../ui/calender";
import { leaves } from "@/app/(admin)/leave/data";
import { Leave } from "@/app/types/leave";
import { ButtonGroup } from "../ui/button-group";
import { LeaveViewDialog } from "./leave-view";

const statusColors = {
    "Approve": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "Pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "Reject": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

export function LeaveDataTable() {




    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [leaveToDelete, setLeaveToDelete] = useState<Leave | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'failure'>('all');

    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

    const viewDetails = (e: React.MouseEvent, leave: Leave) => {
        e.preventDefault();
        setSelectedLeave(leave);
        setViewDialogOpen(true);
    };


    const handleDeleteClick = (e: React.MouseEvent, client: Leave) => {
        e.stopPropagation();
        setLeaveToDelete(client);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (leaveToDelete) {
            // Your delete logic here
            console.log('Deleting client:', leaveToDelete.id);
            setDeleteDialogOpen(false);
            setLeaveToDelete(null);
        }
    };

    // Filter leaves based on active filter
    const filteredLeaves = leaves.filter(leave => {
        const today = new Date().toLocaleDateString('en-US');

        switch (activeFilter) {
            case 'today':
                return leave.startDate === today;
            case 'failure':
                return leave.status === 'Reject';
            case 'all':
            default:
                return true;
        }
    });


    return (
        <>
            <ButtonGroup className="mb-3 w-full flex flex-row justify-between">
                <Button
                    variant={activeFilter === 'all' ? "default" : "outline"}
                    size="lg"
                    className={`flex-1 ${activeFilter === 'all' ? 'text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All
                </Button>
                <Button
                    variant={activeFilter === 'today' ? "default" : "outline"}
                    size="lg"
                    className={`flex-1 ${activeFilter === 'today' ? 'text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700' : ''}`}
                    onClick={() => setActiveFilter('today')}
                >
                    Todays List
                </Button>
                <Button
                    variant={activeFilter === 'failure' ? "default" : "outline"}
                    size="lg"
                    className={`flex-1 ${activeFilter === 'failure' ? 'text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700' : 'text-red-500'}`}
                    onClick={() => setActiveFilter('failure')}
                >
                    Failer to arrive on time (2)
                </Button>
            </ButtonGroup>
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

                    </div>


                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Guard Name</TableHead>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Calculation Unit</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredLeaves.map((leave) => (
                                    <TableRow
                                        key={leave.id}
                                        className="hover:bg-gray-50 dark:hover:bg-black"
                                    >
                                        {/* Guard Name */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {leave.guardName.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {leave.guardName}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Leave Type */}
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {leave.leaveType}
                                        </TableCell>

                                        {/* Calculation Unit */}
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {leave.calculationUnit}
                                        </TableCell>

                                        {/* Amount */}
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {leave.amount}
                                        </TableCell>

                                        {/* Start Date */}
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {leave.startDate}
                                        </TableCell>

                                        {/* End Date */}
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {leave.endDate}
                                        </TableCell>

                                        {/* Start Time */}
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {leave.startTime || "-"}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[leave.status] ||
                                                    "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {leave.status}
                                            </span>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <EllipsisVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={(e) => viewDetails(e, leave)}
                                                    >
                                                        View details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>Edit leave</DropdownMenuItem>
                                                    <DropdownMenuItem>Change Status</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => handleDeleteClick(e, leave)}
                                                    >
                                                        Delete leave
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                    </div>

                    <LeaveViewDialog
                        isOpen={viewDialogOpen}
                        onOpenChange={setViewDialogOpen}
                        leave={selectedLeave}
                        trigger={<div />} // Hidden trigger since we control it programmatically
                    />
                    <DeleteDialog
                        isOpen={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        onConfirm={handleConfirmDelete}
                        title="Delete Client"
                        description={`Are you sure you want to delete ${leaveToDelete?.guardName}? This action cannot be undone.`}
                    />
                </CardContent>
            </Card></>
    );
}