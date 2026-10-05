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
   Date Helpers
   ========================================================= */

/*
 * API timestamps such as:
 *
 * 2026-10-05T18:59:52.000000Z
 *
 * contain Z, therefore they represent UTC.
 *
 * JavaScript Date converts that instant to the
 * browser/admin device timezone before date-fns
 * formats it.
 */

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "N/A";
  }

  try {
    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return format(
      date,
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
    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return format(
      date,
      "MMM dd, yyyy • hh:mm:ss a"
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

/* =========================================================
   Coordinate Helpers
   ========================================================= */

const formatCoordinate = (
  value?:
    | number
    | string
    | null
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
    Number.isNaN(
      numericValue
    )
  ) {
    return String(value);
  }

  return numericValue.toFixed(6);
};

const formatAccuracy = (
  value?:
    | number
    | string
    | null
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "N/A";
  }

  const numericValue =
    Number(value);

  if (
    Number.isNaN(
      numericValue
    )
  ) {
    return String(value);
  }

  return `${numericValue.toFixed(1)} m`;
};

/* =========================================================
   Guard / Site Helpers
   ========================================================= */

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

  if (guard.name) {
    return guard.name;
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

const getGuardCode = (
  assignment:
    | PatrolAssignmentSummary
    | null
) => {
  return (
    assignment?.guard?.guard_code ||
    "N/A"
  );
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
    assignment?.duty?.site
      ?.name ||
    "N/A"
  );
};

const getLocationName = (
  assignment:
    | PatrolAssignmentSummary
    | null
) => {
  return (
    assignment
      ?.site_location?.title ||
    assignment
      ?.site_location?.name ||
    assignment
      ?.duty
      ?.site_location?.title ||
    assignment
      ?.duty
      ?.site_location?.name ||
    "N/A"
  );
};

/* =========================================================
   Status Helpers
   ========================================================= */

const getStatusLabel = (
  status?: string | null
) => {
  if (!status) {
    return "Pending";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
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
   Main Component
   ========================================================= */

const PatrolVisitDetails = ({
  assignment,
  visits = [],
  isLoading = false,
}: PatrolVisitDetailsProps) => {
  if (
    isLoading &&
    !assignment
  ) {
    return (
      <div className="space-y-4">
        <Card className="p-5">
          <Skeleton className="h-6 w-48" />

          <Skeleton className="mt-3 h-4 w-72" />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <Skeleton
                  key={item}
                  className="h-24"
                />
              )
            )}
          </div>
        </Card>

        <Card className="p-5">
          <Skeleton className="h-6 w-52" />

          <div className="mt-5 space-y-4">
            {[1, 2, 3].map(
              (item) => (
                <Skeleton
                  key={item}
                  className="h-40"
                />
              )
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card className="p-8">
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <Footprints className="mb-3 h-10 w-10 text-muted-foreground" />

          <p className="font-medium">
            Patrol assignment not found
          </p>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            The selected patrol
            assignment could not be
            loaded.
          </p>
        </div>
      </Card>
    );
  }

  const sortedVisits =
    [...visits].sort(
      (a, b) =>
        Number(
          a.visit_number ?? 0
        ) -
        Number(
          b.visit_number ?? 0
        )
    );

  const requiredVisits =
    assignment.required_visits ??
    0;

  const completedVisits =
    assignment.completed_visits ??
    0;

  const remainingVisits =
    assignment.remaining_visits ??
    Math.max(
      requiredVisits -
      completedVisits,
      0
    );

  const progressPercentage =
    assignment.progress_percentage ??
    (requiredVisits > 0
      ? Math.min(
        100,
        Math.round(
          (completedVisits /
            requiredVisits) *
          100
        )
      )
      : 0);

  const assignmentStatus =
    assignment.operational_status ||
    assignment.status ||
    assignment.assignment_status ||
    "pending";

  return (
    <div className="space-y-4">
      {/* ===================================================
          Assignment Header
          =================================================== */}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">
                Patrol Assignment #
                {assignment.assignment_id}
              </h2>

              <Badge
                variant="outline"
                className={getStatusClassName(
                  assignmentStatus
                )}
              >
                {getStatusLabel(
                  assignmentStatus
                )}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />

                <span>
                  {getGuardName(
                    assignment
                  )}
                </span>
              </div>

              <span>
                {getGuardCode(
                  assignment
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <Footprints className="h-4 w-4" />

                <span>
                  Patrol Visits
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-[220px]">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Overall Progress
              </span>

              <span className="font-semibold">
                {completedVisits}/
                {requiredVisits}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[#5F0015]"
                style={{
                  width: `${Math.min(
                    progressPercentage,
                    100
                  )}%`,
                }}
              />
            </div>

            <p className="mt-1 text-right text-xs text-muted-foreground">
              {progressPercentage}%
              completed
            </p>
          </div>
        </div>

        {/* =================================================
            Summary
            ================================================= */}

        <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
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
          Patrol Information
          =================================================== */}

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="font-semibold">
            Patrol Information
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Service location and patrol
            duty information.
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
              `Duty #${assignment.duty_id ??
              "N/A"
              }`
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

        {(assignment.duty
          ?.start_datetime ||
          assignment.duty
            ?.end_datetime) && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InformationItem
                icon={
                  <Clock3 className="h-4 w-4" />
                }
                label="Duty Start"
                value={formatDateTime(
                  assignment.duty
                    ?.start_datetime
                )}
              />

              <InformationItem
                icon={
                  <Clock3 className="h-4 w-4" />
                }
                label="Duty End"
                value={formatDateTime(
                  assignment.duty
                    ?.end_datetime
                )}
              />
            </div>
          )}
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
  /*
   * Prefer the current backend nested response.
   * Keep old flat fields as fallbacks.
   */

  const checkInAt =
    visit.check_in?.at ??
    visit.checked_in_at ??
    null;

  const checkOutAt =
    visit.check_out?.at ??
    visit.checked_out_at ??
    null;

  const checkInLatitude =
    visit.check_in?.latitude ??
    visit.checkin_latitude ??
    null;

  const checkInLongitude =
    visit.check_in?.longitude ??
    visit.checkin_longitude ??
    null;

  const checkInAccuracy =
    visit.check_in?.accuracy ??
    visit.checkin_accuracy ??
    null;

  const checkOutLatitude =
    visit.check_out?.latitude ??
    visit.checkout_latitude ??
    null;

  const checkOutLongitude =
    visit.check_out?.longitude ??
    visit.checkout_longitude ??
    null;

  const checkOutAccuracy =
    visit.check_out?.accuracy ??
    visit.checkout_accuracy ??
    null;

  const formattedCheckInLatitude =
    formatCoordinate(
      checkInLatitude
    );

  const formattedCheckInLongitude =
    formatCoordinate(
      checkInLongitude
    );

  const formattedCheckOutLatitude =
    formatCoordinate(
      checkOutLatitude
    );

  const formattedCheckOutLongitude =
    formatCoordinate(
      checkOutLongitude
    );

  const hasCheckInCoordinates =
    formattedCheckInLatitude !==
    null &&
    formattedCheckInLongitude !==
    null;

  const hasCheckOutCoordinates =
    formattedCheckOutLatitude !==
    null &&
    formattedCheckOutLongitude !==
    null;

  return (
    <div className="overflow-hidden rounded-xl border">
      {/* ===================================================
          Header
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
              Patrol execution record
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
          Timing
          =================================================== */}

      <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
        <VisitMetric
          icon={
            <Clock3 className="h-4 w-4" />
          }
          label="Check In"
          value={formatDateTime(
            checkInAt
          )}
        />

        <VisitMetric
          icon={
            <Clock3 className="h-4 w-4" />
          }
          label="Check Out"
          value={formatDateTime(
            checkOutAt
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
          GPS Information
          =================================================== */}

      {(hasCheckInCoordinates ||
        hasCheckOutCoordinates) && (
          <div className="grid grid-cols-1 gap-4 border-t p-4 lg:grid-cols-2">
            {hasCheckInCoordinates && (
              <LocationBlock
                title="Check-In Location"
                latitude={
                  formattedCheckInLatitude
                }
                longitude={
                  formattedCheckInLongitude
                }
                accuracy={
                  checkInAccuracy
                }
              />
            )}

            {hasCheckOutCoordinates && (
              <LocationBlock
                title="Check-Out Location"
                latitude={
                  formattedCheckOutLatitude
                }
                longitude={
                  formattedCheckOutLongitude
                }
                accuracy={
                  checkOutAccuracy
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

  latitude: string | null;

  longitude: string | null;

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
  const hasCoordinates =
    latitude !== null &&
    longitude !== null;

  const googleMapsUrl =
    hasCoordinates
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-[#5F0015]" />

        <p className="text-sm font-medium">
          {title}
        </p>
      </div>

      {hasCoordinates ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Latitude
              </p>

              <p className="mt-1 font-mono text-sm">
                {latitude}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Longitude
              </p>

              <p className="mt-1 font-mono text-sm">
                {longitude}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Accuracy
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatAccuracy(
                  accuracy
                )}
              </p>
            </div>

            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5F0015] hover:underline"
              >
                <Navigation className="h-4 w-4" />

                Open in Maps
              </a>
            )}
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Location unavailable
        </p>
      )}
    </div>
  );
};

export default PatrolVisitDetails;