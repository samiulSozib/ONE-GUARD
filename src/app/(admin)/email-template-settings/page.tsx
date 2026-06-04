// app/admin/email-templates/page.tsx
"use client";

import { EmailTemplateDataTable } from "@/components/email-template-settings/email-template-data-table";
import EmailTemplateTopCard from "@/components/email-template-settings/email-template-top-card";

export default function EmailTemplatesPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <EmailTemplateTopCard />
        </div>
        <div className="py-2 px-4 md:px-6">
          <EmailTemplateDataTable />
        </div>
      </div>
    </div>
  );
}