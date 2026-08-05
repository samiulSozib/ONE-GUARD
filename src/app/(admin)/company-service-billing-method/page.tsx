// app/admin/company-service-billing-methods/page.tsx
"use client";

import { CompanyServiceBillingMethodDataTable } from '@/components/company-service-billing-method/company-service-billing-method-data-table';
import CompanyServiceBillingMethodTopCard from '@/components/company-service-billing-method/company-service-billing-method-top-card';



export default function CompanyServiceBillingMethodsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <CompanyServiceBillingMethodTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <CompanyServiceBillingMethodDataTable />
        </div>
      </div>
    </div>
  );
}
