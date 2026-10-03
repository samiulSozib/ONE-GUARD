"use client";

import React from "react";

import { TelegramBot } from "@/app/types/telegram";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Bot,
  CalendarClock,
  Loader2,
  Pencil,
  ShieldCheck,
} from "lucide-react";

interface TelegramBotDataTableProps {
  bots: TelegramBot[];
  isLoading?: boolean;
  verifyingBotId?: number | null;
  onEdit: (bot: TelegramBot) => void;
  onVerify: (bot: TelegramBot) => void;
}

const TelegramBotDataTable = ({
  bots,
  isLoading = false,
  verifyingBotId = null,
  onEdit,
  onVerify,
}: TelegramBotDataTableProps) => {
  const formatDate = (
    value?: string | null
  ) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  };

  if (isLoading && bots.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="flex min-h-[260px] items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bot className="h-5 w-5 animate-pulse text-muted-foreground" />
            </div>

            <p className="mt-3 text-sm font-medium">
              Loading Telegram bots...
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Please wait while the registered
              bots are loaded.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (bots.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="flex min-h-[260px] items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bot className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-sm font-medium">
              No Telegram bots found
            </p>

            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Register a Telegram bot to start
              configuring groups and notification
              delivery.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Desktop table */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bot
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Updated
              </th>

              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {bots.map((bot) => {
              const isVerifying =
                verifyingBotId === bot.id;

              return (
                <tr
                  key={bot.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
                        <Bot className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {bot.name ||
                            "Unnamed Bot"}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Bot ID: {bot.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {bot.is_active ? (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                      >
                        Inactive
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0" />

                      <span>
                        {formatDate(
                          bot.created_at
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0" />

                      <span>
                        {formatDate(
                          bot.updated_at
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          verifyingBotId !==
                          null
                        }
                        onClick={() =>
                          onVerify(bot)
                        }
                      >
                        {isVerifying ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                        )}

                        {isVerifying
                          ? "Verifying..."
                          : "Verify"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          verifyingBotId !==
                          null
                        }
                        onClick={() =>
                          onEdit(bot)
                        }
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />

                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}

      <div className="divide-y md:hidden">
        {bots.map((bot) => {
          const isVerifying =
            verifyingBotId === bot.id;

          return (
            <div
              key={bot.id}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {bot.name ||
                        "Unnamed Bot"}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Bot ID: {bot.id}
                    </p>
                  </div>
                </div>

                {bot.is_active ? (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-green-200 bg-green-50 text-green-700"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="shrink-0"
                  >
                    Inactive
                  </Badge>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">
                    Created
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDate(
                      bot.created_at
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Updated
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDate(
                      bot.updated_at
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    verifyingBotId !== null
                  }
                  onClick={() =>
                    onVerify(bot)
                  }
                >
                  {isVerifying ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                  )}

                  {isVerifying
                    ? "Verifying..."
                    : "Verify Bot"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    verifyingBotId !== null
                  }
                  onClick={() =>
                    onEdit(bot)
                  }
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />

                  Edit Bot
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TelegramBotDataTable;