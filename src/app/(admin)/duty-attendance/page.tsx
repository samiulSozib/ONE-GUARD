"use client";

import { DutyAttendanceDataTable } from "@/components/duty-attendance/duty-attendance-data-table";
import DutyAttendanceTopCard from "@/components/duty-attendance/duty-attendence-top-card";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <DutyAttendanceTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <DutyAttendanceDataTable/>
        </div>
      </div>


    </div>
  );
}
