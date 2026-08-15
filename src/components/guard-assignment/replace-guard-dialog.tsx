// components/guard-assignment/replace-guard-dialog.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchGuards } from "@/store/slices/guardSlice";
import { replaceGuard } from "@/store/slices/guardAssignmentSlice";
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon";
import { User, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { Guard } from "@/app/types/guard";
import { GuardAssignment } from "@/app/types/guardAssignment";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { ScrollArea } from "../ui/scroll-area";
import type { ReplaceGuardResponse } from "@/service/guardAssignment.service";

interface ReplaceGuardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: GuardAssignment | null;
  onSuccess?: () => void;
}

type ReplacementScope = "this_duty" | "this_and_future";

export function ReplaceGuardDialog({
  isOpen,
  onOpenChange,
  assignment,
  onSuccess
}: ReplaceGuardDialogProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGuardId, setSelectedGuardId] = useState<number>(0);
  const [scope, setScope] = useState<ReplacementScope>("this_duty");
  const [guardSearch, setGuardSearch] = useState("");
  const [result, setResult] = useState<ReplaceGuardResponse | null>(null);

  const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchGuards({ page: 1, per_page: 100, is_active: true }));
      setSelectedGuardId(0);
      setScope("this_duty");
      setResult(null);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (guardSearch.trim() || guardSearch === "") {
        dispatch(fetchGuards({
          page: 1,
          per_page: 10,
          search: guardSearch.trim(),
          is_active: true,
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [guardSearch, dispatch]);

  const formatGuardDisplay = (guard: Partial<Guard>) => {
    if (!guard) return "";
    return `${guard.full_name || 'Unknown'} (${guard.guard_code || 'No Code'})`;
  };

  const handleReplace = async () => {
    if (!assignment) return;
    if (!selectedGuardId) {
      SweetAlertService.warning('Select Guard', 'Please select a replacement guard.');
      return;
    }

    if (selectedGuardId === assignment.guard_id) {
      SweetAlertService.warning('Same Guard', 'Selected guard is already assigned to this duty.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const resultAction = await dispatch(replaceGuard({
        assignment_id: assignment.id,
        replacement_guard_id: selectedGuardId,
        scope: scope
      }));

      if (replaceGuard.fulfilled.match(resultAction)) {
        // Now resultAction.payload is ReplaceGuardResponse directly
        const data = resultAction.payload;

        // Store result for display
        setResult(data);

        const scopeText = scope === "this_duty"
          ? "this duty only"
          : "this and all future duties";

        const replacedCount = data.summary.assignments_replaced || 0;
        const skippedCount = data.summary.assignments_skipped || 0;

        if (replacedCount > 0 && skippedCount === 0) {
          // All succeeded
          await SweetAlertService.success(
            'Guard Replaced',
            `${replacedCount} assignment(s) replaced successfully for ${scopeText}.`
          );
          // Don't close immediately - let user see the result
        } else if (replacedCount === 0 && skippedCount > 0) {
          // All failed
          await SweetAlertService.error(
            'Replacement Failed',
            `All ${skippedCount} replacement(s) failed. Please check the details below.`
          );
        } else if (replacedCount > 0 && skippedCount > 0) {
          // Partial success
          await SweetAlertService.warning(
            'Partial Success',
            `${replacedCount} assignment(s) replaced, ${skippedCount} skipped for ${scopeText}.`
          );
        } else {
          // No replacements and no skips - something unexpected
          await SweetAlertService.info(
            'Replacement Completed',
            data.message || 'Guard replacement completed.'
          );
        }
      } else {
        throw resultAction.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to replace guard. Please try again.";
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      SweetAlertService.error('Replacement Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setResult(null);
      onOpenChange(false);
    }
  };

  const handleDone = () => {
    setResult(null);
    onSuccess?.();
    onOpenChange(false);
  };

  const currentGuard = assignment?.guard;
  const hasFutureDuties = assignment?.duty?.duty_schedule_id !== undefined && assignment?.duty?.duty_schedule_id !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[550px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-blue-600" />
            Replace Guard
          </DialogTitle>
          <DialogDescription>
            Replace the current guard with another guard for this assignment.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          // Result Display
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Replacement Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Replaced</p>
                  <p className="text-xl font-bold text-green-600">{result.summary.assignments_replaced}</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Skipped</p>
                  <p className="text-xl font-bold text-red-600">{result.summary.assignments_skipped}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Checked</p>
                  <p className="text-xl font-bold text-blue-600">{result.summary.assignments_checked}</p>
                </div>
              </div>
            </div>

            {result.replaced && result.replaced.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                <h5 className="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Replaced ({result.replaced.length})
                </h5>
                <ScrollArea className="h-[80px]">
                  <div className="space-y-1">
                    {result.replaced.map((item, index) => (
                      <div key={index} className="text-sm text-green-600 dark:text-green-400">
                        Duty #{item.duty_id}: Guard #{item.old_guard_id} → Guard #{item.replacement_guard_id}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {result.skipped && result.skipped.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <h5 className="font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Skipped ({result.skipped.length})
                </h5>
                <ScrollArea className="h-[80px]">
                  <div className="space-y-1">
                    {result.skipped.map((item, index) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400">
                        Duty #{item.duty_id}: {item.message}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <Button
              type="button"
              onClick={handleDone}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-6 py-4">
              {/* Current Guard Info */}
              {currentGuard && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current Guard
                  </Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">{currentGuard.full_name || `Guard #${currentGuard.id}`}</p>
                      <p className="text-sm text-gray-500">{currentGuard.guard_code || 'No Code'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Replacement Guard Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Replacement Guard <span className="text-red-500">*</span>
                </Label>
                <SearchableDropdownWithIcon
                  value={selectedGuardId || 0}
                  onValueChange={(value) => {
                    setSelectedGuardId(Number(value));
                  }}
                  options={guards
                    .filter((guard: Guard) => guard.id !== assignment?.guard_id)
                    .map((guard: Guard) => ({
                      value: guard.id,
                      label: formatGuardDisplay(guard),
                      ...guard
                    }))}
                  onSearch={(search) => {
                    setGuardSearch(search);
                    dispatch(fetchGuards({
                      page: 1,
                      per_page: 10,
                      search: search,
                      is_active: true,
                    }));
                  }}
                  placeholder="Search and select replacement guard..."
                  disabled={isLoading || guardsLoading}
                  isLoading={guardsLoading}
                  emptyMessage={guardSearch ? "No guards found" : "No guards available"}
                  searchPlaceholder="Search guards by name or code..."
                  icon={User}
                  iconPosition="left"
                />
                {selectedGuardId === assignment?.guard_id && (
                  <p className="text-sm text-amber-600 mt-1">
                    Selected guard is already assigned to this duty.
                  </p>
                )}
              </div>

              {/* Scope Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Replacement Scope <span className="text-red-500">*</span>
                </Label>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="scope"
                      value="this_duty"
                      checked={scope === "this_duty"}
                      onChange={() => setScope("this_duty")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">This Duty Only</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Replace guard only for this specific duty occurrence.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    hasFutureDuties
                      ? "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      : "opacity-50 cursor-not-allowed"
                  }`}>
                    <input
                      type="radio"
                      name="scope"
                      value="this_and_future"
                      checked={scope === "this_and_future"}
                      onChange={() => hasFutureDuties && setScope("this_and_future")}
                      className="mt-1"
                      disabled={!hasFutureDuties}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">This and Future Duties</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Replace guard for this duty and all future occurrences from the same schedule.
                      </p>
                      {!hasFutureDuties && (
                        <p className="text-xs text-amber-600 mt-1">
                          Only available for recurring schedule duties.
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    The current guard's assignment will be marked as <strong>replaced</strong>
                    and the new guard will be assigned with <strong>active</strong> status.
                    {scope === "this_and_future" && " All future assignments in this schedule will also be updated."}
                  </span>
                </p>
              </div>
            </div>

            <DialogActionFooter
              cancelText="Cancel"
              submitText="Replace Guard"
              isSubmitting={isLoading}
              submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onSubmit={handleReplace}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
