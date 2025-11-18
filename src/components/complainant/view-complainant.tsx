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
import { Expense } from "@/app/types/expense"
import { Card, CardContent } from "../ui/card"
import { IconFileDownload } from "@tabler/icons-react"
import { Complainant } from "@/app/types/complainant"

interface ViewComplainantProps {
    statusColors: Record<string, string>
    priorityColors: Record<string, string>
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    complainant?: Complainant | null
}

export function ViewComplainant({ statusColors, priorityColors, trigger, isOpen, onOpenChange, complainant }: ViewComplainantProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[80vw] max-w-[80vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">View Complainant</span>
                </div>

                <Card>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <span>Title Here</span>
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm text-gray-500">Reporter</span>
                                <span className="text-sm text-gray-900">{complainant?.reporter}</span>
                            </div>
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm text-gray-500">Reporter Name</span>
                                <span className="text-sm text-gray-900">{complainant?.reporter_name}</span>
                            </div>
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm text-gray-500">Against</span>
                                <span className="text-sm text-gray-900">{complainant?.against}</span>
                            </div>
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm text-gray-500">Against Name</span>
                                <span className="text-sm text-gray-900">{complainant?.against_name}</span>
                            </div>
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm text-gray-500">Priority</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[complainant?.priority || ""]}`}>
                                    {complainant?.priority}
                                </span>
                            </div>

                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[complainant?.status || ""]}`}>
                                    {complainant?.status}
                                </span>
                            </div>

                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm text-gray-500">Document</span>
                                <div className="flex flex-row gap-2 text-green-500 font-bold text-sm">
                                    Download
                                    <IconFileDownload />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-blue-100 flex flex-col p-2 rounded-md">
                    <span className="mb-2 text-md font-bold">Note</span>
                    <p className="text-sm text-gray-500 tracking-tight justify-center">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laboriosam, modi rem eius quaerat laborum, consectetur nihil in unde, suscipit eaque laudantium corrupti repellat aliquam accusamus cum sequi necessitatibus fugiat illo.</p>
                </div>




                {/* Footer Actions */}
                <DialogActionFooter submitText="Edit" />
            </DialogContent>
        </Dialog>
    )
}