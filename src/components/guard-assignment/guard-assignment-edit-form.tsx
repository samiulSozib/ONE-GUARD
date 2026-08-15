// components/guard-assignment/guard-assignment-edit-form.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, useEffect } from 'react';
import Image from "next/image";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchGuards } from "@/store/slices/guardSlice";
import { fetchDuties } from "@/store/slices/dutySlice";
import { updateAssignment, fetchAssignment } from "@/store/slices/guardAssignmentSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Guard } from "@/app/types/guard";
import { Duty, DutyParams } from "@/app/types/duty";
import { GuardAssignment } from "@/app/types/guardAssignment";
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon";
import { User, Briefcase } from "lucide-react";

interface GuardAssignmentEditFormProps {
  trigger: ReactNode;
  assignment: GuardAssignment;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

// Zod schema for update - only guard_id and duty_id are editable
const guardAssignmentSchema = z.object({
  guard_id: z.number()
    .min(1, { message: "Guard is required" }),
  duty_id: z.number()
    .min(1, { message: "Duty is required" }),
});

type GuardAssignmentFormData = z.infer<typeof guardAssignmentSchema>;

export function GuardAssignmentEditForm({
  trigger,
  assignment,
  isOpen,
  onOpenChange,
  onSuccess
}: GuardAssignmentEditFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard);
  const { duties, isLoading: dutiesLoading } = useAppSelector((state) => state.duty);

  const [guardSearch, setGuardSearch] = useState("");
  const [dutySearch, setDutySearch] = useState("");

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<GuardAssignmentFormData>({
    resolver: zodResolver(guardAssignmentSchema),
    defaultValues: {
      guard_id: 0,
      duty_id: 0,
    },
    mode: "onBlur"
  });

  const formValues = watch();

