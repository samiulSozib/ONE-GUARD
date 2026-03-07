"use client";

import { ClientContractDataTable } from "@/components/client-contract/client-contract-data-table";
import ClientContractTopCard from "@/components/client-contract/client-contract-top-card";






export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <ClientContractTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <ClientContractDataTable/>
        </div>
      </div>


    </div>
  );
}
