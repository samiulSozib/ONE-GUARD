'use client'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ReactNode } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelSelect } from "../ui/floating-select"
import { CalendarIcon, Plus, PlusIcon, UploadCloud } from "lucide-react"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import SiteAddForm from "../shared/site-add-form"

interface AddSiteDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AddSiteForm({ trigger, isOpen, onOpenChange }: AddSiteDialogProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add Site</span>
                </div>

                {/* First Row */}
               

                {/* Site detaisl */}
                <SiteAddForm/>

                {/* Footer Actions */}
                <DialogActionFooter />
            </DialogContent>
        </Dialog>
    )
}