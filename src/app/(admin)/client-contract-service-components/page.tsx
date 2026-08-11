// app/admin/client-contract-service-components/page.tsx
"use client";

import { ClientContractServiceComponentDataTable } from '@/components/client-contract-service-component/client-contract-service-component-data-table';
import ClientContractServiceComponentTopCard from '@/components/client-contract-service-component/client-contract-service-component-top-card';


export default function ClientContractServiceComponentsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <ClientContractServiceComponentTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <ClientContractServiceComponentDataTable />
        </div>
      </div>
    </div>
  );
}
