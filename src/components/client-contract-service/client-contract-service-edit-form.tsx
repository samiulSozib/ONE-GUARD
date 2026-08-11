// components/client-contract-service/client-contract-service-edit-form.tsx
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
  updateClientContractService,
  fetchClientContractService,
} from "@/store/slices/client-contract-service.slice";
import { fetchCompanyServices } from "@/store/slices/company-service.slice";
import { fetchSites } from "@/store/slices/siteSlice";
import { fetchSiteLocations } from "@/store/slices/siteLocationSlice";
import { fetchCompanyServiceBillingMethods } from "@/store/slices/company-service-billing-method.slice";
import { ClientContractService, UpdateClientContractServiceDto } from "@/app/types/client-contract-service";
import { CompanyService } from "@/app/types/company-service";
import { Site } from "@/app/types/site";
import { SiteLocation } from "@/app/types/siteLocation.types";
import { CompanyServiceBillingMethod } from "@/app/types/company-service-billing-method";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Switch } from "../ui/switch";
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon";
import {
  Building,
  Tag,
  CreditCard,
  DollarSign,
  Package,
  MapPin,
  Users,
  Percent,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Pricing types
const pricingTypes = [
  { value: "hourly", label: "Hourly" },
  { value: "quantity_rate", label: "Quantity Rate" },
  { value: "fixed", label: "Fixed" },
];

// Discount types
const discountTypes = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
];

