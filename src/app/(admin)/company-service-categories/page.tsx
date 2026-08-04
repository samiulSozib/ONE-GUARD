// app/admin/company-service-categories/page.tsx
"use client";

import { CompanyServiceCategoryDataTable } from '@/components/company-service-category/company-service-category-data-table';
import CompanyServiceCategoryTopCard from '@/components/company-service-category/company-service-category-top-card';


export default function CompanyServiceCategoriesPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <CompanyServiceCategoryTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <CompanyServiceCategoryDataTable />
        </div>
      </div>
    </div>
  );
}
