"use client";

import SettingTopCard from "@/components/settings/setting-top-card";
import SettingContent from "@/components/settings/setting-content";






export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <SettingTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
          <SettingContent/>
        </div>
      </div>


    </div>
  );
}
