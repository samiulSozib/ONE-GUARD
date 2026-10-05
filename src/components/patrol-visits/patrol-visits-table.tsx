"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { format } from "date-fns";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Footprints,
  ListFilter,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  User,
} from "lucide-react";

import {
  PatrolAssignmentSummary,
  PatrolVisitParams,
} from "@/app/types/patrolVisit";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";

import {
  fetchPatrolAssignments,
  fetchPatrolVisitsByAssignment,
  setCurrentPatrolAssignment,
} from "@/store/slices/patrolVisitSlice";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

/* =========================================================
   Props
   ========================================================= */

interface PatrolVisitsTableProps {
  onViewAssignment?: (
    assignment: PatrolAssignmentSummary
  ) => void;
}

/* =========================================================
   Helpers
   ========================================================= */

const getGuardName = (
  assignment: PatrolAssignmentSummary
) => {
  const guard = assignment.guard;

  if (!guard) {
    return `Guard #${assignment.guard_id ?? "N/A"}`;
  }

  if (guard.full_name) {
    return guard.full_name;
  }

  const fullName = [
    guard.first_name,
    guard.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    guard.guard_code ||
    `Guard #${guard.id ?? assignment.guard_id ?? "N/A"}`
  );
};

const getSiteName = (
  assignment: PatrolAssignmentSummary
) => {
  return (
    assignment.site?.site_name ||
    assignment.site?.name ||
    assignment.duty?.site?.site_name ||
    assignment.duty?.site?.name ||
    "N/A"
  );
};

const getLocationName = (
  assignment: PatrolAssignmentSummary
) => {
  return (
    assignment.site_location?.title ||
    assignment.site_location?.name ||
    assignment.duty?.site_location?.title ||
    assignment.duty?.site_location?.name ||
    "N/A"
  );
};

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "N/A";
  }

  try {
    return format(
      new Date(value),
      "MMM dd, yyyy"
    );
  } catch {
    return value;
  }
};

const formatDateTime = (
  value?: string | null
) => {
  if (!value) {
    return "—";
  }

  try {
    return format(
      new Date(value),
      "MMM dd • hh:mm a"
    );
  } catch {
    return value;
  }
};

