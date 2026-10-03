"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";

import {
  fetchTelegramBots,
  fetchTelegramChats,
  fetchTelegramDeliveries,
  fetchTelegramEvents,
  fetchTelegramOverview,
} from "@/store/slices/telegramSlice";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Activity,
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MessageSquare,
  RefreshCw,
  Send,
  Settings2,
  ShieldCheck,
} from "lucide-react";

type TelegramTab =
  | "overview"
  | "bots"
  | "groups"
  | "deliveries"
  | "events";

const TelegramManagement = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    overview,
    bots,
    chats,
    deliveries,
    events,
    isLoading,
    error,
  } = useSelector(
    (state: RootState) => state.telegram
  );

  const [activeTab, setActiveTab] =
    useState<TelegramTab>("overview");

  const loadOverview = useCallback(async () => {
    await Promise.all([
      dispatch(fetchTelegramOverview()),
      dispatch(fetchTelegramBots({ per_page: 20 })),
      dispatch(fetchTelegramChats({ per_page: 20 })),
      dispatch(
        fetchTelegramDeliveries({
          page: 1,
          per_page: 20,
        })
      ),
      dispatch(fetchTelegramEvents()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const tabs: Array<{
    key: TelegramTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "overview",
      label: "Overview",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      key: "bots",
      label: "Bots",
      icon: <Bot className="h-4 w-4" />,
    },
    {
      key: "groups",
      label: "Groups",
      icon: (
        <MessageSquare className="h-4 w-4" />
      ),
    },
    {
      key: "deliveries",
      label: "Deliveries",
      icon: <Send className="h-4 w-4" />,
    },
    {
      key: "events",
      label: "Events",
      icon: (
        <Settings2 className="h-4 w-4" />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Card className="border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="font-medium text-red-700 dark:text-red-400">
                Unable to load Telegram data
              </p>

              <p className="mt-1 text-sm text-red-600/90 dark:text-red-400/80">
                {error}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                type="button"
                variant={
                  activeTab === tab.key
                    ? "default"
                    : "ghost"
                }
                size="sm"
                onClick={() =>
                  setActiveTab(tab.key)
                }
                className={
                  activeTab === tab.key
                    ? "shrink-0 bg-[#5F0015] text-white hover:bg-[#75001a]"
                    : "shrink-0"
                }
              >
                {tab.icon}

                <span className="ml-2">
                  {tab.label}
                </span>
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => void loadOverview()}
            className="w-full lg:w-auto"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isLoading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>
      </Card>

      {activeTab === "overview" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard
              title="Telegram Bots"
              value={
                overview?.bots?.total ??
                bots.length
              }
              subtitle={`${
                overview?.bots?.active ?? 0
              } active`}
              icon={<Bot className="h-5 w-5" />}
            />

            <OverviewCard
              title="Telegram Groups"
              value={
                overview?.chats?.total ??
                chats.length
              }
              subtitle={`${
                overview?.chats?.active ?? 0
              } active`}
              icon={
                <MessageSquare className="h-5 w-5" />
              }
            />

            <OverviewCard
              title="Event Rules"
              value={
                overview?.rules?.total ?? 0
              }
              subtitle={`${
                overview?.rules?.enabled ??
                overview?.rules?.active ??
                0
              } enabled`}
              icon={
                <ShieldCheck className="h-5 w-5" />
              }
            />

            <OverviewCard
              title="Deliveries"
              value={
                overview?.deliveries?.total ??
                deliveries.length
              }
              subtitle={`${
                overview?.deliveries?.sent ??
                0
              } sent`}
              icon={<Send className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="p-4 xl:col-span-2">
              <div className="mb-4">
                <h2 className="font-semibold">
                  Delivery Status
                </h2>

                <p className="text-sm text-muted-foreground">
                  Current Telegram notification
                  delivery summary.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatusItem
                  label="Sent"
                  value={
                    overview?.deliveries
                      ?.sent ?? 0
                  }
                  icon={
                    <CheckCircle2 className="h-5 w-5" />
                  }
                />

                <StatusItem
                  label="Pending"
                  value={
                    overview?.deliveries
                      ?.pending ?? 0
                  }
                  icon={
                    <Clock3 className="h-5 w-5" />
                  }
                />

                <StatusItem
                  label="Failed"
                  value={
                    overview?.deliveries
                      ?.failed ?? 0
                  }
                  icon={
                    <CircleAlert className="h-5 w-5" />
                  }
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-4">
                <h2 className="font-semibold">
                  Event Catalog
                </h2>

                <p className="text-sm text-muted-foreground">
                  Events currently available for
                  Telegram rules.
                </p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {events.length}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    available events
                  </p>
                </div>

                <Settings2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "bots" && (
        <PlaceholderSection
          title="Telegram Bots"
          description="Bot registration and configuration will be managed here."
          count={bots.length}
          icon={<Bot className="h-6 w-6" />}
        />
      )}

      {activeTab === "groups" && (
        <PlaceholderSection
          title="Telegram Groups"
          description="Group registration, verification, scopes and event rules will be managed here."
          count={chats.length}
          icon={
            <MessageSquare className="h-6 w-6" />
          }
        />
      )}

      {activeTab === "deliveries" && (
        <PlaceholderSection
          title="Delivery History"
          description="Telegram notification delivery monitoring will be available here."
          count={deliveries.length}
          icon={<Send className="h-6 w-6" />}
        />
      )}

      {activeTab === "events" && (
        <PlaceholderSection
          title="Telegram Events"
          description="Canonical Telegram event types available for group rules."
          count={events.length}
          icon={
            <Settings2 className="h-6 w-6" />
          }
        />
      )}
    </div>
  );
};

interface OverviewCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}

const OverviewCard = ({
  title,
  value,
  subtitle,
  icon,
}: OverviewCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
          {icon}
        </div>
      </div>
    </Card>
  );
};

interface StatusItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const StatusItem = ({
  label,
  value,
  icon,
}: StatusItemProps) => {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground">
          {icon}
        </div>

        <span className="text-xl font-bold">
          {value}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium">
        {label}
      </p>
    </div>
  );
};

interface PlaceholderSectionProps {
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
}

const PlaceholderSection = ({
  title,
  description,
  count,
  icon,
}: PlaceholderSectionProps) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>

          <div>
            <h2 className="font-semibold">
              {title}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="rounded-lg border px-4 py-2 text-center">
          <p className="text-xl font-bold">
            {count}
          </p>

          <p className="text-xs text-muted-foreground">
            Records
          </p>
        </div>
      </div>
    </Card>
  );
};

export { TelegramManagement };
