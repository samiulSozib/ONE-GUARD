"use client";

import { LeaveDataTable } from "@/components/leave/leave-data-table";
import LeaveTopCard from "@/components/leave/leave-top-card";
import { Messages } from "@/components/messages/message-content";



export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <LeaveTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <LeaveDataTable/>
        </div>
      </div>


    </div>
  );
}
