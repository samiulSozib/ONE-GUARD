"use client";

import { Card, CardContent } from "@/components/ui/card";
import { HomeInfo } from "@/components/cards/home-info";
import { ClientGurdRequestOverview } from "@/components/dataviews/home-client-guard-request-overview";
import { OnGoingShifts } from "@/components/dataviews/home-ongoing-shifts";
import { ClientReviewCard } from "@/components/cards/home-client-review";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        {/* Grid container with stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6 px-4 md:px-6 items-stretch h-full">

          {/* LEFT COLUMN — Home Info & Data Table */}
          <div className="lg:col-span-9 flex flex-col gap-6 h-full">
            {/* Home Info Card */}
            <Card className="shadow-sm rounded-2xl flex-1">
              <CardContent className="p-1 sm:p-2">
                <HomeInfo />
              </CardContent>
            </Card>

            {/* Data Table Card */}
            <div className="flex-1">
              <ClientGurdRequestOverview />
            </div>
          </div>

          {/* RIGHT COLUMN — Additional Components */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full">
            <OnGoingShifts />
            <ClientReviewCard />
          </div>

        </div>
      </div>
    </div>
  );
}