// Zod schema
const contractServiceSchema = z.object({
  client_contract_site_id: z.number()
    .min(1, { message: "Contract site is required" }),

  company_service_id: z.number()
    .min(1, { message: "Company service is required" }),

  site_location_id: z.number()
    .optional()
    .nullable(),

  company_service_billing_method_id: z.number()
    .min(1, { message: "Billing method is required" }),

  currency_id: z.number()
    .min(1, { message: "Currency is required" }),

  pricing_type: z.string()
    .min(1, { message: "Pricing type is required" }),

  quantity: z.number()
    .min(1, { message: "Quantity must be at least 1" }),

  selling_rate: z.string()
    .min(1, { message: "Selling rate is required" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount" }),

  internal_cost: z.string()
    .min(1, { message: "Internal cost is required" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount" }),

  fixed_amount: z.string()
    .optional()
    .nullable()
       .refine(
  (val) =>
    val === undefined ||
    val === null ||
    val === '' ||
    /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Please enter a valid amount",
    }),

  minimum_billable_quantity: z.number()
    .min(0, { message: "Minimum billable quantity must be 0 or greater" })
    .optional()
    .nullable(),

  overtime_rate: z.string()
    .optional()
    .nullable()
       .refine(
  (val) =>
    val === undefined ||
    val === null ||
    val === '' ||
    /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Please enter a valid amount",
    }),

  holiday_rate: z.string()
    .optional()
    .nullable()
       .refine(
  (val) =>
    val === undefined ||
    val === null ||
    val === '' ||
    /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Please enter a valid amount",
    }),

  night_rate: z.string()
    .optional()
    .nullable()
       .refine(
  (val) =>
    val === undefined ||
    val === null ||
    val === '' ||
    /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Please enter a valid amount",
    }),

  discount_type: z.string()
    .optional()
    .nullable(),

  discount_value: z.string()
    .optional()
    .nullable()
    .refine((val) => val === null || val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Please enter a valid amount",
    }),

  requires_attendance: z.boolean(),
  is_active: z.boolean(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type ContractServiceFormData = z.infer<typeof contractServiceSchema>;

interface ClientContractServiceEditFormProps {
  trigger: ReactNode;
  item: ClientContractService;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ClientContractServiceEditForm({
  trigger,
  item,
  isOpen,
  onOpenChange,
  onSuccess
}: ClientContractServiceEditFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Redux states for dropdown data
  const { companyServices } = useAppSelector((state) => state.companyService);
  const { sites } = useAppSelector((state) => state.site);
  const { siteLocations } = useAppSelector((state) => state.siteLocation);
  const { companyServiceBillingMethods } = useAppSelector((state) => state.companyServiceBillingMethod);

  // Search states for comboboxes
  const [serviceSearch, setServiceSearch] = useState("");
  const [siteSearch, setSiteSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [billingMethodSearch, setBillingMethodSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ContractServiceFormData>({
    resolver: zodResolver(contractServiceSchema),
    defaultValues: {
      client_contract_site_id: undefined,
      company_service_id: undefined,
      site_location_id: null,
      company_service_billing_method_id: undefined,
      currency_id: 1,
      pricing_type: "hourly",
      quantity: 1,
      selling_rate: "",
      internal_cost: "",
      fixed_amount: null,
      minimum_billable_quantity: 1,
      overtime_rate: null,
      holiday_rate: null,
      night_rate: null,
      discount_type: null,
      discount_value: null,
      requires_attendance: false,
      is_active: true,
      start_date: null,
      end_date: null,
      notes: "",
    },
    mode: "onBlur"
  });

  const formValues = watch();

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen && item?.id) {
      loadItem();
    }
  }, [isOpen, item?.id]);

  // Fetch dropdown data when dialog opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCompanyServices({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchCompanyServiceBillingMethods({ page: 1, per_page: 100, is_active: true }));
    }
  }, [isOpen, dispatch]);

  // Search effects
  useEffect(() => {
    const timer = setTimeout(() => {
      if (serviceSearch.trim() || serviceSearch === "") {
        dispatch(fetchCompanyServices({
          page: 1,
          per_page: 10,
          is_active: true,
          search: serviceSearch.trim()
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceSearch, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (siteSearch.trim() || siteSearch === "") {
        dispatch(fetchSites({
          page: 1,
          per_page: 10,
          is_active: true,
          search: siteSearch.trim()
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [siteSearch, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (billingMethodSearch.trim() || billingMethodSearch === "") {
        dispatch(fetchCompanyServiceBillingMethods({
          page: 1,
          per_page: 10,
          is_active: true,
          search: billingMethodSearch.trim()
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [billingMethodSearch, dispatch]);

  const loadItem = async () => {
    if (!item?.id) return;

    setIsFetching(true);
    try {
      const result = await dispatch(fetchClientContractService(item.id));

      if (fetchClientContractService.fulfilled.match(result)) {
        const data = result.payload.item;
        reset({
          client_contract_site_id: data.client_contract_site_id,
          company_service_id: data.company_service_id,
          site_location_id: data.site_location_id || null,
          company_service_billing_method_id: data.company_service_billing_method_id,
          currency_id: data.currency_id || 1,
          pricing_type: data.pricing_type || "hourly",
          quantity: data.quantity || 1,
          selling_rate: data.selling_rate?.toString() || "",
          internal_cost: data.internal_cost?.toString() || "",
          fixed_amount: data.fixed_amount?.toString() || null,
          minimum_billable_quantity: data.minimum_billable_quantity || null,
          overtime_rate: data.overtime_rate?.toString() || null,
          holiday_rate: data.holiday_rate?.toString() || null,
          night_rate: data.night_rate?.toString() || null,
          discount_type: data.discount_type || null,
          discount_value: data.discount_value?.toString() || null,
          requires_attendance: data.requires_attendance || false,
          is_active: data.is_active,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          notes: data.notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to load contract service:", error);
      SweetAlertService.error('Error', 'Failed to load contract service details');
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: ContractServiceFormData) => {
    if (!item?.id) return;

    setIsLoading(true);
    try {
      const submitData: UpdateClientContractServiceDto = {
        client_contract_site_id: data.client_contract_site_id,
        company_service_id: data.company_service_id,
        site_location_id: data.site_location_id || null,
        company_service_billing_method_id: data.company_service_billing_method_id,
        currency_id: data.currency_id || 1,
        pricing_type: data.pricing_type,
        quantity: data.quantity,
        selling_rate: parseFloat(data.selling_rate),
        internal_cost: parseFloat(data.internal_cost),
        fixed_amount: data.fixed_amount ? parseFloat(data.fixed_amount) : null,
        minimum_billable_quantity: data.minimum_billable_quantity || null,
        overtime_rate: data.overtime_rate ? parseFloat(data.overtime_rate) : null,
        holiday_rate: data.holiday_rate ? parseFloat(data.holiday_rate) : null,
        night_rate: data.night_rate ? parseFloat(data.night_rate) : null,
        discount_type: data.discount_type as any || null,
        discount_value: data.discount_value ? parseFloat(data.discount_value) : null,
        requires_attendance: data.requires_attendance,
        is_active: data.is_active,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        notes: data.notes?.trim() || null,
      };

      const result = await dispatch(updateClientContractService({
        id: item.id,
        data: submitData
      }));

      if (updateClientContractService.fulfilled.match(result)) {
        SweetAlertService.success(
          'Contract Service Updated',
          `Contract service has been updated successfully.`
        ).then(() => {
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update contract service. Please try again.";

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
        client_contract_site_id: item?.client_contract_site_id,
        company_service_id: item?.company_service_id,
        site_location_id: item?.site_location_id || null,
        company_service_billing_method_id: item?.company_service_billing_method_id,
        currency_id: item?.currency_id || 1,
        pricing_type: item?.pricing_type || "hourly",
        quantity: item?.quantity || 1,
        selling_rate: item?.selling_rate?.toString() || "",
        internal_cost: item?.internal_cost?.toString() || "",
        fixed_amount: item?.fixed_amount?.toString() || null,
        minimum_billable_quantity: item?.minimum_billable_quantity || null,
        overtime_rate: item?.overtime_rate?.toString() || null,
        holiday_rate: item?.holiday_rate?.toString() || null,
        night_rate: item?.night_rate?.toString() || null,
        discount_type: item?.discount_type || null,
        discount_value: item?.discount_value?.toString() || null,
        requires_attendance: item?.requires_attendance || false,
        is_active: item?.is_active,
        start_date: item?.start_date || null,
        end_date: item?.end_date || null,
        notes: item?.notes || "",
      };

      const currentData = {
        client_contract_site_id: formValues.client_contract_site_id,
        company_service_id: formValues.company_service_id,
        site_location_id: formValues.site_location_id || null,
        company_service_billing_method_id: formValues.company_service_billing_method_id,
        currency_id: formValues.currency_id || 1,
        pricing_type: formValues.pricing_type,
        quantity: formValues.quantity,
        selling_rate: formValues.selling_rate,
        internal_cost: formValues.internal_cost,
        fixed_amount: formValues.fixed_amount || null,
        minimum_billable_quantity: formValues.minimum_billable_quantity || null,
        overtime_rate: formValues.overtime_rate || null,
        holiday_rate: formValues.holiday_rate || null,
        night_rate: formValues.night_rate || null,
        discount_type: formValues.discount_type || null,
        discount_value: formValues.discount_value || null,
        requires_attendance: formValues.requires_attendance,
        is_active: formValues.is_active,
        start_date: formValues.start_date || null,
        end_date: formValues.end_date || null,
        notes: formValues.notes || "",
      };

      const hasChanges = JSON.stringify(originalData) !== JSON.stringify(currentData);

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

      <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Edit Contract Service</span>
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading contract service details...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Service *
                </Label>
                <SearchableDropdownWithIcon
                  value={formValues.company_service_id || ""}
                  onValueChange={(value) => {
                    setValue("company_service_id", Number(value), { shouldValidate: true });
                  }}
                  options={companyServices.map((service: CompanyService) => ({
                    value: service.id,
                    label: `${service.name} (${service.code})`,
                    ...service
                  }))}
                  onSearch={(search) => {
                    setServiceSearch(search);
                    dispatch(fetchCompanyServices({
                      page: 1,
                      per_page: 10,
                      is_active: true,
                      search: search
                    }));
                  }}
                  placeholder="Select service"
                  disabled={isLoading || isFetching}
                  emptyMessage={serviceSearch ? "No services found" : "No services available"}
                  searchPlaceholder="Search services..."
                  icon={Package}
                  iconPosition="left"
                />
                {errors.company_service_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.company_service_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contract Site *
                </Label>
                <SearchableDropdownWithIcon
                  value={formValues.client_contract_site_id || ""}
                  onValueChange={(value) => {
                    setValue("client_contract_site_id", Number(value), { shouldValidate: true });
                  }}
                  options={sites.map((site: Site) => ({
                    value: site.id,
                    label: site.site_name || site.title || `Site ${site.id}`,
                    ...site
                  }))}
                  onSearch={(search) => {
                    setSiteSearch(search);
                    dispatch(fetchSites({
                      page: 1,
                      per_page: 10,
                      is_active: true,
                      search: search
                    }));
                  }}
                  placeholder="Select contract site"
                  disabled={isLoading || isFetching}
                  emptyMessage={siteSearch ? "No sites found" : "No sites available"}
                  searchPlaceholder="Search sites..."
                  icon={Building}
                  iconPosition="left"
                />
                {errors.client_contract_site_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.client_contract_site_id.message}</p>
                )}
              </div>
            </div>

            {/* Billing Method & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      is_active: true,
                      search: search
                    }));
                  }}
                  placeholder="Select billing method"
                  disabled={isLoading || isFetching}
                  emptyMessage={billingMethodSearch ? "No billing methods found" : "No billing methods available"}
                  searchPlaceholder="Search billing methods..."
                  icon={CreditCard}
                  iconPosition="left"
                />
                {errors.company_service_billing_method_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.company_service_billing_method_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency
                </Label>
                <SearchableDropdownWithIcon
                  value={formValues.currency_id || ""}
                  onValueChange={(value) => {
                    setValue("currency_id", Number(value), { shouldValidate: true });
                  }}
                  options={[
                    { value: 1, label: "USD - US Dollar" },
                    { value: 2, label: "EUR - Euro" },
                    { value: 3, label: "GBP - British Pound" },
                  ]}
                  placeholder="Select currency"
                  disabled={isLoading || isFetching}
                  icon={DollarSign}
                  iconPosition="left"
                />
                {errors.currency_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.currency_id.message}</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pricing Type *
                </Label>
                <Select
                  value={formValues.pricing_type}
                  onValueChange={(value) => setValue("pricing_type", value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pricing_type && (
                  <p className="text-sm text-red-500 mt-1">{errors.pricing_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <FloatingLabelInput
                  label="Quantity *"
                  type="number"
                  min="1"
                  {...register("quantity", { valueAsNumber: true })}
                  error={errors.quantity?.message}
                  disabled={isLoading || isFetching}
                />
              </div>

              <div className="space-y-2">
                <FloatingLabelInput
                  label="Minimum Billable Quantity"
                  type="number"
                  min="0"
                  {...register("minimum_billable_quantity", { valueAsNumber: true })}
                  error={errors.minimum_billable_quantity?.message}
                  disabled={isLoading || isFetching}
                />
              </div>
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Selling Rate *"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("selling_rate")}
                  error={errors.selling_rate?.message}
                  disabled={isLoading || isFetching}
                />
              </div>
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Internal Cost *"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("internal_cost")}
                  error={errors.internal_cost?.message}
                  disabled={isLoading || isFetching}
                />
              </div>
            </div>

            {/* Fixed Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Fixed Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("fixed_amount")}
                  error={errors.fixed_amount?.message}
                  disabled={isLoading || isFetching}
                />
              </div>
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Overtime Rate"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("overtime_rate")}
                  error={errors.overtime_rate?.message}
                  disabled={isLoading || isFetching}
                />
              </div>
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Holiday Rate"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("holiday_rate")}
                  error={errors.holiday_rate?.message}
                  disabled={isLoading || isFetching}
                />
              </div>
            </div>



{/* Discount & Night Rate */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Discount Type
    </Label>
    <Select
      value={formValues.discount_type || "none"}
      onValueChange={(value) => {
        if (value === "none") {
          setValue("discount_type", null, { shouldValidate: true });
        } else {
          setValue("discount_type", value, { shouldValidate: true });
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select discount type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None</SelectItem>
        {discountTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <div className="space-y-2">
    <FloatingLabelInput
      label="Discount Value"
      type="number"
      step="0.01"
      min="0"
      {...register("discount_value")}
      error={errors.discount_value?.message}
      disabled={isLoading || isFetching}
    />
  </div>

  <div className="space-y-2">
    <FloatingLabelInput
      label="Night Rate"
      type="number"
      step="0.01"
      min="0"
      {...register("night_rate")}
      error={errors.night_rate?.message}
      disabled={isLoading || isFetching}
    />
  </div>
</div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Start Date"
                  type="date"
                  {...register("start_date")}
                  error={errors.start_date?.message}
                  disabled={isLoading || isFetching}
                />
              </div>
              <div className="space-y-2">
                <FloatingLabelInput
                  label="End Date"
                  type="date"
                  {...register("end_date")}
                  error={errors.end_date?.message}
                  disabled={isLoading || isFetching}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="w-full">
              <FloatingLabelTextarea
                label="Notes (Optional)"
                rows={3}
                {...register("notes")}
                disabled={isLoading || isFetching}
                className="resize-none"
                placeholder="Enter additional notes about this contract service..."
              />
            </div>

            {/* Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="requires_attendance"
                  checked={formValues.requires_attendance}
                  onCheckedChange={(checked) => setValue("requires_attendance", checked)}
                  disabled={isLoading || isFetching}
                />
                <Label htmlFor="requires_attendance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requires Attendance
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={formValues.is_active}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                  disabled={isLoading || isFetching}
                />
                <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </Label>
              </div>
            </div>

            {/* Footer Actions */}
            <DialogActionFooter
              cancelText="Cancel"
              submitText="Update Contract Service"
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
