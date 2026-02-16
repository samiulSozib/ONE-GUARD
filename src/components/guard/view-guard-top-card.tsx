import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { IconBrandGoogleMaps } from "@tabler/icons-react";
import { ChevronLeft } from "lucide-react";
import { ViewGuardTopCardProps } from "@/app/types/guard";
import { AddTrainingForm } from "./add-training-form";
import { AddGuardArmsForm } from "./add-guard-arms-form";
import { AddAvailabilityForm } from "./add-availability-form";



const ViewGuardTopCard = ({ guard }: ViewGuardTopCardProps) => {
  return (
    <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-3 sm:p-4">
      {/* Guard Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <span className="font-bold text-base sm:text-lg text-black dark:text-white break-words">
          {guard?.full_name}
        </span>
        <span className="font-medium text-gray-400 text-xs sm:text-sm">
          ID: {guard.guard_code}
        </span>
      </div>

      {/* Buttons Section — scrollable on small screens */}
      <div className="flex flex-row gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
        <div className="flex flex-nowrap gap-2 min-w-max">
          <Button
            className="flex-shrink-0 justify-center text-xs sm:text-sm text-black dark:text-white border border-gray-300"
            variant="ghost"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to list
          </Button>

          {/* <AddGuardArmsForm trigger={
            <Button
              className="flex-shrink-0 justify-center text-xs sm:text-sm bg-[#B5A28A] hover:bg-[#9b8a73] text-white"
              variant="default"
            >
              <IconBrandGoogleMaps className="h-4 w-4 mr-1" />
              Add Guard Arms
            </Button>
          } />

          <AddTrainingForm trigger={
            <Button
              className="flex-shrink-0 justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-[#7a1a2b] text-white"
              variant="default"
            >
              Add Training
            </Button>
          } />

          <AddAvailabilityForm trigger={
            <Button
              className="flex-shrink-0 justify-center text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white"
              variant="default"
            >
              Add Availability
            </Button>
          } /> */}
        </div>
      </div>
    </Card>
  );
};

export default ViewGuardTopCard;
