// components/company-service-component/company-service-component-edit-form.tsx
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
  updateCompanyServiceComponent,
  fetchCompanyServiceComponent
} from "@/store/slices/company-service-component.slice";
import { fetchCompanyServices } from "@/store/slices/company-service.slice";
import { CompanyServiceComponent, UpdateCompanyServiceComponentDto } from "@/app/types/company-service-component";
import { CompanyService } from "@/app/types/company-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Switch } from "../ui/switch";
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon";
import {
  Package,
  Hash,
  DollarSign,
  Layers,
  Link,
  AlertCircle
} from "lucide-react";

// Zod schema
const componentSchema = z.object({
  parent_company_service_id: z.number()
    .min(1, { message: "Parent service is required" }),

  component_company_service_id: z.number()
    .min(1, { message: "Component service is required" }),

  default_quantity: z.number()
    .min(0, { message: "Default quantity must be 0 or greater" })
    .optional()
    .nullable(),

  included_quantity: z.number()
    .min(0, { message: "Included quantity must be 0 or greater" })
    .optional()
    .nullable(),

  is_required: z.boolean(),
  is_optional: z.boolean(),
  is_included_in_parent_price: z.boolean(),
  is_client_billable: z.boolean(),

  default_selling_rate: z.string()
    .optional()
    .nullable()
    .refine(
  (val) =>
    val === undefined ||
    val === null ||
    val === '' ||
    /^\d+(\.\d{1,2})?$/.test(val),
  {
      message: "Please enter a valid amount",
    }),

  default_internal_cost: z.string()
    .optional()
    .nullable()
    .refine(
  (val) =>
    val === undefined ||
    val === null ||
    val === '' ||
    /^\d+(\.\d{1,2})?$/.test(val),
  {
      message: "Please enter a valid amount",
    }),

  additional_unit_rate: z.string()
    .optional()
    .nullable()
    .refine(
  (val) =>
    val === undefined ||
    val === null ||
    val === '' ||
    /^\d+(\.\d{1,2})?$/.test(val),
  {
      message: "Please enter a valid amount",
    }),

  sort_order: z.number()
    .min(0, { message: "Sort order must be a positive number" })
    .optional()
    .nullable(),

  is_active: z.boolean(),
  notes: z.string().optional().nullable(),
});

type ComponentFormData = z.infer<typeof componentSchema>;

