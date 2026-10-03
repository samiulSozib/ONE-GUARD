"use client";

import TelegramTopCard from "@/components/telegram/telegram-top-card";
import { TelegramManagement } from "@/components/telegram/telegram-management";

export default function TelegramPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
          <TelegramTopCard />
        </div>

        <div className="py-2 px-4 md:px-6">
          <TelegramManagement />
        </div>
      </div>
    </div>
  );
}
