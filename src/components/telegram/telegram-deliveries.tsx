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

import type {
  TelegramDelivery,
  TelegramDeliveryParams,
} from "@/app/types/telegram";

import {
  fetchTelegramChats,
  fetchTelegramDeliveries,
  fetchTelegramEvents,
} from "@/store/slices/telegramSlice";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";

import TelegramDeliveryDetails from "./telegram-delivery-details";

const DEFAULT_PER_PAGE = 20;

const TelegramDeliveries = () => {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    deliveries,
    deliveryPagination,
    chats,
    events,
    isLoading,
  } = useSelector(
    (state: RootState) =>
      state.telegram
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    perPage,
    setPerPage,
  ] = useState(
    DEFAULT_PER_PAGE
  );

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    eventType,
    setEventType,
  ] = useState("");

  const [
    chatId,
    setChatId,
  ] = useState("");

  const [
    selectedDelivery,
    setSelectedDelivery,
  ] =
    useState<TelegramDelivery | null>(
      null
    );

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const params =
    useMemo<TelegramDeliveryParams>(
      () => {
        const request: TelegramDeliveryParams =
          {
            page,
            per_page:
              perPage,
          };

        if (status) {
          request.status =
            status;
        }

        if (eventType) {
          request.event_type =
            eventType;
        }

        if (chatId) {
          request.telegram_chat_id =
            Number(chatId);
        }

        return request;
      },
      [
        page,
        perPage,
        status,
        eventType,
        chatId,
      ]
    );

  const loadDeliveries =
    useCallback(async () => {
      await dispatch(
        fetchTelegramDeliveries(
          params
        )
      );
    }, [
      dispatch,
      params,
    ]);

  useEffect(() => {
    void loadDeliveries();
  }, [loadDeliveries]);

  useEffect(() => {
    if (
      events.length === 0
    ) {
      void dispatch(
        fetchTelegramEvents()
      );
    }

    if (
      chats.length === 0
    ) {
      void dispatch(
        fetchTelegramChats({
          page: 1,
          per_page: 100,
        })
      );
    }
  }, [
    dispatch,
    events.length,
    chats.length,
  ]);

  const sentCount =
    deliveries.filter(
      (delivery) =>
        normalizeStatus(
          delivery.status
        ) === "sent"
    ).length;

  const pendingCount =
    deliveries.filter(
      (delivery) =>
        normalizeStatus(
          delivery.status
        ) === "pending"
    ).length;

  const failedCount =
    deliveries.filter(
      (delivery) =>
        normalizeStatus(
          delivery.status
        ) === "failed"
    ).length;

  const handleRefresh =
    async () => {
      await Promise.all([
        dispatch(
          fetchTelegramDeliveries(
            params
          )
        ),

        dispatch(
          fetchTelegramEvents()
        ),

        dispatch(
          fetchTelegramChats({
            page: 1,
            per_page: 100,
          })
        ),
      ]);
    };

  const handleResetFilters =
    () => {
      setStatus("");
      setEventType("");
      setChatId("");
      setPage(1);
    };

  const handleStatusChange = (
    value: string
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handleEventChange = (
    value: string
  ) => {
    setEventType(value);
    setPage(1);
  };

  const handleChatChange = (
    value: string
  ) => {
    setChatId(value);
    setPage(1);
  };

  const handlePerPageChange = (
    value: string
  ) => {
    setPerPage(
      Number(value)
    );

    setPage(1);
  };

  const handleView = (
    delivery: TelegramDelivery
  ) => {
    setSelectedDelivery(
      delivery
    );

    setDetailsOpen(true);
  };

  const handleDetailsOpenChange =
    (
      open: boolean
    ) => {
      setDetailsOpen(open);

      if (!open) {
        setSelectedDelivery(
          null
        );
      }
    };

  const currentPage =
    deliveryPagination.current_page ??
    page;

  const lastPage =
    deliveryPagination.last_page ??
    1;

  const total =
    deliveryPagination.total ??
    deliveries.length;

  const hasFilters =
    Boolean(
      status ||
        eventType ||
        chatId
    );

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}

        <Card className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
                <Send className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Telegram Deliveries
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Monitor Telegram
                  notification delivery
                  history, status,
                  attempts and errors.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                isLoading
              }
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

        {/* Current page summary */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Records"
            value={total}
            icon={
              <Send className="h-4 w-4" />
            }
          />

          <SummaryCard
            label="Sent On Page"
            value={sentCount}
            icon={
              <CheckCircle2 className="h-4 w-4" />
            }
          />

          <SummaryCard
            label="Pending On Page"
            value={
              pendingCount
            }
            icon={
              <Clock3 className="h-4 w-4" />
            }
          />

          <SummaryCard
            label="Failed On Page"
            value={
              failedCount
            }
            icon={
              <XCircle className="h-4 w-4" />
            }
          />
        </div>

        {/* Filters */}

        <Card className="p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />

                <h3 className="text-sm font-semibold">
                  Filters
                </h3>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Filter delivery
                history by status,
                event or Telegram
                group.
              </p>
            </div>

            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={
                  handleResetFilters
                }
              >
                <RotateCcw className="mr-2 h-4 w-4" />

                Reset Filters
              </Button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {/* Status */}

            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Status
              </label>

              <select
                value={status}
                onChange={(
                  event
                ) =>
                  handleStatusChange(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">
                  All statuses
                </option>

                <option value="sent">
                  Sent
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="failed">
                  Failed
                </option>
              </select>
            </div>

            {/* Event */}

            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Event
              </label>

              <select
                value={
                  eventType
                }
                onChange={(
                  event
                ) =>
                  handleEventChange(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">
                  All events
                </option>

                {events.map(
                  (event) => (
                    <option
                      key={
                        event
                      }
                      value={
                        event
                      }
                    >
                      {
                        event
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Group */}

            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Telegram Group
              </label>

              <select
                value={chatId}
                onChange={(
                  event
                ) =>
                  handleChatChange(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">
                  All groups
                </option>

                {chats.map(
                  (chat) => (
                    <option
                      key={
                        chat.id
                      }
                      value={String(
                        chat.id
                      )}
                    >
                      {
                        chat.title
                      }{" "}
                      (#
                      {
                        chat.id
                      })
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Per page */}

            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Per Page
              </label>

              <select
                value={String(
                  perPage
                )}
                onChange={(
                  event
                ) =>
                  handlePerPageChange(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="10">
                  10
                </option>

                <option value="20">
                  20
                </option>

                <option value="50">
                  50
                </option>

                <option value="100">
                  100
                </option>
              </select>
            </div>
          </div>
        </Card>

        {/* Delivery table */}

        <Card className="overflow-hidden">
          <div className="border-b p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-semibold">
                  Delivery History
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {total}{" "}
                  {total === 1
                    ? "delivery"
                    : "deliveries"}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Page{" "}
                {
                  currentPage
                }{" "}
                of{" "}
                {
                  lastPage
                }
              </p>
            </div>
          </div>

          {isLoading &&
          deliveries.length ===
            0 ? (
            <div className="flex min-h-[260px] items-center justify-center p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />

                Loading Telegram
                deliveries...
              </div>
            </div>
          ) : deliveries.length ===
            0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Send className="h-5 w-5 text-muted-foreground" />
              </div>

              <h4 className="font-medium">
                No deliveries found
              </h4>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                No Telegram
                deliveries match the
                current filters.
              </p>

              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={
                    handleResetFilters
                  }
                  className="mt-4"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />

                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">
                      ID
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Event
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Group
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Subject
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Attempts
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Message ID
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Sent At
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deliveries.map(
                    (
                      delivery
                    ) => {
                      const chat =
                        chats.find(
                          (
                            item
                          ) =>
                            item.id ===
                            delivery.telegram_chat_id
                        );

                      return (
                        <tr
                          key={
                            delivery.id
                          }
                          className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-medium">
                            #
                            {
                              delivery.id
                            }
                          </td>

                          <td className="px-4 py-3">
                            <div className="max-w-[260px]">
                              <p className="break-all font-medium">
                                {delivery.event_type ??
                                  "—"}
                              </p>

                              {delivery.event_key && (
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                  {
                                    delivery.event_key
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="max-w-[190px]">
                              <p className="truncate font-medium">
                                {chat?.title ??
                                  (delivery.telegram_chat_id ==
                                  null
                                    ? "—"
                                    : `Group #${delivery.telegram_chat_id}`)}
                              </p>

                              {delivery.telegram_chat_id !=
                                null && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Record #
                                  {
                                    delivery.telegram_chat_id
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">
                                {delivery.subject_type ??
                                  "—"}
                              </p>

                              {delivery.subject_id !=
                                null && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  ID:{" "}
                                  {
                                    delivery.subject_id
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <DeliveryStatusBadge
                              status={
                                delivery.status
                              }
                            />
                          </td>

                          <td className="px-4 py-3">
                            {delivery.attempts ??
                              0}
                          </td>

                          <td className="px-4 py-3">
                            {delivery.telegram_message_id ==
                            null
                              ? "—"
                              : String(
                                  delivery.telegram_message_id
                                )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                            {formatDateTime(
                              delivery.sent_at
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleView(
                                  delivery
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />

                              Details
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}

          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              {
                deliveries.length
              }{" "}
              record
              {deliveries.length ===
              1
                ? ""
                : "s"}{" "}
              on this page ·{" "}
              {total} total
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  isLoading ||
                  currentPage <= 1
                }
                onClick={() =>
                  setPage(
                    Math.max(
                      1,
                      currentPage -
                        1
                    )
                  )
                }
              >
                <ChevronLeft className="mr-1 h-4 w-4" />

                Previous
              </Button>

              <div className="min-w-[90px] text-center text-sm">
                {
                  currentPage
                }{" "}
                /{" "}
                {
                  lastPage
                }
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  isLoading ||
                  currentPage >=
                    lastPage
                }
                onClick={() =>
                  setPage(
                    Math.min(
                      lastPage,
                      currentPage +
                        1
                    )
                  )
                }
              >
                Next

                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Filter note */}

        <div className="flex items-start gap-2 rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <p>
            The Telegram Group
            filter uses the ONE GUARD
            database group record ID,
            not the raw Telegram
            chat ID.
          </p>
        </div>
      </div>

      <TelegramDeliveryDetails
        open={detailsOpen}
        onOpenChange={
          handleDetailsOpenChange
        }
        delivery={
          selectedDelivery
        }
      />
    </>
  );
};

/* =========================================================
   Summary Card
   ========================================================= */

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const SummaryCard = ({
  label,
  value,
  icon,
}: SummaryCardProps) => {
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

/* =========================================================
   Status Badge
   ========================================================= */

const DeliveryStatusBadge = ({
  status,
}: {
  status?: string | null;
}) => {
  const normalized =
    normalizeStatus(status);

  if (normalized === "sent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />

        Sent
      </span>
    );
  }

  if (
    normalized === "failed"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
        <XCircle className="h-3 w-3" />

        Failed
      </span>
    );
  }

  if (
    normalized === "pending"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        <Clock3 className="h-3 w-3" />

        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {status ?? "Unknown"}
    </span>
  );
};

/* =========================================================
   Helpers
   ========================================================= */

const normalizeStatus = (
  status?: string | null
) => {
  return (
    status
      ?.trim()
      .toLowerCase() ??
    "unknown"
  );
};

const formatDateTime = (
  value?: string | null
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString();
};

export default TelegramDeliveries;
