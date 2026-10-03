"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { useDispatch } from "react-redux";

import type {
  AppDispatch,
} from "@/store/store";

import {
  createTelegramBot,
  fetchTelegramBots,
  fetchTelegramOverview,
  updateTelegramBot,
} from "@/store/slices/telegramSlice";

import type {
  CreateTelegramBotDto,
  TelegramBot,
  UpdateTelegramBotDto,
} from "@/app/types/telegram";

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
  Bot,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";

interface TelegramBotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot?: TelegramBot | null;
}

interface FormState {
  name: string;
  code: string;
  token_env_key: string;
  is_active: boolean;
}

const getInitialState = (
  bot?: TelegramBot | null
): FormState => ({
  name: bot?.name ?? "",
  code: "",
  token_env_key: "",
  is_active: bot?.is_active ?? true,
});

const TelegramBotForm = ({
  open,
  onOpenChange,
  bot = null,
}: TelegramBotFormProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const isEdit = Boolean(bot);

  const [form, setForm] =
    useState<FormState>(
      getInitialState(bot)
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(getInitialState(bot));
    setError(null);
    setSuccessMessage(null);
  }, [open, bot]);

  const updateField = <
    K extends keyof FormState
  >(
    key: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Bot name is required.";
    }

    if (!isEdit && !form.code.trim()) {
      return "Bot code is required.";
    }

    if (
      !isEdit &&
      !form.token_env_key.trim()
    ) {
      return "Token environment key is required.";
    }

    return null;
  };

  const refreshData = async () => {
    await Promise.all([
      dispatch(
        fetchTelegramBots({
          page: 1,
          per_page: 20,
        })
      ),
      dispatch(fetchTelegramOverview()),
    ]);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isEdit && bot) {
        const payload: UpdateTelegramBotDto =
          {
            name: form.name.trim(),
            is_active: form.is_active,
          };

        /*
         * The bot list endpoint does not expose
         * code/token_env_key.
         *
         * Therefore edit mode sends these fields
         * only when the admin intentionally enters
         * replacement values.
         */
        if (form.code.trim()) {
          payload.code =
            form.code.trim();
        }

        if (
          form.token_env_key.trim()
        ) {
          payload.token_env_key =
            form.token_env_key.trim();
        }

        await dispatch(
          updateTelegramBot({
            id: bot.id,
            data: payload,
          })
        ).unwrap();

        await refreshData();

        setSuccessMessage(
          "Telegram bot updated successfully."
        );
      } else {
        const payload: CreateTelegramBotDto =
          {
            name: form.name.trim(),
            code: form.code.trim(),
            token_env_key:
              form.token_env_key.trim(),
          };

        await dispatch(
          createTelegramBot(payload)
        ).unwrap();

        await refreshData();

        setSuccessMessage(
          "Telegram bot registered successfully."
        );
      }

      window.setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } catch (submitError: unknown) {
      if (
        submitError instanceof Error
      ) {
        setError(
          submitError.message
        );
      } else if (
        typeof submitError === "string"
      ) {
        setError(submitError);
      } else {
        setError(
          isEdit
            ? "Failed to update Telegram bot."
            : "Failed to register Telegram bot."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (
    nextOpen: boolean
  ) => {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <DialogTitle>
                  {isEdit
                    ? "Edit Telegram Bot"
                    : "Register Telegram Bot"}
                </DialogTitle>

                <DialogDescription className="mt-1">
                  {isEdit
                    ? "Update the registered Telegram bot configuration."
                    : "Register a Telegram bot for ONE GUARD notification delivery."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            {/* Bot name */}

            <div className="grid gap-2">
              <Label htmlFor="telegram-bot-name">
                Bot Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </Label>

              <Input
                id="telegram-bot-name"
                value={form.name}
                disabled={isSubmitting}
                placeholder="ONE GUARD Operations"
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                Human-readable name used to
                identify this bot in the admin
                panel.
              </p>
            </div>

            {/* Bot code */}

            <div className="grid gap-2">
              <Label htmlFor="telegram-bot-code">
                Bot Code
                {!isEdit && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}
              </Label>

              <Input
                id="telegram-bot-code"
                value={form.code}
                disabled={isSubmitting}
                autoComplete="off"
                placeholder={
                  isEdit
                    ? "Leave empty to keep current code"
                    : "operations"
                }
                onChange={(event) =>
                  updateField(
                    "code",
                    event.target.value
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? "The API does not expose the current code. Leave this empty unless you want to replace it."
                  : "Unique internal identifier, for example operations or operations_staging."}
              </p>
            </div>

            {/* Token env key */}

            <div className="grid gap-2">
              <Label htmlFor="telegram-token-env-key">
                Token Environment Key
                {!isEdit && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}
              </Label>

              <Input
                id="telegram-token-env-key"
                value={
                  form.token_env_key
                }
                disabled={isSubmitting}
                autoComplete="off"
                placeholder={
                  isEdit
                    ? "Leave empty to keep current environment key"
                    : "TELEGRAM_OPERATIONS_BOT_TOKEN"
                }
                onChange={(event) =>
                  updateField(
                    "token_env_key",
                    event.target.value
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                Enter the server environment
                variable name containing the bot
                token. Do not enter the actual
                Telegram bot token here.
              </p>
            </div>

            {/* Active state - edit only */}

            {isEdit && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label
                      htmlFor="telegram-bot-active"
                      className="text-sm font-medium"
                    >
                      Active
                    </Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Controls whether this bot is
                      active in Telegram
                      notification configuration.
                    </p>
                  </div>

                  <button
                    id="telegram-bot-active"
                    type="button"
                    role="switch"
                    aria-checked={
                      form.is_active
                    }
                    disabled={isSubmitting}
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

                {successMessage}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
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
                    ? "Update Bot"
                    : "Register Bot"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TelegramBotForm;
