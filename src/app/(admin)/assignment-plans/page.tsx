// app/assignment-plans/page.tsx

"use client";

import { useState } from "react";
import { AssignmentPlansTopCard } from "@/components/assignment-plans/assignment-plans-top-card";
import { AssignmentPlansDataTable } from "@/components/assignment-plans/assignment-plans-data-table";
import { AssignmentPlansForm } from "@/components/assignment-plans/assignment-plans-form";
import { GuardAssignmentPlan } from "@/app/types/scheduling";

export default function AssignmentPlansPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<GuardAssignmentPlan | null>(null);

  const handleAddClick = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (plan: GuardAssignmentPlan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleViewClick = (plan: GuardAssignmentPlan) => {
    // Navigate to view page or open view dialog
    console.log("View plan:", plan);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <AssignmentPlansTopCard onAddClick={handleAddClick} />
        </div>
        <div className="py-2 px-4 md:px-6">
          <AssignmentPlansDataTable
            onAddClick={handleAddClick}
            onViewClick={handleViewClick}
            onEditClick={handleEditClick}
          />
        </div>
      </div>

      <AssignmentPlansForm
        trigger={<div />}
        plan={selectedPlan || undefined}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
