"use client";

import { DutyTimeTypeDataTable } from "@/components/duty-time-type/duty-time-type-data-table";
import DutyTimeTypeTopCard from "@/components/duty-time-type/duty-time-type-top-card";





export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <DutyTimeTypeTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <DutyTimeTypeDataTable/>
        </div>
      </div>


    </div>
  );
}
