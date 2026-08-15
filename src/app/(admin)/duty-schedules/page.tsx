// app/admin/duty-schedules/page.tsx
"use client";

import DutyScheduleTopCard from "@/components/duty-schedule/duty-schedule-top-card";
import { DutyScheduleDataTable } from "@/components/duty-schedule/duty-schedule-data-table";

export default function DutySchedulesPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <DutyScheduleTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <DutyScheduleDataTable />
        </div>
      </div>
    </div>
  );
}
