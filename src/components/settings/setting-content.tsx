"use client";

import { FileIcon, Key, MessageCircleIcon, MessagesSquareIcon, QrCode, Star, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import General from "./tabContents/general";
import TwilioSettings from "./tabContents/twilio-settings";
import TwoFactorAuthentication from "./tabContents/two-factor-authentication";
import ChangePassword from "./tabContents/chang-password";

export default function SettingContent() {
  const tabs = [
    {
      value: "general",
      label: "General",
      icon: <UserIcon className="h-4 w-4"/>,
      shortLabel: "General"
    },
    {
      value: "contacts",
      label: "Contacts",
      icon: <FileIcon className="h-4 w-4" />,
      shortLabel: "Contacts"
    },
    {
      value: "twilio-settings",
      label: "Twilio Settings",
      icon: <MessagesSquareIcon className="h-4 w-4" />,
      shortLabel: "Twilio"
    },
    {
      value: "two-factor-authentication",
      label: "Two-Factor Authentication",
      icon: <QrCode className="h-4 w-4" />,
      shortLabel: "2FA"
    },
    {
      value: "change-password",
      label: "Change Password",
      icon: <Key className="h-4 w-4" />,
      shortLabel: "Password"
    },
  ];

  return (
    <div className="">
      <Tabs defaultValue="general" className="w-full">
        {/* Navigation Tabs - No Card Border */}
        <div className="w-full border-b">
          <div className="flex justify-start">
            <div className="overflow-x-auto no-scrollbar">
              <TabsList className="flex items-center gap-1 px-3 sm:px-4 py-3 h-auto bg-transparent w-full">
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

        {/* Tab Content - No Card Styling */}
        <div className="py-4">
          <TabsContent value="general" className="m-0">
            <General/>
          </TabsContent>

          <TabsContent value="contacts" className="m-0">
            <p>Contacts content</p>
          </TabsContent>

          <TabsContent value="twilio-settings" className="m-0">
            <TwilioSettings/>
          </TabsContent>

          <TabsContent value="two-factor-authentication" className="m-0">
            <TwoFactorAuthentication/>
          </TabsContent>

          <TabsContent value="change-password" className="m-0">
            <ChangePassword/>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}