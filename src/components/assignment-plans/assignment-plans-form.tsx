// components/assignment-plans/assignment-plans-form.tsx

"use client";

import { AssignmentPlanStatus, GuardAssignmentPlan } from "@/app/types/scheduling";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import SweetAlertService from "@/lib/sweetAlert";
import { cn } from "@/lib/utils";
import { fetchDutySchedules } from "@/store/slices/duty-schedule.slice";
import { fetchGuards } from "@/store/slices/guardSlice";
import {
  createAssignmentPlan,
  fetchAssignmentPlan,
  updateAssignmentPlan,
} from "@/store/slices/schedulingSlice";
import { format } from "date-fns";
import { CalendarIcon, Shield, User } from "lucide-react";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Calendar } from "../ui/calender";
import { FloatingLabelInput } from "../ui/floating-input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface AssignmentPlansFormProps {
  trigger: ReactNode;
  plan?: GuardAssignmentPlan;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

// Type for the create/update response
interface AssignmentPlanResponse {
  item: GuardAssignmentPlan;
  generation?: {
    plan_id: number;
    duties_checked: number;
    assignments_created: number;
    assignments_skipped: number;
    skipped_reasons?: Record<string, string[]>;
  };
}

export function AssignmentPlansForm({
  trigger,
  plan,
  isOpen,
  onOpenChange,
  onSuccess,
}: AssignmentPlansFormProps) {
  const dispatch = useAppDispatch();
  const { isLoading: isSaving } = useAppSelector((state) => state.scheduling.plans);
  const { items: dutySchedules, isLoading: schedulesLoading } = useAppSelector((state) => state.dutySchedule);
  const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard);

  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({
    duty_schedule_id: "",
    guard_id: "",
    start_date: "",
    end_date: "",
    is_open_ended: false,
    status: "active" as AssignmentPlanStatus,
    is_active: true,
    notes: "",
  });

  const isEditMode = !!plan;

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDutySchedules({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchGuards({ page: 1, per_page: 100 }));
    }
  }, [isOpen, dispatch]);

  // Load plan for edit
  useEffect(() => {
    if (plan && isOpen) {
      loadPlan();
    }
  }, [plan, isOpen]);

  const loadPlan = async () => {
    if (!plan?.id) return;
    setIsFetching(true);
    try {
      const result = await dispatch(fetchAssignmentPlan(plan.id)).unwrap();
      setFormData({
        duty_schedule_id: String(result.duty_schedule_id),
        guard_id: String(result.guard_id),
        start_date: result.start_date,
        end_date: result.end_date || "",
        is_open_ended: result.is_open_ended,
        status: result.status,
        is_active: result.is_active,
        notes: result.notes || "",
      });
    } catch (error) {
      console.error("Failed to load plan:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        duty_schedule_id: parseInt(formData.duty_schedule_id),
        guard_id: parseInt(formData.guard_id),
        start_date: formData.start_date,
        end_date: formData.is_open_ended ? null : formData.end_date || null,
        is_open_ended: formData.is_open_ended,
        status: formData.status,
        is_active: formData.is_active,
        notes: formData.notes || null,
      };

      let result: AssignmentPlanResponse;
      if (isEditMode && plan) {
        result = await dispatch(updateAssignmentPlan({ id: plan.id, data: payload })).unwrap();
        SweetAlertService.success("Plan Updated", "Assignment plan has been updated successfully.");
      } else {
        result = await dispatch(createAssignmentPlan(payload)).unwrap();
        SweetAlertService.success("Plan Created", "Assignment plan has been created successfully.");
      }

      // Show generation info if available
      if (result.generation) {
        const info = result.generation;
        SweetAlertService.info(
          "Generation Summary",
          `Checked ${info.duties_checked} duties, created ${info.assignments_created} assignments, skipped ${info.assignments_skipped}`
        );
      }

      onSuccess?.();
      onOpenChange?.(false);
      resetForm();
    } catch (error: any) {
      SweetAlertService.error(
        isEditMode ? "Update Failed" : "Creation Failed",
        error?.message || "Please try again."
      );
    }
  };

  const resetForm = () => {
    setFormData({
      duty_schedule_id: "",
      guard_id: "",
      start_date: "",
      end_date: "",
      is_open_ended: false,
      status: "active",
      is_active: true,
      notes: "",
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange?.(open);
  };

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return "Select date";
    return format(date, 'MMM dd, yyyy');
  };

  // Get selected items for display
  const selectedSchedule = dutySchedules.find((s: any) => s.id === parseInt(formData.duty_schedule_id));
  const selectedGuard = guards.find((g: any) => g.id === parseInt(formData.guard_id));

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[800px] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-3 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-3 sm:mb-6">
            <Image src="/images/logo.png" alt="" width={20} height={20} className="sm:w-6 sm:h-6" />
            <span className="whitespace-nowrap">
              {isEditMode ? "Edit Assignment Plan" : "Create Assignment Plan"}
            </span>
          </div>
          <DialogDescription>
            {isEditMode
              ? "Update the assignment plan details"
              : "Define a recurring assignment rule for a guard"}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-xs sm:text-sm text-gray-600">Loading plan details...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Duty Schedule Selection */}
                <div className="space-y-2">
                  <Label htmlFor="duty_schedule_id" className="text-sm font-medium">
                    Shift Schedule *
                  </Label>
                  <Select
                    value={formData.duty_schedule_id}
                    onValueChange={(value) => handleChange("duty_schedule_id", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {dutySchedules.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">No schedules available</div>
                      ) : (
                        dutySchedules.map((schedule: any) => (
                          <SelectItem key={schedule.id} value={String(schedule.id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{schedule.title || `Schedule #${schedule.id}`}</span>
                              {schedule.description && (
                                <span className="text-xs text-muted-foreground">{schedule.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!formData.duty_schedule_id && (
                    <p className="text-xs text-amber-500">Please select a duty schedule</p>
                  )}
                </div>

                {/* Guard Selection */}
                <div className="space-y-2">
                  <Label htmlFor="guard_id" className="text-sm font-medium">
                    Guard *
                  </Label>
                  <Select
                    value={formData.guard_id}
                    onValueChange={(value) => handleChange("guard_id", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select guard" />
                    </SelectTrigger>
                    <SelectContent>
                      {guards.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">No guards available</div>
                      ) : (
                        guards.map((guard: any) => (
                          <SelectItem key={guard.id} value={String(guard.id)}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{guard.full_name}</span>
                              <span className="text-xs text-muted-foreground">({guard.guard_code})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!formData.guard_id && (
                    <p className="text-xs text-amber-500">Please select a guard</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 border-gray-300 dark:border-gray-600",
                          !formData.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? format(new Date(formData.start_date), 'MMM dd, yyyy') : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date ? new Date(formData.start_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleChange("start_date", format(date, 'yyyy-MM-dd'));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 border-gray-300 dark:border-gray-600",
                          !formData.end_date && "text-muted-foreground",
                          formData.is_open_ended && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={formData.is_open_ended}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(new Date(formData.end_date), 'MMM dd, yyyy') : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date ? new Date(formData.end_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleChange("end_date", format(date, 'yyyy-MM-dd'));
                          }
                        }}
                        initialFocus
                        disabled={formData.is_open_ended}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Open-ended Switch */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Open-ended</Label>
                  <p className="text-xs text-muted-foreground">
                    No end date, continues indefinitely
                  </p>
                </div>
                <Switch
                  checked={formData.is_open_ended}
                  onCheckedChange={(checked) => {
                    handleChange("is_open_ended", checked);
                    if (checked) {
                      handleChange("end_date", "");
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value as AssignmentPlanStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Switch */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Active Status</Label>
                  <div className="flex items-center gap-3 pt-1">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleChange("is_active", checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.is_active ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
                <FloatingLabelInput
                  label="Add notes about this assignment plan..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>

              {/* Selected Items Summary */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Selected Items</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Schedule:</span>
                    <span className="text-muted-foreground">
                      {selectedSchedule?.title || formData.duty_schedule_id ? `#${formData.duty_schedule_id}` : "Not selected"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Guard:</span>
                    <span className="text-muted-foreground">
                      {selectedGuard?.full_name || formData.guard_id ? `#${formData.guard_id}` : "Not selected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogActionFooter
              cancelText="Cancel"
              submitText={isEditMode ? "Update Plan" : "Create Plan"}
              isSubmitting={isSaving}
              submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onSubmit={handleSubmit}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
