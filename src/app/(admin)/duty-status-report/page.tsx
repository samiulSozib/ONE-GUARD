"use client";

import { DutyStatusReportDataTable } from "@/components/duty-status-report/duty-status-report-data-table";
import DutyStausReportTopCard from "@/components/duty-status-report/duty-status-report-top-card";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <DutyStausReportTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <DutyStatusReportDataTable/>
        </div>
      </div>


    </div>
  );
}
