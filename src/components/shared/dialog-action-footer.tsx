"use client"

import React from "react"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DialogActionFooterProps {
  cancelText?: string
  submitText?: string
  onSubmit?: () => void
  isSubmitting?: boolean
  submitColor?: string // optional color override
}

export const DialogActionFooter: React.FC<DialogActionFooterProps> = ({
  cancelText = "Cancel",
  submitText = "Add",
  onSubmit,
  isSubmitting = false,
  submitColor = "bg-green-600 hover:bg-green-700 dark:bg-gray-700 dark:hover:bg-gray-600",
}) => {
  return (
    <DialogFooter className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
      <DialogClose asChild>
        <Button
          variant="outline"
          size="lg"
          className="dark:border-red-600 w-full sm:w-auto"
          type="button"
        >
          {cancelText}
        </Button>
      </DialogClose>
      <Button
        type="submit"
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`${submitColor} text-white w-full sm:w-auto`}
      >
        {isSubmitting ? "Processing..." : submitText}
      </Button>
    </DialogFooter>
  )
}
