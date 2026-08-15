// components/duty-schedule/duty-schedule-create-form.tsx
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
import { createDutySchedule } from "@/store/slices/duty-schedule.slice";
import { fetchSites } from "@/store/slices/siteSlice";
import { fetchSiteLocations } from "@/store/slices/siteLocationSlice";
import { fetchClientContractServices } from "@/store/slices/client-contract-service.slice";
import { CreateDutyScheduleDto } from "@/app/types/duty-schedule";
import { Site } from "@/app/types/site";
import { SiteLocation } from "@/app/types/siteLocation.types";
import { ClientContractService } from "@/app/types/client-contract-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Switch } from "../ui/switch";
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon";
import {
  Building,
  MapPin,
  Calendar,
  Clock,
  Users,
  Package,
  FileText,
  Repeat,
  AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Schedule types
const scheduleTypes = [
  { value: "one_time", label: "One Time" },
  { value: "recurring", label: "Recurring" },
];

// Recurrence frequencies
const recurrenceFrequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

// Weekdays
const weekdays = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

// Zod schema
const dutyScheduleSchema = z.object({
  site_id: z.number()
    .min(1, { message: "Site is required" }),

  site_location_id: z.number()
    .optional()
    .nullable(),

  client_contract_service_id: z.number()
    .optional()
    .nullable(),

  title: z.string()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be less than 200 characters" }),

  description: z.string().optional().nullable(),

  schedule_type: z.string()
    .min(1, { message: "Schedule type is required" }),

  start_date: z.string()
    .min(1, { message: "Start date is required" }),

  end_date: z.string()
    .optional()
    .nullable(),

  is_open_ended: z.boolean(),

  recurrence_frequency: z.string()
    .optional()
    .nullable(),

  recurrence_interval: z.number()
    .min(1, { message: "Interval must be at least 1" })
    .optional()
    .nullable(),

  recurrence_days: z.array(z.string())
    .optional()
    .nullable(),

  start_time: z.string()
    .min(1, { message: "Start time is required" }),

  end_time: z.string()
    .min(1, { message: "End time is required" }),

  guards_required: z.number()
    .min(1, { message: "At least 1 guard is required" })
    .max(50, { message: "Maximum 50 guards allowed" }),

  required_hours: z.number()
    .min(0.5, { message: "Minimum 0.5 hours required" })
    .max(24, { message: "Maximum 24 hours allowed" })
    .optional()
    .nullable(),

  status: z.string(),
  is_active: z.boolean(),
  notes: z.string().optional().nullable(),
});

type DutyScheduleFormData = z.infer<typeof dutyScheduleSchema>;

interface DutyScheduleCreateFormProps {
  trigger: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DutyScheduleCreateForm({
  trigger,
  isOpen,
  onOpenChange,
  onSuccess
}: DutyScheduleCreateFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);

  // Redux states
  const { sites } = useAppSelector((state) => state.site);
  const { siteLocations } = useAppSelector((state) => state.siteLocation);
  const { items: clientContractServices } = useAppSelector((state) => state.clientContractService);

  // Search states
  const [siteSearch, setSiteSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DutyScheduleFormData>({
    resolver: zodResolver(dutyScheduleSchema),
    defaultValues: {
      site_id: undefined,
      site_location_id: null,
      client_contract_service_id: null,
      title: "",
      description: "",
      schedule_type: "recurring",
      start_date: "",
      end_date: "",
      is_open_ended: false,
      recurrence_frequency: "daily",
      recurrence_interval: 1,
      recurrence_days: [],
      start_time: "08:00",
      end_time: "16:00",
      guards_required: 1,
      required_hours: 8,
      status: "active",
      is_active: true,
      notes: "",
    },
    mode: "onBlur"
  });

  const formValues = watch();

  // Fetch data when dialog opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }));
    }
  }, [isOpen, dispatch]);

  // Fetch locations when site is selected
  useEffect(() => {
    if (formValues.site_id) {
      dispatch(fetchSiteLocations({
        page: 1,
        per_page: 100,
        is_active: true,
        site_id: formValues.site_id
      }));
    }
  }, [formValues.site_id, dispatch]);

  // Fetch client contract services when site is selected
  useEffect(() => {
    if (formValues.site_id) {
      dispatch(fetchClientContractServices({
        page: 1,
        per_page: 100,
        is_active: true,
        client_contract_site_id: formValues.site_id
      }));
    } else {
      // Clear contract services when no site is selected
      // You might want to add a clear action in your slice
    }
  }, [formValues.site_id, dispatch]);

  // Search effects
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
      if (serviceSearch.trim() || serviceSearch === "") {
        dispatch(fetchClientContractServices({
          page: 1,
          per_page: 10,
          is_active: true,
          search: serviceSearch.trim(),
          client_contract_site_id: formValues.site_id
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceSearch, dispatch, formValues.site_id]);

  // Handle weekday toggle
  const toggleWeekday = (day: string) => {
    const current = selectedWeekdays;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    setSelectedWeekdays(updated);
    setValue("recurrence_days", updated, { shouldValidate: true });
  };

  // Auto-calculate required hours
  useEffect(() => {
    if (formValues.start_time && formValues.end_time) {
      const start = formValues.start_time.split(':').map(Number);
      const end = formValues.end_time.split(':').map(Number);
      let hours = end[0] - start[0];
      const minutes = end[1] - start[1];

      // Handle overnight shifts
      if (hours < 0 || (hours === 0 && minutes < 0)) {
        hours += 24;
      }

      const totalHours = hours + (minutes / 60);
      if (totalHours > 0) {
        setValue("required_hours", Math.round(totalHours * 100) / 100);
      }
    }
  }, [formValues.start_time, formValues.end_time, setValue]);

  const onSubmit = async (data: DutyScheduleFormData) => {
    setIsLoading(true);
    try {
      const submitData: CreateDutyScheduleDto = {
        site_id: data.site_id,
        site_location_id: data.site_location_id || null,
        client_contract_service_id: data.schedule_type === 'recurring' ? null : (data.client_contract_service_id || null),
        title: data.title.trim(),
        description: data.description?.trim() || null,
        schedule_type: data.schedule_type as 'one_time' | 'recurring',
        start_date: data.start_date,
        end_date: data.is_open_ended ? null : data.end_date || null,
        is_open_ended: data.is_open_ended,
        recurrence_frequency: data.schedule_type === 'recurring' ? (data.recurrence_frequency as any) : null,
        recurrence_interval: data.schedule_type === 'recurring' ? (data.recurrence_interval || 1) : null,
        recurrence_days: data.schedule_type === 'recurring' && data.recurrence_frequency === 'weekly'
          ? data.recurrence_days || []
          : null,
        start_time: data.start_time,
        end_time: data.end_time,
        guards_required: data.guards_required,
        required_hours: data.required_hours || 0,
        status: data.status,
        is_active: data.is_active,
        notes: data.notes?.trim() || null,
      };

      const result = await dispatch(createDutySchedule(submitData));

      if (createDutySchedule.fulfilled.match(result)) {
        SweetAlertService.success(
          'Schedule Created',
          `${data.title} has been created successfully.`
        ).then(() => {
          reset();
          setSelectedWeekdays([]);
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to create schedule. Please try again.";

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
      setSelectedWeekdays([]);
      onOpenChange?.(false);
    }
  };

  // Filter contract services by site ID
  const filteredContractServices = clientContractServices.filter(
    (service: ClientContractService) => service.client_contract_site_id === formValues.site_id
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Create Duty Schedule</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText className="h-4 w-4" />
              Basic Information
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Title *"
                  {...register("title")}
                  error={errors.title?.message}
                  disabled={isLoading}
                />
              </div>

            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Schedule Type *
                </Label>
                <Select
                  value={formValues.schedule_type}
                  onValueChange={(value) => {
                    setValue("schedule_type", value, { shouldValidate: true });
                    if (value === 'one_time') {
                      setValue("recurrence_frequency", null);
                      setValue("recurrence_interval", null);
                      setValue("recurrence_days", []);
                      setSelectedWeekdays([]);
                    }
                    if (value === 'recurring') {
                      setValue("client_contract_service_id", null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.schedule_type && (
                  <p className="text-sm text-red-500 mt-1">{errors.schedule_type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <FloatingLabelTextarea
                label="Description (Optional)"
                rows={2}
                {...register("description")}
                disabled={isLoading}
                className="resize-none"
                placeholder="Enter schedule description..."
              />
            </div>
          </div>

          {/* Location & Contract */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Building className="h-4 w-4" />
              Location & Contract
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Site *
                </Label>
                <SearchableDropdownWithIcon
                  value={formValues.site_id || ""}
                  onValueChange={(value) => {
                    setValue("site_id", Number(value), { shouldValidate: true });
                    setValue("site_location_id", null);
                    setValue("client_contract_service_id", null); // Clear contract service when site changes
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
                  placeholder="Select site"
                  disabled={isLoading}
                  emptyMessage={siteSearch ? "No sites found" : "No sites available"}
                  searchPlaceholder="Search sites..."
                  icon={Building}
                  iconPosition="left"
                />
                {errors.site_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.site_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Site Location (Optional)
                </Label>
                <SearchableDropdownWithIcon
                  value={formValues.site_location_id || ""}
                  onValueChange={(value) => {
                    setValue("site_location_id", Number(value), { shouldValidate: true });
                  }}
                  options={siteLocations.map((location: SiteLocation) => ({
                    value: location.id,
                    label: location.title,
                    ...location
                  }))}
                  onSearch={(search) => {
                    setLocationSearch(search);
                    if (formValues.site_id) {
                      dispatch(fetchSiteLocations({
                        page: 1,
                        per_page: 10,
                        is_active: true,
                        search: search,
                        site_id: formValues.site_id
                      }));
                    }
                  }}
                  placeholder={formValues.site_id ? "Select location" : "Select site first"}
                  disabled={isLoading || !formValues.site_id}
                  emptyMessage={
                    !formValues.site_id
                      ? "Select a site first"
                      : locationSearch
                        ? "No locations found"
                        : "No locations available"
                  }
                  searchPlaceholder="Search locations..."
                  icon={MapPin}
                  iconPosition="left"
                />
              </div>
            </div>

            {/* Contract Service - Hidden for recurring schedules */}
            {formValues.schedule_type !== 'recurring' && formValues.site_id && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contract Service (Optional)
                </Label>
                <SearchableDropdownWithIcon
                  value={formValues.client_contract_service_id || ""}
                  onValueChange={(value) => {
                    setValue("client_contract_service_id", Number(value), { shouldValidate: true });
                  }}
                  options={filteredContractServices.map((service: ClientContractService) => ({
                    value: service.id,
                    label: (service.company_service?.name || '') +
                           (service.pricing_type ? ` ${service.pricing_type}` : '') +
                           (service.billing_method?.name ? ` (${service.billing_method.name})` : '') ||
                           `Service ${service.id}`,
                    ...service
                  }))}
                  onSearch={(search) => {
                    setServiceSearch(search);
                    if (formValues.site_id) {
                      dispatch(fetchClientContractServices({
                        page: 1,
                        per_page: 10,
                        is_active: true,
                        search: search.trim(),
                        client_contract_site_id: formValues.site_id
                      }));
                    }
                  }}
                  placeholder={formValues.site_id ? "Select contract service" : "Select a site first"}
                  disabled={isLoading || !formValues.site_id}
                  emptyMessage={
                    !formValues.site_id
                      ? "Select a site first"
                      : serviceSearch
                        ? "No contract services found for this site"
                        : "No contract services available for this site"
                  }
                  searchPlaceholder="Search contract services..."
                  icon={Package}
                  iconPosition="left"
                />
              </div>
            )}

            {/* Show message when no site is selected */}
            {formValues.schedule_type !== 'recurring' && !formValues.site_id && (
              <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>Please select a site first to view available contract services</span>
              </div>
            )}
          </div>

          {/* Schedule Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              Schedule Details
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Start Date *"
                  type="date"
                  {...register("start_date")}
                  error={errors.start_date?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <FloatingLabelInput
                  label="End Date"
                  type="date"
                  {...register("end_date")}
                  error={errors.end_date?.message}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Switch
                id="is_open_ended"
                checked={formValues.is_open_ended}
                onCheckedChange={(checked) => {
                  setValue("is_open_ended", checked);
                  if (checked) {
                    setValue("end_date", null);
                  }
                }}
                disabled={isLoading}
              />
              <div>
                <Label htmlFor="is_open_ended" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Open Ended Schedule
                </Label>
                <p className="text-xs text-gray-500">Schedule continues indefinitely</p>
              </div>
            </div>
          </div>

          {/* Recurrence Settings */}
          {formValues.schedule_type === 'recurring' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Repeat className="h-4 w-4" />
                Recurrence Settings
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recurrence Frequency *
                  </Label>
                  <Select
                    value={formValues.recurrence_frequency || ""}
                    onValueChange={(value) => {
                      setValue("recurrence_frequency", value, { shouldValidate: true });
                      if (value !== 'weekly') {
                        setValue("recurrence_days", []);
                        setSelectedWeekdays([]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurrenceFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recurrence_frequency && (
                    <p className="text-sm text-red-500 mt-1">{errors.recurrence_frequency.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <FloatingLabelInput
                    label="Interval"
                    type="number"
                    min="1"
                    {...register("recurrence_interval", { valueAsNumber: true })}
                    error={errors.recurrence_interval?.message}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Weekly Days Selection */}
              {formValues.recurrence_frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Days *
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map((day) => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={selectedWeekdays.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleWeekday(day.value)}
                        disabled={isLoading}
                        className="capitalize"
                      >
                        {day.label.substring(0, 3)}
                      </Button>
                    ))}
                  </div>
                  {errors.recurrence_days && (
                    <p className="text-sm text-red-500 mt-1">{errors.recurrence_days.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Select at least one day for weekly recurrence</p>
                </div>
              )}
            </div>
          )}

          {/* Time & Guards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              Time & Guards
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Start Time *"
                  type="time"
                  {...register("start_time")}
                  error={errors.start_time?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <FloatingLabelInput
                  label="End Time *"
                  type="time"
                  {...register("end_time")}
                  error={errors.end_time?.message}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Guards Required *"
                  type="number"
                  min="1"
                  max="50"
                  {...register("guards_required", { valueAsNumber: true })}
                  error={errors.guards_required?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <FloatingLabelInput
                  label="Required Hours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  {...register("required_hours", { valueAsNumber: true })}
                  error={errors.required_hours?.message}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <FloatingLabelTextarea
              label="Notes (Optional)"
              rows={2}
              {...register("notes")}
              disabled={isLoading}
              className="resize-none"
              placeholder="Enter additional notes..."
            />
          </div>

          {/* Status Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Switch
                id="is_active"
                checked={formValues.is_active}
                onCheckedChange={(checked) => setValue("is_active", checked)}
                disabled={isLoading}
              />
              <div>
                <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Active
                </Label>
                <p className="text-xs text-gray-500">Enable or disable this schedule</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </Label>
              <Select
                value={formValues.status}
                onValueChange={(value) => setValue("status", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogActionFooter
            cancelText="Cancel"
            submitText="Create Schedule"
            isSubmitting={isLoading}
            submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onSubmit={handleSubmit(onSubmit)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
