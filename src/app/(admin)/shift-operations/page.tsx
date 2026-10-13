
"use client";

import ShiftOperationsManagement from "@/components/shift-operations/shift-operations-management";

export default function ShiftOperationsPage() {
  return (
    <main className="flex w-full min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-clip p-3 pt-5 sm:p-4 md:p-6">
      <ShiftOperationsManagement />
    </main>
  );
}
