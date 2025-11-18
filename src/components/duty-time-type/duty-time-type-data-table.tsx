"use client";

import Image from "next/image";
import { EllipsisVertical, Search } from "lucide-react";
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
import { guardTypes } from "@/app/(admin)/guard-type/data";
import { GuardType } from "@/app/types/guard-type";
import { dutyTimeTypes } from "@/app/(admin)/duty-time-type/data";
import { DutyTimeType } from "@/app/types/duty-time-type";









export function DutyTimeTypeDataTable() {




    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<DutyTimeType | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, type: DutyTimeType) => {
        e.stopPropagation();
        setTypeToDelete(type);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (typeToDelete) {
            // Your delete logic here
            console.log('Deleting client:', typeToDelete.id);
            setDeleteDialogOpen(false);
            setTypeToDelete(null);
        }
    };


    return (
        <Card className="shadow-sm rounded-2xl">





            {/* Table */}
            <div className="overflow-x-auto p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {dutyTimeTypes.map((type) => (
                        <div
                            key={type.id}
                            className="border p-4 rounded-xl shadow-sm relative"
                        >
                            {/* First row: name center + menu right */}
                            <div className="flex items-center justify-between w-full">
                                <span className="w-8 h-8 flex items-center justify-center bg-blue-200 text-blue-600 rounded-full">
                                    {type.id}
                                </span>
                                <span className="text-center flex-1">{type.title}</span>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <EllipsisVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end">
                                        

                                        <DropdownMenuItem>
                                            Edit type
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={(e) => handleDeleteClick(e, type)}>
                                            Delete type
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                title="Delete Type"
                description={`Are you sure you want to delete ${typeToDelete?.title}? This action cannot be undone.`}
            />
        </Card>
    );
}
