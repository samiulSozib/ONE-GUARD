// app/admin/jobs/page.tsx
"use client";

import { JobDataTable } from "@/components/jobs/job-data-table";
import JobTopCard from "@/components/jobs/job-top-card";


export default function JobsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <JobTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <JobDataTable />
        </div>
      </div>
    </div>
  );
}