interface CompanyServiceComponentEditFormProps {
  trigger: ReactNode;
  component: CompanyServiceComponent;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyServiceComponentEditForm({
  trigger,
  component,
  isOpen,
  onOpenChange,
  onSuccess
}: CompanyServiceComponentEditFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Redux states for dropdown data
  const { companyServices, packageServices } = useAppSelector((state) => state.companyService);

  // Search states for comboboxes
  const [parentSearch, setParentSearch] = useState("");
  const [componentSearch, setComponentSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ComponentFormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      parent_company_service_id: undefined,
      component_company_service_id: undefined,
      default_quantity: 1,
      included_quantity: 1,
      is_required: true,
      is_optional: false,
      is_included_in_parent_price: true,
      is_client_billable: false,
      default_selling_rate: "",
      default_internal_cost: "",
      additional_unit_rate: "",
      sort_order: 0,
      is_active: true,
      notes: "",
    },
    mode: "onBlur"
  });

  const formValues = watch();

  // Fetch package services when dialog opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCompanyServices({ page: 1, per_page: 100, is_package: true, is_active: true }));
      dispatch(fetchCompanyServices({ page: 1, per_page: 100, is_active: true }));
    }
  }, [isOpen, dispatch]);

  // Load component data when dialog opens
  useEffect(() => {
    if (isOpen && component?.id) {
      loadComponent();
    }
  }, [isOpen, component?.id]);

  const loadComponent = async () => {
    if (!component?.id) return;

    setIsFetching(true);
    try {
      const result = await dispatch(fetchCompanyServiceComponent(component.id));

      if (fetchCompanyServiceComponent.fulfilled.match(result)) {
        const data = result.payload.item;
        reset({
          parent_company_service_id: data.parent_company_service_id,
          component_company_service_id: data.component_company_service_id,
          default_quantity: data.default_quantity || 1,
          included_quantity: data.included_quantity || 1,
          is_required: data.is_required,
          is_optional: data.is_optional,
          is_included_in_parent_price: data.is_included_in_parent_price,
          is_client_billable: data.is_client_billable,
          default_selling_rate: data.default_selling_rate?.toString() || "",
          default_internal_cost: data.default_internal_cost?.toString() || "",
          additional_unit_rate: data.additional_unit_rate?.toString() || "",
          sort_order: data.sort_order || 0,
          is_active: data.is_active,
          notes: data.notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to load component:", error);
      SweetAlertService.error('Error', 'Failed to load component details');
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: ComponentFormData) => {
    if (!component?.id) return;

    setIsLoading(true);
    try {
      const submitData: UpdateCompanyServiceComponentDto = {
        parent_company_service_id: data.parent_company_service_id,
        component_company_service_id: data.component_company_service_id,
        default_quantity: data.default_quantity || 1,
        included_quantity: data.included_quantity || 1,
        is_required: data.is_required,
        is_optional: data.is_optional,
        is_included_in_parent_price: data.is_included_in_parent_price,
        is_client_billable: data.is_client_billable,
        default_selling_rate: data.default_selling_rate ? parseFloat(data.default_selling_rate) : null,
        default_internal_cost: data.default_internal_cost ? parseFloat(data.default_internal_cost) : null,
        additional_unit_rate: data.additional_unit_rate ? parseFloat(data.additional_unit_rate) : null,
        sort_order: data.sort_order || 0,
        is_active: data.is_active,
        notes: data.notes?.trim() || null,
      };

      const result = await dispatch(updateCompanyServiceComponent({
        id: component.id,
        data: submitData
      }));

      if (updateCompanyServiceComponent.fulfilled.match(result)) {
        SweetAlertService.success(
          'Component Updated',
          `Component has been updated successfully.`
        ).then(() => {
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update component. Please try again.";

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
        parent_company_service_id: component?.parent_company_service_id,
        component_company_service_id: component?.component_company_service_id,
        default_quantity: component?.default_quantity || 1,
        included_quantity: component?.included_quantity || 1,
        is_required: component?.is_required,
        is_optional: component?.is_optional,
        is_included_in_parent_price: component?.is_included_in_parent_price,
        is_client_billable: component?.is_client_billable,
        default_selling_rate: component?.default_selling_rate?.toString() || "",
        default_internal_cost: component?.default_internal_cost?.toString() || "",
        additional_unit_rate: component?.additional_unit_rate?.toString() || "",
        sort_order: component?.sort_order || 0,
        is_active: component?.is_active,
        notes: component?.notes || "",
      };

      const currentData = {
        parent_company_service_id: formValues.parent_company_service_id,
        component_company_service_id: formValues.component_company_service_id,
        default_quantity: formValues.default_quantity || 1,
        included_quantity: formValues.included_quantity || 1,
        is_required: formValues.is_required,
        is_optional: formValues.is_optional,
        is_included_in_parent_price: formValues.is_included_in_parent_price,
        is_client_billable: formValues.is_client_billable,
        default_selling_rate: formValues.default_selling_rate || "",
        default_internal_cost: formValues.default_internal_cost || "",
        additional_unit_rate: formValues.additional_unit_rate || "",
        sort_order: formValues.sort_order || 0,
        is_active: formValues.is_active,
        notes: formValues.notes || "",
      };

      const hasChanges =
        currentData.parent_company_service_id !== originalData.parent_company_service_id ||
        currentData.component_company_service_id !== originalData.component_company_service_id ||
        currentData.default_quantity !== originalData.default_quantity ||
        currentData.included_quantity !== originalData.included_quantity ||
        currentData.is_required !== originalData.is_required ||
        currentData.is_optional !== originalData.is_optional ||
        currentData.is_included_in_parent_price !== originalData.is_included_in_parent_price ||
        currentData.is_client_billable !== originalData.is_client_billable ||
        currentData.default_selling_rate !== originalData.default_selling_rate ||
        currentData.default_internal_cost !== originalData.default_internal_cost ||
        currentData.additional_unit_rate !== originalData.additional_unit_rate ||
        currentData.sort_order !== originalData.sort_order ||
        currentData.is_active !== originalData.is_active ||
        currentData.notes !== originalData.notes;

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

      <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Edit Component</span>
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading component details...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Parent Service */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Parent Package *
              </Label>
              <SearchableDropdownWithIcon
                value={formValues.parent_company_service_id || ""}
                onValueChange={(value) => {
                  setValue("parent_company_service_id", Number(value), { shouldValidate: true });
                }}
                options={packageServices.map((service: CompanyService) => ({
                  value: service.id,
                  label: `${service.name} (${service.code})`,
                  ...service
                }))}
                onSearch={(search) => {
                  setParentSearch(search);
                  dispatch(fetchCompanyServices({
                    page: 1,
                    per_page: 10,
                    is_package: true,
                    search: search,
                    is_active: true
                  }));
                }}
                placeholder="Select package service"
                disabled={isLoading || isFetching}
                emptyMessage={parentSearch ? "No packages found" : "No packages available"}
                searchPlaceholder="Search packages..."
                icon={Package}
                iconPosition="left"
              />
              {errors.parent_company_service_id && (
                <p className="text-sm text-red-500 mt-1">{errors.parent_company_service_id.message}</p>
              )}
            </div>

            {/* Component Service */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Component Service *
              </Label>
              <SearchableDropdownWithIcon
                value={formValues.component_company_service_id || ""}
                onValueChange={(value) => {
                  setValue("component_company_service_id", Number(value), { shouldValidate: true });
                }}
                options={companyServices
                  .filter(s => s.id !== formValues.parent_company_service_id)
                  .map((service: CompanyService) => ({
                    value: service.id,
                    label: `${service.name} (${service.code})`,
                    ...service
                  }))}
                onSearch={(search) => {
                  setComponentSearch(search);
                  dispatch(fetchCompanyServices({
                    page: 1,
                    per_page: 10,
                    search: search,
                    is_active: true
                  }));
                }}
                placeholder="Select component service"
                disabled={isLoading || isFetching || !formValues.parent_company_service_id}
                emptyMessage={componentSearch ? "No services found" : "No services available"}
                searchPlaceholder="Search services..."
                icon={Hash}
                iconPosition="left"
              />
              {errors.component_company_service_id && (
                <p className="text-sm text-red-500 mt-1">{errors.component_company_service_id.message}</p>
              )}
            </div>

            {/* Quantities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <FloatingLabelInput
                  label="Default Quantity"
                  type="number"
                  min="0"
                  {...register("default_quantity", { valueAsNumber: true })}
                  error={errors.default_quantity?.message}
                  disabled={isLoading || isFetching}
                  placeholder="1"
                />
              </div>
              <div className="w-full">
                <FloatingLabelInput
                  label="Included Quantity"
                  type="number"
                  min="0"
                  {...register("included_quantity", { valueAsNumber: true })}
                  error={errors.included_quantity?.message}
                  disabled={isLoading || isFetching}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="is_required"
                  checked={formValues.is_required}
                  onCheckedChange={(checked) => {
                    setValue("is_required", checked);
                    if (checked) setValue("is_optional", false);
                  }}
                  disabled={isLoading || isFetching}
                />
                <Label htmlFor="is_required" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Required
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_optional"
                  checked={formValues.is_optional}
                  onCheckedChange={(checked) => {
                    setValue("is_optional", checked);
                    if (checked) setValue("is_required", false);
                  }}
                  disabled={isLoading || isFetching}
                />
                <Label htmlFor="is_optional" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Optional
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_included_in_parent_price"
                  checked={formValues.is_included_in_parent_price}
                  onCheckedChange={(checked) => setValue("is_included_in_parent_price", checked)}
                  disabled={isLoading || isFetching}
                />
                <Label htmlFor="is_included_in_parent_price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Included in Parent Price
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_client_billable"
                  checked={formValues.is_client_billable}
                  onCheckedChange={(checked) => setValue("is_client_billable", checked)}
                  disabled={isLoading || isFetching}
                />
                <Label htmlFor="is_client_billable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Billable
                </Label>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="w-full">
                <FloatingLabelInput
                  label="Default Selling Rate"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("default_selling_rate")}
                  error={errors.default_selling_rate?.message}
                  disabled={isLoading || isFetching}
                  placeholder="0.00"
                />
              </div>
              <div className="w-full">
                <FloatingLabelInput
                  label="Default Internal Cost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("default_internal_cost")}
                  error={errors.default_internal_cost?.message}
                  disabled={isLoading || isFetching}
                  placeholder="0.00"
                />
              </div>
              <div className="w-full">
                <FloatingLabelInput
                  label="Additional Unit Rate"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("additional_unit_rate")}
                  error={errors.additional_unit_rate?.message}
                  disabled={isLoading || isFetching}
                  placeholder="0.00"
                />
              </div>
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

            {/* Notes */}
            <div className="w-full">
              <FloatingLabelTextarea
                label="Notes (Optional)"
                rows={2}
                {...register("notes")}
                disabled={isLoading || isFetching}
                className="resize-none"
                placeholder="Internal notes about this component..."
              />
            </div>

            {/* Footer Actions */}
            <DialogActionFooter
              cancelText="Cancel"
              submitText="Update Component"
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
