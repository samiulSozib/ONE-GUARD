"use client";

import {
  AssignmentPlanGuardInput,
  AssignmentPlanStatus,
  GuardAssignmentPlan,
  IsoWeekday,
} from "@/app/types/scheduling";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";

import SweetAlertService from "@/lib/sweetAlert";
import { cn } from "@/lib/utils";

import { fetchDutySchedules } from "@/store/slices/duty-schedule.slice";
import { fetchGuards } from "@/store/slices/guardSlice";

import {
  createAssignmentPlan,
  fetchAssignmentPlan,
  updateAssignmentPlan,
} from "@/store/slices/schedulingSlice";

import { format } from "date-fns";

import {
  CalendarIcon,
  Plus,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";

import Image from "next/image";

import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DialogActionFooter } from "../shared/dialog-action-footer";
import { Calendar } from "../ui/calender";
import { FloatingLabelInput } from "../ui/floating-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

// ============================================
// TYPES
// ============================================

interface AssignmentPlansFormProps {
  trigger: ReactNode;

  plan?: GuardAssignmentPlan;

  isOpen?: boolean;

  onOpenChange?: (open: boolean) => void;

  onSuccess?: () => void;
}

interface AssignmentPlanResponse {
  item: GuardAssignmentPlan;

  generation?: {
    plan_id: number;

    duties_checked: number;

    guard_rules_checked?: number;

    assignments_created: number;

    assignments_skipped: number;

    skipped_reasons?: Record<string, string[]>;
  };
}

interface GuardRowForm {
  guard_id: string;

  weekdays: IsoWeekday[];
}

// ============================================
// WEEKDAYS
// ============================================

const WEEKDAYS: {
  value: IsoWeekday;
  short: string;
  label: string;
}[] = [
    {
      value: 1,
      short: "Mon",
      label: "Monday",
    },
    {
      value: 2,
      short: "Tue",
      label: "Tuesday",
    },
    {
      value: 3,
      short: "Wed",
      label: "Wednesday",
    },
    {
      value: 4,
      short: "Thu",
      label: "Thursday",
    },
    {
      value: 5,
      short: "Fri",
      label: "Friday",
    },
    {
      value: 6,
      short: "Sat",
      label: "Saturday",
    },
    {
      value: 7,
      short: "Sun",
      label: "Sunday",
    },
  ];

const ALL_WEEKDAYS: IsoWeekday[] = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
];

const createEmptyGuardRow = (): GuardRowForm => ({
  guard_id: "",

  /*
   * Important:
   *
   * Default to all seven days.
   *
   * This preserves the behavior of the old form:
   * selecting one guard means that guard covers every
   * applicable duty date unless the admin changes days.
   */
  weekdays: [...ALL_WEEKDAYS],
});

// ============================================
// COMPONENT
// ============================================

