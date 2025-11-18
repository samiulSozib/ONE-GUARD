"use client";

import { Messages } from "@/components/messages/message-content";



export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <Messages/>
        </div>
        <div className="py-2 px-4 md:px-6">
        </div>
      </div>


    </div>
  );
}
