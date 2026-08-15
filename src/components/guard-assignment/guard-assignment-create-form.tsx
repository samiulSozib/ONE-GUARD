// components/guard-assignment/guard-assignment-create-form.tsx

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
import {
  CalendarIcon,
  Plus,
  User,
  Briefcase,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
  Clock
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calender";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchGuards } from "@/store/slices/guardSlice";
import { fetchDuties } from "@/store/slices/dutySlice";
import { fetchDutySchedules } from "@/store/slices/duty-schedule.slice";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SweetAlertService from "@/lib/sweetAlert";
import { format } from "date-fns";
import { DialogActionFooter } from "../shared/dialog-action-footer";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Guard } from "@/app/types/guard";
import { Duty, DutyParams } from "@/app/types/duty";
import { DutySchedule } from "@/app/types/duty-schedule";
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAssignment,
  bulkScheduleAssignments
} from "@/store/slices/guardAssignmentSlice";
import { DutyCreateForm } from "../duty/duty-create-form";

interface GuardAssignmentCreateFormProps {
  trigger: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

// Single assignment schema
const singleAssignmentSchema = z.object({
  guard_id: z.number()
    .min(1, { message: "Guard is required" }),
  duty_id: z.number()
    .min(1, { message: "Duty is required" }),
});

// Bulk assignment schema
const bulkAssignmentSchema = z.object({
  duty_schedule_id: z.number()
    .min(1, { message: "Duty schedule is required" }),
  guard_ids: z.array(z.number())
    .min(1, { message: "At least one guard is required" }),
  date_from: z.string()
    .optional()
    .nullable(),
  date_to: z.string()
    .optional()
    .nullable(),
}).refine((data) => {
  if (data.date_from && data.date_to) {
    return new Date(data.date_from) <= new Date(data.date_to);
  }
  return true;
}, {
  message: "Start date must be before or equal to end date",
  path: ["date_to"]
});

type SingleAssignmentFormData = z.infer<typeof singleAssignmentSchema>;
type BulkAssignmentFormData = z.infer<typeof bulkAssignmentSchema>;

export function GuardAssignmentCreateForm({
  trigger,
  isOpen,
  onOpenChange,
  onSuccess
}: GuardAssignmentCreateFormProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [dutyCreateDialogOpen, setDutyCreateDialogOpen] = useState(false);

  // Single assignment states
  const [guardSearch, setGuardSearch] = useState("");
  const [dutySearch, setDutySearch] = useState("");

  // Bulk assignment states
  const [selectedGuardIds, setSelectedGuardIds] = useState<number[]>([]);
  const [bulkGuardSearch, setBulkGuardSearch] = useState("");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [bulkResult, setBulkResult] = useState<{
    created: number;
    skipped: number;
    total: number;
    details?: Array<{ duty_id: number; guard_id: number; reason: string; message: string }>;
  } | null>(null);

  // Redux states
  const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard);
  const { duties, isLoading: dutiesLoading } = useAppSelector((state) => state.duty);
  const { items: schedules, isLoading: schedulesLoading } = useAppSelector((state) => state.dutySchedule);

  // Single assignment form
  const {
    handleSubmit: handleSingleSubmit,
    formState: { errors: singleErrors },
    setValue: setSingleValue,
    watch: watchSingle,
    reset: resetSingle,
  } = useForm<SingleAssignmentFormData>({
    resolver: zodResolver(singleAssignmentSchema),
    defaultValues: {
      guard_id: 0,
      duty_id: 0,
    },
    mode: "onBlur"
  });

  // Bulk assignment form
  const {
    handleSubmit: handleBulkSubmit,
    formState: { errors: bulkErrors },
    setValue: setBulkValue,
    watch: watchBulk,
    reset: resetBulk,
  } = useForm<BulkAssignmentFormData>({
    resolver: zodResolver(bulkAssignmentSchema),
    defaultValues: {
      duty_schedule_id: 0,
      guard_ids: [],
      date_from: null,
      date_to: null,
    },
    mode: "onBlur"
  });

  const singleFormValues = watchSingle();
  const bulkFormValues = watchBulk();

