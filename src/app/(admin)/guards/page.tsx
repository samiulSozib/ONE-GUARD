"use client";

import GuardTopCard from "@/components/cards/guard-top-card";
import { GuardDataTable } from "@/components/dataviews/guard-data-table";

export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <GuardTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <GuardDataTable />
        </div>
      </div>


    </div>
  );
}
