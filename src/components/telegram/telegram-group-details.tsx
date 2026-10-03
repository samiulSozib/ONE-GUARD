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
  TelegramChat,
} from "@/app/types/telegram";

import {
  fetchTelegramChat,
  fetchTelegramChats,
  fetchTelegramOverview,
  verifyTelegramChat,
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
  Bot,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

interface TelegramGroupDetailsProps {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  chat: TelegramChat | null;
}

const TelegramGroupDetails = ({
  open,
  onOpenChange,
  chat,
}: TelegramGroupDetailsProps) => {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    currentChat,
    scopes,
    rules,
  } = useSelector(
    (state: RootState) =>
      state.telegram
  );

  const [
    isFetching,
    setIsFetching,
  ] = useState(false);

  const [
    isVerifying,
    setIsVerifying,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null
    );

  const group =
    currentChat?.id === chat?.id
      ? currentChat
      : chat;

  const loadGroupDetails =
    async (
      id: number
    ) => {
      setIsFetching(true);
      setError(null);

      try {
        await dispatch(
          fetchTelegramChat(id)
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
            "Failed to load Telegram group details."
          );
        }
      } finally {
        setIsFetching(false);
      }
    };

  useEffect(() => {
    if (
      !open ||
      !chat?.id
    ) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    void loadGroupDetails(
      chat.id
    );
  }, [
    open,
    chat?.id,
  ]);

  const refreshAll =
    async (
      id: number
    ) => {
      await Promise.all([
        dispatch(
          fetchTelegramChat(
            id
          )
        ),

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

  const handleRefresh =
    async () => {
      if (!chat?.id) {
        return;
      }

      await loadGroupDetails(
        chat.id
      );
    };

  const handleVerify =
    async () => {
      if (!group?.id) {
        return;
      }

      setIsVerifying(true);
      setError(null);
      setSuccessMessage(null);

      try {
        await dispatch(
          verifyTelegramChat(
            group.id
          )
        ).unwrap();

        await refreshAll(
          group.id
        );

        setSuccessMessage(
          "Telegram group verified successfully."
        );
      } catch (
        verifyError: unknown
      ) {
        if (
          verifyError instanceof
          Error
        ) {
          setError(
            verifyError.message
          );
        } else if (
          typeof verifyError ===
          "string"
        ) {
          setError(
            verifyError
          );
        } else {
          setError(
            "Failed to verify Telegram group."
          );
        }
      } finally {
        setIsVerifying(false);
      }
    };

  const handleOpenChange = (
    nextOpen: boolean
  ) => {
    if (isVerifying) {
      return;
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
              <MessageSquare className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle>
                Telegram Group
                Details
              </DialogTitle>

              <DialogDescription className="mt-1">
                Inspect the Telegram
                group, verification
                state, scopes and
                subscribed event
                rules.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!group &&
        isFetching ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Loading group
              details...
            </div>
          </div>
        ) : group ? (
          <div className="space-y-5 py-5">
            {/* Main status */}

            <Card className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">
                      {
                        group.title
                      }
                    </h3>

                    <StatusBadge
                      active={
                        group.is_active
                      }
                      activeLabel="Active"
                      inactiveLabel="Inactive"
                    />

                    <StatusBadge
                      active={
                        group.is_verified ===
                        true
                      }
                      activeLabel="Verified"
                      inactiveLabel="Unverified"
                    />
                  </div>

                  {group.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {
                        group.description
                      }
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      isFetching ||
                      isVerifying
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

                  {!group.is_verified && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={
                        isVerifying
                      }
                      onClick={() =>
                        void handleVerify()
                      }
                      className="bg-[#5F0015] text-white hover:bg-[#75001a]"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-4 w-4" />

                          Verify Group
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* General information */}

            <div>
              <h4 className="mb-3 text-sm font-semibold">
                Group Information
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard
                  label="Database ID"
                  value={String(
                    group.id
                  )}
                />

                <InfoCard
                  label="Telegram Chat ID"
                  value={
                    group.chat_id
                  }
                />

                <InfoCard
                  label="Telegram Bot ID"
                  value={String(
                    group.telegram_bot_id
                  )}
                  icon={
                    <Bot className="h-4 w-4" />
                  }
                />

                <InfoCard
                  label="Group Type"
                  value={
                    group.type ??
                    "—"
                  }
                />

                <InfoCard
                  label="Audience"
                  value={
                    group.audience ??
                    "—"
                  }
                />

                <InfoCard
                  label="Verification"
                  value={
                    group.is_verified
                      ? "Verified"
                      : "Not Verified"
                  }
                  icon={
                    group.is_verified ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <ShieldX className="h-4 w-4" />
                    )
                  }
                />
              </div>
            </div>

            {/* Scope summary */}

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold">
                    Notification
                    Scopes
                  </h4>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Controls which
                    ONE GUARD records
                    can route
                    notifications to
                    this group.
                  </p>
                </div>

                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {
                    scopes.length
                  }{" "}
                  {scopes.length ===
                  1
                    ? "scope"
                    : "scopes"}
                </span>
              </div>

              {scopes.length ===
              0 ? (
                <EmptyConfiguration
                  title="No scopes configured"
                  description="This group does not currently have any notification scopes."
                />
              ) : (
                <div className="space-y-2">
                  {scopes.map(
                    (scope) => (
                      <Card
                        key={
                          scope.id
                        }
                        className="p-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {
                                scope.scope_type
                              }{" "}
                              Scope
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Scope ID:{" "}
                              {scope.scope_id ??
                                "—"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {scope.include_children && (
                              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                                Includes
                                children
                              </span>
                            )}

                            <StatusBadge
                              active={
                                scope.is_active !==
                                false
                              }
                              activeLabel="Active"
                              inactiveLabel="Inactive"
                            />
                          </div>
                        </div>
                      </Card>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Rules summary */}

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold">
                    Event Rules
                  </h4>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Events subscribed
                    for delivery to
                    this Telegram
                    group.
                  </p>
                </div>

                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {
                    rules.length
                  }{" "}
                  {rules.length ===
                  1
                    ? "rule"
                    : "rules"}
                </span>
              </div>

              {rules.length ===
              0 ? (
                <EmptyConfiguration
                  title="No event rules configured"
                  description="This group does not currently subscribe to any Telegram notification events."
                />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {rules.map(
                    (rule) => (
                      <Card
                        key={
                          rule.id
                        }
                        className="p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-all text-sm font-medium">
                              {
                                rule.event_type
                              }
                            </p>
                          </div>

                          <StatusBadge
                            active={
                              rule.is_enabled !==
                              false
                            }
                            activeLabel="Enabled"
                            inactiveLabel="Disabled"
                          />
                        </div>
                      </Card>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Feedback */}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span>
                  {error}
                </span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                <span>
                  {
                    successMessage
                  }
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />

            <p className="font-medium">
              Group details are
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
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        active
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

interface EmptyConfigurationProps {
  title: string;
  description: string;
}

const EmptyConfiguration = ({
  title,
  description,
}: EmptyConfigurationProps) => {
  return (
    <div className="rounded-lg border border-dashed p-5 text-center">
      <p className="text-sm font-medium">
        {title}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default TelegramGroupDetails;
