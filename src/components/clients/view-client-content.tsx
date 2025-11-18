"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileIcon, MessageCircleIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewGuardTopCardProps } from "@/app/types/guard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ViewClientTopCardProps } from "@/app/types/client";
import PersonalInformation from "./tabContents/personal-information";
import { Message } from "./tabContents/message";
import { Site } from "./tabContents/site";


export default function ViewClientContent({ client }: ViewClientTopCardProps) {
  const tabs = [
    { 
      value: "personal", 
      label: "Personal Information", 
      icon: "👤", 
      shortLabel: "Personal" 
    },
    { 
      value: "sites", 
      label: "Sites", 
      icon: <FileIcon/>, 
      shortLabel: "Sites" 
    },
    { 
      value: "message", 
      label: "Message", 
      icon: <MessageCircleIcon/>, 
      shortLabel: "Message" 
    },

  ];

  return (
    <div className="">
      <Tabs defaultValue="personal" className="w-full">
        {/* Top Card with Profile Information */}
        <div className="overflow-hidden border rounded-2xl mb-3">
          {/* Background Section */}
          <div className="relative w-full h-60 bg-gray-800">
            <Image
              src="/images/overlay.png"
              alt="Guard background"
              fill
              className="object-cover opacity-60"
            />

            {/* Profile and Info */}
            <div className="absolute inset-0 flex items-end justify-between px-4 sm:px-6 py-4 bg-black/40">
              {/* Left Section: Profile Image and Name */}
              <div className="flex items-end gap-1 w-full">
                <div className="relative -bottom-6 h-30 w-30 rounded-full border-4 border-white overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/rectangle.png"
                    alt="Guard"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 ml-24 sm:ml-0 sm:pl-4 text-white mb-1">
                  <h2 className="font-bold text-lg sm:text-xl truncate">Carlota Monteiro</h2>
                  <p className="text-sm opacity-80">Guard</p>
                </div>
              </div>

              {/* Right Section: Rating and Status - Positioned top-right */}
              <div className="absolute top-4 right-4 sm:right-6 flex flex-col items-end gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs sm:text-sm">
                  ● On Duty
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="w-full border-t bg-white dark:bg-gray-900">
            <div className="flex justify-end">
              <div className="overflow-x-auto no-scrollbar">
                <TabsList className="flex items-center gap-1 px-3 sm:px-4 py-3 h-auto bg-transparent">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        "text-sm flex items-center gap-2 px-3 py-2 rounded-none transition-all border-b-2 flex-shrink-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                        "data-[state=active]:text-green-600 data-[state=active]:border-b-green-600 data-[state=active]:bg-green-50",
                        "text-gray-600 border-transparent hover:text-green-600 hover:border-green-600"
                      )}
                    >
                      <span className="text-base">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card with Tab Content */}
        <Card className="border rounded-2xl">
          <CardContent className="p-0">
            {/* Tab Contents */}
            <TabsContent value="personal" className="m-2">
              <PersonalInformation/>
            </TabsContent>

            <TabsContent value="sites" className="m-2">
              <Site/>
            </TabsContent>

            <TabsContent value="message" className="m-2">
              <Message/>
            </TabsContent>

            
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}