const getStatusLabel = (
  status?: string | null
) => {
  if (!status) {
    return "Pending";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const getStatusClassName = (
  status?: string | null
) => {
  switch (status) {
    case "completed":
      return "border-green-200 bg-green-100 text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-400";

    case "checked_in":
    case "in_progress":
      return "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400";

    case "missed":
      return "border-red-200 bg-red-100 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400";

    case "partially_completed":
      return "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400";

    case "cancelled":
      return "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300";

    default:
      return "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-400";
  }
};

/* =========================================================
   Patrol Visits Table
   ========================================================= */

const PatrolVisitsTable = ({
  onViewAssignment,
}: PatrolVisitsTableProps) => {
  const dispatch = useAppDispatch();

  const {
    assignments,
    pagination,
    isLoading,
  } = useAppSelector(
    (state) => state.patrolVisits
  );

  const [searchInput, setSearchInput] =
    useState("");

  const [filters, setFilters] =
    useState<PatrolVisitParams>({
      page: 1,
      per_page: 10,
    });

  /* =======================================================
     Load
     ======================================================= */

  useEffect(() => {
    void dispatch(
      fetchPatrolAssignments(filters)
    );
  }, [dispatch, filters]);

  /* =======================================================
     Search
     ======================================================= */

  const handleSearch = () => {
    setFilters((previous) => ({
      ...previous,
      page: 1,
      search:
        searchInput.trim() ||
        undefined,
    }));
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /* =======================================================
     Status
     ======================================================= */

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value =
      event.target.value;

    setFilters((previous) => ({
      ...previous,
      page: 1,
      status:
        value || undefined,
    }));
  };

  /* =======================================================
     Date
     ======================================================= */

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      event.target.value;

    setFilters((previous) => ({
      ...previous,
      page: 1,
      date:
        value || undefined,
    }));
  };

  /* =======================================================
     Clear
     ======================================================= */

  const handleClearFilters = () => {
    setSearchInput("");

    setFilters({
      page: 1,
      per_page:
        filters.per_page ?? 10,
    });
  };

  /* =======================================================
     Refresh
     ======================================================= */

  const handleRefresh = () => {
    void dispatch(
      fetchPatrolAssignments(filters)
    );
  };

  /* =======================================================
     View
     ======================================================= */

  const handleView = async (
    assignment: PatrolAssignmentSummary
  ) => {
    dispatch(
      setCurrentPatrolAssignment(
        assignment
      )
    );

    if (onViewAssignment) {
      onViewAssignment(
        assignment
      );
    }

    await dispatch(
      fetchPatrolVisitsByAssignment({
        assignmentId:
          assignment.assignment_id,
      })
    );
  };

  /* =======================================================
     Pagination
     ======================================================= */

  const handlePreviousPage = () => {
    if (
      pagination.current_page <= 1
    ) {
      return;
    }

    setFilters((previous) => ({
      ...previous,
      page:
        pagination.current_page -
        1,
    }));
  };

  const handleNextPage = () => {
    if (
      pagination.current_page >=
      pagination.last_page
    ) {
      return;
    }

    setFilters((previous) => ({
      ...previous,
      page:
        pagination.current_page +
        1,
    }));
  };

  /* =======================================================
     Page Information
     ======================================================= */

  const pageStart = useMemo(() => {
    if (
      pagination.total === 0
    ) {
      return 0;
    }

    return (
      (pagination.current_page -
        1) *
        pagination.per_page +
      1
    );
  }, [pagination]);

  const pageEnd = useMemo(() => {
    return Math.min(
      pagination.current_page *
        pagination.per_page,
      pagination.total
    );
  }, [pagination]);

  /* =======================================================
     Loading
     ======================================================= */

  if (
    isLoading &&
    assignments.length === 0
  ) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 border-b pb-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />

                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>

                  <Skeleton className="h-8 w-24" />
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      {/* ===================================================
          Toolbar
          =================================================== */}

      <div className="flex flex-col gap-3 border-b bg-[#F4F6F8] p-4 dark:bg-muted/40 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4" />

          <CardTitle className="text-sm">
            Patrol Visits
          </CardTitle>

          <Badge
            variant="outline"
            className="ml-1 bg-background"
          >
            {pagination.total}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(filters.search ||
            filters.status ||
            filters.date) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={
                handleClearFilters
              }
            >
              Clear Filters
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={
              handleRefresh
            }
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isLoading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>
      </div>

      {/* ===================================================
          Filters
          =================================================== */}

      <div className="grid grid-cols-1 gap-3 border-b p-4 md:grid-cols-12">
        {/* Search */}

        <div className="md:col-span-5">
          <InputGroup>
            <InputGroupInput
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Search guard, duty or site..."
            />

            <InputGroupAddon
              className="cursor-pointer"
              onClick={
                handleSearch
              }
            >
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Status */}

        <div className="md:col-span-3">
          <select
            value={
              filters.status ?? ""
            }
            onChange={
              handleStatusChange
            }
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="partially_completed">
              Partially Completed
            </option>

            <option value="missed">
              Missed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {/* Date */}

        <div className="relative md:col-span-4">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="date"
            value={
              filters.date ?? ""
            }
            onChange={
              handleDateChange
            }
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      </div>

      {/* ===================================================
          Table
          =================================================== */}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Guard
              </TableHead>

              <TableHead>
                Duty
              </TableHead>

              <TableHead>
                Site & Location
              </TableHead>

              <TableHead>
                Date
              </TableHead>

              <TableHead>
                Progress
              </TableHead>

              <TableHead>
                Latest Visit
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {assignments.length ===
            0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-[280px] text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Footprints className="h-7 w-7 text-muted-foreground" />
                    </div>

                    <h3 className="font-semibold">
                      No patrol visits
                      found
                    </h3>

                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                      No patrol
                      assignments match
                      the selected filters.
                    </p>

                    {(filters.search ||
                      filters.status ||
                      filters.date) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={
                          handleClearFilters
                        }
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map(
                (assignment) => {
                  const required =
                    assignment.required_visits ??
                    0;

                  const completed =
                    assignment.completed_visits ??
                    0;

                  const percentage =
                    required > 0
                      ? Math.min(
                          Math.round(
                            (completed /
                              required) *
                              100
                          ),
                          100
                        )
                      : 0;

                  return (
                    <TableRow
                      key={
                        assignment.assignment_id
                      }
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() =>
                        void handleView(
                          assignment
                        )
                      }
                    >
                      {/* Guard */}

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5F0015]/10 text-[#5F0015]">
                            <User className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate font-medium">
                              {getGuardName(
                                assignment
                              )}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {assignment
                                .guard
                                ?.guard_code ||
                                `Guard #${assignment.guard_id ?? "N/A"}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Duty */}

                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                          <div>
                            <p className="max-w-[190px] truncate text-sm font-medium">
                              {assignment
                                .duty
                                ?.title ||
                                `Duty #${assignment.duty_id ?? "N/A"}`}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Patrol Visits
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Site */}

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                            <span className="max-w-[180px] truncate text-sm">
                              {getSiteName(
                                assignment
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />

                            <span className="max-w-[180px] truncate">
                              {getLocationName(
                                assignment
                              )}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Date */}

                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />

                          {formatDate(
                            assignment.duty_date ||
                              assignment
                                .duty
                                ?.duty_date
                          )}
                        </div>
                      </TableCell>

                      {/* Progress */}

                      <TableCell>
                        <div className="min-w-[125px]">
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold">
                              {completed}/
                              {required}
                            </span>

                            <span className="text-muted-foreground">
                              {percentage}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-[#5F0015]"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Latest Visit */}

                      <TableCell>
                        {assignment.latest_visit ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Footprints className="h-3.5 w-3.5 text-muted-foreground" />

                              <span className="text-sm font-medium">
                                Visit #
                                {
                                  assignment
                                    .latest_visit
                                    .visit_number
                                }
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock3 className="h-3.5 w-3.5" />

                              {formatDateTime(
                                assignment
                                  .latest_visit
                                  .checked_out_at ||
                                  assignment
                                    .latest_visit
                                    .checked_in_at
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No activity
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusClassName(
                            assignment.status
                          )}
                        >
                          {assignment.status ===
                          "completed" ? (
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          ) : assignment.status ===
                            "in_progress" ? (
                            <Clock3 className="mr-1 h-3.5 w-3.5" />
                          ) : null}

                          {getStatusLabel(
                            assignment.status
                          )}
                        </Badge>
                      </TableCell>

                      {/* Action */}

                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            void handleView(
                              assignment
                            );
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />

                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* ===================================================
          Pagination
          =================================================== */}

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {pageStart}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {pageEnd}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {pagination.total}
          </span>{" "}
          patrol assignments
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              isLoading ||
              pagination.current_page <=
                1
            }
            onClick={
              handlePreviousPage
            }
          >
            <ChevronLeft className="mr-1 h-4 w-4" />

            Previous
          </Button>

          <div className="flex h-9 min-w-[90px] items-center justify-center rounded-md border px-3 text-sm">
            Page{" "}
            {pagination.current_page}{" "}
            /{" "}
            {pagination.last_page}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              isLoading ||
              pagination.current_page >=
                pagination.last_page
            }
            onClick={
              handleNextPage
            }
          >
            Next

            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PatrolVisitsTable;
