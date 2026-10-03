export interface TelegramBot {
  id: number;

  /**
   * Bot list responses currently expose only the bot name,
   * active state and timestamps in addition to the ID.
   */
  name: string;

  is_active: boolean;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface TelegramChat {
  id: number;

  telegram_bot_id: number;

  /**
   * Raw Telegram chat/group ID.
   * Example: -5318019188
   */
  chat_id: string;

  title: string;

  type?: string | null;
  audience?: string | null;
  description?: string | null;

  is_active: boolean;
  is_verified?: boolean;

  created_at?: string | null;
  updated_at?: string | null;

  scopes?: TelegramScope[];
  rules?: TelegramRule[];
}

export interface TelegramScope {
  id: number;

  telegram_chat_id?: number;

  /**
   * Current Admin API supports client and site.
   */
  scope_type: "client" | "site" | string;

  scope_id: number | null;

  include_children?: boolean;
  is_active?: boolean;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface TelegramRule {
  id: number;

  telegram_chat_id?: number;

  event_type: string;

  is_enabled?: boolean;

  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * GET /admin/telegram/events currently returns:
 *
 * {
 *   "items": [
 *     "assignment.created",
 *     "shift.checked_in",
 *     ...
 *   ]
 * }
 */
export type TelegramEvent = string;

export interface TelegramDelivery {
  id: number;

  /**
   * Database ID of the Telegram chat record.
   */
  telegram_chat_id?: number | null;

  event_type?: string | null;
  event_key?: string | null;

  subject_type?: string | null;
  subject_id?: number | null;

  status?: string | null;

  attempts?: number | null;

  telegram_message_id?: string | number | null;

  /**
   * Backend delivery list currently exposes last_error.
   */
  last_error?: string | null;

  sent_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  /**
   * Delivery details may expose additional fields,
   * including media information.
   */
  [key: string]: unknown;
}

/* =========================================================
   Overview
   ========================================================= */

export interface TelegramOverview {
  bots?: {
    total?: number;
    active?: number;
  };

  chats?: {
    total?: number;
    active?: number;
  };

  rules?: {
    total?: number;
    enabled?: number;
  };

  deliveries?: {
    total?: number;
    sent?: number;
    failed?: number;
    pending?: number;
  };
}

/* =========================================================
   Pagination
   ========================================================= */

export interface TelegramPagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page?: number;
}

/* =========================================================
   Query Parameters
   ========================================================= */

export interface TelegramBotParams {
  page?: number;
  per_page?: number;
}

export interface TelegramChatParams {
  page?: number;
  per_page?: number;

  telegram_bot_id?: number;
  audience?: string;
}

export interface TelegramDeliveryParams {
  page?: number;
  per_page?: number;

  status?: string;
  event_type?: string;

  /**
   * Database ID of the registered Telegram chat/group.
   * This is NOT the raw Telegram -100... chat ID.
   */
  telegram_chat_id?: number;
}

/* =========================================================
   Bot DTOs
   ========================================================= */

export interface CreateTelegramBotDto {
  name: string;

  /**
   * Unique internal bot code.
   * Example:
   * operations_staging
   */
  code: string;

  /**
   * Laravel/config environment key containing the token.
   *
   * Example:
   * TELEGRAM_OPERATIONS_BOT_TOKEN
   *
   * The actual Telegram bot token must not be submitted
   * through the admin UI.
   */
  token_env_key: string;
}

export interface UpdateTelegramBotDto {
  name?: string;
  code?: string;
  token_env_key?: string;
  is_active?: boolean;
}

/* =========================================================
   Chat DTOs
   ========================================================= */

export interface CreateTelegramChatDto {
  telegram_bot_id: number;

  /**
   * Raw Telegram group/chat ID.
   */
  chat_id: string;

  title: string;

  type?: string;
  audience?: string;
  description?: string;
}

export interface UpdateTelegramChatDto {
  telegram_bot_id?: number;

  chat_id?: string;
  title?: string;

  type?: string;
  audience?: string;
  description?: string;

  is_active?: boolean;
}

/* =========================================================
   Scope DTOs
   ========================================================= */

export interface TelegramScopeInput {
  scope_type: "client" | "site";

  scope_id: number;

  include_children?: boolean;
  is_active?: boolean;
}

export interface ReplaceTelegramScopesDto {
  scopes: TelegramScopeInput[];
}

/* =========================================================
   Rule DTOs
   ========================================================= */

export interface TelegramRuleInput {
  event_type: string;
  is_enabled?: boolean;
}

export interface ReplaceTelegramRulesDto {
  rules: TelegramRuleInput[];
}