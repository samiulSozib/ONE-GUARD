// app/admin/email-logs/page.tsx
"use client";

import { EmailLogsDataTable } from "@/components/email-logs/email-logs-data-table";
import EmailLogsTopCard from "@/components/email-logs/email-logs-top-card";

export default function EmailLogsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <EmailLogsTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <EmailLogsDataTable />
        </div>
      </div>
    </div>
  );
}