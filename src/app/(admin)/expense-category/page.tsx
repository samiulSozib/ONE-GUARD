"use client";

import ExpenseCategoryTopCard from "@/components/expense-category/expense-category-top-card";
import { ExpenseCategoryDataTable } from "@/components/expense-category/expense-category-data-table";





export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <ExpenseCategoryTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <ExpenseCategoryDataTable/>
        </div>
      </div>


    </div>
  );
}
