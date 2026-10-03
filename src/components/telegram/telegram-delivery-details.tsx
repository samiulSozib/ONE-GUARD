"use client";

import React, {
  useEffect,
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
} from "@/app/types/telegram";

import {
  clearCurrentTelegramDelivery,
  fetchTelegramDelivery,
} from "@/store/slices/telegramSlice";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Hash,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";

interface TelegramDeliveryDetailsProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  delivery:
    | TelegramDelivery
    | null;
}

const TelegramDeliveryDetails = ({
  open,
  onOpenChange,
  delivery,
}: TelegramDeliveryDetailsProps) => {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    currentDelivery,
  } = useSelector(
    (state: RootState) =>
      state.telegram
  );

  const [
    isFetching,
    setIsFetching,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const selectedDelivery =
    currentDelivery?.id ===
    delivery?.id
      ? currentDelivery
      : delivery;

  const loadDelivery =
    async (
      id: number
    ) => {
      setIsFetching(true);
      setError(null);

      try {
        await dispatch(
          fetchTelegramDelivery(
            id
          )
        ).unwrap();
      } catch (
        fetchError: unknown
      ) {
        if (
          fetchError instanceof
          Error
        ) {
          setError(
            fetchError.message
          );
        } else if (
          typeof fetchError ===
          "string"
        ) {
          setError(
            fetchError
          );
        } else {
          setError(
            "Failed to load Telegram delivery details."
          );
        }
      } finally {
        setIsFetching(false);
      }
    };

  useEffect(() => {
    if (
      !open ||
      !delivery?.id
    ) {
      return;
    }

    setError(null);

    void loadDelivery(
      delivery.id
    );
  }, [
    open,
    delivery?.id,
  ]);

  const handleRefresh =
    async () => {
      if (!delivery?.id) {
        return;
      }

      await loadDelivery(
        delivery.id
      );
    };

  const handleOpenChange = (
    nextOpen: boolean
  ) => {
    if (isFetching) {
      return;
    }

    if (!nextOpen) {
      dispatch(
        clearCurrentTelegramDelivery()
      );
    }

    onOpenChange(
      nextOpen
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[780px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
              <Send className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle>
                Telegram Delivery
                Details
              </DialogTitle>

              <DialogDescription className="mt-1">
                Inspect the delivery
                event, Telegram
                message, attempts and
                processing result.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!selectedDelivery &&
        isFetching ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Loading delivery
              details...
            </div>
          </div>
        ) : selectedDelivery ? (
          <div className="space-y-5 py-5">
            <Card className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">
                      Delivery #
                      {
                        selectedDelivery.id
                      }
                    </h3>

                    <DeliveryStatusBadge
                      status={
                        selectedDelivery.status
                      }
                    />
                  </div>

                  <p className="mt-2 break-all text-sm text-muted-foreground">
                    {selectedDelivery.event_type ??
                      "No event type"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    isFetching
                  }
                  onClick={() =>
                    void handleRefresh()
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isFetching
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Refresh
                </Button>
              </div>
            </Card>

            <div>
              <h4 className="mb-3 text-sm font-semibold">
                Delivery Information
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard
                  label="Delivery ID"
                  value={String(
                    selectedDelivery.id
                  )}
                  icon={
                    <Hash className="h-4 w-4" />
                  }
                />

                <InfoCard
                  label="Telegram Group Record"
                  value={
                    selectedDelivery.telegram_chat_id ==
                    null
                      ? "—"
                      : `#${selectedDelivery.telegram_chat_id}`
                  }
                  icon={
                    <MessageSquare className="h-4 w-4" />
                  }
                />

                <InfoCard
                  label="Event Type"
                  value={
                    selectedDelivery.event_type ??
                    "—"
                  }
                />

                <InfoCard
                  label="Event Key"
                  value={
                    selectedDelivery.event_key ??
                    "—"
                  }
                />

                <InfoCard
                  label="Subject Type"
                  value={
                    selectedDelivery.subject_type ??
                    "—"
                  }
                />

                <InfoCard
                  label="Subject ID"
                  value={
                    selectedDelivery.subject_id ==
                    null
                      ? "—"
                      : String(
                          selectedDelivery.subject_id
                        )
                  }
                />

                <InfoCard
                  label="Attempts"
                  value={String(
                    selectedDelivery.attempts ??
                      0
                  )}
                />

                <InfoCard
                  label="Telegram Message ID"
                  value={
                    selectedDelivery.telegram_message_id ==
                    null
                      ? "—"
                      : String(
                          selectedDelivery.telegram_message_id
                        )
                  }
                />

                <InfoCard
                  label="Sent At"
                  value={formatDateTime(
                    selectedDelivery.sent_at
                  )}
                />

                <InfoCard
                  label="Created At"
                  value={formatDateTime(
                    selectedDelivery.created_at
                  )}
                />

                <InfoCard
                  label="Updated At"
                  value={formatDateTime(
                    selectedDelivery.updated_at
                  )}
                />
              </div>
            </div>

            {selectedDelivery.last_error && (
              <div>
                <h4 className="mb-3 text-sm font-semibold">
                  Last Error
                </h4>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <p className="break-words">
                      {
                        selectedDelivery.last_error
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <AdditionalFields
              delivery={
                selectedDelivery
              }
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span>
                  {error}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />

            <p className="font-medium">
              Delivery details are
              unavailable.
            </p>

            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface InfoCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

const InfoCard = ({
  label,
  value,
  icon,
}: InfoCardProps) => {
  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 text-muted-foreground">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 break-all text-sm font-medium">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
};

const DeliveryStatusBadge = ({
  status,
}: {
  status?: string | null;
}) => {
  const normalized =
    status
      ?.trim()
      .toLowerCase() ??
    "unknown";

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

const AdditionalFields = ({
  delivery,
}: {
  delivery: TelegramDelivery;
}) => {
  const knownFields =
    new Set([
      "id",
      "telegram_chat_id",
      "event_type",
      "event_key",
      "subject_type",
      "subject_id",
      "status",
      "attempts",
      "telegram_message_id",
      "last_error",
      "sent_at",
      "created_at",
      "updated_at",
    ]);

  const extraFields =
    Object.entries(
      delivery
    ).filter(
      ([key, value]) =>
        !knownFields.has(
          key
        ) &&
        value !== null &&
        value !== undefined
    );

  if (
    extraFields.length === 0
  ) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">
        Additional Information
      </h4>

      <Card className="overflow-hidden">
        <div className="divide-y">
          {extraFields.map(
            ([
              key,
              value,
            ]) => (
              <div
                key={key}
                className="grid gap-1 p-3 sm:grid-cols-[180px_1fr] sm:gap-4"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {formatFieldName(
                    key
                  )}
                </p>

                <div className="break-all text-sm">
                  {formatUnknownValue(
                    value
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
};

const formatUnknownValue = (
  value: unknown
): React.ReactNode => {
  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number"
  ) {
    return String(value);
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  try {
    return (
      <pre className="whitespace-pre-wrap break-all text-xs">
        {JSON.stringify(
          value,
          null,
          2
        )}
      </pre>
    );
  } catch {
    return "Unable to display value";
  }
};

const formatFieldName = (
  value: string
) => {
  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
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

export default TelegramDeliveryDetails;
