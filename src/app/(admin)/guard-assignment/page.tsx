"use client";

import { GuardAssignmentDataTable } from "@/components/guard-assignment/guard-assignment-data-table";
import GuardAssignmentTopCard from "@/components/guard-assignment/guard-assignment-top-card-";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <GuardAssignmentTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <GuardAssignmentDataTable/>
        </div>
      </div>


    </div>
  );
}
