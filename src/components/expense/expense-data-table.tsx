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

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FloatingLabelInput } from "../ui/floating-input";
import { Calendar } from "../ui/calender";
import { expenses } from "@/app/(admin)/expense/data";
import { IconFileDownload } from "@tabler/icons-react";
import { Expense } from "@/app/types/expense";
import { ViewExpense } from "./view-expense";









export function ExpensetDataTable() {


    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const viewDetails = (e: React.MouseEvent, expense: Expense) => {
        e.preventDefault();
        setSelectedExpense(expense);
        setViewDialogOpen(true);
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, expense: Expense) => {
        e.stopPropagation();
        setExpenseToDelete(expense);
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
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Deposit ID</TableHead>
                                <TableHead>Attachment</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow
                                    key={expense.id}
                                    className="hover:bg-gray-50 dark:hover:bg-black"
                                >
                                    {/* Description */}
                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                        {expense.description}
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {expense.date}
                                    </TableCell>

                                    {/* Time */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {expense.time}
                                    </TableCell>

                                    {/* Amount */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {expense.amount}
                                    </TableCell>

                                    {/* Deposit ID */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {expense.depositId}
                                    </TableCell>

                                    {/* Attachment */}
                                    <TableCell className="text-green-500">
                                        {expense.hasAttachment && (
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
                                                <DropdownMenuItem onClick={(e) => viewDetails(e, expense)}>
                                                    View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit expense</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleDeleteClick(e, expense)}>
                                                    Delete expense
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </div>

                <ViewExpense
                    isOpen={viewDialogOpen}
                    onOpenChange={setViewDialogOpen}
                    expense={selectedExpense}
                    trigger={<div />} // Hidden trigger since we control it programmatically
                />
                <DeleteDialog
                    isOpen={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Client"
                    description={`Are you sure you want to delete ${expenseToDelete?.description}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}
