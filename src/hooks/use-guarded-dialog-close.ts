"use client";

import { useCallback, useRef } from "react";
import SweetAlertService, {
  shouldSuppressDialogClose,
} from "@/lib/sweetAlert";

type GuardedCloseOptions = {
  /** Return true when the form has dirty / filled values. */
  hasUnsavedChanges: () => boolean;
  /** Reset local form state before actually closing. */
  onDiscard: () => void;
  /** Controlled dialog open change from the parent. */
  onOpenChange?: (open: boolean) => void;
  title?: string;
  text?: string;
};

/**
 * Shared close handling for Radix Dialogs that show a discard confirm.
 * Prevents the Cancel / "No, keep" blink loop caused by Swal click-through
 * re-firing Dialog onOpenChange(false).
 */
export function useGuardedDialogClose({
  hasUnsavedChanges,
  onDiscard,
  onOpenChange,
  title = "Discard Changes?",
  text = "You have unsaved changes. Are you sure you want to close?",
}: GuardedCloseOptions) {
  const confirmingRef = useRef(false);

  const closeNow = useCallback(() => {
    onDiscard();
    onOpenChange?.(false);
  }, [onDiscard, onOpenChange]);

  const requestClose = useCallback(async () => {
    if (shouldSuppressDialogClose() || confirmingRef.current) {
      return;
    }

    if (!hasUnsavedChanges()) {
      closeNow();
      return;
    }

    confirmingRef.current = true;
    try {
      const result = await SweetAlertService.confirmDiscard(title, text);
      if (result.isConfirmed) {
        closeNow();
      }
    } finally {
      confirmingRef.current = false;
    }
  }, [closeNow, hasUnsavedChanges, text, title]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        onOpenChange?.(true);
        return;
      }

      // Keep dialog open until discard is confirmed (controlled mode).
      void requestClose();
    },
    [onOpenChange, requestClose]
  );

  return {
    requestClose,
    handleDialogOpenChange,
  };
}
