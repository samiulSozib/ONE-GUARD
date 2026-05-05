// app/admin/job-applications/page.tsx
"use client";

import { JobApplicationDataTable } from "@/components/job-applications/job-application-data-table";
import JobApplicationTopCard from "@/components/job-applications/job-application-top-card";



export default function JobApplicationsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <JobApplicationTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <JobApplicationDataTable />
        </div>
      </div>
    </div>
  );
}