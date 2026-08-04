// components/company-service-unit-type/company-service-unit-type-edit-form.tsx
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
import { FloatingLabelInput } from "../ui/floating-input";
import { FloatingLabelTextarea } from "../ui/floating-textarea";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  updateCompanyServiceUnitType,
  fetchCompanyServiceUnitType
} from "@/store/slices/company-service-unit-type.slice";
import { CompanyServiceUnitType, UpdateCompanyServiceUnitTypeDto } from "@/app/types/company-service-unit-type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Switch } from "../ui/switch";

// Zod schema
const unitTypeSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),

  code: z.string()
    .min(1, { message: "Code is required" })
    .max(50, { message: "Code must be less than 50 characters" })
    .regex(/^[a-z0-9_]+$/, { message: "Code must contain only lowercase letters, numbers, and underscores" }),

  description: z.string().optional().nullable(),

  sort_order: z.number()
    .min(0, { message: "Sort order must be a positive number" })
    .optional()
    .nullable(),

  is_active: z.boolean().optional().default(true),
});

type UnitTypeFormData = z.infer<typeof unitTypeSchema>;

interface CompanyServiceUnitTypeEditFormProps {
  trigger: ReactNode;
  unitType: CompanyServiceUnitType;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyServiceUnitTypeEditForm({
  trigger,
  unitType,
  isOpen,
  onOpenChange,
  onSuccess
}: CompanyServiceUnitTypeEditFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UnitTypeFormData>({
    resolver: zodResolver(unitTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      sort_order: 0,
      is_active: true,
    },
    mode: "onBlur"
  });

  const formValues = watch();

  // Load unit type data when dialog opens
  useEffect(() => {
    if (isOpen && unitType?.id) {
      loadUnitType();
    }
  }, [isOpen, unitType?.id]);

  const loadUnitType = async () => {
    if (!unitType?.id) return;

    setIsFetching(true);
    try {
      const result = await dispatch(fetchCompanyServiceUnitType(unitType.id));

      if (fetchCompanyServiceUnitType.fulfilled.match(result)) {
        const data = result.payload.item;
        reset({
          name: data.name || "",
          code: data.code || "",
          description: data.description || "",
          sort_order: data.sort_order || 0,
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error("Failed to load unit type:", error);
      SweetAlertService.error('Error', 'Failed to load unit type details');
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: UnitTypeFormData) => {
    if (!unitType?.id) return;

    setIsLoading(true);
    try {
      const submitData: UpdateCompanyServiceUnitTypeDto = {
        name: data.name.trim(),
        code: data.code.trim().toLowerCase(),
        description: data.description?.trim() || null,
        sort_order: data.sort_order || 0,
        is_active: data.is_active,
      };

      const result = await dispatch(updateCompanyServiceUnitType({
        id: unitType.id,
        data: submitData
      }));

      if (updateCompanyServiceUnitType.fulfilled.match(result)) {
        SweetAlertService.success(
          'Unit Type Updated',
          `${data.name} has been updated successfully.`
        ).then(() => {
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update unit type. Please try again.";

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
    if (open) {
      onOpenChange?.(true);
    } else {
      // Check for unsaved changes
      const originalData = {
        name: unitType?.name || "",
        code: unitType?.code || "",
        description: unitType?.description || "",
        sort_order: unitType?.sort_order || 0,
        is_active: unitType?.is_active,
      };

      const currentData = {
        name: formValues.name.trim(),
        code: formValues.code.trim(),
        description: formValues.description || "",
        sort_order: formValues.sort_order || 0,
        is_active: formValues.is_active,
      };

      const hasChanges =
        currentData.name !== originalData.name ||
        currentData.code !== originalData.code ||
        currentData.description !== originalData.description ||
        currentData.sort_order !== originalData.sort_order ||
        currentData.is_active !== originalData.is_active;

      if (!hasChanges) {
        onOpenChange?.(false);
      } else {
        SweetAlertService.confirm(
          'Discard Changes?',
          'You have unsaved changes. Are you sure you want to close?',
          'Yes, discard',
          'No, keep'
        ).then((result) => {
          if (result.isConfirmed) {
            reset();
            onOpenChange?.(false);
          } else {
            onOpenChange?.(true);
          }
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Edit Unit Type</span>
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading unit type details...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="w-full">
              <FloatingLabelInput
                label="Unit Type Name *"
                {...register("name")}
                error={errors.name?.message}
                disabled={isLoading || isFetching}
                placeholder="e.g., Guard Per Month"
              />
            </div>

            {/* Code */}
            <div className="w-full">
              <FloatingLabelInput
                label="Unit Type Code *"
                {...register("code")}
                error={errors.code?.message}
                disabled={isLoading || isFetching}
                placeholder="e.g., guard_per_month"
                helperText="Use lowercase letters, numbers, and underscores only."
              />
            </div>

            {/* Description */}
            <div className="w-full">
              <FloatingLabelTextarea
                label="Description (Optional)"
                rows={3}
                {...register("description")}
                disabled={isLoading || isFetching}
                className="resize-none"
                placeholder="Enter unit type description..."
              />
            </div>

            {/* Sort Order and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <FloatingLabelInput
                  label="Sort Order"
                  type="number"
                  min="0"
                  {...register("sort_order", { valueAsNumber: true })}
                  error={errors.sort_order?.message}
                  disabled={isLoading || isFetching}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Status
                </Label>
                <Switch
                  id="is_active"
                  checked={formValues.is_active}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                  disabled={isLoading || isFetching}
                />
                <span className="text-sm text-gray-500">
                  {formValues.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <DialogActionFooter
              cancelText="Cancel"
              submitText="Update Unit Type"
              isSubmitting={isLoading}
              submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onSubmit={handleSubmit(onSubmit)}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