  // ---- Single Assignment Effects ----

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchGuards({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchDuties({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchDutySchedules({ page: 1, per_page: 100, is_active: true, schedule_type: 'recurring' }));
      setBulkResult(null);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (singleFormValues.guard_id && singleFormValues.guard_id > 0) {
      const params: DutyParams = {
        page: 1,
        per_page: 100,
        guard_id: singleFormValues.guard_id,
        is_active: true,
      };
      dispatch(fetchDuties(params));
    }
  }, [singleFormValues.guard_id, dispatch]);

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
        if (singleFormValues.guard_id && singleFormValues.guard_id > 0) {
          params.guard_id = singleFormValues.guard_id;
        }
        dispatch(fetchDuties(params));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dutySearch, singleFormValues.guard_id, dispatch]);

  // ---- Bulk Assignment Effects ----

  useEffect(() => {
    if (activeTab === "bulk") {
      dispatch(fetchGuards({ page: 1, per_page: 100, is_active: true }));
      dispatch(fetchDutySchedules({ page: 1, per_page: 100, is_active: true, schedule_type: 'recurring' }));
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bulkGuardSearch.trim() || bulkGuardSearch === "") {
        dispatch(fetchGuards({
          page: 1,
          per_page: 10,
          search: bulkGuardSearch.trim(),
          is_active: true,
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [bulkGuardSearch, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scheduleSearch.trim() || scheduleSearch === "") {
        dispatch(fetchDutySchedules({
          page: 1,
          per_page: 10,
          search: scheduleSearch.trim(),
          is_active: true,
          schedule_type: 'recurring',
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [scheduleSearch, dispatch]);

  useEffect(() => {
    if (dateFrom) {
      setBulkValue('date_from', format(dateFrom, 'yyyy-MM-dd'), { shouldValidate: true });
    } else {
      setBulkValue('date_from', null);
    }
  }, [dateFrom, setBulkValue]);

  useEffect(() => {
    if (dateTo) {
      setBulkValue('date_to', format(dateTo, 'yyyy-MM-dd'), { shouldValidate: true });
    } else {
      setBulkValue('date_to', null);
    }
  }, [dateTo, setBulkValue]);

  useEffect(() => {
    setBulkValue('guard_ids', selectedGuardIds, { shouldValidate: true });
  }, [selectedGuardIds, setBulkValue]);

  // ---- Helper Functions ----

  const formatGuardDisplay = (guard: Partial<Guard>) => {
    if (!guard) return "";
    return `${guard.full_name || 'Unknown'} (${guard.guard_code || 'No Code'})`;
  };

  const formatDutyDisplay = (duty: Partial<Duty>) => {
    if (!duty) return "";
    const siteName = duty.site?.site_name || 'No Site';
    const date = duty.duty_date ? format(new Date(duty.duty_date), 'MMM dd') : '';
    return `${duty.title || 'Untitled Duty'} - ${siteName}${date ? ` (${date})` : ''}`;
  };

  const formatScheduleDisplay = (schedule: Partial<DutySchedule>) => {
    if (!schedule) return "";
    const freq = schedule.recurrence_frequency ? ` - ${schedule.recurrence_frequency}` : '';
    return `${schedule.title || 'Untitled Schedule'}${freq}`;
  };

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return "Select date";
    return format(date, 'MMM dd, yyyy');
  };

  const toggleGuardSelection = (guardId: number) => {
    setSelectedGuardIds(prev => {
      if (prev.includes(guardId)) {
        return prev.filter(id => id !== guardId);
      } else {
        return [...prev, guardId];
      }
    });
  };

  const removeGuard = (guardId: number) => {
    setSelectedGuardIds(prev => prev.filter(id => id !== guardId));
  };

  const clearAllGuards = () => {
    setSelectedGuardIds([]);
  };

  const handleDutyCreated = () => {
    const params: DutyParams = {
      page: 1,
      per_page: 10,
      search: dutySearch.trim(),
      is_active: true,
    };
    if (singleFormValues.guard_id && singleFormValues.guard_id > 0) {
      params.guard_id = singleFormValues.guard_id;
    }
    dispatch(fetchDuties(params));
    setDutyCreateDialogOpen(false);
  };

  // ---- Submit Handlers ----

  const onSingleSubmit = async (data: SingleAssignmentFormData) => {
    setIsLoading(true);
    try {
      const submitData = {
        guard_id: data.guard_id,
        duty_id: data.duty_id,
      };

      const result = await dispatch(createAssignment(submitData));

      if (createAssignment.fulfilled.match(result)) {
        SweetAlertService.success(
          'Guard Assignment Created',
          'Guard has been assigned to duty successfully.'
        ).then(() => {
          resetSingle();
          setGuardSearch("");
          setDutySearch("");
          onSuccess?.();
          onOpenChange?.(false);
        });
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to create guard assignment. Please try again.";
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

  const onBulkSubmit = async (data: BulkAssignmentFormData) => {
    setIsLoading(true);
    setBulkResult(null);

    try {
      const submitData = {
        duty_schedule_id: data.duty_schedule_id,
        guard_ids: data.guard_ids,
        date_from: data.date_from || undefined,
        date_to: data.date_to || undefined,
      };

      const result = await dispatch(bulkScheduleAssignments(submitData));

      if (bulkScheduleAssignments.fulfilled.match(result)) {
        const payload = result.payload;
        setBulkResult({
          created: payload.summary.assignments_created,
          skipped: payload.summary.assignments_skipped,
          total: payload.summary.assignment_attempts,
          details: payload.skipped,
        });

        if (payload.summary.assignments_skipped === 0 && payload.summary.assignments_created > 0) {
          SweetAlertService.success(
            'Bulk Assignment Complete',
            `${payload.summary.assignments_created} assignments created successfully for ${payload.summary.guards_requested} guard(s).`
          );
        } else if (payload.summary.assignments_created === 0) {
          SweetAlertService.error(
            'Bulk Assignment Failed',
            `All ${payload.summary.assignment_attempts} assignments failed. Please check the details below.`
          );
        } else {
          SweetAlertService.warning(
            'Partial Success',
            `${payload.summary.assignments_created} assignments created, ${payload.summary.assignments_skipped} skipped.`
          );
        }
      } else {
        throw result.payload;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to create bulk assignments. Please try again.";
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      SweetAlertService.error('Bulk Assignment Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      const hasSingleChanges = singleFormValues.guard_id !== 0 || singleFormValues.duty_id !== 0;
      const hasBulkChanges = selectedGuardIds.length > 0 ||
        bulkFormValues.duty_schedule_id !== 0 ||
        dateFrom !== undefined ||
        dateTo !== undefined;

      if ((hasSingleChanges || hasBulkChanges) && !bulkResult) {
        SweetAlertService.confirm(
          'Discard Changes?',
          'You have unsaved changes. Are you sure you want to close?',
          'Yes, discard',
          'No, keep'
        ).then((result) => {
          if (result.isConfirmed) {
            resetAll();
            onOpenChange?.(false);
          } else {
            onOpenChange?.(true);
          }
        });
      } else {
        resetAll();
        onOpenChange?.(false);
      }
    } else {
      onOpenChange?.(true);
    }
  };

  const resetAll = () => {
    resetSingle();
    resetBulk();
    setGuardSearch("");
    setDutySearch("");
    setBulkGuardSearch("");
    setScheduleSearch("");
    setSelectedGuardIds([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setBulkResult(null);
    setActiveTab("single");
  };

  const handleBulkDone = () => {
    resetAll();
    onSuccess?.();
    onOpenChange?.(false);
  };

  const selectedGuards = guards.filter(g => selectedGuardIds.includes(g.id));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>

        <DialogContent className="sm:max-w-[700px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2 border-b">
            <Image src="/images/logo.png" alt="" width={24} height={24} />
            <span className="whitespace-nowrap">Assign Guard to Duty</span>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "single" | "bulk")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Single Assignment
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bulk Assignment
              </TabsTrigger>
            </TabsList>

            {/* Single Assignment Tab */}
            <TabsContent value="single">
              <form onSubmit={handleSingleSubmit(onSingleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {/* Guard Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Guard <span className="text-red-500">*</span>
                    </Label>
                    <SearchableDropdownWithIcon
                      value={singleFormValues.guard_id || 0}
                      onValueChange={(value) => {
                        setSingleValue("guard_id", Number(value), { shouldValidate: true });
                        setSingleValue("duty_id", 0);
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
                      disabled={isLoading || guardsLoading}
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
                    {singleErrors.guard_id && (
                      <p className="text-sm text-red-500 mt-1">{singleErrors.guard_id.message}</p>
                    )}
                  </div>

                  {/* Duty Selection with Plus Button */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duty <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <SearchableDropdownWithIcon
                          value={singleFormValues.duty_id || 0}
                          onValueChange={(value) => {
                            setSingleValue("duty_id", Number(value), { shouldValidate: true });
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
                            if (singleFormValues.guard_id && singleFormValues.guard_id > 0) {
                              params.guard_id = singleFormValues.guard_id;
                            }
                            dispatch(fetchDuties(params));
                          }}
                          placeholder={singleFormValues.guard_id && singleFormValues.guard_id > 0 ? "Select duty" : "Select guard first"}
                          disabled={isLoading || dutiesLoading || !singleFormValues.guard_id || singleFormValues.guard_id === 0}
                          isLoading={dutiesLoading}
                          emptyMessage={
                            !singleFormValues.guard_id || singleFormValues.guard_id === 0
                              ? "Select a guard first"
                              : dutySearch
                                ? "No duties found for this guard"
                                : "No duties available for this guard"
                          }
                          searchPlaceholder="Search duties by title or site..."
                          icon={Briefcase}
                          iconPosition="left"
                          displayValue={(value, options) => {
                            if (!value || value === 0) {
                              return singleFormValues.guard_id && singleFormValues.guard_id > 0
                                ? "Select duty"
                                : "Select guard first";
                            }
                            const option = options.find(opt => opt.value === value);
                            return option?.label || "Select duty";
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-10 w-10"
                        onClick={() => setDutyCreateDialogOpen(true)}
                        disabled={isLoading}
                        title="Create new duty"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {singleErrors.duty_id && (
                      <p className="text-sm text-red-500 mt-1">{singleErrors.duty_id.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {singleFormValues.guard_id && singleFormValues.guard_id > 0
                        ? "Showing duties for the selected guard"
                        : "Select a guard to see available duties"}
                    </p>
                  </div>
                </div>

                <DialogActionFooter
                  cancelText="Cancel"
                  submitText="Create Assignment"
                  isSubmitting={isLoading}
                  submitColor="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  onSubmit={handleSingleSubmit(onSingleSubmit)}
                />
              </form>
            </TabsContent>

            {/* Bulk Assignment Tab */}
            <TabsContent value="bulk">
              {bulkResult ? (
                // Result Display
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Assignment Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                        <p className="text-2xl font-bold text-green-600">{bulkResult.created}</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Skipped</p>
                        <p className="text-2xl font-bold text-red-600">{bulkResult.skipped}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
                        <p className="text-2xl font-bold text-blue-600">{bulkResult.total}</p>
                      </div>
                    </div>
                  </div>

                  {bulkResult.details && bulkResult.details.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                      <h4 className="font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Skipped Details ({bulkResult.details.length})
                      </h4>
                      <ScrollArea className="h-[120px]">
                        <div className="space-y-1">
                          {bulkResult.details.map((item, index) => (
                            <div key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                              <span className="font-mono text-xs">Duty #{item.duty_id}</span>
                              <span className="text-gray-400">→</span>
                              <span className="font-mono text-xs">Guard #{item.guard_id}</span>
                              <span className="text-gray-400">:</span>
                              <span>{item.message}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleBulkDone}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleBulkSubmit(onBulkSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {/* Duty Schedule Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Duty Schedule <span className="text-red-500">*</span>
                      </Label>
                      <SearchableDropdownWithIcon
                        value={bulkFormValues.duty_schedule_id || 0}
                        onValueChange={(value) => {
                          setBulkValue("duty_schedule_id", Number(value), { shouldValidate: true });
                        }}
                        options={schedules.map((schedule: DutySchedule) => ({
                          value: schedule.id,
                          label: formatScheduleDisplay(schedule),
                          subtitle: schedule.recurrence_frequency ? `Every ${schedule.recurrence_frequency}` : '',
                          ...schedule
                        }))}
                        onSearch={(search) => {
                          setScheduleSearch(search);
                          dispatch(fetchDutySchedules({
                            page: 1,
                            per_page: 10,
                            search: search,
                            is_active: true,
                            schedule_type: 'recurring',
                          }));
                        }}
                        placeholder="Select duty schedule"
                        disabled={isLoading || schedulesLoading}
                        isLoading={schedulesLoading}
                        emptyMessage={scheduleSearch ? "No schedules found" : "No schedules available"}
                        searchPlaceholder="Search schedules by title..."
                        icon={Calendar}
                        iconPosition="left"
                        displayValue={(value, options) => {
                          if (!value || value === 0) return "Select duty schedule";
                          const option = options.find(opt => opt.value === value);
                          return option?.label || "Select duty schedule";
                        }}
                      />
                      {bulkErrors.duty_schedule_id && (
                        <p className="text-sm text-red-500 mt-1">{bulkErrors.duty_schedule_id.message}</p>
                      )}
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Only recurring schedules can be used for bulk assignment
                      </p>
                    </div>

                    {/* Guards Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Guards <span className="text-red-500">*</span>
                      </Label>
                      <SearchableDropdownWithIcon
                        value=""
                        onValueChange={(value) => {
                          if (value) {
                            toggleGuardSelection(Number(value));
                            // Reset the dropdown value after selection
                            const input = document.querySelector('input[placeholder="Search and select guards..."]') as HTMLInputElement;
                            if (input) input.value = '';
                          }
                        }}
                        options={guards.map((guard: Guard) => ({
                          value: guard.id,
                          label: formatGuardDisplay(guard),
                          ...guard
                        }))}
                        onSearch={(search) => {
                          setBulkGuardSearch(search);
                          dispatch(fetchGuards({
                            page: 1,
                            per_page: 10,
                            search: search,
                            is_active: true,
                          }));
                        }}
                        placeholder="Search and select guards..."
                        disabled={isLoading || guardsLoading}
                        isLoading={guardsLoading}
                        emptyMessage={bulkGuardSearch ? "No guards found" : "No guards available"}
                        searchPlaceholder="Search guards by name or code..."
                        icon={User}
                        iconPosition="left"
                      />
                      {bulkErrors.guard_ids && (
                        <p className="text-sm text-red-500 mt-1">{bulkErrors.guard_ids.message}</p>
                      )}

                      {/* Selected Guards Tags */}
                      {selectedGuardIds.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Selected Guards ({selectedGuardIds.length})
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearAllGuards}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-auto p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[44px] border">
                            {selectedGuards.map((guard) => (
                              <Badge
                                key={guard.id}
                                variant="secondary"
                                className="flex items-center gap-1 px-3 py-1.5 text-sm"
                              >
                                {formatGuardDisplay(guard)}
                                <button
                                  type="button"
                                  onClick={() => removeGuard(guard.id)}
                                  className="ml-1 hover:text-red-500 transition-colors"
                                >
                                  <XCircle className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            {selectedGuardIds.length === 0 && (
                              <span className="text-sm text-gray-400">No guards selected</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date Range (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date From (Optional)
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10",
                                !dateFrom && "text-muted-foreground"
                              )}
                              disabled={isLoading}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formatDateDisplay(dateFrom)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={dateFrom}
                              onSelect={setDateFrom}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date To (Optional)
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10",
                                !dateTo && "text-muted-foreground"
                              )}
                              disabled={isLoading}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formatDateDisplay(dateTo)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={dateTo}
                              onSelect={setDateTo}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    {bulkErrors.date_to && (
                      <p className="text-sm text-red-500 -mt-2">{bulkErrors.date_to.message}</p>
                    )}
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      If no date range is selected, all duties in the schedule will be processed
                    </p>
                  </div>

                  <DialogActionFooter
                    cancelText="Cancel"
                    submitText="Create Bulk Assignments"
                    isSubmitting={isLoading}
                    submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    onSubmit={handleBulkSubmit(onBulkSubmit)}
                  />
                </form>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Duty Create Dialog */}
      <DutyCreateForm
        trigger={<div />}
        isOpen={dutyCreateDialogOpen}
        onOpenChange={setDutyCreateDialogOpen}
        onSuccess={handleDutyCreated}
      />
    </>
  );
}
