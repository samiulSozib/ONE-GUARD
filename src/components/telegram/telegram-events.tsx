"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
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

import {
  fetchTelegramEvents,
} from "@/store/slices/telegramSlice";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Activity,
  AlertCircle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileWarning,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

type EventCategory =
  | "assignment"
  | "shift"
  | "early_checkout"
  | "site"
  | "other";

const TelegramEvents = () => {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    events,
    isLoading,
  } = useSelector(
    (state: RootState) =>
      state.telegram
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState<
    EventCategory | "all"
  >("all");

  const loadEvents =
    useCallback(async () => {
      await dispatch(
        fetchTelegramEvents()
      );
    }, [dispatch]);

  useEffect(() => {
    if (
      events.length === 0
    ) {
      void loadEvents();
    }
  }, [
    events.length,
    loadEvents,
  ]);

  const filteredEvents =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return events.filter(
        (event) => {
          const eventCategory =
            getEventCategory(
              event
            );

          const matchesCategory =
            category === "all" ||
            eventCategory ===
              category;

          const matchesSearch =
            !query ||
            event
              .toLowerCase()
              .includes(query) ||
            formatEventName(
              event
            )
              .toLowerCase()
              .includes(query);

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      events,
      search,
      category,
    ]);

  const counts =
    useMemo(() => {
      return {
        assignment:
          events.filter(
            (event) =>
              getEventCategory(
                event
              ) ===
              "assignment"
          ).length,

        shift:
          events.filter(
            (event) =>
              getEventCategory(
                event
              ) ===
              "shift"
          ).length,

        early_checkout:
          events.filter(
            (event) =>
              getEventCategory(
                event
              ) ===
              "early_checkout"
          ).length,

        site:
          events.filter(
            (event) =>
              getEventCategory(
                event
              ) ===
              "site"
          ).length,

        other:
          events.filter(
            (event) =>
              getEventCategory(
                event
              ) ===
              "other"
          ).length,
      };
    }, [events]);

  const handleRefresh =
    async () => {
      await loadEvents();
    };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
  };

  const hasFilters =
    search.trim() !== "" ||
    category !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
              <Settings2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-semibold">
                Telegram Event Catalog
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Canonical notification
                events available for
                Telegram group rules.
              </p>
            </div>
          </div>

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

      {/* Summary */}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          label="All Events"
          value={events.length}
          icon={
            <Activity className="h-4 w-4" />
          }
          active={
            category === "all"
          }
          onClick={() =>
            setCategory("all")
          }
        />

        <SummaryCard
          label="Assignments"
          value={
            counts.assignment
          }
          icon={
            <UserCheck className="h-4 w-4" />
          }
          active={
            category ===
            "assignment"
          }
          onClick={() =>
            setCategory(
              "assignment"
            )
          }
        />

        <SummaryCard
          label="Shifts"
          value={counts.shift}
          icon={
            <CalendarClock className="h-4 w-4" />
          }
          active={
            category === "shift"
          }
          onClick={() =>
            setCategory("shift")
          }
        />

        <SummaryCard
          label="Early Checkout"
          value={
            counts.early_checkout
          }
          icon={
            <Clock3 className="h-4 w-4" />
          }
          active={
            category ===
            "early_checkout"
          }
          onClick={() =>
            setCategory(
              "early_checkout"
            )
          }
        />

        <SummaryCard
          label="Site"
          value={counts.site}
          icon={
            <ShieldCheck className="h-4 w-4" />
          }
          active={
            category === "site"
          }
          onClick={() =>
            setCategory("site")
          }
        />

        <SummaryCard
          label="Other"
          value={counts.other}
          icon={
            <BellRing className="h-4 w-4" />
          }
          active={
            category === "other"
          }
          onClick={() =>
            setCategory("other")
          }
        />
      </div>

      {/* Search / filters */}

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Search Event
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="text"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search event type..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Category
              </label>

              <select
                value={category}
                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target
                      .value as
                      | EventCategory
                      | "all"
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">
                  All categories
                </option>

                <option value="assignment">
                  Assignment
                </option>

                <option value="shift">
                  Shift
                </option>

                <option value="early_checkout">
                  Early Checkout
                </option>

                <option value="site">
                  Site
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Catalog */}

      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-semibold">
                Available Events
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                These event types can
                be enabled or disabled
                for individual Telegram
                groups.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              {
                filteredEvents.length
              }{" "}
              of {events.length}
            </p>
          </div>
        </div>

        {isLoading &&
        events.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />

              Loading Telegram
              events...
            </div>
          </div>
        ) : filteredEvents.length ===
          0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />

            <h4 className="font-medium">
              No events found
            </h4>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              No Telegram event
              matches the current
              filters.
            </p>

            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map(
              (event) => (
                <EventCard
                  key={event}
                  event={event}
                />
              )
            )}
          </div>
        )}
      </Card>

      {/* Information */}

      <div className="flex items-start gap-2 rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

        <p>
          The event catalog is
          read-only. To control which
          events a Telegram group
          receives, open that group
          and use its Event Rules
          configuration.
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   Event Card
   ========================================================= */

const EventCard = ({
  event,
}: {
  event: string;
}) => {
  const category =
    getEventCategory(event);

  const metadata =
    getCategoryMetadata(
      category
    );

  return (
    <div className="group rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {metadata.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {formatEventName(
                event
              )}
            </p>

            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {metadata.label}
            </span>
          </div>

          <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
            {event}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Summary
   ========================================================= */

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const SummaryCard = ({
  label,
  value,
  icon,
  active,
  onClick,
}: SummaryCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-colors ${
        active
          ? "border-[#5F0015] bg-[#5F0015]/5"
          : "bg-card hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={
            active
              ? "text-[#5F0015]"
              : "text-muted-foreground"
          }
        >
          {icon}
        </div>

        <span className="text-xl font-bold">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-medium">
        {label}
      </p>
    </button>
  );
};

/* =========================================================
   Helpers
   ========================================================= */

const getEventCategory = (
  event: string
): EventCategory => {
  if (
    event.startsWith(
      "assignment."
    )
  ) {
    return "assignment";
  }

  if (
    event.startsWith(
      "shift."
    )
  ) {
    return "shift";
  }

  if (
    event.startsWith(
      "early_checkout."
    )
  ) {
    return "early_checkout";
  }

  if (
    event.startsWith(
      "site."
    )
  ) {
    return "site";
  }

  return "other";
};

const getCategoryMetadata = (
  category: EventCategory
): {
  label: string;
  icon: React.ReactNode;
} => {
  switch (category) {
    case "assignment":
      return {
        label: "Assignment",
        icon: (
          <UserCheck className="h-4 w-4" />
        ),
      };

    case "shift":
      return {
        label: "Shift",
        icon: (
          <CalendarClock className="h-4 w-4" />
        ),
      };

    case "early_checkout":
      return {
        label:
          "Early Checkout",
        icon: (
          <Clock3 className="h-4 w-4" />
        ),
      };

    case "site":
      return {
        label: "Site",
        icon: (
          <ShieldCheck className="h-4 w-4" />
        ),
      };

    default:
      return {
        label: "Other",
        icon: (
          <ClipboardList className="h-4 w-4" />
        ),
      };
  }
};

const formatEventName = (
  event: string
) => {
  return event
    .split(".")
    .map((part) =>
      part
        .replace(
          /_/g,
          " "
        )
        .replace(
          /\b\w/g,
          (character) =>
            character.toUpperCase()
        )
    )
    .join(" · ");
};

export default TelegramEvents;
