// components/company-service/company-service-create-form.tsx
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
import { createCompanyService } from "@/store/slices/company-service.slice";
import { fetchCompanyServiceCategories } from "@/store/slices/company-service-category.slice";
import { fetchCompanyServiceUnitTypes } from "@/store/slices/company-service-unit-type.slice";
import { fetchCompanyServiceBillingMethods } from "@/store/slices/company-service-billing-method.slice";
import { CreateCompanyServiceDto } from "@/app/types/company-service";
import { CompanyServiceCategory } from "@/app/types/company-service-category";
import { CompanyServiceUnitType } from "@/app/types/company-service-unit-type";
import { CompanyServiceBillingMethod } from "@/app/types/company-service-billing-method";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Switch } from "../ui/switch";
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon";
import {
  Tag,
  Ruler,
  CreditCard,
  Package,
  Hash,
  DollarSign,
  Shield,
  Users,
  Clock,
  Calendar,
  Building,
  FileText,
  CheckSquare,
  AlertCircle
} from "lucide-react";

// Zod schema
const serviceSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .max(200, { message: "Name must be less than 200 characters" }),

  code: z.string()
    .min(1, { message: "Code is required" })
    .max(50, { message: "Code must be less than 50 characters" })
    .regex(/^[a-z0-9_]+$/, { message: "Code must contain only lowercase letters, numbers, and underscores" }),

  company_service_category_id: z.number()
    .min(1, { message: "Category is required" }),

  company_service_unit_type_id: z.number()
    .min(1, { message: "Unit type is required" }),

  company_service_billing_method_id: z.number()
    .min(1, { message: "Billing method is required" }),

  currency_id: z.number().optional().nullable(),

  guard_type_id: z.number().optional().nullable(),

  service_type: z.enum(['standalone', 'package', 'component']),

  description: z.string().optional().nullable(),

  default_selling_rate: z.string()
    .optional()
    .nullable()
    .refine((val) => val === null || val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Please enter a valid amount",
    }),

  default_internal_cost: z.string()
    .optional()
    .nullable()
    .refine((val) => val === null || val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Please enter a valid amount",
    }),

  minimum_quantity: z.number()
    .min(0, { message: "Minimum quantity must be 0 or greater" })
    .optional()
    .nullable(),

  default_quantity: z.number()
    .min(0, { message: "Default quantity must be 0 or greater" })
    .optional()
    .nullable(),

  is_package: z.boolean(),
  is_active: z.boolean(),
  is_sellable: z.boolean(),
  is_component: z.boolean(),
  requires_guard: z.boolean(),
  requires_shift: z.boolean(),
  requires_attendance: z.boolean(),
  requires_asset: z.boolean(),
  sort_order: z.number()
    .min(0, { message: "Sort order must be a positive number" })
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface CompanyServiceCreateFormProps {
  trigger: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyServiceCreateForm({
  trigger,
  isOpen,
  onOpenChange,
  onSuccess
}: CompanyServiceCreateFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Redux states for dropdown data
  const { companyServiceCategories } = useAppSelector((state) => state.companyServiceCategory);
  const { companyServiceUnitTypes } = useAppSelector((state) => state.companyServiceUnitType);
  const { companyServiceBillingMethods } = useAppSelector((state) => state.companyServiceBillingMethod);

  // Search states for comboboxes
  const [categorySearch, setCategorySearch] = useState("");
  const [unitTypeSearch, setUnitTypeSearch] = useState("");
  const [billingMethodSearch, setBillingMethodSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      code: "",
      company_service_category_id: undefined,
      company_service_unit_type_id: undefined,
      company_service_billing_method_id: undefined,
      currency_id: 1,
      guard_type_id: null,
      service_type: "standalone",
      description: "",
      default_selling_rate: "",
      default_internal_cost: "",
      minimum_quantity: 1,
      default_quantity: 1,
      is_package: false,
      is_active: true,
      is_sellable: true,
      is_component: false,
      requires_guard: false,
      requires_shift: false,
      requires_attendance: false,
      requires_asset: false,
      sort_order: 0,
      notes: "",
    },
    mode: "onBlur"
  });

  const formValues = watch();

  // Fetch dropdown data when dialog opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCompanyServiceCategories({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchCompanyServiceUnitTypes({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchCompanyServiceBillingMethods({ page: 1, per_page: 100, is_active: true }));
    }
  }, [isOpen, dispatch]);

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

  // Update is_package based on service_type
  useEffect(() => {
    setValue('is_package', formValues.service_type === 'package');
  }, [formValues.service_type, setValue]);

  // Fetch categories when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (categorySearch.trim() || categorySearch === "") {
        dispatch(fetchCompanyServiceCategories({
          page: 1,
          per_page: 10,
          search: categorySearch.trim(),
          is_active: true
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [categorySearch, dispatch]);

  // Fetch unit types when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (unitTypeSearch.trim() || unitTypeSearch === "") {
        dispatch(fetchCompanyServiceUnitTypes({
          page: 1,
          per_page: 10,
          search: unitTypeSearch.trim(),
          is_active: true
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [unitTypeSearch, dispatch]);

  // Fetch billing methods when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (billingMethodSearch.trim() || billingMethodSearch === "") {
        dispatch(fetchCompanyServiceBillingMethods({
          page: 1,
          per_page: 10,
          search: billingMethodSearch.trim(),
          is_active: true
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [billingMethodSearch, dispatch]);

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    try {
      const submitData: CreateCompanyServiceDto = {
        name: data.name.trim(),
        code: data.code.trim().toLowerCase(),
        company_service_category_id: data.company_service_category_id,
        company_service_unit_type_id: data.company_service_unit_type_id,
        company_service_billing_method_id: data.company_service_billing_method_id,
        currency_id: data.currency_id || 1,
        guard_type_id: data.guard_type_id || null,
        service_type: data.service_type,
        service_kind: data.service_type,
        description: data.description?.trim() || null,
        default_selling_rate: data.default_selling_rate ? parseFloat(data.default_selling_rate) : null,
        default_internal_cost: data.default_internal_cost ? parseFloat(data.default_internal_cost) : null,
        minimum_quantity: data.minimum_quantity || 1,
        default_quantity: data.default_quantity || 1,
        is_package: data.service_type === 'package',
        is_active: data.is_active,
        is_sellable: data.is_sellable,
        is_component: data.is_component,
        requires_guard: data.requires_guard,
        requires_shift: data.requires_shift,
        requires_attendance: data.requires_attendance,
        requires_asset: data.requires_asset,
        sort_order: data.sort_order || 0,
        notes: data.notes?.trim() || null,
      };

      const result = await dispatch(createCompanyService(submitData));

      if (createCompanyService.fulfilled.match(result)) {
        SweetAlertService.success(
          'Service Created',
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
      let errorMessage = "Failed to create service. Please try again.";

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

      <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Add New Service</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name and Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <FloatingLabelInput
                label="Service Name *"
                {...register("name")}
                error={errors.name?.message}
                disabled={isLoading}
                placeholder="e.g., Motorcycle Patrol Service"
              />
            </div>
            <div className="w-full">
              <FloatingLabelInput
                label="Service Code *"
                {...register("code")}
                error={errors.code?.message}
                disabled={isLoading}
                placeholder="e.g., motorcycle_patrol_service"
                // helperText="Auto-generated from name"
              />
            </div>
          </div>

          {/* Category, Unit Type, Billing Method */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category *
              </Label>
              <SearchableDropdownWithIcon
                value={formValues.company_service_category_id || ""}
                onValueChange={(value) => {
                  setValue("company_service_category_id", Number(value), { shouldValidate: true });
                }}
                options={companyServiceCategories.map((cat: CompanyServiceCategory) => ({
                  value: cat.id,
                  label: cat.name,
                  ...cat
                }))}
                onSearch={(search) => {
                  setCategorySearch(search);
                  dispatch(fetchCompanyServiceCategories({
                    page: 1,
                    per_page: 10,
                    search: search,
                    is_active: true
                  }));
                }}
                placeholder="Select category"
                disabled={isLoading}
                emptyMessage={categorySearch ? "No categories found" : "No categories available"}
                searchPlaceholder="Search categories..."
                icon={Tag}
                iconPosition="left"
              />
              {errors.company_service_category_id && (
                <p className="text-sm text-red-500 mt-1">{errors.company_service_category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Unit Type *
              </Label>
              <SearchableDropdownWithIcon
                value={formValues.company_service_unit_type_id || ""}
                onValueChange={(value) => {
                  setValue("company_service_unit_type_id", Number(value), { shouldValidate: true });
                }}
                options={companyServiceUnitTypes.map((unit: CompanyServiceUnitType) => ({
                  value: unit.id,
                  label: unit.name,
                  ...unit
                }))}
                onSearch={(search) => {
                  setUnitTypeSearch(search);
                  dispatch(fetchCompanyServiceUnitTypes({
                    page: 1,
                    per_page: 10,
                    search: search,
                    is_active: true
                  }));
                }}
                placeholder="Select unit type"
                disabled={isLoading}
                emptyMessage={unitTypeSearch ? "No unit types found" : "No unit types available"}
                searchPlaceholder="Search unit types..."
                icon={Ruler}
                iconPosition="left"
              />
              {errors.company_service_unit_type_id && (
                <p className="text-sm text-red-500 mt-1">{errors.company_service_unit_type_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Billing Method *
              </Label>
              <SearchableDropdownWithIcon
                value={formValues.company_service_billing_method_id || ""}
                onValueChange={(value) => {
                  setValue("company_service_billing_method_id", Number(value), { shouldValidate: true });
                }}
                options={companyServiceBillingMethods.map((method: CompanyServiceBillingMethod) => ({
                  value: method.id,
                  label: method.name,
                  ...method
                }))}
                onSearch={(search) => {
                  setBillingMethodSearch(search);
                  dispatch(fetchCompanyServiceBillingMethods({
                    page: 1,
                    per_page: 10,
                    search: search,
                    is_active: true
                  }));
                }}
                placeholder="Select billing method"
                disabled={isLoading}
                emptyMessage={billingMethodSearch ? "No billing methods found" : "No billing methods available"}
                searchPlaceholder="Search billing methods..."
                icon={CreditCard}
                iconPosition="left"
              />
              {errors.company_service_billing_method_id && (
                <p className="text-sm text-red-500 mt-1">{errors.company_service_billing_method_id.message}</p>
              )}
            </div>
          </div>

          {/* Service Type */}
          <div className="w-full">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Service Type *
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={formValues.service_type === 'standalone' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setValue('service_type', 'standalone')}
                disabled={isLoading}
              >
                <Package className="h-4 w-4 mr-2" />
                Standalone
              </Button>
              <Button
                type="button"
                variant={formValues.service_type === 'package' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setValue('service_type', 'package')}
                disabled={isLoading}
              >
                <Package className="h-4 w-4 mr-2" />
                Package
              </Button>
              <Button
                type="button"
                variant={formValues.service_type === 'component' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setValue('service_type', 'component')}
                disabled={isLoading}
              >
                <Hash className="h-4 w-4 mr-2" />
                Component
              </Button>
            </div>
            {errors.service_type && (
              <p className="text-sm text-red-500 mt-1">{errors.service_type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="w-full">
            <FloatingLabelTextarea
              label="Description"
              rows={3}
              {...register("description")}
              disabled={isLoading}
              className="resize-none"
              placeholder="Enter service description..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <FloatingLabelInput
                label="Default Selling Rate"
                type="number"
                step="0.01"
                min="0"
                {...register("default_selling_rate")}
                error={errors.default_selling_rate?.message}
                disabled={isLoading}
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
                disabled={isLoading}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <FloatingLabelInput
                label="Minimum Quantity"
                type="number"
                min="0"
                {...register("minimum_quantity", { valueAsNumber: true })}
                error={errors.minimum_quantity?.message}
                disabled={isLoading}
                placeholder="1"
              />
            </div>
            <div className="w-full">
              <FloatingLabelInput
                label="Default Quantity"
                type="number"
                min="0"
                {...register("default_quantity", { valueAsNumber: true })}
                error={errors.default_quantity?.message}
                disabled={isLoading}
                placeholder="1"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Switch
                id="is_sellable"
                checked={formValues.is_sellable}
                onCheckedChange={(checked) => setValue("is_sellable", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="is_sellable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sellable
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="is_component"
                checked={formValues.is_component}
                onCheckedChange={(checked) => setValue("is_component", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="is_component" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Component
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="requires_guard"
                checked={formValues.requires_guard}
                onCheckedChange={(checked) => setValue("requires_guard", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="requires_guard" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Requires Guard
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="requires_shift"
                checked={formValues.requires_shift}
                onCheckedChange={(checked) => setValue("requires_shift", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="requires_shift" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Requires Shift
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="requires_attendance"
                checked={formValues.requires_attendance}
                onCheckedChange={(checked) => setValue("requires_attendance", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="requires_attendance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Requires Attendance
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="requires_asset"
                checked={formValues.requires_asset}
                onCheckedChange={(checked) => setValue("requires_asset", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="requires_asset" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Requires Asset
              </Label>
            </div>
          </div>

          {/* Sort Order, Status */}
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

          {/* Notes */}
          <div className="w-full">
            <FloatingLabelTextarea
              label="Notes (Optional)"
              rows={2}
              {...register("notes")}
              disabled={isLoading}
              className="resize-none"
              placeholder="Internal notes about this service..."
            />
          </div>

          {/* Footer Actions */}
          <DialogActionFooter
            cancelText="Cancel"
            submitText="Create Service"
            isSubmitting={isLoading}
            submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onSubmit={handleSubmit(onSubmit)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
