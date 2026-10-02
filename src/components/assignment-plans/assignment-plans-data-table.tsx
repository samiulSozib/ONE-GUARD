"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

import {
  Calendar,
  Clock,
  EllipsisVertical,
  Eye,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";

import { format } from "date-fns";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";

import {
  deleteAssignmentPlan,
  fetchAssignmentPlans,
  toggleAssignmentPlanStatus,
} from "@/store/slices/schedulingSlice";

import {
  AssignmentPlanStatus,
  GuardAssignmentPlan,
  IsoWeekday,
} from "@/app/types/scheduling";

import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================
// STATUS COLORS
// ============================================

const statusColors: Record<
  AssignmentPlanStatus,
  string
> = {
  active:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  paused:
    "bg-amber-100 text-amber-700 border-amber-200",

  completed:
    "bg-blue-100 text-blue-700 border-blue-200",

  cancelled:
    "bg-red-100 text-red-700 border-red-200",
};

// ============================================
// WEEKDAY NAMES
// ============================================

const weekdayNames: Record<
  IsoWeekday,
  string
> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

// ============================================
// PROPS
// ============================================

interface AssignmentPlansDataTableProps {
  onAddClick?: () => void;

  onViewClick?: (
    plan: GuardAssignmentPlan
  ) => void;

  onEditClick?: (
    plan: GuardAssignmentPlan
  ) => void;
}

// ============================================
// COMPONENT
// ============================================

export function AssignmentPlansDataTable({
  onAddClick,
  onViewClick,
  onEditClick,
}: AssignmentPlansDataTableProps) {
  const dispatch = useAppDispatch();

  const {
    plans,
    pagination,
    isLoading,
  } = useAppSelector(
    (state) =>
      state.scheduling.plans
  );

  // ============================================
  // LOCAL STATE
  // ============================================

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    filters,
    setFilters,
  ] = useState({
    page: 1,

    per_page: 10,

    status: "all" as string,
  });

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    planToDelete,
    setPlanToDelete,
  ] =
    useState<GuardAssignmentPlan | null>(
      null
    );

  // ============================================
  // LOAD PLANS
  // ============================================

  useEffect(() => {
    const params: any = {
      page: filters.page,

      per_page:
        filters.per_page,
    };

    if (searchTerm) {
      params.search =
        searchTerm;
    }

    if (
      filters.status !==
      "all"
    ) {
      params.status =
        filters.status;
    }

    dispatch(
      fetchAssignmentPlans(
        params
      )
    );
  }, [
    dispatch,
    filters,
    searchTerm,
  ]);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(
      event.target.value
    );

    setFilters(
      (previous) => ({
        ...previous,

        page: 1,
      })
    );
  };

  const handleSearchSubmit =
    () => {
      setFilters(
        (previous) => ({
          ...previous,

          page: 1,
        })
      );
    };

  // ============================================
  // STATUS FILTER
  // ============================================

  const handleStatusFilter = (
    status: string
  ) => {
    setFilters(
      (previous) => ({
        ...previous,

        status,

        page: 1,
      })
    );
  };

  // ============================================
  // PAGINATION
  // ============================================

  const handlePageChange = (
    page: number
  ) => {
    setFilters(
      (previous) => ({
        ...previous,

        page,
      })
    );
  };

  // ============================================
  // DELETE
  // ============================================

  const handleDeleteClick = (
    plan: GuardAssignmentPlan
  ) => {
    setPlanToDelete(plan);

    setDeleteDialogOpen(
      true
    );
  };

  const handleConfirmDelete =
    async () => {
      if (!planToDelete) {
        return;
      }

      try {
        await dispatch(
          deleteAssignmentPlan(
            planToDelete.id
          )
        ).unwrap();

        SweetAlertService.success(
          "Deleted",
          "Assignment plan has been deleted."
        );

        setDeleteDialogOpen(
          false
        );

        setPlanToDelete(
          null
        );

        dispatch(
          fetchAssignmentPlans({
            page:
              filters.page,

            per_page:
              filters.per_page,

            status:
              filters.status !==
                "all"
                ? (filters.status as AssignmentPlanStatus)
                : undefined,

            search:
              searchTerm ||
              undefined,
          })
        );
      } catch (
      error: any
      ) {
        SweetAlertService.error(
          "Delete Failed",
          error?.message ||
          "Failed to delete assignment plan."
        );
      }
    };

  // ============================================
  // TOGGLE ACTIVE STATUS
  // ============================================

  const handleToggleStatus =
    async (
      plan: GuardAssignmentPlan
    ) => {
      try {
        await dispatch(
          toggleAssignmentPlanStatus({
            id: plan.id,

            data: {
              is_active:
                !plan.is_active,
            },
          })
        ).unwrap();

        SweetAlertService.success(
          "Status Updated",
          `Plan has been ${!plan.is_active
            ? "activated"
            : "deactivated"
          }.`
        );
      } catch (
      error: any
      ) {
        SweetAlertService.error(
          "Update Failed",
          error?.message ||
          "Failed to update status."
        );
      }
    };

  // ============================================
  // DATE FORMATTER
  // ============================================

  const formatDate = (
    dateString: string
  ) => {
    try {
      const normalized =
        dateString.substring(
          0,
          10
        );

      return format(
        new Date(
          `${normalized}T00:00:00`
        ),
        "MMM dd, yyyy"
      );
    } catch {
      return dateString;
    }
  };

  // ============================================
  // STATUS BADGE
  // ============================================

  const getStatusBadge = (
    status: AssignmentPlanStatus
  ) => {
    return (
      <Badge
        className={`
          ${statusColors[status]}
          border
          px-2
          py-0.5
          text-xs
          font-medium
        `}
      >
        {status
          .charAt(0)
          .toUpperCase() +
          status.slice(1)}
      </Badge>
    );
  };

  // ============================================
  // GUARD COVERAGE DISPLAY
  // ============================================

  const renderGuards = (
    plan: GuardAssignmentPlan
  ) => {
    /*
     * NEW MULTI-GUARD RESPONSE
     */
    if (
      plan.guards &&
      plan.guards.length > 0
    ) {
      return (
        <div
          className="
            min-w-[230px]
            space-y-2
          "
        >
          {plan.guards.map(
            (
              row,
              index
            ) => {
              const weekdays =
                [
                  ...(row.weekdays ||
                    []),
                ].sort(
                  (a, b) =>
                    a - b
                );

              return (
                <div
                  key={
                    row.id ||
                    `${row.guard_id}-${index}`
                  }
                  className="
                    rounded-md
                    border
                    bg-background
                    px-2
                    py-1.5
                  "
                >
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
                        h-3.5
                        w-3.5
                        shrink-0
                        text-[#5F0015]
                      "
                    />

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <div
                        className="
                          truncate
                          text-sm
                          font-medium
                        "
                      >
                        {row.guard
                          ?.full_name ||
                          `Guard #${row.guard_id}`}
                      </div>

                      {row.guard
                        ?.guard_code && (
                          <div
                            className="
                            text-[10px]
                            text-muted-foreground
                          "
                          >
                            {
                              row
                                .guard
                                .guard_code
                            }
                          </div>
                        )}

                      <div
                        className="
                          mt-1
                          flex
                          flex-wrap
                          gap-1
                        "
                      >
                        {weekdays.length ===
                          7 ? (
                          <Badge
                            variant="outline"
                            className="
                              border-[#5F0015]/20
                              bg-[#5F0015]/5
                              px-1.5
                              py-0
                              text-[10px]
                              text-[#5F0015]
                            "
                          >
                            Every day
                          </Badge>
                        ) : weekdays.length >
                          0 ? (
                          weekdays.map(
                            (
                              day
                            ) => (
                              <Badge
                                key={
                                  day
                                }
                                variant="outline"
                                className="
                                  px-1.5
                                  py-0
                                  text-[10px]
                                "
                              >
                                {
                                  weekdayNames[
                                  day
                                  ]
                                }
                              </Badge>
                            )
                          )
                        ) : (
                          <Badge
                            variant="outline"
                            className="
                              border-red-200
                              bg-red-50
                              px-1.5
                              py-0
                              text-[10px]
                              text-red-600
                            "
                          >
                            No days
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      );
    }

    /*
     * LEGACY FALLBACK
     *
     * Keep this temporarily so older records/API
     * responses can still be displayed.
     */
    if (
      plan.guard ||
      plan.guard_id ||
      plan.legacy_guard_id
    ) {
      const guardId =
        plan.guard_id ??
        plan.legacy_guard_id;

      return (
        <div
          className="
            min-w-[200px]
            rounded-md
            border
            bg-background
            px-2
            py-1.5
          "
        >
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
                h-3.5
                w-3.5
                text-muted-foreground
              "
            />

            <div>
              <div
                className="
                  text-sm
                  font-medium
                "
              >
                {plan.guard
                  ?.full_name ||
                  `Guard #${guardId}`}
              </div>

              {plan.guard
                ?.guard_code && (
                  <div
                    className="
                    text-[10px]
                    text-muted-foreground
                  "
                  >
                    {
                      plan.guard
                        .guard_code
                    }
                  </div>
                )}

              <Badge
                variant="outline"
                className="
                  mt-1
                  px-1.5
                  py-0
                  text-[10px]
                "
              >
                Every day
              </Badge>
            </div>
          </div>
        </div>
      );
    }

    return (
      <span
        className="
          text-sm
          text-muted-foreground
        "
      >
        No guard rules
      </span>
    );
  };

  // ============================================
  // LOADING
  // ============================================

  if (
    isLoading &&
    plans.length === 0
  ) {
    return (
      <AssignmentPlansTableSkeleton />
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <Card
        className="
          overflow-hidden
          rounded-2xl
          border-0
          shadow-sm
        "
      >
        {/* ======================================
            FILTERS
        ====================================== */}

        <div
          className="
            -mt-6
            flex
            w-full
            flex-wrap
            items-center
            justify-between
            gap-3
            rounded-t-md
            bg-[#F4F6F8]
            p-3
            md:justify-start
            sm:p-5
          "
        >
          <CardTitle
            className="
              flex
              items-center
              gap-1
              text-sm
              dark:text-black
            "
          >
            <Search
              className="
                h-4
                w-4
              "
            />

            Filters
          </CardTitle>

          {/* Search */}

          <div
            className="
              max-w-xs
              flex-1
            "
          >
            <InputGroup>
              <InputGroupInput
                placeholder="Search plans..."
                value={
                  searchTerm
                }
                onChange={
                  handleSearch
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleSearchSubmit();
                  }
                }}
                className="
                  h-8
                  text-xs
                  sm:h-9
                  sm:text-sm
                "
              />

              <InputGroupAddon
                onClick={
                  handleSearchSubmit
                }
                className="cursor-pointer"
              >
                <Search
                  className="
                    h-3
                    w-3
                    sm:h-4
                    sm:w-4
                  "
                />
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Status filter */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <select
              value={
                filters.status
              }
              onChange={(
                event
              ) =>
                handleStatusFilter(
                  event.target
                    .value
                )
              }
              className="
                h-8
                rounded-md
                border
                bg-background
                px-2
                text-xs
                sm:h-9
                sm:text-sm
              "
            >
              <option
                value="all"
              >
                All Status
              </option>

              <option
                value="active"
              >
                Active
              </option>

              <option
                value="paused"
              >
                Paused
              </option>

              <option
                value="completed"
              >
                Completed
              </option>

              <option
                value="cancelled"
              >
                Cancelled
              </option>
            </select>
          </div>

          {/* Refresh */}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters(
                (
                  previous
                ) => ({
                  ...previous,

                  page: 1,
                })
              );

              dispatch(
                fetchAssignmentPlans({
                  page: 1,

                  per_page:
                    filters.per_page,

                  status:
                    filters.status !==
                      "all"
                      ? (filters.status as AssignmentPlanStatus)
                      : undefined,

                  search:
                    searchTerm ||
                    undefined,
                })
              );
            }}
            className="
              h-8
              text-xs
              sm:h-9
              sm:text-sm
            "
          >
            <RefreshCw
              className="
                mr-1
                h-3
                w-3
                sm:h-4
                sm:w-4
              "
            />

            Refresh
          </Button>

          {/* Add */}

          {onAddClick && (
            <Button
              size="sm"
              onClick={
                onAddClick
              }
              className="
                h-8
                bg-[#5F0015]
                text-xs
                text-white
                hover:bg-[#7A001B]
                sm:h-9
                sm:text-sm
              "
            >
              <Plus
                className="
                  mr-1
                  h-3
                  w-3
                  sm:h-4
                  sm:w-4
                "
              />

              Add Plan
            </Button>
          )}
        </div>

        {/* ======================================
            TABLE
        ====================================== */}

        <CardContent
          className="p-0"
        >
          <div
            className="overflow-x-auto"
          >
            <Table>
              <TableHeader>
                <TableRow
                  className="bg-muted/30"
                >
                  <TableHead
                    className="
                      text-xs
                      font-semibold
                    "
                  >
                    ID
                  </TableHead>

                  <TableHead
                    className="
                      text-xs
                      font-semibold
                    "
                  >
                    Schedule
                  </TableHead>

                  <TableHead
                    className="
                      min-w-[250px]
                      text-xs
                      font-semibold
                    "
                  >
                    Guard Coverage
                  </TableHead>

                  <TableHead
                    className="
                      text-xs
                      font-semibold
                    "
                  >
                    Start Date
                  </TableHead>

                  <TableHead
                    className="
                      text-xs
                      font-semibold
                    "
                  >
                    End Date
                  </TableHead>

                  <TableHead
                    className="
                      text-xs
                      font-semibold
                    "
                  >
                    Status
                  </TableHead>

                  <TableHead
                    className="
                      text-xs
                      font-semibold
                    "
                  >
                    Active
                  </TableHead>

                  <TableHead
                    className="
                      text-center
                      text-xs
                      font-semibold
                    "
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {plans.length ===
                  0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="
                        py-12
                        text-center
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          items-center
                          justify-center
                        "
                      >
                        <Calendar
                          className="
                            mb-4
                            h-12
                            w-12
                            text-muted-foreground
                          "
                        />

                        <h3
                          className="
                            mb-2
                            text-lg
                            font-medium
                            text-foreground
                          "
                        >
                          No assignment
                          plans found
                        </h3>

                        <p
                          className="
                            mb-4
                            text-sm
                            text-muted-foreground
                          "
                        >
                          Create a plan
                          and assign
                          guards to
                          weekdays.
                        </p>

                        {onAddClick && (
                          <Button
                            onClick={
                              onAddClick
                            }
                          >
                            <Plus
                              className="
                                mr-2
                                h-4
                                w-4
                              "
                            />

                            New Plan
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map(
                    (
                      plan
                    ) => (
                      <TableRow
                        key={
                          plan.id
                        }
                        className="
                          transition-colors
                          hover:bg-muted/30
                        "
                      >
                        {/* ID */}

                        <TableCell
                          className="
                            font-mono
                            text-xs
                          "
                        >
                          #
                          {
                            plan.id
                          }
                        </TableCell>

                        {/* Schedule */}

                        <TableCell>
                          <div
                            className="
                              flex
                              min-w-[180px]
                              flex-col
                            "
                          >
                            <span
                              className="
                                flex
                                items-center
                                gap-1
                                text-sm
                                font-medium
                              "
                            >
                              <Shield
                                className="
                                  h-3
                                  w-3
                                  text-blue-500
                                "
                              />

                              {plan
                                .duty_schedule
                                ?.title ||
                                `Schedule #${plan.duty_schedule_id}`}
                            </span>

                            {plan
                              .duty_schedule
                              ?.description && (
                                <span
                                  className="
                                  max-w-[220px]
                                  truncate
                                  text-xs
                                  text-muted-foreground
                                "
                                >
                                  {
                                    plan
                                      .duty_schedule
                                      .description
                                  }
                                </span>
                              )}
                          </div>
                        </TableCell>

                        {/* NEW GUARD COVERAGE */}

                        <TableCell>
                          {renderGuards(
                            plan
                          )}
                        </TableCell>

                        {/* Start Date */}

                        <TableCell
                          className="text-sm"
                        >
                          <div
                            className="
                              flex
                              min-w-[110px]
                              items-center
                              gap-1
                            "
                          >
                            <Clock
                              className="
                                h-3
                                w-3
                                text-muted-foreground
                              "
                            />

                            {formatDate(
                              plan.start_date
                            )}
                          </div>
                        </TableCell>

                        {/* End Date */}

                        <TableCell>
                          {plan.is_open_ended ? (
                            <Badge
                              variant="outline"
                              className="
                                border-blue-200
                                bg-blue-50
                                text-blue-700
                              "
                            >
                              Open-ended
                            </Badge>
                          ) : (
                            <span
                              className="
                                min-w-[110px]
                                text-sm
                              "
                            >
                              {plan.end_date
                                ? formatDate(
                                  plan.end_date
                                )
                                : "—"}
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}

                        <TableCell>
                          {getStatusBadge(
                            plan.status
                          )}
                        </TableCell>

                        {/* Active */}

                        <TableCell>
                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >
                            <Switch
                              checked={
                                plan.is_active
                              }
                              onCheckedChange={() =>
                                handleToggleStatus(
                                  plan
                                )
                              }
                            />

                            {plan.is_active ? (
                              <Power
                                className="
                                  h-3
                                  w-3
                                  text-emerald-500
                                "
                              />
                            ) : (
                              <PowerOff
                                className="
                                  h-3
                                  w-3
                                  text-gray-400
                                "
                              />
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}

                        <TableCell
                          className="text-center"
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                            >
                              <Button
                                variant="ghost"
                                className="
                                  h-8
                                  w-8
                                  p-0
                                "
                              >
                                <EllipsisVertical
                                  className="
                                    h-4
                                    w-4
                                  "
                                />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                            >
                              {onViewClick && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onViewClick(
                                      plan
                                    )
                                  }
                                >
                                  <Eye
                                    className="
                                      mr-2
                                      h-4
                                      w-4
                                    "
                                  />

                                  View details
                                </DropdownMenuItem>
                              )}

                              {onEditClick && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onEditClick(
                                      plan
                                    )
                                  }
                                >
                                  <Pencil
                                    className="
                                      mr-2
                                      h-4
                                      w-4
                                    "
                                  />

                                  Edit plan
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleStatus(
                                    plan
                                  )
                                }
                                className="text-blue-600"
                              >
                                {plan.is_active ? (
                                  <>
                                    <PowerOff
                                      className="
                                        mr-2
                                        h-4
                                        w-4
                                      "
                                    />

                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Power
                                      className="
                                        mr-2
                                        h-4
                                        w-4
                                      "
                                    />

                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteClick(
                                    plan
                                  )
                                }
                                className="text-red-600"
                              >
                                <Trash2
                                  className="
                                    mr-2
                                    h-4
                                    w-4
                                  "
                                />

                                Delete plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>

          {/* ====================================
              PAGINATION
          ==================================== */}

          {plans.length > 0 && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-between
                gap-4
                border-t
                bg-gray-50/50
                px-4
                py-6
                dark:bg-gray-900/20
                sm:flex-row
              "
            >
              <div
                className="
                  text-sm
                  text-gray-600
                  dark:text-gray-400
                "
              >
                Showing{" "}
                <span
                  className="
                    font-medium
                    text-gray-900
                    dark:text-white
                  "
                >
                  {
                    plans.length
                  }
                </span>{" "}
                of{" "}
                <span
                  className="
                    font-medium
                    text-gray-900
                    dark:text-white
                  "
                >
                  {
                    pagination.total
                  }
                </span>{" "}
                plans
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    pagination.current_page ===
                    1
                  }
                  onClick={() =>
                    handlePageChange(
                      pagination.current_page -
                      1
                    )
                  }
                >
                  Previous
                </Button>

                <span
                  className="
                    rounded-lg
                    bg-blue-50
                    px-3
                    py-1
                    text-sm
                    font-medium
                    text-blue-600
                    dark:bg-blue-900/30
                    dark:text-blue-400
                  "
                >
                  Page{" "}
                  {
                    pagination.current_page
                  }{" "}
                  of{" "}
                  {
                    pagination.last_page
                  }
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    pagination.current_page ===
                    pagination.last_page
                  }
                  onClick={() =>
                    handlePageChange(
                      pagination.current_page +
                      1
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================
          DELETE DIALOG
      ======================================== */}

      <DeleteDialog
        isOpen={
          deleteDialogOpen
        }
        onOpenChange={
          setDeleteDialogOpen
        }
        onConfirm={
          handleConfirmDelete
        }
        title="Delete Assignment Plan"
        description="Are you sure you want to delete this assignment plan? This action cannot be undone."
      />
    </>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

function AssignmentPlansTableSkeleton() {
  return (
    <Card
      className="
        rounded-2xl
        shadow-sm
      "
    >
      <CardContent
        className="p-6"
      >
        <div
          className="space-y-4"
        >
          {[
            1,
            2,
            3,
            4,
            5,
          ].map(
            (
              item
            ) => (
              <div
                key={
                  item
                }
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  pb-4
                "
              >
                <div
                  className="space-y-2"
                >
                  <Skeleton
                    className="
                      h-4
                      w-32
                    "
                  />

                  <Skeleton
                    className="
                      h-3
                      w-24
                    "
                  />
                </div>

                <Skeleton
                  className="
                    h-8
                    w-40
                  "
                />

                <Skeleton
                  className="
                    h-8
                    w-8
                    rounded-full
                  "
                />
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}