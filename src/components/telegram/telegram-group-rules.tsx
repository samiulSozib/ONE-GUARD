"use client";

import React, {
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
  ReplaceTelegramRulesDto,
  TelegramChat,
  TelegramRuleInput,
} from "@/app/types/telegram";

import {
  fetchTelegramChat,
  fetchTelegramChats,
  fetchTelegramEvents,
  fetchTelegramOverview,
  replaceTelegramRules,
} from "@/store/slices/telegramSlice";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Settings2,
} from "lucide-react";

interface TelegramGroupRulesProps {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  chat: TelegramChat | null;
}

interface EventSelection {
  event_type: string;
  selected: boolean;
  is_enabled: boolean;
}

const TelegramGroupRules = ({
  open,
  onOpenChange,
  chat,
}: TelegramGroupRulesProps) => {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    events,
    rules,
  } = useSelector(
    (state: RootState) =>
      state.telegram
  );

  const [
    selections,
    setSelections,
  ] = useState<EventSelection[]>(
    []
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    isLoadingEvents,
    setIsLoadingEvents,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
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

  const buildSelections = (
    eventItems: string[]
  ) => {
    const existingRules =
      chat?.rules ??
      rules;

    const existingMap =
      new Map(
        existingRules.map(
          (rule) => [
            rule.event_type,
            rule,
          ]
        )
      );

    const combinedEvents =
      Array.from(
        new Set([
          ...eventItems,
          ...existingRules.map(
            (rule) =>
              rule.event_type
          ),
        ])
      );

    return combinedEvents.map(
      (eventType) => {
        const existing =
          existingMap.get(
            eventType
          );

        return {
          event_type:
            eventType,

          selected:
            Boolean(
              existing
            ),

          is_enabled:
            existing
              ? existing.is_enabled !==
                false
              : true,
        };
      }
    );
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setSearch("");

    setSelections(
      buildSelections(
        events
      )
    );
  }, [
    open,
    chat,
    rules,
    events,
  ]);

  useEffect(() => {
    if (
      !open ||
      events.length > 0
    ) {
      return;
    }

    const loadEvents =
      async () => {
        setIsLoadingEvents(
          true
        );

        try {
          const response =
            await dispatch(
              fetchTelegramEvents()
            ).unwrap();

          setSelections(
            buildSelections(
              response.items
            )
          );
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
              "Failed to load Telegram event catalog."
            );
          }
        } finally {
          setIsLoadingEvents(
            false
          );
        }
      };

    void loadEvents();
  }, [
    open,
    events.length,
    dispatch,
  ]);

  const filteredSelections =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return selections;
      }

      return selections.filter(
        (item) =>
          item.event_type
            .toLowerCase()
            .includes(
              query
            )
      );
    }, [
      selections,
      search,
    ]);

  const selectedCount =
    selections.filter(
      (item) =>
        item.selected
    ).length;

  const enabledCount =
    selections.filter(
      (item) =>
        item.selected &&
        item.is_enabled
    ).length;

  const updateSelection = (
    eventType: string,
    updates: Partial<EventSelection>
  ) => {
    setSelections(
      (previous) =>
        previous.map(
          (item) =>
            item.event_type ===
            eventType
              ? {
                  ...item,
                  ...updates,
                }
              : item
        )
    );

    if (error) {
      setError(null);
    }
  };

  const handleToggleSelected = (
    eventType: string
  ) => {
    const item =
      selections.find(
        (selection) =>
          selection.event_type ===
          eventType
      );

    if (!item) {
      return;
    }

    updateSelection(
      eventType,
      {
        selected:
          !item.selected,

        is_enabled:
          !item.selected
            ? true
            : item.is_enabled,
      }
    );
  };

  const handleSelectAll =
    () => {
      setSelections(
        (previous) =>
          previous.map(
            (item) => ({
              ...item,
              selected: true,
              is_enabled: true,
            })
          )
      );
    };

  const handleClearAll =
    () => {
      setSelections(
        (previous) =>
          previous.map(
            (item) => ({
              ...item,
              selected: false,
            })
          )
      );
    };

  const handleRefreshEvents =
    async () => {
      setIsLoadingEvents(
        true
      );

      setError(null);

      try {
        const response =
          await dispatch(
            fetchTelegramEvents()
          ).unwrap();

        setSelections(
          buildSelections(
            response.items
          )
        );
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
            "Failed to refresh Telegram event catalog."
          );
        }
      } finally {
        setIsLoadingEvents(
          false
        );
      }
    };

  const refreshGroup =
    async (
      chatId: number
    ) => {
      await Promise.all([
        dispatch(
          fetchTelegramChat(
            chatId
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

  const handleSave =
    async () => {
      if (!chat?.id) {
        setError(
          "Telegram group is unavailable."
        );

        return;
      }

      if (chat.is_active) {
        setError(
          "Deactivate this Telegram group before replacing its event rules."
        );

        return;
      }

      const ruleItems: TelegramRuleInput[] =
        selections
          .filter(
            (item) =>
              item.selected
          )
          .map(
            (item) => ({
              event_type:
                item.event_type,

              is_enabled:
                item.is_enabled,
            })
          );

      const payload: ReplaceTelegramRulesDto =
        {
          rules:
            ruleItems,
        };

      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        await dispatch(
          replaceTelegramRules({
            chatId:
              chat.id,
            data:
              payload,
          })
        ).unwrap();

        await refreshGroup(
          chat.id
        );

        setSuccessMessage(
          "Telegram event rules updated successfully."
        );
      } catch (
        saveError: unknown
      ) {
        if (
          saveError instanceof
          Error
        ) {
          setError(
            saveError.message
          );
        } else if (
          typeof saveError ===
          "string"
        ) {
          setError(
            saveError
          );
        } else {
          setError(
            "Failed to update Telegram event rules."
          );
        }
      } finally {
        setIsSaving(false);
      }
    };

  const handleOpenChange = (
    nextOpen: boolean
  ) => {
    if (isSaving) {
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[820px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
              <Settings2 className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle>
                Manage Event Rules
              </DialogTitle>

              <DialogDescription className="mt-1">
                Configure which
                Telegram events are
                routed to{" "}
                <span className="font-medium">
                  {chat?.title ??
                    "this group"}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-medium">
                  Replacement
                  operation
                </p>

                <p className="mt-1 text-xs">
                  Saving replaces
                  the complete event
                  rule configuration
                  for this Telegram
                  group.
                </p>
              </div>
            </div>
          </div>

          {chat?.is_active && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              This group is active.
              Deactivate it before
              changing its event
              rules.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Available"
              value={
                selections.length
              }
            />

            <SummaryCard
              label="Selected"
              value={
                selectedCount
              }
            />

            <SummaryCard
              label="Enabled"
              value={
                enabledCount
              }
            />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search events..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  isLoadingEvents
                }
                onClick={() =>
                  void handleRefreshEvents()
                }
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isLoadingEvents
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh Events
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  isSaving ||
                  Boolean(
                    chat?.is_active
                  )
                }
                onClick={
                  handleSelectAll
                }
              >
                Select All
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  isSaving ||
                  Boolean(
                    chat?.is_active
                  )
                }
                onClick={
                  handleClearAll
                }
              >
                Clear All
              </Button>
            </div>
          </div>

          {isLoadingEvents &&
          selections.length ===
            0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-lg border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />

                Loading event
                catalog...
              </div>
            </div>
          ) : filteredSelections.length ===
            0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Settings2 className="mx-auto h-7 w-7 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                No events found
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                No Telegram events
                match the current
                search.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredSelections.map(
                (item) => (
                  <div
                    key={
                      item.event_type
                    }
                    className={`rounded-lg border p-4 transition-colors ${
                      item.selected
                        ? "border-[#5F0015]/30 bg-[#5F0015]/5"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        disabled={
                          isSaving ||
                          Boolean(
                            chat?.is_active
                          )
                        }
                        onClick={() =>
                          handleToggleSelected(
                            item.event_type
                          )
                        }
                        className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            item.selected
                              ? "border-[#5F0015] bg-[#5F0015] text-white"
                              : "border-input bg-background"
                          }`}
                        >
                          {item.selected && (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                        </span>

                        <span className="min-w-0">
                          <span className="block break-all text-sm font-medium">
                            {
                              item.event_type
                            }
                          </span>

                          <span className="mt-1 block text-xs text-muted-foreground">
                            {item.selected
                              ? "Included in this group's rule configuration."
                              : "Not subscribed by this group."}
                          </span>
                        </span>
                      </button>

                      {item.selected && (
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {item.is_enabled
                              ? "Enabled"
                              : "Disabled"}
                          </span>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={
                              item.is_enabled
                            }
                            disabled={
                              isSaving ||
                              Boolean(
                                chat?.is_active
                              )
                            }
                            onClick={() =>
                              updateSelection(
                                item.event_type,
                                {
                                  is_enabled:
                                    !item.is_enabled,
                                }
                              )
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                              item.is_enabled
                                ? "bg-[#5F0015]"
                                : "bg-muted-foreground/30"
                            }`}
                          >
                            <span
                              className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                                item.is_enabled
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

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

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={
              isSaving
            }
            onClick={() =>
              onOpenChange(
                false
              )
            }
          >
            Close
          </Button>

          <Button
            type="button"
            disabled={
              isSaving ||
              !chat ||
              chat.is_active
            }
            onClick={() =>
              void handleSave()
            }
            className="bg-[#5F0015] text-white hover:bg-[#75001a]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />

                Save Rules
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
}

const SummaryCard = ({
  label,
  value,
}: SummaryCardProps) => {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold">
        {value}
      </p>
    </div>
  );
};

export default TelegramGroupRules;
