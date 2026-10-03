import { ApiResponse } from "@/app/types/api.types";

import {
  CreateTelegramBotDto,
  CreateTelegramChatDto,
  ReplaceTelegramRulesDto,
  ReplaceTelegramScopesDto,
  TelegramBot,
  TelegramBotParams,
  TelegramChat,
  TelegramChatParams,
  TelegramDelivery,
  TelegramDeliveryParams,
  TelegramEvent,
  TelegramOverview,
  TelegramRule,
  TelegramScope,
  UpdateTelegramBotDto,
  UpdateTelegramChatDto,
} from "@/app/types/telegram";

import api, { handleApiResponse } from "./api.service";

/* =========================================================
   Telegram Management Service
   ========================================================= */

export const telegramService = {
  /* =======================================================
     Settings / Overview
     ======================================================= */

  /**
   * Telegram management overview.
   *
   * Backend exposes the counters/snapshot through:
   * GET /admin/telegram/settings
   */
  getOverview: () =>
    handleApiResponse(
      api.get<ApiResponse<TelegramOverview>>(
        "/admin/telegram/settings"
      )
    ),

  /* =======================================================
     Bots
     ======================================================= */

  getBots: (params: TelegramBotParams = {}) =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          items: TelegramBot[];
          data?: {
            current_page: number;
            last_page: number;
            total: number;
            per_page?: number;
          };
        }>
      >("/admin/telegram/bots", {
        params,
      })
    ),

  createBot: (data: CreateTelegramBotDto) =>
    handleApiResponse(
      api.post<
        ApiResponse<{
          item: TelegramBot;
        }>
      >("/admin/telegram/bots", data)
    ),

  updateBot: (
    id: number,
    data: UpdateTelegramBotDto
  ) =>
    handleApiResponse(
      api.put<
        ApiResponse<{
          item: TelegramBot;
        }>
      >(`/admin/telegram/bots/${id}`, data)
    ),

  /**
   * Verify the configured Telegram bot by asking
   * the backend to call Telegram getMe.
   */
  verifyBot: (id: number) =>
    handleApiResponse(
      api.post<
        ApiResponse<{
          item: TelegramBot;
        }>
      >(`/admin/telegram/bots/${id}/verify`)
    ),

  /* =======================================================
     Telegram Groups / Chats
     ======================================================= */

  getChats: (params: TelegramChatParams = {}) =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          items: TelegramChat[];
          data?: {
            current_page: number;
            last_page: number;
            total: number;
            per_page?: number;
          };
        }>
      >("/admin/telegram/chats", {
        params,
      })
    ),

  getChat: (id: number) =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          item: TelegramChat;
        }>
      >(`/admin/telegram/chats/${id}`)
    ),

  createChat: (data: CreateTelegramChatDto) =>
    handleApiResponse(
      api.post<
        ApiResponse<{
          item: TelegramChat;
        }>
      >("/admin/telegram/chats", data)
    ),

  updateChat: (
    id: number,
    data: UpdateTelegramChatDto
  ) =>
    handleApiResponse(
      api.put<
        ApiResponse<{
          item: TelegramChat;
        }>
      >(`/admin/telegram/chats/${id}`, data)
    ),

  /**
   * Ask Telegram to verify that the configured bot can
   * access the registered group/chat.
   */
  verifyChat: (id: number) =>
    handleApiResponse(
      api.post<
        ApiResponse<{
          item: TelegramChat;
        }>
      >(`/admin/telegram/chats/${id}/verify`)
    ),

  /* =======================================================
     Group Scopes
     ======================================================= */

  replaceChatScopes: (
    chatId: number,
    data: ReplaceTelegramScopesDto
  ) =>
    handleApiResponse(
      api.put<
        ApiResponse<{
          items: TelegramScope[];
        }>
      >(
        `/admin/telegram/chats/${chatId}/scopes`,
        data
      )
    ),

  /* =======================================================
     Group Rules
     ======================================================= */

  replaceChatRules: (
    chatId: number,
    data: ReplaceTelegramRulesDto
  ) =>
    handleApiResponse(
      api.put<
        ApiResponse<{
          items: TelegramRule[];
        }>
      >(
        `/admin/telegram/chats/${chatId}/rules`,
        data
      )
    ),

  /* =======================================================
     Event Catalog
     ======================================================= */

  getEvents: () =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          items: TelegramEvent[];
        }>
      >("/admin/telegram/events")
    ),

  /* =======================================================
     Delivery History
     ======================================================= */

  getDeliveries: (
    params: TelegramDeliveryParams = {}
  ) =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          items: TelegramDelivery[];
          data?: {
            current_page: number;
            last_page: number;
            total: number;
            per_page?: number;
          };
        }>
      >("/admin/telegram/deliveries", {
        params,
      })
    ),

  getDelivery: (id: number) =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          item: TelegramDelivery;
        }>
      >(`/admin/telegram/deliveries/${id}`)
    ),
};

export default telegramService;