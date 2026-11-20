"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import TimesheetGuardDetail from "@/components/timesheet/timesheet-guard-detail";

function monthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    period_start: start.toISOString().slice(0, 10),
    period_end: end.toISOString().slice(0, 10),
  };
}

export default function TimesheetGuardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const defaults = useMemo(() => monthBounds(), []);
  const guardId = Number(params.guardId);
  const periodStart = searchParams.get("period_start") || defaults.period_start;
  const periodEnd = searchParams.get("period_end") || defaults.period_end;

  if (!guardId || Number.isNaN(guardId)) {
    return <div className="p-6 text-sm text-muted-foreground">Invalid guard.</div>;
  }

  return (
    <TimesheetGuardDetail
      guardId={guardId}
      periodStart={periodStart}
      periodEnd={periodEnd}
    />
  );
}
