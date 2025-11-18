"use client";

import { DutyDataTable } from "@/components/duty/duty-data-table";
import DutyTopCard from "@/components/duty/duty-top-card";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <DutyTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <DutyDataTable/>
        </div>
      </div>


    </div>
  );
}
