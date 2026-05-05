// app/admin/job-categories/page.tsx
"use client";

import JobCategoryTopCard from "@/components/job-categories/job-category-top-card";
import { JobCategoryDataTable } from "./job-category-data-table";

export default function JobCategoriesPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <JobCategoryTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <JobCategoryDataTable />
        </div>
      </div>
    </div>
  );
}