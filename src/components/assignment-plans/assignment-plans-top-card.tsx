// components/assignment-plans/assignment-plans-top-card.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface AssignmentPlansTopCardProps {
  onAddClick?: () => void;
  title?: string;
}

export function AssignmentPlansTopCard({ onAddClick, title = "Assignment Plans" }: AssignmentPlansTopCardProps) {
  return (
    <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4">
      <span className="text-lg font-bold dark:text-white">{title}</span>
      <div className="flex flex-row gap-2 w-full md:w-auto">
        <Button
          className="flex-1 xs:flex-initial justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-blue-700 text-white"
          variant="default"
          onClick={onAddClick}
        >
          <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span>Add Assignment Plan</span>
        </Button>
      </div>
    </Card>
  );
}
