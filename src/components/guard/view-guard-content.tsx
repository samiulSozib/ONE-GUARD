"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Battery, Wifi, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewGuardTopCardProps } from "@/app/types/guard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Availability } from "./tabContents/availability";
import { GuardTraining } from "./tabContents/guard-training";
import { GuardArms } from "./tabContents/guard-arms";
import { Contact } from "./tabContents/contact";
import PersonalInformation from "./tabContents/personal-information";
import { Assignment } from "./tabContents/assignment";

export default function ViewGuardContent({ guard }: ViewGuardTopCardProps) {
  const tabs = [
    {
      value: "personal",
      label: "Personal Information",
      icon: "👤",
      shortLabel: "Personal"
    },
    {
      value: "assignment",
      label: "Assignment",
      icon: "👤",
      shortLabel: "assignment"
    },
    {
      value: "availability",
      label: "Availability",
      icon: "🗓️",
      shortLabel: "Availability"
    },
    {
      value: "training",
      label: "Guard Training",
      icon: "🎯",
      shortLabel: "Training"
    },
    {
      value: "arms",
      label: "Guard Arms",
      icon: "🛡️",
      shortLabel: "Arms"
    },
    {
      value: "contract",
      label: "Contract",
      icon: "📄",
      shortLabel: "Contract"
    },
  ];

  // Get status color and text
  const getStatusDisplay = () => {
    if (guard.online_status === 'online') {
      return { 
        color: 'bg-green-100 text-green-700', 
        text: '● Online',
        pulse: true
      };
    } else if (guard.online_status === 'offline') {
      return { 
        color: 'bg-gray-100 text-gray-700', 
        text: '● Offline',
        pulse: false
      };
    } else {
      return { 
        color: 'bg-yellow-100 text-yellow-700', 
        text: '● Unknown',
        pulse: false
      };
    }
  };

  const status = getStatusDisplay();

  // Format last location time
  const formatLastLocationTime = () => {
    if (!guard.last_location?.recorded_at) return null;
    const date = new Date(guard.last_location.recorded_at);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format distance
  const formatDistance = () => {
    if (!guard.distance_to_duty_meters) return null;
    const distance = parseFloat(guard.distance_to_duty_meters);
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    }
    return `${Math.round(distance)} m`;
  };

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
                  <h2 className="font-bold text-lg sm:text-xl truncate">{guard.full_name}</h2>
                  <p className="text-sm opacity-80">{guard.guard_code}</p>
                </div>
              </div>

              {/* Right Section: Rating and Status */}
              <div className="absolute top-4 right-4 sm:right-6 flex flex-col items-end gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                </div>
                <Badge variant="secondary" className={`${status.color} text-xs sm:text-sm`}>
                  {status.text}
                </Badge>
              </div>
            </div>
          </div>

          {/* Location Status Bar */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Online Status with Dot */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${guard.online_status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-xs font-medium">
                  {guard.online_status === 'online' ? 'Live' : 'Last seen'}
                </span>
                {guard.last_ping_at && (
                  <span className="text-xs text-gray-500">
                    {new Date(guard.last_ping_at).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Location Info */}
              {guard.last_location && (
                <>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-xs">
                      Lat: {parseFloat(guard.last_location.latitude).toFixed(6)}, 
                      Lng: {parseFloat(guard.last_location.longitude).toFixed(6)}
                    </span>
                  </div>
                  
                  {guard.last_location.accuracy && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        ±{parseFloat(guard.last_location.accuracy).toFixed(0)}m
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {formatLastLocationTime()}
                    </span>
                  </div>
                </>
              )}

              {/* Battery Info */}
              {guard.last_location?.battery_level !== undefined && (
                <div className="flex items-center gap-1">
                  <Battery className="h-3 w-3 text-gray-500" />
                  <span className="text-xs">
                    {guard.last_location.battery_level}%
                    {guard.last_location.is_charging && ' ⚡'}
                  </span>
                </div>
              )}

              {/* Network Info */}
              {guard.last_location?.battery_level !== undefined && (
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-gray-500" />
                  <span className="text-xs">
                    {guard.last_location.is_charging !== undefined ? 'Mobile' : 'WiFi'}
                  </span>
                </div>
              )}
            </div>

            {/* Duty Location Status */}
            <div className="flex items-center gap-2">
              {guard.is_at_duty_location !== undefined && (
                <Badge 
                  variant={guard.is_at_duty_location ? "default" : "destructive"}
                  className="text-xs"
                >
                  {guard.is_at_duty_location ? '✓ At Duty Location' : '⚠ Away from Duty'}
                </Badge>
              )}
              {guard.distance_to_duty_meters && (
                <span className="text-xs text-gray-500">
                  {formatDistance()} away
                </span>
              )}
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
              <PersonalInformation guard={guard} />
            </TabsContent>

             <TabsContent value="assignment" className="m-2">
              <Assignment guard_id={guard.id}/>
            </TabsContent>

            <TabsContent value="availability" className="m-2">
              <Availability />
            </TabsContent>

            <TabsContent value="training" className="m-2">
              <GuardTraining />
            </TabsContent>

            <TabsContent value="arms" className="m-2">
              <GuardArms />
            </TabsContent>

            <TabsContent value="contract" className="m-2">
              <Contact />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}