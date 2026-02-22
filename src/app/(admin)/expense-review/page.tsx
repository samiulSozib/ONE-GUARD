"use client";

import ExpenseReviewTopCard from "@/components/expense-review/expanse-review-top-card";
import { ExpenseReviewDataTable } from "@/components/expense-review/expense-review-data-table";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <ExpenseReviewTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <ExpenseReviewDataTable/>
        </div>
      </div>


    </div>
  );
}
