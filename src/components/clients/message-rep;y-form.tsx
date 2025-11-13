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
import { ReactNode, useState } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelSelect } from "../ui/floating-select"
import { Calendar as CalendarIcon, Plus, UploadCloud } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { DialogActionFooter } from "../shared/dialog-action-footer"
import { Textarea } from "../ui/textarea"

interface MessageDialogProps {
  trigger: ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MessageReplyForm({ trigger, isOpen, onOpenChange }: MessageDialogProps) {


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
          <span className="whitespace-nowrap">Reply Message</span>
        </div>

        {/* First Row */}
        <div className="grid grid-cols-1  gap-3 sm:gap-4 mb-4">
          <div className="col-span-1">
            <Textarea className="border-black dark:border-white"/>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogActionFooter submitText="Reply"/>
      </DialogContent>
    </Dialog>
  )
}
