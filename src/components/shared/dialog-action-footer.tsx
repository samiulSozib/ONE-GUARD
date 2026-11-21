"use client"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import React from "react"

interface DialogActionFooterProps {
  cancelText?: string
  submitText?: string
  onSubmit?: (...args: any[]) => void | Promise<void>
  /**
   * Prefer this over DialogClose whenever the parent shows a discard confirm.
   * DialogClose forces Radix closed and re-triggers the Swal blink loop.
   */
  onCancel?: () => void
  isSubmitting?: boolean
  submitColor?: string
}

export const DialogActionFooter: React.FC<DialogActionFooterProps> = ({
  cancelText = "Cancel",
  submitText = "Add",
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitColor = "bg-green-600 hover:bg-green-700 dark:bg-gray-700 dark:hover:bg-gray-600",
}) => {
  const cancelButton = (
    <Button
      variant="outline"
      size="lg"
      className="dark:border-red-600 w-full sm:w-auto"
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
    >
      {cancelText}
    </Button>
  )

  return (
    <DialogFooter className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
      {onCancel ? (
        cancelButton
      ) : (
        <DialogClose asChild>{cancelButton}</DialogClose>
      )}
      <Button
        type="submit"
        size="lg"
        onClick={(e) => onSubmit?.(e)}
        disabled={isSubmitting}
        className={`${submitColor} text-white w-full sm:w-auto`}
      >
        {isSubmitting ? "Processing..." : submitText}
      </Button>
    </DialogFooter>
  )
}
