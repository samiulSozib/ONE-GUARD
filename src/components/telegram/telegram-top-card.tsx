"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  RefreshCw,
  Send,
} from "lucide-react";

interface TelegramTopCardProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const TelegramTopCard = ({
  onRefresh,
  isRefreshing = false,
}: TelegramTopCardProps) => {
  return (
    <Card className="flex flex-col gap-4 p-3 lg:p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5F0015]/10">
          <Send className="h-5 w-5 text-[#5F0015]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold dark:text-white">
              Telegram Management
            </h1>

            <Bot className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage Telegram bots, groups, event rules and notification deliveries.
          </p>
        </div>
      </div>

      {onRefresh && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full md:w-auto"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />

          {isRefreshing
            ? "Refreshing..."
            : "Refresh"}
        </Button>
      )}
    </Card>
  );
};

export default TelegramTopCard;
