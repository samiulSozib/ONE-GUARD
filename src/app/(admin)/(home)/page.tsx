// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import { HomeInfo } from "@/components/home/home-info";
// import { OnGoingShifts } from "@/components/home/home-ongoing-shifts";
// import { ClientReviewCard } from "@/components/home/home-client-review";
// import { ClientGuardRequestOverview } from "@/components/home/home-client-guard-request-overview";

// export default function Page() {
//   return (
//     <div className="flex flex-1 flex-col h-full">
//       <div className="@container/main flex flex-1 flex-col gap-2 h-full">
//         {/* Grid container with stretch */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6 px-4 md:px-6 items-stretch h-full">

//           {/* LEFT COLUMN — Home Info & Data Table */}
//           <div className="lg:col-span-9 flex flex-col gap-6 h-full">
//             {/* Home Info Card */}
//             <Card className="shadow-sm rounded-2xl flex-1">
//               <CardContent className="p-1 sm:p-2">
//                 <HomeInfo />
//               </CardContent>
//             </Card>

//             {/* Data Table Card */}
//             <div className="flex-1">
//               <ClientGuardRequestOverview />
//             </div>
//           </div>

//           {/* RIGHT COLUMN — Additional Components */}
//           <div className="lg:col-span-3 flex flex-col gap-4 h-full">
//             <OnGoingShifts />
//             <ClientReviewCard />
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }



// app/page.tsx (Your dashboard home page)
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { HomeInfo } from "@/components/home/home-info";
import { OnGoingShifts } from "@/components/home/home-ongoing-shifts";
import { ClientReviewCard } from "@/components/home/home-client-review";
import { ClientGuardRequestOverview } from "@/components/home/home-client-guard-request-overview";
import { Wifi, WifiOff, Users, UserCheck } from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealTimeDashboard";
import { SocketProvider, useSocket } from "@/components/contexts/SocketContext";

function DashboardContent() {
  const { isConnected, onlineCount, totalGuards } = useRealtimeDashboard();
  const { lastEvent } = useSocket();

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Connection Status Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {isConnected ? (
                <Wifi className="h-3 w-3 animate-pulse" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span>Total: {totalGuards}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-green-500" />
                <span>Online: {onlineCount}</span>
              </div>
            </div>
          </div>

          {/* Last Event Time */}
          {lastEvent && (
            <div className="text-xs text-gray-400">
              Last update: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

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
              <ClientGuardRequestOverview />
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

export default function Page() {
  return (
    <SocketProvider>
      <DashboardContent />
    </SocketProvider>
  );
}