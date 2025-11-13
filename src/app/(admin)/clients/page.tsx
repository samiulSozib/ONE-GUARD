"use client";

import ClientTopCard from "@/components/clients/client-top-card";
import { ClientDataTable } from "@/components/clients/client-data-table";

export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <ClientTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <ClientDataTable />
        </div>
      </div>


    </div>
  );
}
