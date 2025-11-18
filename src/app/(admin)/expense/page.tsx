"use client";

import ExpenseTopCard from "@/components/expense/expanse-top-card";
import { ExpensetDataTable } from "@/components/expense/expense-data-table";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <ExpenseTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <ExpensetDataTable/>
        </div>
      </div>


    </div>
  );
}
