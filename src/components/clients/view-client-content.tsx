// components/clients/view-client-content.tsx
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileIcon, MessageCircleIcon, Star, Building, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import PersonalInformation from "./tabContents/personal-information";
import { Message } from "./tabContents/message";
import { Site } from "./tabContents/site";
import { Client } from "@/app/types/client";

interface ViewClientContentProps {
  client: Client;
}

export default function ViewClientContent({ client }: ViewClientContentProps) {
  const tabs = [
    { 
      value: "personal", 
      label: "Personal Information", 
      icon: <UserIcon size={16}/>, 
      shortLabel: "Personal" 
    },
    { 
      value: "sites", 
      label: "Sites", 
      icon: <Building size={16}/>, 
      shortLabel: "Sites" 
    },
    { 
      value: "message", 
      label: "Message", 
      icon: <MessageCircleIcon size={16}/>, 
      shortLabel: "Message" 
    },
  ];

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="">
      <Tabs defaultValue="personal" className="w-full">
        {/* Top Card with Profile Information */}
        <div className="overflow-hidden border rounded-2xl mb-3">
          {/* Background Section */}
          <div className="relative w-full h-60 bg-gradient-to-r from-blue-800 to-indigo-900">
            <Image
              src="/images/overlay.png"
              alt="Client background"
              fill
              className="object-cover opacity-20"
            />

            {/* Profile and Info */}
            <div className="absolute inset-0 flex items-end justify-between px-4 sm:px-6 py-4">
              {/* Left Section: Profile Image and Name */}
              <div className="flex items-end gap-4 w-full">
                <div className="relative -bottom-6 h-32 w-32 rounded-full border-4 border-white overflow-hidden flex-shrink-0 bg-white">
                  {client.profile_image ? (
                    <Image
                      src={client.profile_image}
                      alt={client.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                      {getInitials(client.full_name)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 ml-0 sm:pl-4 text-white mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-bold text-2xl sm:text-3xl truncate">
                      {client.full_name}
                    </h2>
                    <Badge className={cn(
                      "text-xs",
                      client.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    )}>
                      {client.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {client.company_name && (
                      <div className="flex items-center gap-2">
                        <Building size={16} className="opacity-70" />
                        <span className="text-sm opacity-90">{client.company_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-90 truncate">{client.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-90">{client.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-90">
                        Client Code: {client.client_code}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-90">
                        Joined {formatDate(client.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
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
                        "data-[state=active]:text-blue-600 data-[state=active]:border-b-blue-600 data-[state=active]:bg-blue-50",
                        "text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600"
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
              <PersonalInformation client={client}/>
            </TabsContent>

            <TabsContent value="sites" className="m-2">
              {/* <Site client={client}/> */}
            </TabsContent>

            <TabsContent value="message" className="m-2">
              {/* <Message client={client}/> */}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}