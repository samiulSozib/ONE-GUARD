"use client";


import { IncidentDataTable } from "@/components/incident/incident-data-table";
import IncidentTopCard from "@/components/incident/incident-top-card";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <IncidentTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <IncidentDataTable/>
        </div>
      </div>


    </div>
  );
}
