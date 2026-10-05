"use client";

import PatrolVisitsManagement from "@/components/patrol-visits/patrol-visits-management";

/* =========================================================
   Patrol Visits Page
   ========================================================= */

export default function PatrolVisitsPage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="@container/main flex h-full flex-1 flex-col gap-2">
        <div className="px-4 py-6 md:px-6">
          <PatrolVisitsManagement />
        </div>
      </div>
    </div>
  );
}
