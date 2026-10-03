"use client";

import React, {
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";

import type {
  TelegramChat,
} from "@/app/types/telegram";

import {
  fetchTelegramChats,
  fetchTelegramOverview,
} from "@/store/slices/telegramSlice";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import TelegramGroupForm from "./telegram-group-form";

interface TelegramGroupsProps {
  onView?: (
    chat: TelegramChat
  ) => void;
}

const TelegramGroups = ({
  onView,
}: TelegramGroupsProps) => {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    chats,
    isLoading,
  } = useSelector(
    (state: RootState) =>
      state.telegram
  );

  const [
    selectedChat,
    setSelectedChat,
  ] =
    useState<TelegramChat | null>(
      null
    );

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const activeGroups =
    chats.filter(
      (chat) => chat.is_active
    ).length;

  const inactiveGroups =
    chats.length - activeGroups;

  const verifiedGroups =
    chats.filter(
      (chat) =>
        chat.is_verified === true
    ).length;

  const unverifiedGroups =
    chats.length - verifiedGroups;

  const handleRefresh =
    async () => {
      await Promise.all([
        dispatch(
          fetchTelegramChats({
            page: 1,
            per_page: 20,
          })
        ),

        dispatch(
          fetchTelegramOverview()
        ),
      ]);
    };

  const handleCreate = () => {
    setSelectedChat(null);
    setFormOpen(true);
  };

  const handleEdit = (
    chat: TelegramChat
  ) => {
    setSelectedChat(chat);
    setFormOpen(true);
  };

  const handleView = (
    chat: TelegramChat
  ) => {
    setSelectedChat(chat);

    if (onView) {
      onView(chat);
    }
  };

  const handleFormOpenChange = (
    open: boolean
  ) => {
    setFormOpen(open);

    if (!open) {
      setSelectedChat(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}

        <Card className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
                <MessageSquare className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Telegram Groups
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manage Telegram groups,
                  verification, scopes and
                  event rules.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() =>
                  void handleRefresh()
                }
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading
                    ? "animate-spin"
                    : ""
                    }`}
                />

                Refresh
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                className="bg-[#5F0015] text-white hover:bg-[#75001a]"
              >
                <Plus className="mr-2 h-4 w-4" />

                Add Group
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <GroupSummaryCard
            label="Total Groups"
            value={chats.length}
            icon={
              <MessageSquare className="h-4 w-4" />
            }
          />

          <GroupSummaryCard
            label="Active"
            value={activeGroups}
            icon={
              <ShieldCheck className="h-4 w-4" />
            }
          />

          <GroupSummaryCard
            label="Verified"
            value={verifiedGroups}
            icon={
              <ShieldCheck className="h-4 w-4" />
            }
          />

          <GroupSummaryCard
            label="Unverified"
            value={unverifiedGroups}
            icon={
              <ShieldX className="h-4 w-4" />
            }
          />
        </div>

        {/* Registered groups */}

        <Card className="overflow-hidden">
          <div className="border-b p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-semibold">
                  Registered Groups
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {chats.length}{" "}
                  {chats.length === 1
                    ? "group"
                    : "groups"}{" "}
                  registered
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                {inactiveGroups} inactive
              </div>
            </div>
          </div>

          {isLoading &&
            chats.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />

                Loading Telegram
                groups...
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>

              <h4 className="font-medium">
                No Telegram groups
              </h4>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Register a Telegram group
                to configure notification
                scopes and event rules.
              </p>

              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                className="mt-4 bg-[#5F0015] text-white hover:bg-[#75001a]"
              >
                <Plus className="mr-2 h-4 w-4" />

                Add Group
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {chats.map(
                (chat) => {
                  const isSelected =
                    selectedChat?.id ===
                    chat.id;

                  return (
                    <div
                      key={chat.id}
                      className={`flex flex-col gap-4 p-4 transition-colors lg:flex-row lg:items-center lg:justify-between ${isSelected
                        ? "bg-muted/40"
                        : ""
                        }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {
                              chat.title
                            }
                          </p>

                          <StatusBadge
                            active={
                              chat.is_active
                            }
                            activeLabel="Active"
                            inactiveLabel="Inactive"
                          />

                          <StatusBadge
                            active={
                              chat.is_verified ===
                              true
                            }
                            activeLabel="Verified"
                            inactiveLabel="Unverified"
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            ID:{" "}
                            {
                              chat.id
                            }
                          </span>

                          <span>
                            Telegram
                            Chat:{" "}
                            {
                              chat.chat_id
                            }
                          </span>

                          {chat.type && (
                            <span>
                              Type:{" "}
                              {
                                chat.type
                              }
                            </span>
                          )}

                          {chat.audience && (
                            <span>
                              Audience:{" "}
                              {
                                chat.audience
                              }
                            </span>
                          )}
                        </div>

                        {chat.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {
                              chat.description
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleView(
                              chat
                            )
                          }
                        >
                          Details
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEdit(
                              chat
                            )
                          }
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </Card>
      </div>

      <TelegramGroupForm
        open={formOpen}
        onOpenChange={
          handleFormOpenChange
        }
        chat={selectedChat}
      />
    </>
  );
};

interface GroupSummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const GroupSummaryCard = ({
  label,
  value,
  icon,
}: GroupSummaryCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
      </div>
    </Card>
  );
};

interface StatusBadgeProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}

const StatusBadge = ({
  active,
  activeLabel,
  inactiveLabel,
}: StatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${active
        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
        : "bg-muted text-muted-foreground"
        }`}
    >
      {active
        ? activeLabel
        : inactiveLabel}
    </span>
  );
};

export default TelegramGroups;