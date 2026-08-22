// components/duty-schedule/duty-schedule-edit-form.tsx

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
  updateDutySchedule,
  fetchDutySchedule,
} from "@/store/slices/duty-schedule.slice";
import { fetchSites } from "@/store/slices/siteSlice";
import { fetchSiteLocations } from "@/store/slices/siteLocationSlice";
import { fetchClientContractServices } from "@/store/slices/client-contract-service.slice";
import { fetchDutyTimeTypes } from "@/store/slices/dutyTimeTypesSlice";
import { DutySchedule, UpdateDutyScheduleDto } from "@/app/types/duty-schedule";
import { Site } from "@/app/types/site";
import { SiteLocation } from "@/app/types/siteLocation.types";
import { ClientContractService } from "@/app/types/client-contract-service";
import { DutyTimeType } from "@/app/types/dutyTimeType";
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

// Timezone Display Component - Full Width Responsive
const TimezoneInfo = ({ siteTimezone }: { siteTimezone?: string }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!siteTimezone) return null;

  const formatTime = (date: Date, timezone?: string) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getTimezoneName = (tz: string) => {
    return tz.split('/').pop()?.replace('_', ' ') || tz;
  };

  return (
    <div className="w-full p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Timezone Information</span>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-sm">
        <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-900">
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-between gap-1">
            <span>Site Time</span>
            <span className="font-medium text-blue-600 dark:text-blue-400 truncate max-w-[100px] sm:max-w-none">
              {getTimezoneName(siteTimezone)}
            </span>
          </div>
          <div className="font-mono font-semibold text-blue-600 dark:text-blue-400 mt-1 text-sm sm:text-base">
            {formatTime(currentTime, siteTimezone)}
          </div>
        </div>
        <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-md border border-green-100 dark:border-green-900">
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-between gap-1">
            <span>Device Time</span>
            <span className="font-medium text-green-600 dark:text-green-400 truncate max-w-[100px] sm:max-w-none">
              {getTimezoneName(deviceTimezone)}
            </span>
          </div>
          <div className="font-mono font-semibold text-green-600 dark:text-green-400 mt-1 text-sm sm:text-base">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Zod schema
const dutyScheduleSchema = z.object({
  site_id: z.number()
    .min(1, { message: "Site is required" })
    .optional(),

  site_location_id: z.number()
    .optional()
    .nullable(),

  client_contract_service_id: z.number()
    .optional()
    .nullable(),

  duty_time_type_id: z.number()
    .optional()
    .nullable(),

  title: z.string()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be less than 200 characters" })
    .optional(),

  description: z.string().optional().nullable(),

  schedule_type: z.string()
    .min(1, { message: "Schedule type is required" })
    .optional(),

  start_date: z.string()
    .min(1, { message: "Start date is required" })
    .optional(),

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
    .min(1, { message: "Start time is required" })
    .optional(),

  end_time: z.string()
    .min(1, { message: "End time is required" })
    .optional(),

  guards_required: z.number()
    .min(1, { message: "At least 1 guard is required" })
    .max(50, { message: "Maximum 50 guards allowed" })
    .optional(),

  required_hours: z.number()
    .min(0.5, { message: "Minimum 0.5 hours required" })
    .max(24, { message: "Maximum 24 hours allowed" })
    .optional()
    .nullable(),

  mandatory_check_in_time: z.string()
    .optional()
    .nullable(),

  status: z.string(),
  is_active: z.boolean(),
  notes: z.string().optional().nullable(),
});

type DutyScheduleFormData = z.infer<typeof dutyScheduleSchema>;

interface DutyScheduleEditFormProps {
  trigger: ReactNode;
  item: DutySchedule;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DutyScheduleEditForm({
  trigger,
  item,
  isOpen,
  onOpenChange,
  onSuccess
}: DutyScheduleEditFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [selectedSiteTimezone, setSelectedSiteTimezone] = useState<string | undefined>(undefined);

  // Redux states
  const { sites } = useAppSelector((state) => state.site);
  const { siteLocations } = useAppSelector((state) => state.siteLocation);
  const { items: clientContractServices } = useAppSelector((state) => state.clientContractService);
  const { dutyTimeTypes } = useAppSelector((state) => state.dutyTimeTypes);

  // Search states
  const [siteSearch, setSiteSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [dutyTimeTypeSearch, setDutyTimeTypeSearch] = useState("");

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
      duty_time_type_id: null,
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
      mandatory_check_in_time: null,
      status: "active",
      is_active: true,
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
      dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchClientContractServices({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchDutyTimeTypes({ page: 1, per_page: 100, is_active: true }));
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
          search: serviceSearch.trim()
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceSearch, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dutyTimeTypeSearch.trim() || dutyTimeTypeSearch === "") {
        dispatch(fetchDutyTimeTypes({
          page: 1,
          per_page: 10,
          is_active: true,
          search: dutyTimeTypeSearch.trim()
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dutyTimeTypeSearch, dispatch]);

  const loadItem = async () => {
    if (!item?.id) return;

    setIsFetching(true);
    try {
      const result = await dispatch(fetchDutySchedule(item.id));

      if (fetchDutySchedule.fulfilled.match(result)) {
        const data = result.payload.item;
        const days = data.recurrence_days || [];
        setSelectedWeekdays(days);

        // Set the timezone from the site data
        if (data.site?.timezone) {
          setSelectedSiteTimezone(data.site.timezone);
        }

        reset({
          site_id: data.site_id,
          site_location_id: data.site_location_id || null,
          client_contract_service_id: data.client_contract_service_id || null,
          duty_time_type_id: data.duty_time_type_id || null,
          title: data.title || "",
          description: data.description || "",
          schedule_type: data.schedule_type || "recurring",
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          is_open_ended: data.is_open_ended || false,
          recurrence_frequency: data.recurrence_frequency || null,
          recurrence_interval: data.recurrence_interval || 1,
          recurrence_days: days,
          start_time: data.start_time || "08:00",
          end_time: data.end_time || "16:00",
          guards_required: data.guards_required || 1,
          required_hours: data.required_hours || 8,
          mandatory_check_in_time: data.mandatory_check_in_time || null,
          status: data.status || "active",
          is_active: data.is_active !== undefined ? data.is_active : true,
          notes: data.notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to load schedule:", error);
      SweetAlertService.error('Error', 'Failed to load schedule details');
    } finally {
      setIsFetching(false);
    }
  };

  // Handle weekday toggle
  const toggleWeekday = (day: string) => {
    const current = selectedWeekdays;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    setSelectedWeekdays(updated);
    setValue("recurrence_days", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: DutyScheduleFormData) => {
    if (!item?.id) return;

    setIsLoading(true);
    try {
      const submitData: UpdateDutyScheduleDto = {
        site_id: data.site_id,
        site_location_id: data.site_location_id || null,
        client_contract_service_id: data.schedule_type === 'recurring' ? null : (data.client_contract_service_id || null),
        duty_time_type_id: data.duty_time_type_id || null,
        title: data.title,
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
        mandatory_check_in_time: data.mandatory_check_in_time || null,
        status: data.status,
        is_active: data.is_active,
        notes: data.notes?.trim() || null,
      };

      const result = await dispatch(updateDutySchedule({
        id: item.id,
        data: submitData
      }));

      if (updateDutySchedule.fulfilled.match(result)) {
        SweetAlertService.success(
          'Schedule Updated',
          `${data.title} has been updated successfully.`
        ).then(() => {
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update schedule. Please try again.";

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
      const originalData = {
        title: item?.title || "",
        description: item?.description || "",
        site_id: item?.site_id,
        site_location_id: item?.site_location_id || null,
        client_contract_service_id: item?.client_contract_service_id || null,
        duty_time_type_id: item?.duty_time_type_id || null,
        schedule_type: item?.schedule_type || "recurring",
        start_date: item?.start_date || "",
        end_date: item?.end_date || "",
        is_open_ended: item?.is_open_ended || false,
        recurrence_frequency: item?.recurrence_frequency || null,
        recurrence_interval: item?.recurrence_interval || 1,
        recurrence_days: item?.recurrence_days || [],
        start_time: item?.start_time || "08:00",
        end_time: item?.end_time || "16:00",
        guards_required: item?.guards_required || 1,
        required_hours: item?.required_hours || 8,
        mandatory_check_in_time: item?.mandatory_check_in_time || null,
        status: item?.status || "active",
        is_active: item?.is_active !== undefined ? item.is_active : true,
        notes: item?.notes || "",
      };

      const currentData = {
        title: formValues.title || "",
        description: formValues.description || "",
        site_id: formValues.site_id,
        site_location_id: formValues.site_location_id || null,
        client_contract_service_id: formValues.client_contract_service_id || null,
        duty_time_type_id: formValues.duty_time_type_id || null,
        schedule_type: formValues.schedule_type || "recurring",
        start_date: formValues.start_date || "",
        end_date: formValues.end_date || "",
        is_open_ended: formValues.is_open_ended || false,
        recurrence_frequency: formValues.recurrence_frequency || null,
        recurrence_interval: formValues.recurrence_interval || 1,
        recurrence_days: formValues.recurrence_days || [],
        start_time: formValues.start_time || "08:00",
        end_time: formValues.end_time || "16:00",
        guards_required: formValues.guards_required || 1,
        required_hours: formValues.required_hours || 8,
        mandatory_check_in_time: formValues.mandatory_check_in_time || null,
        status: formValues.status || "active",
        is_active: formValues.is_active !== undefined ? formValues.is_active : true,
        notes: formValues.notes || "",
      };

      const hasChanges = JSON.stringify(originalData) !== JSON.stringify(currentData);

      if (!hasChanges) {
        setSelectedSiteTimezone(undefined);
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
            setSelectedWeekdays([]);
            setSelectedSiteTimezone(undefined);
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

      <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-3 sm:p-6">
        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-3 sm:mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={20} height={20} className="sm:w-6 sm:h-6" />
          <span className="whitespace-nowrap">Edit Duty Schedule</span>
        </div>

        {/* Timezone Display - Full Width at Top */}
        <TimezoneInfo siteTimezone={selectedSiteTimezone} />

        {isFetching ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-xs sm:text-sm text-gray-600">Loading schedule details...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Basic Information */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4" />
                Basic Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <FloatingLabelInput
                    label="Title *"
                    {...register("title")}
                    error={errors.title?.message}
                    disabled={isLoading || isFetching}
                  />
                </div>

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
                  disabled={isLoading || isFetching}
                  className="resize-none text-xs sm:text-sm"
                  placeholder="Enter schedule description..."
                />
              </div>
            </div>

            {/* Location & Contract */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <Building className="h-4 w-4" />
                Location & Contract
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Site *
                  </Label>
                  <SearchableDropdownWithIcon
                    value={formValues.site_id || ""}
                    onValueChange={(value) => {
                      const siteId = Number(value);
                      setValue("site_id", siteId, { shouldValidate: true });
                      setValue("site_location_id", null);

                      // Find the selected site and get its timezone
                      const selectedSite = sites.find((site: Site) => site.id === siteId);
                      if (selectedSite) {
                        setSelectedSiteTimezone(selectedSite.timezone||undefined);
                      } else {
                        setSelectedSiteTimezone(undefined);
                      }
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
                    disabled={isLoading || isFetching}
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
                    disabled={isLoading || isFetching || !formValues.site_id}
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
              {formValues.schedule_type !== 'recurring' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contract Service (Optional)
                  </Label>
                  <SearchableDropdownWithIcon
                    value={formValues.client_contract_service_id || ""}
                    onValueChange={(value) => {
                      setValue("client_contract_service_id", Number(value), { shouldValidate: true });
                    }}
                    options={clientContractServices.map((service: ClientContractService) => ({
                      value: service.id,
                      label: (service.company_service?.name || '') +
                        (service.pricing_type ? ` ${service.pricing_type}` : '') +
                        (service.billing_method?.name ? ` (${service.billing_method.name})` : '') ||
                        `Service ${service.id}`,
                      ...service
                    }))}
                    onSearch={(search) => {
                      setServiceSearch(search);
                      dispatch(fetchClientContractServices({
                        page: 1,
                        per_page: 10,
                        is_active: true,
                        search: search
                      }));
                    }}
                    placeholder="Select contract service"
                    disabled={isLoading || isFetching}
                    emptyMessage={serviceSearch ? "No contract services found" : "No contract services available"}
                    searchPlaceholder="Search contract services..."
                    icon={Package}
                    iconPosition="left"
                  />
                </div>
              )}
            </div>

            {/* Schedule Details */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                Schedule Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <FloatingLabelInput
                    label="Start Date *"
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
                  disabled={isLoading || isFetching}
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
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Repeat className="h-4 w-4" />
                  Recurrence Settings
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      disabled={isLoading || isFetching}
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
                          disabled={isLoading || isFetching}
                          className="capitalize text-xs sm:text-sm"
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
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock className="h-4 w-4" />
                Time & Guards
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <FloatingLabelInput
                    label="Start Time *"
                    type="time"
                    {...register("start_time")}
                    error={errors.start_time?.message}
                    disabled={isLoading || isFetching}
                  />
                </div>

                <div className="space-y-2">
                  <FloatingLabelInput
                    label="End Time *"
                    type="time"
                    {...register("end_time")}
                    error={errors.end_time?.message}
                    disabled={isLoading || isFetching}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <FloatingLabelInput
                    label="Guards Required *"
                    type="number"
                    min="1"
                    max="50"
                    {...register("guards_required", { valueAsNumber: true })}
                    error={errors.guards_required?.message}
                    disabled={isLoading || isFetching}
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
                    disabled={isLoading || isFetching}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <FloatingLabelInput
                    label="Mandatory Check-in Time"
                    type="time"
                    {...register("mandatory_check_in_time")}
                    error={errors.mandatory_check_in_time?.message}
                    disabled={isLoading || isFetching}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duty Time Type (Optional)
                  </Label>
                  <SearchableDropdownWithIcon
                    value={formValues.duty_time_type_id || ""}
                    onValueChange={(value) => {
                      setValue("duty_time_type_id", Number(value), { shouldValidate: true });
                    }}
                    options={dutyTimeTypes.map((type: DutyTimeType) => ({
                      value: type.id,
                      label: type.title || `Type ${type.id}`,
                      ...type
                    }))}
                    onSearch={(search) => {
                      setDutyTimeTypeSearch(search);
                      dispatch(fetchDutyTimeTypes({
                        page: 1,
                        per_page: 10,
                        is_active: true,
                        search: search
                      }));
                    }}
                    placeholder="Select duty time type"
                    disabled={isLoading || isFetching}
                    emptyMessage={dutyTimeTypeSearch ? "No types found" : "No types available"}
                    searchPlaceholder="Search duty time types..."
                    icon={Clock}
                    iconPosition="left"
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
                disabled={isLoading || isFetching}
                className="resize-none text-xs sm:text-sm"
                placeholder="Enter additional notes..."
              />
            </div>

            {/* Status Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Switch
                  id="is_active"
                  checked={formValues.is_active}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                  disabled={isLoading || isFetching}
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
              submitText="Update Schedule"
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
