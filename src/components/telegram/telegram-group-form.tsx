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
  CreateTelegramChatDto,
  TelegramChat,
  UpdateTelegramChatDto,
} from "@/app/types/telegram";

import {
  createTelegramChat,
  fetchTelegramChats,
  fetchTelegramOverview,
  updateTelegramChat,
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
import { Label } from "@/components/ui/label";

import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Save,
} from "lucide-react";

interface TelegramGroupFormProps {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  chat?: TelegramChat | null;
}

interface FormState {
  telegram_bot_id: string;
  chat_id: string;
  title: string;
  type: string;
  audience: string;
  description: string;
  is_active: boolean;
}

const getInitialState = (
  chat?: TelegramChat | null
): FormState => ({
  telegram_bot_id:
    chat?.telegram_bot_id
      ? String(
          chat.telegram_bot_id
        )
      : "",

  chat_id:
    chat?.chat_id ?? "",

  title:
    chat?.title ?? "",

  type:
    chat?.type ??
    "supergroup",

  audience:
    chat?.audience ??
    "internal",

  description:
    chat?.description ?? "",

  is_active:
    chat?.is_active ?? false,
});

const TelegramGroupForm = ({
  open,
  onOpenChange,
  chat = null,
}: TelegramGroupFormProps) => {
  const dispatch =
    useDispatch<AppDispatch>();

  const { bots } = useSelector(
    (state: RootState) =>
      state.telegram
  );

  const isEdit = Boolean(chat);

  const [
    form,
    setForm,
  ] = useState<FormState>(
    getInitialState(chat)
  );

  const [
    isSubmitting,
    setIsSubmitting,
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

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      getInitialState(chat)
    );

    setError(null);
    setSuccessMessage(null);
  }, [open, chat]);

  const updateField = <
    K extends keyof FormState
  >(
    key: K,
    value: FormState[K]
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );

    if (error) {
      setError(null);
    }
  };

  const validateForm =
    () => {
      if (
        !form.telegram_bot_id
      ) {
        return "Telegram bot is required.";
      }

      if (
        !form.chat_id.trim()
      ) {
        return "Telegram group/chat ID is required.";
      }

      if (
        !form.title.trim()
      ) {
        return "Group title is required.";
      }

      if (!form.type) {
        return "Group type is required.";
      }

      if (!form.audience) {
        return "Audience is required.";
      }

      return null;
    };

  const refreshData =
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

  const handleSubmit =
    async (
      event: React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (validationError) {
        setError(
          validationError
        );

        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      try {
        if (
          isEdit &&
          chat
        ) {
          const payload: UpdateTelegramChatDto =
            {
              telegram_bot_id:
                Number(
                  form.telegram_bot_id
                ),

              chat_id:
                form.chat_id.trim(),

              title:
                form.title.trim(),

              type:
                form.type,

              audience:
                form.audience,

              description:
                form.description
                  .trim(),

              is_active:
                form.is_active,
            };

          await dispatch(
            updateTelegramChat({
              id: chat.id,
              data: payload,
            })
          ).unwrap();

          await refreshData();

          setSuccessMessage(
            "Telegram group updated successfully."
          );
        } else {
          const payload: CreateTelegramChatDto =
            {
              telegram_bot_id:
                Number(
                  form.telegram_bot_id
                ),

              chat_id:
                form.chat_id.trim(),

              title:
                form.title.trim(),

              type:
                form.type,

              audience:
                form.audience,

              description:
                form.description
                  .trim(),
            };

          await dispatch(
            createTelegramChat(
              payload
            )
          ).unwrap();

          await refreshData();

          setSuccessMessage(
            "Telegram group registered successfully."
          );
        }

        window.setTimeout(
          () => {
            onOpenChange(
              false
            );
          },
          500
        );
      } catch (
        submitError: unknown
      ) {
        if (
          submitError instanceof
          Error
        ) {
          setError(
            submitError.message
          );
        } else if (
          typeof submitError ===
          "string"
        ) {
          setError(
            submitError
          );
        } else {
          setError(
            isEdit
              ? "Failed to update Telegram group."
              : "Failed to register Telegram group."
          );
        }
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  const handleOpenChange = (
    nextOpen: boolean
  ) => {
    if (isSubmitting) {
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
        <form
          onSubmit={
            handleSubmit
          }
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
                <MessageSquare className="h-5 w-5" />
              </div>

              <div>
                <DialogTitle>
                  {isEdit
                    ? "Edit Telegram Group"
                    : "Register Telegram Group"}
                </DialogTitle>

                <DialogDescription className="mt-1">
                  {isEdit
                    ? "Update the registered Telegram group configuration."
                    : "Register a Telegram group for ONE GUARD notification delivery."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            {/* Bot */}

            <div className="grid gap-2">
              <Label htmlFor="telegram-group-bot">
                Telegram Bot
                <span className="ml-1 text-red-500">
                  *
                </span>
              </Label>

              <select
                id="telegram-group-bot"
                value={
                  form.telegram_bot_id
                }
                disabled={
                  isSubmitting
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "telegram_bot_id",
                    event.target
                      .value
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  Select bot
                </option>

                {bots.map(
                  (bot) => (
                    <option
                      key={
                        bot.id
                      }
                      value={
                        bot.id
                      }
                    >
                      {
                        bot.name
                      }
                      {bot.is_active
                        ? " — Active"
                        : " — Inactive"}
                    </option>
                  )
                )}
              </select>

              <p className="text-xs text-muted-foreground">
                Select the
                registered bot that
                will communicate
                with this Telegram
                group.
              </p>
            </div>

            {/* Chat ID */}

            <div className="grid gap-2">
              <Label htmlFor="telegram-group-chat-id">
                Telegram Chat ID
                <span className="ml-1 text-red-500">
                  *
                </span>
              </Label>

              <Input
                id="telegram-group-chat-id"
                value={
                  form.chat_id
                }
                disabled={
                  isSubmitting
                }
                placeholder="-1001234567890"
                onChange={(
                  event
                ) =>
                  updateField(
                    "chat_id",
                    event.target
                      .value
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                Enter the raw
                Telegram group,
                supergroup or
                channel ID.
              </p>
            </div>

            {/* Title */}

            <div className="grid gap-2">
              <Label htmlFor="telegram-group-title">
                Group Title
                <span className="ml-1 text-red-500">
                  *
                </span>
              </Label>

              <Input
                id="telegram-group-title"
                value={
                  form.title
                }
                disabled={
                  isSubmitting
                }
                placeholder="ONE GUARD Operations"
                onChange={(
                  event
                ) =>
                  updateField(
                    "title",
                    event.target
                      .value
                  )
                }
              />
            </div>

            {/* Type / Audience */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="telegram-group-type">
                  Group Type
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </Label>

                <select
                  id="telegram-group-type"
                  value={
                    form.type
                  }
                  disabled={
                    isSubmitting
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "type",
                      event
                        .target
                        .value
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="group">
                    Group
                  </option>

                  <option value="supergroup">
                    Supergroup
                  </option>

                  <option value="channel">
                    Channel
                  </option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telegram-group-audience">
                  Audience
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </Label>

                <select
                  id="telegram-group-audience"
                  value={
                    form.audience
                  }
                  disabled={
                    isSubmitting
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "audience",
                      event
                        .target
                        .value
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="internal">
                    Internal
                  </option>

                  <option value="client">
                    Client
                  </option>
                </select>
              </div>
            </div>

            {/* Description */}

            <div className="grid gap-2">
              <Label htmlFor="telegram-group-description">
                Description
              </Label>

              <textarea
                id="telegram-group-description"
                value={
                  form.description
                }
                disabled={
                  isSubmitting
                }
                rows={4}
                placeholder="Telegram group used for ONE GUARD operations notifications."
                onChange={(
                  event
                ) =>
                  updateField(
                    "description",
                    event.target
                      .value
                  )
                }
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Active */}

            {isEdit && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Active
                    </Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Enable or
                      disable this
                      Telegram group
                      for notification
                      routing.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={
                      form.is_active
                    }
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      updateField(
                        "is_active",
                        !form.is_active
                      )
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      form.is_active
                        ? "bg-[#5F0015]"
                        : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                        form.is_active
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {!chat?.is_verified && (
                  <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                    This group is
                    currently
                    unverified. Verify
                    the Telegram group
                    before attempting
                    to activate it.
                  </p>
                )}
              </div>
            )}

            {/* Error */}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Success */}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />

                {
                  successMessage
                }
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={
                isSubmitting
              }
              onClick={() =>
                onOpenChange(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting
              }
              className="bg-[#5F0015] text-white hover:bg-[#75001a]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  {isEdit
                    ? "Updating..."
                    : "Registering..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />

                  {isEdit
                    ? "Update Group"
                    : "Register Group"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TelegramGroupForm;
