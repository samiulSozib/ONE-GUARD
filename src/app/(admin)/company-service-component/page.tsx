// app/admin/company-service-components/page.tsx
"use client";

import { CompanyServiceComponentDataTable } from '@/components/company-service-component/company-service-component-data-table';
import CompanyServiceComponentTopCard from '@/components/company-service-component/company-service-component-top-card';


export default function CompanyServiceComponentsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <CompanyServiceComponentTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <CompanyServiceComponentDataTable />
        </div>
      </div>
    </div>
  );
}
