"use client";

import React from "react";
import { format } from "date-fns";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Footprints,
  MapPin,
  Navigation,
  Shield,
  Timer,
  User,
  XCircle,
} from "lucide-react";

import {
  PatrolAssignmentSummary,
  PatrolVisit,
} from "@/app/types/patrolVisit";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* =========================================================
   Props
   ========================================================= */

interface PatrolVisitDetailsProps {
  assignment:
    | PatrolAssignmentSummary
    | null;

  visits?: PatrolVisit[];

  isLoading?: boolean;
}

/* =========================================================
   Helpers
   ========================================================= */

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
      "MMM dd, yyyy • hh:mm a"
    );
  } catch {
    return value;
  }
};

const formatDuration = (
  minutes?: number | null
) => {
  if (
    minutes === undefined ||
    minutes === null
  ) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const formatCoordinate = (
  value?: number | string | null
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const numericValue =
    Number(value);

  if (
    Number.isNaN(numericValue)
  ) {
    return String(value);
  }

  return numericValue.toFixed(6);
};

const getGuardName = (
  assignment:
    | PatrolAssignmentSummary
    | null
) => {
  const guard =
    assignment?.guard;

  if (!guard) {
    return "Unknown Guard";
  }

  if (guard.full_name) {
    return guard.full_name;
  }

  const name = [
    guard.first_name,
    guard.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  if (name) {
    return name;
  }

  if (guard.guard_code) {
    return `Guard ${guard.guard_code}`;
  }

  return "Unknown Guard";
};

const getSiteName = (
  assignment:
    | PatrolAssignmentSummary
    | null
) => {
  return (
    assignment?.site?.site_name ||
    assignment?.site?.name ||
    assignment?.duty?.site
      ?.site_name ||
    assignment?.duty?.site?.name ||
    "N/A"
  );
};

const getLocationName = (
  assignment:
    | PatrolAssignmentSummary
    | null
) => {
  return (
    assignment?.site_location
      ?.title ||
    assignment?.site_location
      ?.name ||
    assignment?.duty
      ?.site_location?.title ||
    assignment?.duty
      ?.site_location?.name ||
    "N/A"
  );
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

    case "cancelled":
      return "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300";

    default:
      return "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-400";
  }
};

/* =========================================================
   Patrol Visit Details
   ========================================================= */

const PatrolVisitDetails = ({
  assignment,
  visits = [],
  isLoading = false,
}: PatrolVisitDetailsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-5">
          <div className="space-y-4">
            <Skeleton className="h-6 w-52" />

            <Skeleton className="h-4 w-72" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <Skeleton
                    key={item}
                    className="h-20 w-full rounded-xl"
                  />
                )
              )}
            </div>
          </div>
        </Card>

        {[1, 2, 3].map(
          (item) => (
            <Card
              key={item}
              className="p-5"
            >
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />

                <Skeleton className="h-4 w-full" />

                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          )
        )}
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Footprints className="mb-3 h-10 w-10 text-muted-foreground" />

          <h3 className="font-semibold">
            No patrol selected
          </h3>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Select a patrol assignment
            to view its visit history
            and execution details.
          </p>
        </div>
      </Card>
    );
  }

  const requiredVisits =
    assignment.required_visits ??
    visits.length;

  const completedVisits =
    assignment.completed_visits ??
    visits.filter(
      (visit) =>
        visit.status ===
        "completed"
    ).length;

  const remainingVisits =
    assignment.remaining_visits ??
    Math.max(
      requiredVisits -
        completedVisits,
      0
    );

  const progressPercentage =
    requiredVisits > 0
      ? Math.min(
          Math.round(
            (completedVisits /
              requiredVisits) *
              100
          ),
          100
        )
      : 0;

  const sortedVisits =
    [...visits].sort(
      (a, b) =>
        a.visit_number -
        b.visit_number
    );

  return (
    <div className="space-y-4">
      {/* ===================================================
          Assignment Header
          =================================================== */}

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/30 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {assignment.duty
                    ?.title ||
                    `Patrol Assignment #${assignment.assignment_id}`}
                </h2>

                <Badge
                  variant="outline"
                  className={getStatusClassName(
                    assignment.status
                  )}
                >
                  {getStatusLabel(
                    assignment.status
                  )}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />

                  <span>
                    {getGuardName(
                      assignment
                    )}
                  </span>
                </div>

                {assignment.guard
                  ?.guard_code && (
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />

                    <span>
                      {
                        assignment
                          .guard
                          .guard_code
                      }
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />

                  <span>
                    {formatDate(
                      assignment.duty_date ||
                        assignment.duty
                          ?.duty_date
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-[150px]">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Patrol Progress
                </span>

                <span className="font-medium text-foreground">
                  {completedVisits}/
                  {requiredVisits}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#5F0015] transition-all"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>

              <p className="mt-1 text-right text-xs text-muted-foreground">
                {progressPercentage}%
                completed
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            Summary
            ================================================= */}

        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          <SummaryItem
            label="Required"
            value={requiredVisits}
            icon={
              <Footprints className="h-4 w-4" />
            }
          />

          <SummaryItem
            label="Completed"
            value={completedVisits}
            icon={
              <CheckCircle2 className="h-4 w-4" />
            }
          />

          <SummaryItem
            label="Remaining"
            value={remainingVisits}
            icon={
              <Clock3 className="h-4 w-4" />
            }
          />

          <SummaryItem
            label="Missed"
            value={
              assignment.missed_visits ??
              0
            }
            icon={
              <XCircle className="h-4 w-4" />
            }
          />
        </div>
      </Card>

      {/* ===================================================
          Service Information
          =================================================== */}

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="font-semibold">
            Patrol Information
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Service location and
            patrol duty information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InformationItem
            icon={
              <Shield className="h-4 w-4" />
            }
            label="Duty"
            value={
              assignment.duty
                ?.title ||
              `Duty #${assignment.duty_id ?? "N/A"}`
            }
          />

          <InformationItem
            icon={
              <MapPin className="h-4 w-4" />
            }
            label="Site"
            value={getSiteName(
              assignment
            )}
          />

          <InformationItem
            icon={
              <Navigation className="h-4 w-4" />
            }
            label="Location"
            value={getLocationName(
              assignment
            )}
          />

          <InformationItem
            icon={
              <CalendarDays className="h-4 w-4" />
            }
            label="Duty Date"
            value={formatDate(
              assignment.duty_date ||
                assignment.duty
                  ?.duty_date
            )}
          />
        </div>
      </Card>

      {/* ===================================================
          Visit Timeline
          =================================================== */}

      <Card className="p-5">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">
              Patrol Visit Timeline
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Individual check-in and
              check-out history for
              this patrol assignment.
            </p>
          </div>

          <Badge
            variant="outline"
            className="w-fit"
          >
            {sortedVisits.length}{" "}
            {sortedVisits.length ===
            1
              ? "Visit"
              : "Visits"}
          </Badge>
        </div>

        {sortedVisits.length ===
        0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
            <Footprints className="mb-3 h-9 w-9 text-muted-foreground" />

            <p className="font-medium">
              No patrol visits
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              No visit execution
              records are available
              for this assignment yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedVisits.map(
              (visit) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                />
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

/* =========================================================
   Summary Item
   ========================================================= */

interface SummaryItemProps {
  label: string;
  value:
    | string
    | number;
  icon: React.ReactNode;
}

const SummaryItem = ({
  label,
  value,
  icon,
}: SummaryItemProps) => {
  return (
    <div className="bg-background p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}

        <span>{label}</span>
      </div>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   Information Item
   ========================================================= */

interface InformationItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InformationItem = ({
  icon,
  label,
  value,
}: InformationItemProps) => {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}

        <span>{label}</span>
      </div>

      <div className="mt-2 text-sm font-medium">
        {value}
      </div>
    </div>
  );
};

/* =========================================================
   Visit Card
   ========================================================= */

interface VisitCardProps {
  visit: PatrolVisit;
}

const VisitCard = ({
  visit,
}: VisitCardProps) => {
  const checkinLatitude =
    formatCoordinate(
      visit.checkin_latitude
    );

  const checkinLongitude =
    formatCoordinate(
      visit.checkin_longitude
    );

  const checkoutLatitude =
    formatCoordinate(
      visit.checkout_latitude
    );

  const checkoutLongitude =
    formatCoordinate(
      visit.checkout_longitude
    );

  const hasCheckinCoordinates =
    checkinLatitude !== null &&
    checkinLongitude !== null;

  const hasCheckoutCoordinates =
    checkoutLatitude !== null &&
    checkoutLongitude !== null;

  return (
    <div className="overflow-hidden rounded-xl border">
      {/* ===================================================
          Visit Header
          =================================================== */}

      <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5F0015]/10 font-semibold text-[#5F0015]">
            {visit.visit_number}
          </div>

          <div>
            <p className="font-medium">
              Visit #
              {visit.visit_number}
            </p>

            <p className="text-xs text-muted-foreground">
              Patrol execution
              record
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={getStatusClassName(
            visit.status
          )}
        >
          {getStatusLabel(
            visit.status
          )}
        </Badge>
      </div>

      {/* ===================================================
          Visit Timing
          =================================================== */}

      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
        <VisitMetric
          icon={
            <Clock3 className="h-4 w-4" />
          }
          label="Check In"
          value={formatDateTime(
            visit.checked_in_at
          )}
        />

        <VisitMetric
          icon={
            <Clock3 className="h-4 w-4" />
          }
          label="Check Out"
          value={formatDateTime(
            visit.checked_out_at
          )}
        />

        <VisitMetric
          icon={
            <Timer className="h-4 w-4" />
          }
          label="Duration"
          value={formatDuration(
            visit.duration_minutes
          )}
        />
      </div>

      {/* ===================================================
          GPS
          =================================================== */}

      {(hasCheckinCoordinates ||
        hasCheckoutCoordinates) && (
        <div className="grid grid-cols-1 gap-4 border-t p-4 lg:grid-cols-2">
          {hasCheckinCoordinates && (
            <LocationBlock
              title="Check-In Location"
              latitude={
                checkinLatitude
              }
              longitude={
                checkinLongitude
              }
              accuracy={
                visit.checkin_accuracy
              }
            />
          )}

          {hasCheckoutCoordinates && (
            <LocationBlock
              title="Check-Out Location"
              latitude={
                checkoutLatitude
              }
              longitude={
                checkoutLongitude
              }
              accuracy={
                visit.checkout_accuracy
              }
            />
          )}
        </div>
      )}

      {/* ===================================================
          Notes
          =================================================== */}

      {visit.notes && (
        <div className="border-t p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Notes
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm">
            {visit.notes}
          </p>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   Visit Metric
   ========================================================= */

interface VisitMetricProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const VisitMetric = ({
  icon,
  label,
  value,
}: VisitMetricProps) => {
  return (
    <div className="bg-background p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}

        <span>{label}</span>
      </div>

      <div className="mt-2 text-sm font-medium">
        {value}
      </div>
    </div>
  );
};

/* =========================================================
   Location Block
   ========================================================= */

interface LocationBlockProps {
  title: string;
  latitude: string;
  longitude: string;
  accuracy?:
    | number
    | string
    | null;
}

const LocationBlock = ({
  title,
  latitude,
  longitude,
  accuracy,
}: LocationBlockProps) => {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-[#5F0015]" />

        <p className="text-sm font-medium">
          {title}
        </p>
      </div>

      <div className="mt-2 space-y-1 pl-6 text-xs text-muted-foreground">
        <p>
          Lat:{" "}
          <span className="font-medium text-foreground">
            {latitude}
          </span>
        </p>

        <p>
          Lng:{" "}
          <span className="font-medium text-foreground">
            {longitude}
          </span>
        </p>

        {accuracy !== undefined &&
          accuracy !== null && (
            <p>
              Accuracy:{" "}
              <span className="font-medium text-foreground">
                {accuracy} m
              </span>
            </p>
          )}
      </div>
    </div>
  );
};

export default PatrolVisitDetails;
