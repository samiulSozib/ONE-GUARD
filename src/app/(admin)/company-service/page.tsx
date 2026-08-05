// app/admin/company-services/page.tsx
"use client";

import { CompanyServiceDataTable } from '@/components/company-service/company-service-data-table';
import CompanyServiceTopCard from '@/components/company-service/company-service-top-card';



export default function CompanyServicesPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <CompanyServiceTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <CompanyServiceDataTable />
        </div>
      </div>
    </div>
  );
}
