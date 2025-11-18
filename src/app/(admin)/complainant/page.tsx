"use client";

import { ComplainantDataTable } from "@/components/complainant/complainant-data-table";
import ComplainantTopCard from "@/components/complainant/complainant-top-card";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <ComplainantTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <ComplainantDataTable/>
        </div>
      </div>


    </div>
  );
}
