"use client";

import React from "react";

import {
  CheckCircle2,
  Clock3,
  Footprints,
  ShieldAlert,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { PatrolVisitOverview } from "@/app/types/patrolVisit";

/* =========================================================
   Props
   ========================================================= */

interface PatrolVisitsOverviewProps {
  overview: PatrolVisitOverview | null;
  isLoading?: boolean;
}

/* =========================================================
   Patrol Visits Overview
   ========================================================= */

const PatrolVisitsOverview = ({
  overview,
  isLoading = false,
}: PatrolVisitsOverviewProps) => {
  const requiredVisits =
    overview?.required_visits ??
    overview?.total_required_visits ??
    0;

  const completedVisits =
    overview?.completed_visits ??
    0;

  const inProgressVisits =
    overview?.checked_in_visits ??
    overview?.in_progress_visits ??
    0;

  const missedVisits =
    overview?.missed_visits ??
    0;

  const remainingVisits =
    overview?.remaining_visits ??
    Math.max(
      requiredVisits -
      completedVisits,
      0
    );

  const completedPercentage =
    overview?.completion_percentage ??
    (requiredVisits > 0
      ? Math.min(
        Math.round(
          (completedVisits /
            requiredVisits) *
          100
        ),
        100
      )
      : 0);

  if (isLoading && !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <Card
              key={item}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-28" />

                  <Skeleton className="h-8 w-16" />

                  <Skeleton className="h-3 w-32" />
                </div>

                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </Card>
          )
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OverviewCard
        title="Required Visits"
        value={requiredVisits}
        subtitle={`${remainingVisits} remaining`}
        icon={
          <Footprints className="h-5 w-5" />
        }
        iconClassName="bg-[#5F0015]/10 text-[#5F0015]"
      />

      <OverviewCard
        title="Completed"
        value={completedVisits}
        subtitle={`${completedPercentage}% completion`}
        icon={
          <CheckCircle2 className="h-5 w-5" />
        }
        iconClassName="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
      />

      <OverviewCard
        title="In Progress"
        value={inProgressVisits}
        subtitle={
          inProgressVisits === 1
            ? "1 active patrol visit"
            : `${inProgressVisits} active patrol visits`
        }
        icon={
          <Clock3 className="h-5 w-5" />
        }
        iconClassName="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
      />

      <OverviewCard
        title="Missed"
        value={missedVisits}
        subtitle={
          missedVisits === 0
            ? "No missed patrol visits"
            : missedVisits === 1
              ? "1 visit requires attention"
              : `${missedVisits} visits require attention`
        }
        icon={
          <ShieldAlert className="h-5 w-5" />
        }
        iconClassName="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
      />
    </div>
  );
};

/* =========================================================
   Overview Card
   ========================================================= */

interface OverviewCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconClassName?: string;
}

const OverviewCard = ({
  title,
  value,
  subtitle,
  icon,
  iconClassName = "",
}: OverviewCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

          <p className="mt-1 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default PatrolVisitsOverview;