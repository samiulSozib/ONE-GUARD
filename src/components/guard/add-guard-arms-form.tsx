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
import { format } from "date-fns"
import { Calendar } from "../ui/calender"
import { DialogActionFooter } from "../shared/dialog-action-footer"

interface LiveMapDialogProps {
  trigger: ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddGuardArmsForm({ trigger, isOpen, onOpenChange }: LiveMapDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Add Guard Arms</span>
          <span className="text-gray-400">#GRD-0007</span>
        </div>

        {/* First Row */}
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="col-span-2">
            <FloatingLabelInput label="Title" />
          </div>

          

          {/* Start Date */}
          <div className="col-span-1">
            <Popover>
              <PopoverTrigger asChild>
                <FloatingLabelInput
                    className="text-start"
                  label="Start Date"
                  value={startDate ? format(startDate, "MM/dd/yyyy") : ""}
                  readOnly
                  postfixIcon={<CalendarIcon />}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="col-span-1">
            <Popover>
              <PopoverTrigger asChild>
                <FloatingLabelInput
                className="text-start"
                  label="End Date"
                  value={endDate ? format(endDate, "MM/dd/yyyy") : ""}
                  readOnly
                  postfixIcon={<CalendarIcon />}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogActionFooter/>
      </DialogContent>
    </Dialog>
  )
}
