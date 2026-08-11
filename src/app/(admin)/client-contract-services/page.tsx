// app/admin/client-contract-services/page.tsx
"use client";

import { ClientContractServiceDataTable } from '@/components/client-contract-service/client-contract-service-data-table';
import ClientContractServiceTopCard from '@/components/client-contract-service/client-contract-service-top-card';



export default function ClientContractServicesPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <ClientContractServiceTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <ClientContractServiceDataTable />
        </div>
      </div>
    </div>
  );
}
