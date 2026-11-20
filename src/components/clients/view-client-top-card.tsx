import React from "react";
import Link from "next/link";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, Edit2Icon, PlusIcon, Sparkles } from "lucide-react";
import { ViewClientTopCardProps } from "@/app/types/client";
import { CreateSiteForm } from "./create-site-form";
import { ClientSetupWizard } from "./client-setup-wizard";

const ViewClientTopCard = ({ client }: ViewClientTopCardProps) => {
  return (
    <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
        <span className="font-bold text-base sm:text-lg text-black dark:text-white break-words truncate">
          {client?.full_name}
        </span>
        <span className="font-medium text-gray-400 text-xs sm:text-sm shrink-0">
          ID: {client.client_code}
        </span>
      </div>

      <div className="flex flex-row gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
        <div className="flex flex-nowrap gap-2 min-w-max">
          <Button
            asChild
            className="flex-shrink-0 justify-center text-xs sm:text-sm text-black dark:text-white border border-gray-300"
            variant="ghost"
          >
            <Link href="/clients">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to list
            </Link>
          </Button>

          <Button
            className="flex-shrink-0 justify-center text-xs sm:text-sm bg-[#B5A28A] hover:bg-[#9b8a73] text-white"
            variant="default"
          >
            <Edit2Icon className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>

          <ClientSetupWizard
            initialClient={client}
            trigger={
              <Button
                className="flex-shrink-0 justify-center text-xs sm:text-sm border border-[#5F0015] text-[#5F0015] hover:bg-[#5F0015]/10"
                variant="outline"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Continue setup
              </Button>
            }
          />

          <CreateSiteForm
            trigger={
              <Button
                className="flex-shrink-0 justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-[#7a1a2b] text-white"
                variant="default"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add New Site
              </Button>
            }
            clientId={client?.id}
            onSuccess={() => {}}
          />
        </div>
      </div>
    </Card>
  );
};

export default ViewClientTopCard;