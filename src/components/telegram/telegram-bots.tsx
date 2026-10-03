"use client";

import React, { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";

import type {
  TelegramBot,
} from "@/app/types/telegram";

import {
  fetchTelegramBots,
  fetchTelegramOverview,
  verifyTelegramBot,
} from "@/store/slices/telegramSlice";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Bot,
  CheckCircle2,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";

import TelegramBotDataTable from "./telegram-bot-data-table";
import TelegramBotForm from "./telegram-bot-form";

const TelegramBots = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    bots,
    isLoading,
  } = useSelector(
    (state: RootState) => state.telegram
  );

  const [formOpen, setFormOpen] =
    useState(false);

  const [selectedBot, setSelectedBot] =
    useState<TelegramBot | null>(null);

  const [verifyingBotId, setVerifyingBotId] =
    useState<number | null>(null);

  const [verifySuccess, setVerifySuccess] =
    useState<string | null>(null);

  const [verifyError, setVerifyError] =
    useState<string | null>(null);

  const activeBots = bots.filter(
    (bot) => bot.is_active
  ).length;

  const inactiveBots =
    bots.length - activeBots;

  const handleCreate = () => {
    setSelectedBot(null);
    setFormOpen(true);
  };

  const handleEdit = (
    bot: TelegramBot
  ) => {
    setSelectedBot(bot);
    setFormOpen(true);
  };

  const handleFormOpenChange = (
    open: boolean
  ) => {
    setFormOpen(open);

    if (!open) {
      setSelectedBot(null);
    }
  };

  const refreshBots = async () => {
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

  const handleRefresh = async () => {
    setVerifyError(null);
    setVerifySuccess(null);

    await refreshBots();
  };

  const handleVerify = async (
    bot: TelegramBot
  ) => {
    if (verifyingBotId !== null) {
      return;
    }

    setVerifyingBotId(bot.id);
    setVerifyError(null);
    setVerifySuccess(null);

    try {
      await dispatch(
        verifyTelegramBot(bot.id)
      ).unwrap();

      await refreshBots();

      setVerifySuccess(
        `${bot.name || "Telegram bot"} verified successfully.`
      );
    } catch (error: unknown) {
      if (typeof error === "string") {
        setVerifyError(error);
      } else if (error instanceof Error) {
        setVerifyError(error.message);
      } else {
        setVerifyError(
          `Failed to verify ${bot.name || "Telegram bot"
          }.`
        );
      }
    } finally {
      setVerifyingBotId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* =================================================
            Header
            ================================================= */}

        <Card className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Telegram Bots
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manage Telegram bots registered
                  for ONE GUARD notification
                  delivery.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  isLoading ||
                  verifyingBotId !== null
                }
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
                disabled={
                  verifyingBotId !== null
                }
                onClick={handleCreate}
                className="bg-[#5F0015] text-white hover:bg-[#75001a]"
              >
                <Plus className="mr-2 h-4 w-4" />

                Add Bot
              </Button>
            </div>
          </div>
        </Card>

        {/* =================================================
            Verification feedback
            ================================================= */}

        {verifySuccess && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

            <div className="flex-1">
              {verifySuccess}
            </div>

            <button
              type="button"
              aria-label="Dismiss success message"
              className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
              onClick={() =>
                setVerifySuccess(null)
              }
            >
              ×
            </button>
          </div>
        )}

        {verifyError && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <div className="flex-1">
              {verifyError}
            </div>

            <button
              type="button"
              aria-label="Dismiss error message"
              className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
              onClick={() =>
                setVerifyError(null)
              }
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            Summary
            ================================================= */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BotSummaryCard
            label="Total Bots"
            value={bots.length}
          />

          <BotSummaryCard
            label="Active"
            value={activeBots}
          />

          <BotSummaryCard
            label="Inactive"
            value={inactiveBots}
          />
        </div>

        {/* =================================================
            Registered bots
            ================================================= */}

        <div>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-semibold">
                Registered Bots
              </h3>

              <p className="text-sm text-muted-foreground">
                {bots.length}{" "}
                {bots.length === 1
                  ? "bot"
                  : "bots"}{" "}
                registered
              </p>
            </div>
          </div>

          <TelegramBotDataTable
            bots={bots}
            isLoading={isLoading}
            verifyingBotId={verifyingBotId}
            onEdit={handleEdit}
            onVerify={handleVerify}
          />
        </div>
      </div>

      {/* ===================================================
          Add / Edit Dialog
          =================================================== */}

      <TelegramBotForm
        open={formOpen}
        onOpenChange={
          handleFormOpenChange
        }
        bot={selectedBot}
      />
    </>
  );
};

interface BotSummaryCardProps {
  label: string;
  value: number;
}

const BotSummaryCard = ({
  label,
  value,
}: BotSummaryCardProps) => {
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

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Bot className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
};

export default TelegramBots;