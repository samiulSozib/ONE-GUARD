"use client";

import { ComplaintDataTable } from "@/components/complaint/complaint-data-table";
import ComplaintTopCard from "@/components/complaint/complaint-top-card";





export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <ComplaintTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <ComplaintDataTable/>
        </div>
      </div>


    </div>
  );
}
