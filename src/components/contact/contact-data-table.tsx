"use client";

import { EllipsisVertical, ListFilter, DownloadIcon, Search } from "lucide-react";
import {
    Card,
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
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";

import { DeleteDialog } from "../shared/delete-dialog";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ViewContact } from "./view-contact";
import { Contact, ContactParams } from "@/app/types/contact";
import { fetchContacts, deleteContact } from "@/store/slices/contactSlice";
import SweetAlertService from "@/lib/sweetAlert";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";

export function ContactDataTable() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get contacts from Redux store
    const { contacts, pagination, isLoading, error } = useAppSelector((state) => state.contact);

    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

    // Search states
    const [nameSearch, setNameSearch] = useState("");
    const [emailSearch, setEmailSearch] = useState("");
    const [phoneSearch, setPhoneSearch] = useState("");

    // Filter states
    const [contactTypeFilter, setContactTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Fetch contacts on component mount and when filters change
    useEffect(() => {
        const params: ContactParams = {
            page: pagination.current_page || 1,
            per_page: 12, // Changed to 12 for grid layout
        };

        // Add search term (combine all search fields)
        if (nameSearch || emailSearch || phoneSearch) {
            params.search = [nameSearch, emailSearch, phoneSearch]
                .filter(Boolean)
                .join(" ");
        }

        // Add contact type filter
        if (contactTypeFilter !== "all") {
            params.contactable_type = contactTypeFilter;
        }

        // Add status filter
        if (statusFilter !== "all") {
            params.is_active = statusFilter === "active";
        }

        dispatch(fetchContacts(params));
    }, [dispatch, pagination.current_page, nameSearch, emailSearch, phoneSearch, contactTypeFilter, statusFilter]);

    const viewDetails = (e: React.MouseEvent, contact: Contact) => {
        e.stopPropagation();
        setSelectedContact(contact);
        setViewDialogOpen(true);
    };

    const handleEditClick = (e: React.MouseEvent, contact: Contact) => {
        e.stopPropagation();
        // You'll need to implement the edit route
        router.push(`/contacts/edit/${contact.id}`);
    };

    const handleDeleteClick = (e: React.MouseEvent, contact: Contact) => {
        e.stopPropagation();
        setContactToDelete(contact);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (contactToDelete) {
            try {
                await dispatch(deleteContact(contactToDelete.id));

                SweetAlertService.success(
                    'Contact Deleted',
                    `${contactToDelete.name} has been deleted successfully.`,
                    {
                        timer: 1500,
                        showConfirmButton: false,
                    }
                );

                setDeleteDialogOpen(false);
                setContactToDelete(null);

                // Refresh the contact list
                dispatch(fetchContacts({
                    page: pagination.current_page,
                    per_page: 12,
                }));
            } catch (error) {
                SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the contact. Please try again.'
                );
            }
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedContacts(contacts.map((contact: Contact) => contact.id));
        } else {
            setSelectedContacts([]);
        }
    };

    const handleSelectContact = (contactId: number, checked: boolean) => {
        if (checked) {
            setSelectedContacts(prev => [...prev, contactId]);
        } else {
            setSelectedContacts(prev => prev.filter(id => id !== contactId));
        }
    };

    const handleExport = () => {
        SweetAlertService.success(
            'Export Started',
            'Your contact data export has been initiated.',
            {
                timer: 1500,
                showConfirmButton: false,
            }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedContacts.length === 0) {
            SweetAlertService.warning(
                'No Contacts Selected',
                'Please select at least one contact to delete.'
            );
            return;
        }

        const result = await SweetAlertService.confirm(
            'Bulk Delete Confirmation',
            `Are you sure you want to delete ${selectedContacts.length} selected contact(s)? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                // Delete all selected contacts
                for (const contactId of selectedContacts) {
                    await dispatch(deleteContact(contactId));
                }
                
                SweetAlertService.success(
                    'Contacts Deleted',
                    `${selectedContacts.length} contact(s) have been deleted successfully.`,
                    {
                        timer: 1500,
                        showConfirmButton: false,
                    }
                );
                
                setSelectedContacts([]);
                
                // Refresh the contact list
                dispatch(fetchContacts({
                    page: pagination.current_page,
                    per_page: 12,
                }));
            } catch (error) {
                SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the contacts. Please try again.'
                );
            }
        }
    };

    // Get contact role/designation
    const getContactRole = (contact: Contact) => {
        return contact.designation || contact.position || "Contact";
    };

    // Get contact location
    const getContactLocation = (contact: Contact) => {
        if (contact.contactable?.city && contact.contactable?.country) {
            return `${contact.contactable.city}, ${contact.contactable.country}`;
        }
        return contact.contactable?.city || contact.contactable?.country || "Location not specified";
    };

    // Get avatar initials
const getAvatarInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
        return "CN"; // Default initials
    }
    
    // Remove extra whitespace and split
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return "CN";
    
    const initials = trimmedName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    
    return initials || "CN";
};

    // Handle pagination
    const handlePreviousPage = () => {
        if (pagination.current_page > 1) {
            dispatch(fetchContacts({
                page: pagination.current_page - 1,
                per_page: 12,
            }));
        }
    };

    const handleNextPage = () => {
        if (pagination.current_page < pagination.last_page) {
            dispatch(fetchContacts({
                page: pagination.current_page + 1,
                per_page: 12,
            }));
        }
    };

    // Status badge
    const getStatusBadge = (contact: Contact) => {
        return contact.is_active ? (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Active
            </div>
        ) : (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Inactive
            </div>
        );
    };

    // Primary contact badge
    const getPrimaryBadge = (contact: Contact) => {
        return contact.is_primary ? (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Primary
            </div>
        ) : null;
    };

    // Contact type badge
    const getContactTypeBadge = (contact: Contact) => {
        const typeColors = {
            client: "bg-blue-100 text-blue-800",
            guard: "bg-green-100 text-green-800",
            site: "bg-purple-100 text-purple-800",
        };
        
        const color = typeColors[contact.contactable_type] || "bg-gray-100 text-gray-800";
        
        return (
            <div className={`mt-2 px-3 py-1 rounded-full text-xs ${color} capitalize`}>
                {contact.contactable_type}
            </div>
        );
    };

    return (
        <Card className="shadow-sm rounded-2xl">
            {/* Header - Same as GuardDataTable */}
            <div className="bg-[#F4F6F8] p-5 -mt-6 rounded-t-md flex flex-row items-center gap-4 w-full justify-between md:justify-start">
                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <ListFilter size="14px" />
                    Filters
                </CardTitle>

                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleExport}
                    className="text-sm flex items-center gap-1 dark:text-black"
                >
                    <DownloadIcon size="14px" />
                    Export
                </Button>

                <div className="text-sm flex items-center gap-1 dark:text-black">
                    <Checkbox 
                        id="select-all"
                        checked={selectedContacts.length === contacts.length && contacts.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="dark:bg-white dark:border-black"
                    />
                    <Label htmlFor="select-all">Select All</Label>
                </div>

                {selectedContacts.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="ml-auto"
                    >
                        Delete Selected ({selectedContacts.length})
                    </Button>
                )}
            </div>

            <CardContent className="p-0">
                {/* Filters - Modified for 3 search inputs and 3 filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Inputs */}
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput 
                                placeholder="Contact Name..." 
                                value={nameSearch}
                                onChange={(e) => setNameSearch(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput 
                                placeholder="Email Address..." 
                                value={emailSearch}
                                onChange={(e) => setEmailSearch(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput 
                                placeholder="Phone Number..." 
                                value={phoneSearch}
                                onChange={(e) => setPhoneSearch(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Filter Selects */}
                    <div className="sm:col-span-3">
                        <Select value={contactTypeFilter} onValueChange={setContactTypeFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Contact Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Contact Type</SelectLabel>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="guard">Guard</SelectItem>
                                    <SelectItem value="site">Site</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="sm:col-span-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading contacts...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="p-4 text-center text-red-600">
                        Error loading contacts: {error}
                    </div>
                )}

                {/* Contacts Grid - KEEPING THE EXACT SAME LAYOUT */}
                {!isLoading && !error && (
                    <div className="overflow-x-auto p-3">
                        {contacts.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">
                                <p>No contacts found.</p>
                                {(nameSearch || emailSearch || phoneSearch) && (
                                    <Button 
                                        variant="link" 
                                        onClick={() => {
                                            setNameSearch("");
                                            setEmailSearch("");
                                            setPhoneSearch("");
                                        }}
                                    >
                                        Clear search
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {contacts.map((contact:Contact) => (
                                    <div
                                        key={contact.id}
                                        className="border p-4 rounded-xl shadow-sm relative hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={(e) => viewDetails(e, contact)}
                                    >
                                        {/* Status and Primary Badges */}
                                        {/* {getStatusBadge(contact)}
                                        {getPrimaryBadge(contact)} */}
                                        
                                        {/* First row: name center + menu right */}
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-center flex-1 font-medium">{contact.name}</span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <EllipsisVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => viewDetails(e, contact)}>
                                                        View details
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={(e) => handleEditClick(e, contact)}>
                                                        Edit contact
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={(e) => handleDeleteClick(e, contact)}>
                                                        Delete contact
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Contact Info - EXACT SAME LAYOUT */}
                                        <div className="flex flex-col mt-2 gap-2 items-center justify-center">
                                            <Avatar className="w-16 h-16">
                                                <AvatarFallback className="bg-gray-200 text-gray-700">
                                                    {getAvatarInitials(contact.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-md font-bold mt-2">{getContactRole(contact)}</span>
                                            <span className="text-sm text-gray-400">{contact.email || "No email"}</span>
                                            <span className="text-sm text-blue-500">{contact.phone}</span>
                                            <span className="text-xs text-gray-400">{getContactLocation(contact)}</span>
                                            
                                            {/* Contact Type Badge */}
                                            {getContactTypeBadge(contact)}
                                        </div>

                                        {/* Select Checkbox - Added for bulk actions */}
                                        <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedContacts.includes(contact.id)}
                                                onCheckedChange={(checked) => 
                                                    handleSelectContact(contact.id, checked as boolean)
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {contacts.length > 0 && (
                            <div className="flex items-center justify-between mt-6 px-4">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {contacts.length} of {pagination.total} contacts
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.current_page === 1}
                                        onClick={handlePreviousPage}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {pagination.current_page} of {pagination.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.current_page === pagination.last_page}
                                        onClick={handleNextPage}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* View Contact Dialog */}
                <ViewContact
                    isOpen={viewDialogOpen}
                    onOpenChange={setViewDialogOpen}
                    contact={selectedContact}
                    trigger={<div />}
                />

                {/* Delete Confirmation Dialog */}
                <DeleteDialog
                    isOpen={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Contact"
                    description={`Are you sure you want to delete ${contactToDelete?.name}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}