  useEffect(() => {
    if (isOpen && assignment?.id) {
      loadAssignment();
    }
  }, [isOpen, assignment?.id]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchGuards({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchDuties({ page: 1, per_page: 100, is_active: true }));
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (formValues.guard_id && formValues.guard_id > 0) {
      const params: DutyParams = {
        page: 1,
        per_page: 100,
        guard_id: formValues.guard_id,
        is_active: true,
      };
      dispatch(fetchDuties(params));
    }
  }, [formValues.guard_id, dispatch]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dutySearch.trim() || dutySearch === "") {
        const params: DutyParams = {
          page: 1,
          per_page: 10,
          search: dutySearch.trim(),
          is_active: true,
        };
        if (formValues.guard_id && formValues.guard_id > 0) {
          params.guard_id = formValues.guard_id;
        }
        dispatch(fetchDuties(params));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dutySearch, formValues.guard_id, dispatch]);

  const loadAssignment = async () => {
    if (!assignment?.id) return;

    setIsFetching(true);
    try {
      const result = await dispatch(fetchAssignment({
        id: assignment.id,
      }));

      if (fetchAssignment.fulfilled.match(result)) {
        const data = result.payload.item;

        reset({
          guard_id: data.guard_id || 0,
          duty_id: data.duty_id || 0,
        });

        if (data.guard_id) {
          dispatch(fetchDuties({
            page: 1,
            per_page: 100,
            guard_id: data.guard_id,
            is_active: true,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load assignment:", error);
      SweetAlertService.error('Error', 'Failed to load assignment details');
    } finally {
      setIsFetching(false);
    }
  };

  const formatGuardDisplay = (guard: Partial<Guard>) => {
    if (!guard) return "";
    return `${guard.full_name || 'Unknown'} (${guard.guard_code || 'No Code'})`;
  };

  const formatDutyDisplay = (duty: Partial<Duty>) => {
    if (!duty) return "";
    const siteName = duty.site?.site_name || 'No Site';
    const date = duty.duty_date ? new Date(duty.duty_date).toLocaleDateString() : '';
    return `${duty.title || 'Untitled Duty'} - ${siteName}${date ? ` (${date})` : ''}`;
  };

  const onSubmit = async (data: GuardAssignmentFormData) => {
    if (!assignment?.id) return;

    setIsLoading(true);
    try {
      const submitData = {
        guard_id: data.guard_id,
        duty_id: data.duty_id,
      };

      const result = await dispatch(updateAssignment({
        id: assignment.id,
        data: submitData
      }));

      if (updateAssignment.fulfilled.match(result)) {
        SweetAlertService.success(
          'Assignment Updated',
          'Guard assignment has been updated successfully.'
        ).then(() => {
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update guard assignment. Please try again.";
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      SweetAlertService.error('Update Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    if (!open) {
      reset();
      setGuardSearch("");
      setDutySearch("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Edit Guard Assignment</span>
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading assignment details...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Assignment Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {/* Guard Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Guard <span className="text-red-500">*</span>
                  </Label>
                  <SearchableDropdownWithIcon
                    value={formValues.guard_id || 0}
                    onValueChange={(value) => {
                      setValue("guard_id", Number(value), { shouldValidate: true });
                      setValue("duty_id", 0);
                      setDutySearch("");
                    }}
                    options={guards.map((guard: Guard) => ({
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
                    placeholder="Select guard"
                    disabled={isLoading || isFetching || guardsLoading}
                    isLoading={guardsLoading}
                    emptyMessage={guardSearch ? "No guards found" : "No guards available"}
                    searchPlaceholder="Search guards by name or code..."
                    icon={User}
                    iconPosition="left"
                    displayValue={(value, options) => {
                      if (!value || value === 0) return "Select guard";
                      const option = options.find(opt => opt.value === value);
                      return option?.label || "Select guard";
                    }}
                  />
                  {errors.guard_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.guard_id.message}</p>
                  )}
                </div>

                {/* Duty Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duty <span className="text-red-500">*</span>
                  </Label>
                  <SearchableDropdownWithIcon
                    value={formValues.duty_id || 0}
                    onValueChange={(value) => {
                      setValue("duty_id", Number(value), { shouldValidate: true });
                    }}
                    options={duties.map((duty: Duty) => ({
                      value: duty.id,
                      label: formatDutyDisplay(duty),
                      ...duty
                    }))}
                    onSearch={(search) => {
                      setDutySearch(search);
                      const params: DutyParams = {
                        page: 1,
                        per_page: 10,
                        search: search,
                        is_active: true,
                      };
                      if (formValues.guard_id && formValues.guard_id > 0) {
                        params.guard_id = formValues.guard_id;
                      }
                      dispatch(fetchDuties(params));
                    }}
                    placeholder={formValues.guard_id && formValues.guard_id > 0 ? "Select duty" : "Select guard first"}
                    disabled={isLoading || isFetching || dutiesLoading || !formValues.guard_id || formValues.guard_id === 0}
                    isLoading={dutiesLoading}
                    emptyMessage={
                      !formValues.guard_id || formValues.guard_id === 0
                        ? "Select a guard first"
                        : dutySearch
                          ? "No duties found for this guard"
                          : "No duties available for this guard"
                    }
                    searchPlaceholder="Search duties..."
                    icon={Briefcase}
                    iconPosition="left"
                    displayValue={(value, options) => {
                      if (!value || value === 0) {
                        return formValues.guard_id && formValues.guard_id > 0
                          ? "Select duty"
                          : "Select guard first";
                      }
                      const option = options.find(opt => opt.value === value);
                      return option?.label || "Select duty";
                    }}
                  />
                  {errors.duty_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.duty_id.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formValues.guard_id && formValues.guard_id > 0
                      ? "Showing duties assigned to selected guard"
                      : "Select a guard to see available duties"}
                  </p>
                </div>
              </div>
            </div>

            <DialogActionFooter
              cancelText="Cancel"
              submitText="Update Assignment"
              isSubmitting={isLoading}
              submitColor="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              onSubmit={handleSubmit(onSubmit)}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