export function AssignmentPlansForm({
  trigger,
  plan,
  isOpen,
  onOpenChange,
  onSuccess,
}: AssignmentPlansFormProps) {
  const dispatch = useAppDispatch();

  // ============================================
  // REDUX STATE
  // ============================================

  const { isLoading: isSaving } = useAppSelector(
    (state) => state.scheduling.plans
  );

  const { items: dutySchedules } = useAppSelector(
    (state) => state.dutySchedule
  );

  const { guards } = useAppSelector(
    (state) => state.guard
  );

  // ============================================
  // LOCAL STATE
  // ============================================

  const [isFetching, setIsFetching] =
    useState(false);

  const [formData, setFormData] = useState({
    duty_schedule_id: "",

    start_date: "",

    end_date: "",

    is_open_ended: false,

    status: "active" as AssignmentPlanStatus,

    is_active: true,

    notes: "",
  });

  const [guardRows, setGuardRows] = useState<
    GuardRowForm[]
  >([
    createEmptyGuardRow(),
  ]);

  const isEditMode = !!plan;

  // ============================================
  // LOAD DROPDOWN DATA
  // ============================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dispatch(
      fetchDutySchedules({
        page: 1,
        per_page: 100,
        is_active: true,
      })
    );

    dispatch(
      fetchGuards({
        page: 1,
        per_page: 100,
      })
    );
  }, [
    isOpen,
    dispatch,
  ]);

  // ============================================
  // LOAD PLAN WHEN EDITING
  // ============================================

  useEffect(() => {
    if (
      plan &&
      isOpen
    ) {
      loadPlan();
    }
  }, [
    plan,
    isOpen,
  ]);

  const loadPlan = async () => {
    if (!plan?.id) {
      return;
    }

    setIsFetching(true);

    try {
      const result = await dispatch(
        fetchAssignmentPlan(plan.id)
      ).unwrap();

      setFormData({
        duty_schedule_id:
          String(
            result.duty_schedule_id
          ),

        start_date:
          result.start_date
            ? result.start_date.substring(
              0,
              10
            )
            : "",

        end_date:
          result.end_date
            ? result.end_date.substring(
              0,
              10
            )
            : "",

        is_open_ended:
          result.is_open_ended,

        status:
          result.status,

        is_active:
          result.is_active,

        notes:
          result.notes || "",
      });

      /*
       * NEW API
       *
       * Use child guard rules when available.
       */
      if (
        result.guards &&
        result.guards.length > 0
      ) {
        setGuardRows(
          result.guards.map(
            (row) => ({
              guard_id:
                String(
                  row.guard_id
                ),

              weekdays:
                row.weekdays &&
                  row.weekdays.length > 0
                  ? [
                    ...row.weekdays,
                  ].sort(
                    (a, b) =>
                      a - b
                  )
                  : [
                    ...ALL_WEEKDAYS,
                  ],
            })
          )
        );

        return;
      }

      /*
       * LEGACY API FALLBACK
       *
       * If we ever load an older record that still
       * exposes guard_id / legacy_guard_id,
       * treat it as every day.
       */
      const legacyGuardId =
        result.guard_id ??
        result.legacy_guard_id;

      if (legacyGuardId) {
        setGuardRows([
          {
            guard_id:
              String(
                legacyGuardId
              ),

            weekdays: [
              ...ALL_WEEKDAYS,
            ],
          },
        ]);

        return;
      }

      setGuardRows([
        createEmptyGuardRow(),
      ]);
    } catch (error) {
      console.error(
        "Failed to load assignment plan:",
        error
      );

      SweetAlertService.error(
        "Load Failed",
        "Failed to load assignment plan details."
      );
    } finally {
      setIsFetching(false);
    }
  };

  // ============================================
  // GENERAL FORM CHANGES
  // ============================================

  const handleChange = (
    field: string,
    value: any
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  // ============================================
  // GUARD ROW MANAGEMENT
  // ============================================

  const addGuardRow = () => {
    setGuardRows(
      (previous) => [
        ...previous,
        createEmptyGuardRow(),
      ]
    );
  };

  const removeGuardRow = (
    index: number
  ) => {
    setGuardRows(
      (previous) => {
        /*
         * Always keep at least one row.
         */
        if (
          previous.length === 1
        ) {
          return [
            createEmptyGuardRow(),
          ];
        }

        return previous.filter(
          (
            _,
            rowIndex
          ) =>
            rowIndex !== index
        );
      }
    );
  };

  const updateGuard = (
    index: number,
    guardId: string
  ) => {
    setGuardRows(
      (previous) =>
        previous.map(
          (
            row,
            rowIndex
          ) =>
            rowIndex === index
              ? {
                ...row,
                guard_id:
                  guardId,
              }
              : row
        )
    );
  };

  // ============================================
  // WEEKDAY MANAGEMENT
  // ============================================

  const toggleWeekday = (
    index: number,
    weekday: IsoWeekday
  ) => {
    setGuardRows(
      (previous) =>
        previous.map(
          (
            row,
            rowIndex
          ) => {
            if (
              rowIndex !== index
            ) {
              return row;
            }

            const alreadySelected =
              row.weekdays.includes(
                weekday
              );

            const weekdays =
              alreadySelected
                ? row.weekdays.filter(
                  (day) =>
                    day !== weekday
                )
                : [
                  ...row.weekdays,
                  weekday,
                ];

            return {
              ...row,

              weekdays:
                weekdays.sort(
                  (a, b) =>
                    a - b
                ),
            };
          }
        )
    );
  };

  const selectAllWeekdays = (
    index: number
  ) => {
    setGuardRows(
      (previous) =>
        previous.map(
          (
            row,
            rowIndex
          ) =>
            rowIndex === index
              ? {
                ...row,
                weekdays: [
                  ...ALL_WEEKDAYS,
                ],
              }
              : row
        )
    );
  };

  const clearWeekdays = (
    index: number
  ) => {
    setGuardRows(
      (previous) =>
        previous.map(
          (
            row,
            rowIndex
          ) =>
            rowIndex === index
              ? {
                ...row,
                weekdays: [],
              }
              : row
        )
    );
  };

  // ============================================
  // SELECTED SCHEDULE
  // ============================================

  const selectedSchedule =
    useMemo(
      () =>
        dutySchedules.find(
          (
            schedule: any
          ) =>
            schedule.id ===
            parseInt(
              formData.duty_schedule_id ||
              "0",
              10
            )
        ),
      [
        dutySchedules,
        formData.duty_schedule_id,
      ]
    );

  // ============================================
  // GUARD HELPERS
  // ============================================

  const getGuard = (
    guardId: string
  ) => {
    return guards.find(
      (
        guard: any
      ) =>
        guard.id ===
        parseInt(
          guardId || "0",
          10
        )
    );
  };

  const selectedGuardIds =
    guardRows
      .map(
        (row) =>
          row.guard_id
      )
      .filter(Boolean);

  // ============================================
  // VALIDATION
  // ============================================

  const validateForm = () => {
    if (
      !formData.duty_schedule_id
    ) {
      SweetAlertService.error(
        "Schedule Required",
        "Please select a duty schedule."
      );

      return false;
    }

    if (
      !formData.start_date
    ) {
      SweetAlertService.error(
        "Start Date Required",
        "Please select a start date."
      );

      return false;
    }

    if (
      !formData.is_open_ended &&
      !formData.end_date
    ) {
      SweetAlertService.error(
        "End Date Required",
        "Please select an end date or enable open-ended."
      );

      return false;
    }

    if (
      !formData.is_open_ended &&
      formData.end_date <
      formData.start_date
    ) {
      SweetAlertService.error(
        "Invalid Date Range",
        "End date cannot be before the start date."
      );

      return false;
    }

    if (
      guardRows.length === 0
    ) {
      SweetAlertService.error(
        "Guard Required",
        "Please add at least one guard."
      );

      return false;
    }

    const guardIds =
      guardRows.map(
        (row) =>
          row.guard_id
      );

    if (
      guardIds.some(
        (guardId) =>
          !guardId
      )
    ) {
      SweetAlertService.error(
        "Guard Required",
        "Please select a guard for every guard assignment."
      );

      return false;
    }

    /*
     * Same guard should not appear twice in the same
     * normal assignment plan.
     */
    if (
      new Set(
        guardIds
      ).size !==
      guardIds.length
    ) {
      SweetAlertService.error(
        "Duplicate Guard",
        "The same guard cannot be added more than once to the same assignment plan."
      );

      return false;
    }

    /*
     * Each guard must own at least one weekday.
     */
    if (
      guardRows.some(
        (row) =>
          row.weekdays.length ===
          0
      )
    ) {
      SweetAlertService.error(
        "Working Days Required",
        "Every guard must have at least one working day."
      );

      return false;
    }

    return true;
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    /*
     * This is the important new payload.
     */
    const normalizedGuards:
      AssignmentPlanGuardInput[] =
      guardRows.map(
        (row) => ({
          guard_id:
            parseInt(
              row.guard_id,
              10
            ),

          weekdays: [
            ...row.weekdays,
          ].sort(
            (a, b) =>
              a - b
          ),
        })
      );

    const payload = {
      duty_schedule_id:
        parseInt(
          formData.duty_schedule_id,
          10
        ),

      start_date:
        formData.start_date,

      end_date:
        formData.is_open_ended
          ? null
          : formData.end_date ||
          null,

      is_open_ended:
        formData.is_open_ended,

      status:
        formData.status,

      is_active:
        formData.is_active,

      notes:
        formData.notes ||
        null,

      guards:
        normalizedGuards,
    };

    try {
      let result:
        AssignmentPlanResponse;

      if (
        isEditMode &&
        plan
      ) {
        result =
          await dispatch(
            updateAssignmentPlan({
              id: plan.id,

              data: payload,
            })
          ).unwrap();

        SweetAlertService.success(
          "Plan Updated",
          "Assignment plan has been updated successfully."
        );
      } else {
        result =
          await dispatch(
            createAssignmentPlan(
              payload
            )
          ).unwrap();

        SweetAlertService.success(
          "Plan Created",
          "Assignment plan has been created successfully."
        );
      }

      /*
       * Create can return automatic generation details.
       */
      if (
        result.generation
      ) {
        const info =
          result.generation;

        SweetAlertService.info(
          "Generation Summary",
          `Checked ${info.duties_checked} duties, created ${info.assignments_created} assignments, skipped ${info.assignments_skipped}.`
        );
      }

      onSuccess?.();

      onOpenChange?.(
        false
      );

      resetForm();
    } catch (
    error: any
    ) {
      SweetAlertService.error(
        isEditMode
          ? "Update Failed"
          : "Creation Failed",

        error?.message ||
        "Please try again."
      );
    }
  };

  // ============================================
  // RESET
  // ============================================

  const resetForm = () => {
    setFormData({
      duty_schedule_id: "",

      start_date: "",

      end_date: "",

      is_open_ended: false,

      status: "active",

      is_active: true,

      notes: "",
    });

    setGuardRows([
      createEmptyGuardRow(),
    ]);
  };

  const handleDialogOpenChange = (
    open: boolean
  ) => {
    if (!open) {
      resetForm();
    }

    onOpenChange?.(
      open
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Dialog
      open={isOpen}
      onOpenChange={
        handleDialogOpenChange
      }
    >
      <DialogTrigger
        asChild
      >
        {trigger}
      </DialogTrigger>

      <DialogContent
        className="
          mx-auto
          max-h-[92vh]
          w-[96vw]
          max-w-[96vw]
          overflow-y-auto
          p-3
          dark:bg-gray-900
          sm:max-w-[900px]
          sm:p-6
        "
      >
        <DialogHeader>
          <div
            className="
              mb-2
              flex
              items-center
              gap-2
              text-base
              font-semibold
              sm:text-lg
            "
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={20}
              height={20}
              className="sm:h-6 sm:w-6"
            />

            <span
              className="whitespace-nowrap"
            >
              {isEditMode
                ? "Edit Assignment Plan"
                : "Create Assignment Plan"}
            </span>
          </div>

          <DialogDescription>
            Assign one or more
            guards to specific
            weekdays for this
            duty schedule.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div
            className="
              flex
              items-center
              justify-center
              py-12
            "
          >
            <div
              className="text-center"
            >
              <div
                className="
                  mx-auto
                  mb-4
                  h-10
                  w-10
                  animate-spin
                  rounded-full
                  border-b-2
                  border-[#5F0015]
                "
              />

              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Loading plan
                details...
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={
              handleSubmit
            }
          >
            <div
              className="
                space-y-5
                py-4
              "
            >
              {/* ====================================
                  SHIFT SCHEDULE
              ==================================== */}

              <div
                className="space-y-2"
              >
                <Label
                  htmlFor="duty_schedule_id"
                  className="text-sm font-medium"
                >
                  Shift Schedule *
                </Label>

                <Select
                  value={
                    formData.duty_schedule_id
                  }
                  onValueChange={(
                    value
                  ) =>
                    handleChange(
                      "duty_schedule_id",
                      value
                    )
                  }
                >
                  <SelectTrigger
                    className="w-full"
                  >
                    <SelectValue
                      placeholder="Select schedule"
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {dutySchedules.length ===
                      0 ? (
                      <div
                        className="
                          p-3
                          text-sm
                          text-muted-foreground
                        "
                      >
                        No schedules
                        available
                      </div>
                    ) : (
                      dutySchedules.map(
                        (
                          schedule: any
                        ) => (
                          <SelectItem
                            key={
                              schedule.id
                            }
                            value={String(
                              schedule.id
                            )}
                          >
                            <div
                              className="
                                flex
                                flex-col
                              "
                            >
                              <span
                                className="font-medium"
                              >
                                {schedule.title ||
                                  `Schedule #${schedule.id}`}
                              </span>

                              {schedule.description && (
                                <span
                                  className="
                                    text-xs
                                    text-muted-foreground
                                  "
                                >
                                  {
                                    schedule.description
                                  }
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        )
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* ====================================
                  GUARD ASSIGNMENTS
              ==================================== */}

              <div
                className="
                  rounded-xl
                  border
                  bg-muted/20
                  p-3
                  sm:p-4
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        font-semibold
                      "
                    >
                      <Users
                        className="
                          h-4
                          w-4
                          text-[#5F0015]
                        "
                      />

                      Guard Assignments
                    </div>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-muted-foreground
                      "
                    >
                      Select each guard
                      and the weekdays
                      they cover.
                      Different guards
                      may share the same
                      weekday when the
                      schedule requires
                      multiple guards.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={
                      addGuardRow
                    }
                    className="shrink-0"
                  >
                    <Plus
                      className="
                        mr-1
                        h-4
                        w-4
                      "
                    />

                    Add Another Guard
                  </Button>
                </div>

                <div
                  className="space-y-3"
                >
                  {guardRows.map(
                    (
                      row,
                      index
                    ) => {
                      const selectedGuard =
                        getGuard(
                          row.guard_id
                        );

                      return (
                        <div
                          key={
                            index
                          }
                          className="
                            rounded-xl
                            border
                            bg-background
                            p-3
                            shadow-sm
                            sm:p-4
                          "
                        >
                          {/* Guard row header */}

                          <div
                            className="
                              mb-3
                              flex
                              items-center
                              justify-between
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-[#5F0015]/10
                                "
                              >
                                <User
                                  className="
                                    h-4
                                    w-4
                                    text-[#5F0015]
                                  "
                                />
                              </div>

                              <div>
                                <p
                                  className="
                                    text-sm
                                    font-semibold
                                  "
                                >
                                  Guard{" "}
                                  {index +
                                    1}
                                </p>

                                {selectedGuard && (
                                  <p
                                    className="
                                      text-xs
                                      text-muted-foreground
                                    "
                                  >
                                    {
                                      selectedGuard.full_name
                                    }

                                    {selectedGuard.guard_code
                                      ? ` • ${selectedGuard.guard_code}`
                                      : ""}
                                  </p>
                                )}
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeGuardRow(
                                  index
                                )
                              }
                              className="
                                h-8
                                w-8
                                text-red-600
                                hover:bg-red-50
                                hover:text-red-700
                              "
                              title="Remove guard"
                            >
                              <Trash2
                                className="
                                  h-4
                                  w-4
                                "
                              />
                            </Button>
                          </div>

                          <div
                            className="space-y-4"
                          >
                            {/* Guard selector */}

                            <div
                              className="space-y-2"
                            >
                              <Label
                                className="
                                  text-xs
                                  font-medium
                                "
                              >
                                Guard *
                              </Label>

                              <Select
                                value={
                                  row.guard_id
                                }
                                onValueChange={(
                                  value
                                ) =>
                                  updateGuard(
                                    index,
                                    value
                                  )
                                }
                              >
                                <SelectTrigger
                                  className="w-full"
                                >
                                  <SelectValue
                                    placeholder="Select guard"
                                  />
                                </SelectTrigger>

                                <SelectContent>
                                  {guards.map(
                                    (
                                      guard: any
                                    ) => {
                                      const alreadyUsed =
                                        selectedGuardIds.includes(
                                          String(
                                            guard.id
                                          )
                                        ) &&
                                        row.guard_id !==
                                        String(
                                          guard.id
                                        );

                                      return (
                                        <SelectItem
                                          key={
                                            guard.id
                                          }
                                          value={String(
                                            guard.id
                                          )}
                                          disabled={
                                            alreadyUsed
                                          }
                                        >
                                          <div
                                            className="
                                              flex
                                              items-center
                                              gap-2
                                            "
                                          >
                                            <User
                                              className="
                                                h-4
                                                w-4
                                                text-muted-foreground
                                              "
                                            />

                                            <span>
                                              {
                                                guard.full_name
                                              }
                                            </span>

                                            {guard.guard_code && (
                                              <span
                                                className="
                                                  text-xs
                                                  text-muted-foreground
                                                "
                                              >
                                                (
                                                {
                                                  guard.guard_code
                                                }
                                                )
                                              </span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      );
                                    }
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Weekdays */}

                            <div
                              className="space-y-2"
                            >
                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  justify-between
                                  gap-2
                                "
                              >
                                <Label
                                  className="
                                    text-xs
                                    font-medium
                                  "
                                >
                                  Working Days *
                                </Label>

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-1
                                  "
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="
                                      h-7
                                      px-2
                                      text-xs
                                    "
                                    onClick={() =>
                                      selectAllWeekdays(
                                        index
                                      )
                                    }
                                  >
                                    All days
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="
                                      h-7
                                      px-2
                                      text-xs
                                    "
                                    onClick={() =>
                                      clearWeekdays(
                                        index
                                      )
                                    }
                                  >
                                    Clear
                                  </Button>
                                </div>
                              </div>

                              <div
                                className="
                                  grid
                                  grid-cols-4
                                  gap-2
                                  sm:grid-cols-7
                                "
                              >
                                {WEEKDAYS.map(
                                  (
                                    day
                                  ) => {
                                    const active =
                                      row.weekdays.includes(
                                        day.value
                                      );

                                    return (
                                      <button
                                        key={
                                          day.value
                                        }
                                        type="button"
                                        title={
                                          day.label
                                        }
                                        onClick={() =>
                                          toggleWeekday(
                                            index,
                                            day.value
                                          )
                                        }
                                        className={cn(
                                          `
                                            h-9
                                            rounded-md
                                            border
                                            text-xs
                                            font-medium
                                            transition-colors
                                          `,

                                          active
                                            ? `
                                              border-[#5F0015]
                                              bg-[#5F0015]
                                              text-white
                                            `
                                            : `
                                              border-border
                                              bg-background
                                              text-muted-foreground
                                              hover:bg-muted
                                            `
                                        )}
                                      >
                                        {
                                          day.short
                                        }
                                      </button>
                                    );
                                  }
                                )}
                              </div>

                              <p
                                className="
                                  text-[11px]
                                  text-muted-foreground
                                "
                              >
                                {row
                                  .weekdays
                                  .length ===
                                  7
                                  ? "Every day"
                                  : row
                                    .weekdays
                                    .length ===
                                    0
                                    ? "No working days selected"
                                    : WEEKDAYS.filter(
                                      (
                                        day
                                      ) =>
                                        row.weekdays.includes(
                                          day.value
                                        )
                                    )
                                      .map(
                                        (
                                          day
                                        ) =>
                                          day.label
                                      )
                                      .join(
                                        ", "
                                      )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* ====================================
                  DATES
              ==================================== */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                {/* Start Date */}

                <div
                  className="space-y-2"
                >
                  <Label
                    className="
                      text-sm
                      font-medium
                    "
                  >
                    Start Date *
                  </Label>

                  <Popover>
                    <PopoverTrigger
                      asChild
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          `
                            h-10
                            w-full
                            justify-start
                            border-gray-300
                            text-left
                            font-normal
                            dark:border-gray-600
                          `,

                          !formData.start_date &&
                          "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        {formData.start_date
                          ? format(
                            new Date(
                              `${formData.start_date}T00:00:00`
                            ),
                            "MMM dd, yyyy"
                          )
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="
                        w-auto
                        p-0
                      "
                    >
                      <Calendar
                        mode="single"
                        selected={
                          formData.start_date
                            ? new Date(
                              `${formData.start_date}T00:00:00`
                            )
                            : undefined
                        }
                        onSelect={(
                          date
                        ) => {
                          if (
                            date
                          ) {
                            handleChange(
                              "start_date",
                              format(
                                date,
                                "yyyy-MM-dd"
                              )
                            );
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}

                <div
                  className="space-y-2"
                >
                  <Label
                    className="
                      text-sm
                      font-medium
                    "
                  >
                    End Date
                  </Label>

                  <Popover>
                    <PopoverTrigger
                      asChild
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          `
                            h-10
                            w-full
                            justify-start
                            border-gray-300
                            text-left
                            font-normal
                            dark:border-gray-600
                          `,

                          !formData.end_date &&
                          "text-muted-foreground",

                          formData.is_open_ended &&
                          `
                              cursor-not-allowed
                              opacity-50
                            `
                        )}
                        disabled={
                          formData.is_open_ended
                        }
                      >
                        <CalendarIcon
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        {formData.end_date
                          ? format(
                            new Date(
                              `${formData.end_date}T00:00:00`
                            ),
                            "MMM dd, yyyy"
                          )
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="
                        w-auto
                        p-0
                      "
                    >
                      <Calendar
                        mode="single"
                        selected={
                          formData.end_date
                            ? new Date(
                              `${formData.end_date}T00:00:00`
                            )
                            : undefined
                        }
                        onSelect={(
                          date
                        ) => {
                          if (
                            date
                          ) {
                            handleChange(
                              "end_date",
                              format(
                                date,
                                "yyyy-MM-dd"
                              )
                            );
                          }
                        }}
                        initialFocus
                        disabled={
                          formData.is_open_ended
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* ====================================
                  OPEN ENDED
              ==================================== */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  rounded-lg
                  bg-gray-50
                  p-3
                  dark:bg-gray-800
                "
              >
                <div>
                  <Label
                    className="
                      text-sm
                      font-medium
                    "
                  >
                    Open-ended
                  </Label>

                  <p
                    className="
                      text-xs
                      text-muted-foreground
                    "
                  >
                    No end date,
                    continues
                    indefinitely
                  </p>
                </div>

                <Switch
                  checked={
                    formData.is_open_ended
                  }
                  onCheckedChange={(
                    checked
                  ) => {
                    handleChange(
                      "is_open_ended",
                      checked
                    );

                    if (
                      checked
                    ) {
                      handleChange(
                        "end_date",
                        ""
                      );
                    }
                  }}
                />
              </div>

              {/* ====================================
                  STATUS
              ==================================== */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                <div
                  className="space-y-2"
                >
                  <Label
                    htmlFor="status"
                    className="
                      text-sm
                      font-medium
                    "
                  >
                    Status
                  </Label>

                  <Select
                    value={
                      formData.status
                    }
                    onValueChange={(
                      value
                    ) =>
                      handleChange(
                        "status",
                        value as AssignmentPlanStatus
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select status"
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem
                        value="active"
                      >
                        Active
                      </SelectItem>

                      <SelectItem
                        value="paused"
                      >
                        Paused
                      </SelectItem>

                      <SelectItem
                        value="completed"
                      >
                        Completed
                      </SelectItem>

                      <SelectItem
                        value="cancelled"
                      >
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="space-y-2"
                >
                  <Label
                    className="
                      text-sm
                      font-medium
                    "
                  >
                    Active Status
                  </Label>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      pt-1
                    "
                  >
                    <Switch
                      checked={
                        formData.is_active
                      }
                      onCheckedChange={(
                        checked
                      ) =>
                        handleChange(
                          "is_active",
                          checked
                        )
                      }
                    />

                    <span
                      className="
                        text-sm
                        text-muted-foreground
                      "
                    >
                      {formData.is_active
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ====================================
                  NOTES
              ==================================== */}

              <div
                className="space-y-2"
              >
                <Label
                  htmlFor="notes"
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Notes (Optional)
                </Label>

                <FloatingLabelInput
                  label="Add notes about this assignment plan..."
                  value={
                    formData.notes
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "notes",
                      event.target
                        .value
                    )
                  }
                />
              </div>

              {/* ====================================
                  PLAN SUMMARY
              ==================================== */}

              <div
                className="
                  rounded-lg
                  bg-gray-50
                  p-3
                  dark:bg-gray-800
                "
              >
                <p
                  className="
                    mb-2
                    text-xs
                    font-medium
                    text-muted-foreground
                  "
                >
                  Plan Summary
                </p>

                <div
                  className="
                    space-y-2
                    text-sm
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-2
                    "
                  >
                    <Shield
                      className="
                        mt-0.5
                        h-4
                        w-4
                        shrink-0
                        text-blue-500
                      "
                    />

                    <span
                      className="font-medium"
                    >
                      Schedule:
                    </span>

                    <span
                      className="text-muted-foreground"
                    >
                      {selectedSchedule?.title ||
                        (formData.duty_schedule_id
                          ? `#${formData.duty_schedule_id}`
                          : "Not selected")}
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      items-start
                      gap-2
                    "
                  >
                    <Users
                      className="
                        mt-0.5
                        h-4
                        w-4
                        shrink-0
                        text-green-500
                      "
                    />

                    <span
                      className="font-medium"
                    >
                      Guards:
                    </span>

                    <span
                      className="text-muted-foreground"
                    >
                      {
                        guardRows.filter(
                          (
                            row
                          ) =>
                            row.guard_id
                        ).length
                      }
                    </span>
                  </div>

                  {guardRows
                    .filter(
                      (
                        row
                      ) =>
                        row.guard_id
                    )
                    .map(
                      (
                        row,
                        index
                      ) => {
                        const guard =
                          getGuard(
                            row.guard_id
                          );

                        return (
                          <div
                            key={`${row.guard_id}-${index}`}
                            className="
                              ml-6
                              text-xs
                              text-muted-foreground
                            "
                          >
                            {guard?.full_name ||
                              `Guard #${row.guard_id}`}

                            {" — "}

                            {row
                              .weekdays
                              .length ===
                              7
                              ? "Every day"
                              : WEEKDAYS.filter(
                                (
                                  day
                                ) =>
                                  row.weekdays.includes(
                                    day.value
                                  )
                              )
                                .map(
                                  (
                                    day
                                  ) =>
                                    day.short
                                )
                                .join(
                                  ", "
                                )}
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            </div>

            {/* ======================================
                FOOTER
            ====================================== */}

            <DialogActionFooter
              cancelText="Cancel"
              submitText={
                isEditMode
                  ? "Update Plan"
                  : "Create Plan"
              }
              isSubmitting={
                isSaving
              }
              submitColor="
                bg-[#5F0015]
                hover:bg-[#7A001B]
              "
              onSubmit={
                handleSubmit
              }
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}