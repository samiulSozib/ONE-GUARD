export interface TelegramBot {
  id: number;

  name: string;
  code: string;
  token_env_key: string;

  username?: string | null;
  bot_username?: string | null;
  bot_name?: string | null;

  is_active: boolean;
  is_verified?: boolean;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface TelegramChat {
  id: number;

  telegram_bot_id: number;

  /**
   * Raw Telegram chat/group ID.
   * Example: -1001234567890
   */
  chat_id: string;

  title: string;

  type?: string | null;
  audience?: string | null;
  description?: string | null;

  is_active: boolean;
  is_verified?: boolean;
  verified_at?: string | null;

  bot?: TelegramBot | null;

  scopes?: TelegramScope[];
  rules?: TelegramRule[];

  created_at?: string | null;
  updated_at?: string | null;
}

export interface TelegramScope {
  id: number;

  telegram_chat_id?: number;

  /**
   * Current Admin API supports:
   * - client
   * - site
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
  is_active?: boolean;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface TelegramEvent {
  event_type: string;

  name?: string;
  label?: string;

  description?: string | null;
  category?: string | null;
}

export interface TelegramDelivery {
  id: number;

  telegram_bot_id?: number | null;
  telegram_chat_id?: number | null;

  event_type?: string | null;

  status?: string | null;

  message?: string | null;

  telegram_message_id?: string | number | null;

  error_message?: string | null;

  attempts?: number | null;

  sent_at?: string | null;
  failed_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  bot?: TelegramBot | null;
  chat?: TelegramChat | null;

  /**
   * Delivery detail responses may contain additional
   * media-related information.
   */
  [key: string]: unknown;
}

/**
 * GET /admin/telegram/settings
 *
 * The backend uses this endpoint as the Telegram
 * management overview/settings snapshot.
 */
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

    /**
     * Backend documentation currently calls this "enabled".
     * Keep active optional for compatibility with older responses.
     */
    enabled?: number;
    active?: number;
  };

  deliveries?: {
    total?: number;
    sent?: number;
    failed?: number;
    pending?: number;
  };

  enabled?: boolean;

  [key: string]: unknown;
}

/**
 * Kept separately because the frontend may expose
 * the global Telegram enabled state when returned
 * by the backend.
 */
export interface TelegramSettings {
  enabled?: boolean;

  [key: string]: unknown;
}

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
   * Database ID of the registered Telegram chat/group,
   * NOT Telegram's raw -100... chat ID.
   */
  telegram_chat_id?: number;
}

/* =========================================================
   Bot DTOs
   ========================================================= */

export interface CreateTelegramBotDto {
  name: string;

  /**
   * Unique internal code.
   * Example: operations_staging
   */
  code: string;

  /**
   * Laravel/config environment key containing the bot token.
   * Never send/store the actual Telegram bot token here.
   *
   * Example:
   * TELEGRAM_OPERATIONS_BOT_TOKEN
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
   Chat / Group DTOs
   ========================================================= */

export interface CreateTelegramChatDto {
  telegram_bot_id: number;

  /**
   * Raw Telegram group/supergroup ID.
   * Usually looks like -100...
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

/* =========================================================
   Settings DTO
   ========================================================= */

export interface UpdateTelegramSettingsDto {
  enabled: boolean;
}