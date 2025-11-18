"use client";

import Image from "next/image";
import {  EllipsisVertical,  Search } from "lucide-react";
import {
    Card,

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



import { DeleteDialog } from "../shared/delete-dialog";
import { useState } from "react";

import { notes } from "@/app/(admin)/notes/data";
import { Note } from "@/app/types/note";









export function NoteDataTable() {


    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Note | null>(null);

    const viewDetails = (e: React.MouseEvent, note: Note) => {
        e.preventDefault();
        setSelectedContact(note);
        setViewDialogOpen(true);
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, note: Note) => {
        e.stopPropagation();
        setNoteToDelete(note);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (noteToDelete) {
            // Your delete logic here
            console.log('Deleting client:', noteToDelete.id);
            setDeleteDialogOpen(false);
            setNoteToDelete(null);
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
                            <InputGroupInput placeholder="Note Name..." />
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
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="border p-4 rounded-xl shadow-sm relative"
                            >
                                {/* First row: name center + menu right */}
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-center flex-1">{note.title}</span>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <EllipsisVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => viewDetails(e, note)}>
                                                View details
                                            </DropdownMenuItem>

                                            <DropdownMenuItem>
                                                Edit note
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={(e) => handleDeleteClick(e, note)}>
                                                Delete note
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex flex-col mt-2 gap-2">
                                    
                                    <span className="text-sm text-gray-400 text-justify">{note.description}</span>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>




                {/* <ViewContact
                    isOpen={viewDialogOpen}
                    onOpenChange={setViewDialogOpen}
                    note={selectedContact}
                    trigger={<div />} // Hidden trigger since we control it programmatically
                /> */}
                <DeleteDialog
                    isOpen={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Note"
                    description={`Are you sure you want to delete ${noteToDelete?.title}? This action cannot be undone.`}
                />
            </CardContent>
        </Card>
    );
}
