"use client"

import * as React from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DeleteIcon, TrashIcon } from "lucide-react"

interface DeleteDialogProps {
    title?: string
    description?: string
    onConfirm: () => void
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DeleteDialog({
    isOpen,
    onOpenChange,
    title = "Are you absolutely sure?",
    description = "This action cannot be undone. This will permanently delete this record.",
    onConfirm,
}: DeleteDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            
            <AlertDialogContent className="bg-red-50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-500">{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="w-full flex">
                    <AlertDialogCancel className="flex-1 text-black dark:text-black">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="flex-1 bg-red-600"> <TrashIcon/>Yes, Delete it</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
