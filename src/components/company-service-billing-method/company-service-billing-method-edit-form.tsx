// components/company-service-billing-method/company-service-billing-method-edit-form.tsx
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
  updateCompanyServiceBillingMethod,
  fetchCompanyServiceBillingMethod
} from "@/store/slices/company-service-billing-method.slice";
import { CompanyServiceBillingMethod, UpdateCompanyServiceBillingMethodDto } from "@/app/types/company-service-billing-method";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Switch } from "../ui/switch";

// Zod schema
const billingMethodSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),

  code: z.string()
    .min(1, { message: "Code is required" })
    .max(50, { message: "Code must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Code must contain only letters, numbers, and underscores" }),

  description: z.string().optional().nullable(),

  calculation_type: z.string()
    .min(1, { message: "Calculation type is required" })
    .max(100, { message: "Calculation type must be less than 100 characters" }),

  is_recurring: z.boolean(),
  requires_attendance: z.boolean(),

  sort_order: z.number()
    .min(0, { message: "Sort order must be a positive number" })
    .optional()
    .nullable(),

  is_active: z.boolean(),
});

type BillingMethodFormData = z.infer<typeof billingMethodSchema>;

interface CompanyServiceBillingMethodEditFormProps {
  trigger: ReactNode;
  billingMethod: CompanyServiceBillingMethod;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyServiceBillingMethodEditForm({
  trigger,
  billingMethod,
  isOpen,
  onOpenChange,
  onSuccess
}: CompanyServiceBillingMethodEditFormProps) {
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
  } = useForm<BillingMethodFormData>({
    resolver: zodResolver(billingMethodSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      calculation_type: "",
      is_recurring: false,
      requires_attendance: false,
      sort_order: 0,
      is_active: true,
    },
    mode: "onBlur"
  });

  const formValues = watch();

  // Load billing method data when dialog opens
  useEffect(() => {
    if (isOpen && billingMethod?.id) {
      loadBillingMethod();
    }
  }, [isOpen, billingMethod?.id]);

  const loadBillingMethod = async () => {
    if (!billingMethod?.id) return;

    setIsFetching(true);
    try {
      const result = await dispatch(fetchCompanyServiceBillingMethod(billingMethod.id));

      if (fetchCompanyServiceBillingMethod.fulfilled.match(result)) {
        const data = result.payload.item;
        reset({
          name: data.name || "",
          code: data.code || "",
          description: data.description || "",
          calculation_type: data.calculation_type || "",
          is_recurring: data.is_recurring || false,
          requires_attendance: data.requires_attendance || false,
          sort_order: data.sort_order || 0,
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error("Failed to load billing method:", error);
      SweetAlertService.error('Error', 'Failed to load billing method details');
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: BillingMethodFormData) => {
    if (!billingMethod?.id) return;

    setIsLoading(true);
    try {
      const submitData: UpdateCompanyServiceBillingMethodDto = {
        name: data.name.trim(),
        code: data.code.trim().toLowerCase(),
        description: data.description?.trim() || null,
        calculation_type: data.calculation_type.trim(),
        is_recurring: data.is_recurring,
        requires_attendance: data.requires_attendance,
        sort_order: data.sort_order || 0,
        is_active: data.is_active,
      };

      const result = await dispatch(updateCompanyServiceBillingMethod({
        id: billingMethod.id,
        data: submitData
      }));

      if (updateCompanyServiceBillingMethod.fulfilled.match(result)) {
        SweetAlertService.success(
          'Billing Method Updated',
          `${data.name} has been updated successfully.`
        ).then(() => {
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update billing method. Please try again.";

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
        name: billingMethod?.name || "",
        code: billingMethod?.code || "",
        description: billingMethod?.description || "",
        calculation_type: billingMethod?.calculation_type || "",
        is_recurring: billingMethod?.is_recurring || false,
        requires_attendance: billingMethod?.requires_attendance || false,
        sort_order: billingMethod?.sort_order || 0,
        is_active: billingMethod?.is_active,
      };

      const currentData = {
        name: formValues.name.trim(),
        code: formValues.code.trim(),
        description: formValues.description || "",
        calculation_type: formValues.calculation_type.trim(),
        is_recurring: formValues.is_recurring,
        requires_attendance: formValues.requires_attendance,
        sort_order: formValues.sort_order || 0,
        is_active: formValues.is_active,
      };

      const hasChanges =
        currentData.name !== originalData.name ||
        currentData.code !== originalData.code ||
        currentData.description !== originalData.description ||
        currentData.calculation_type !== originalData.calculation_type ||
        currentData.is_recurring !== originalData.is_recurring ||
        currentData.requires_attendance !== originalData.requires_attendance ||
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

      <DialogContent className="sm:max-w-[700px] w-[90vw] max-w-[90vw] mx-auto max-h-[85vh] overflow-y-auto dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Edit Billing Method</span>
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading billing method details...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name and Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <FloatingLabelInput
                  label="Billing Method Name *"
                  {...register("name")}
                  error={errors.name?.message}
                  disabled={isLoading || isFetching}
                  placeholder="e.g., Monthly"
                />
              </div>
              <div className="w-full">
                <FloatingLabelInput
                  label="Billing Method Code *"
                  {...register("code")}
                  error={errors.code?.message}
                  disabled={isLoading || isFetching}
                  placeholder="e.g., monthly"
                />
              </div>
            </div>

            {/* Description */}
            <div className="w-full">
              <FloatingLabelTextarea
                label="Description (Optional)"
                rows={3}
                {...register("description")}
                disabled={isLoading || isFetching}
                className="resize-none"
                placeholder="Enter billing method description..."
              />
            </div>

            {/* Calculation Type */}
            <div className="w-full">
              <FloatingLabelInput
                label="Calculation Type *"
                {...register("calculation_type")}
                error={errors.calculation_type?.message}
                disabled={isLoading || isFetching}
                placeholder="e.g., per_guard, per_hour, fixed"
                // helperText="Define how the billing calculation is performed"
              />
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 pt-2">
                <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
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

              <div className="flex items-center gap-3 pt-2">
                <Label htmlFor="is_recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recurring
                </Label>
                <Switch
                  id="is_recurring"
                  checked={formValues.is_recurring}
                  onCheckedChange={(checked) => setValue("is_recurring", checked)}
                  disabled={isLoading || isFetching}
                />
                <span className="text-sm text-gray-500">
                  {formValues.is_recurring ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Label htmlFor="requires_attendance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requires Attendance
                </Label>
                <Switch
                  id="requires_attendance"
                  checked={formValues.requires_attendance}
                  onCheckedChange={(checked) => setValue("requires_attendance", checked)}
                  disabled={isLoading || isFetching}
                />
                <span className="text-sm text-gray-500">
                  {formValues.requires_attendance ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* Sort Order */}
            <div className="w-full md:w-1/2">
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

            {/* Footer Actions */}
            <DialogActionFooter
              cancelText="Cancel"
              submitText="Update Billing Method"
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
