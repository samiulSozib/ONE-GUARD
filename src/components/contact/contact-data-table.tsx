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
import { contacts } from "@/app/(admin)/contacts/data";
import { Contact } from "@/app/types/contact";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ViewContact } from "./view-contact";









export function ContactDataTable() {


    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const viewDetails = (e: React.MouseEvent, contact: Contact) => {
        e.preventDefault();
        setSelectedContact(contact);
        setViewDialogOpen(true);
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, contact: Contact) => {
        e.stopPropagation();
        setContactToDelete(contact);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (contactToDelete) {
            // Your delete logic here
            console.log('Deleting client:', contactToDelete.id);
            setDeleteDialogOpen(false);
            setContactToDelete(null);
        }
    };


    return (
        <Card className="shadow-sm rounded-2xl">


            <CardContent className="p-0">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Input: 8 columns on sm+ screens */}
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Contact Name..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Subject..." />
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
                </div>


                {/* Table */}
                <div className="overflow-x-auto p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className="border p-4 rounded-xl shadow-sm relative"
                            >
                                {/* First row: name center + menu right */}
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-center flex-1">{contact.name}</span>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <EllipsisVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => viewDetails(e, contact)}>
                                                View details
                                            </DropdownMenuItem>

                                            <DropdownMenuItem>
                                                Edit contact
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={(e) => handleDeleteClick(e, contact)}>
                                                Delete contact
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex flex-col mt-2 gap-2 items-center justify-center">
                                    <Avatar>
                                        <AvatarImage className="w-12 h-12" src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <span className="text-md font-bold mt-2">{contact.role}</span>
                                    <span className="text-sm text-gray-400">{contact.email}</span>
                                    <span className="text-sm text-blue-500">{contact.phone}</span>
                                    <span className="text-xs text-gray-400">{contact.location}</span>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>




                <ViewContact
                    isOpen={viewDialogOpen}
                    onOpenChange={setViewDialogOpen}
                    contact={selectedContact}
                    trigger={<div />} // Hidden trigger since we control it programmatically
                />
                <DeleteDialog
                    isOpen={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Client"
                    description={`Are you sure you want to delete ${contactToDelete?.name}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}
