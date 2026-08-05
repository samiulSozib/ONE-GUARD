// components/company-service-category/company-service-category-create-form.tsx
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
import { createCompanyServiceCategory } from "@/store/slices/company-service-category.slice";
import { CreateCompanyServiceCategoryDto } from "@/app/types/company-service-category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Switch } from "../ui/switch";

// Zod schema
const categorySchema = z.object({
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

  is_active: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CompanyServiceCategoryCreateFormProps {
  trigger: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyServiceCategoryCreateForm({
  trigger,
  isOpen,
  onOpenChange,
  onSuccess
}: CompanyServiceCategoryCreateFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useAppSelector((state) => state.companyServiceCategory);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
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

  // Auto-generate code from name
  useEffect(() => {
    if (formValues.name && !formValues.code) {
      const generatedCode = formValues.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setValue('code', generatedCode);
    }
  }, [formValues.name, formValues.code, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const submitData: CreateCompanyServiceCategoryDto = {
        name: data.name.trim(),
        code: data.code.trim().toLowerCase(),
        description: data.description?.trim() || null,
        sort_order: data.sort_order || 0,
        is_active: data.is_active,
      };

      const result = await dispatch(createCompanyServiceCategory(submitData));

      if (createCompanyServiceCategory.fulfilled.match(result)) {
        SweetAlertService.success(
          'Category Created',
          `${data.name} has been created successfully.`
        ).then(() => {
          reset();
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to create category. Please try again.";

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }

      SweetAlertService.error('Creation Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange?.(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      onOpenChange?.(true);
    } else {
      reset();
      onOpenChange?.(false);
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
          <span className="whitespace-nowrap">Add New Category</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="w-full">
            <FloatingLabelInput
              label="Category Name *"
              {...register("name")}
              error={errors.name?.message}
              disabled={isLoading}
              placeholder="e.g., Security Services"
            />
          </div>

          {/* Code */}
          <div className="w-full">
            <FloatingLabelInput
              label="Category Code *"
              {...register("code")}
              error={errors.code?.message}
              disabled={isLoading}
              placeholder="e.g., security_services"
              // helperText="Auto-generated from name. Use lowercase letters, numbers, and underscores only."
            />
          </div>

          {/* Description */}
          <div className="w-full">
            <FloatingLabelTextarea
              label="Description (Optional)"
              rows={3}
              {...register("description")}
              disabled={isLoading}
              className="resize-none"
              placeholder="Enter category description..."
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <span className="text-sm text-gray-500">
                {formValues.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogActionFooter
            cancelText="Cancel"
            submitText="Create Category"
            isSubmitting={isLoading}
            submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onSubmit={handleSubmit(onSubmit)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
