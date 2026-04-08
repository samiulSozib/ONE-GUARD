"use client";

import { ShiftInstructionDataTable } from "@/components/shift-instruction/shift-instruction-data-table";
import ShifInstructionTopCard from "@/components/shift-instruction/shift-instruction-top-card";





export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <ShifInstructionTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
          <ShiftInstructionDataTable/>
        </div>
      </div>


    </div>
  );
}