import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import { telegramService } from "@/service/telegram.service";

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

/* =========================================================
   State
   ========================================================= */

interface TelegramState {
  overview: TelegramOverview | null;

  bots: TelegramBot[];
  currentBot: TelegramBot | null;

  chats: TelegramChat[];
  currentChat: TelegramChat | null;

  scopes: TelegramScope[];
  rules: TelegramRule[];
  events: TelegramEvent[];

  deliveries: TelegramDelivery[];
  currentDelivery: TelegramDelivery | null;

  deliveryPagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };

  isLoading: boolean;
  error: string | null;
}

const initialState: TelegramState = {
  overview: null,

  bots: [],
  currentBot: null,

  chats: [],
  currentChat: null,

  scopes: [],
  rules: [],
  events: [],

  deliveries: [],
  currentDelivery: null,

  deliveryPagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  },

  isLoading: false,
  error: null,
};

/* =========================================================
   Error Helper
   ========================================================= */

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  return error instanceof Error
    ? error.message
    : fallback;
};

/* =========================================================
   Overview
   ========================================================= */

export const fetchTelegramOverview = createAsyncThunk(
  "telegram/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      return await telegramService.getOverview();
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch Telegram overview"
        )
      );
    }
  }
);

/* =========================================================
   Bots
   ========================================================= */

export const fetchTelegramBots = createAsyncThunk(
  "telegram/fetchBots",
  async (
    params: TelegramBotParams = {},
    { rejectWithValue }
  ) => {
    try {
      return await telegramService.getBots(params);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch Telegram bots"
        )
      );
    }
  }
);

export const createTelegramBot = createAsyncThunk(
  "telegram/createBot",
  async (
    data: CreateTelegramBotDto,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await telegramService.createBot(data);

      return response.item;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create Telegram bot"
        )
      );
    }
  }
);

export const updateTelegramBot = createAsyncThunk(
  "telegram/updateBot",
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: UpdateTelegramBotDto;
    },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await telegramService.updateBot(id, data);

      return response.item;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update Telegram bot"
        )
      );
    }
  }
);

/* =========================================================
   Chats / Groups
   ========================================================= */

export const fetchTelegramChats = createAsyncThunk(
  "telegram/fetchChats",
  async (
    params: TelegramChatParams = {},
    { rejectWithValue }
  ) => {
    try {
      return await telegramService.getChats(params);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch Telegram groups"
        )
      );
    }
  }
);

export const fetchTelegramChat = createAsyncThunk(
  "telegram/fetchChat",
  async (
    id: number,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await telegramService.getChat(id);

      return response.item;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch Telegram group"
        )
      );
    }
  }
);

export const createTelegramChat = createAsyncThunk(
  "telegram/createChat",
  async (
    data: CreateTelegramChatDto,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await telegramService.createChat(data);

      return response.item;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create Telegram group"
        )
      );
    }
  }
);

export const updateTelegramChat = createAsyncThunk(
  "telegram/updateChat",
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: UpdateTelegramChatDto;
    },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await telegramService.updateChat(
          id,
          data
        );

      return response.item;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update Telegram group"
        )
      );
    }
  }
);

export const verifyTelegramChat = createAsyncThunk(
  "telegram/verifyChat",
  async (
    id: number,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await telegramService.verifyChat(id);

      return response.item;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to verify Telegram group"
        )
      );
    }
  }
);

/* =========================================================
   Scopes
   ========================================================= */

export const replaceTelegramScopes = createAsyncThunk(
  "telegram/replaceScopes",
  async (
    {
      chatId,
      data,
    }: {
      chatId: number;
      data: ReplaceTelegramScopesDto;
    },
    { rejectWithValue }
  ) => {
    try {
      return await telegramService.replaceChatScopes(
        chatId,
        data
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update Telegram scopes"
        )
      );
    }
  }
);

/* =========================================================
   Rules
   ========================================================= */

export const replaceTelegramRules = createAsyncThunk(
  "telegram/replaceRules",
  async (
    {
      chatId,
      data,
    }: {
      chatId: number;
      data: ReplaceTelegramRulesDto;
    },
    { rejectWithValue }
  ) => {
    try {
      return await telegramService.replaceChatRules(
        chatId,
        data
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update Telegram rules"
        )
      );
    }
  }
);

/* =========================================================
   Events
   ========================================================= */

export const fetchTelegramEvents = createAsyncThunk(
  "telegram/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      return await telegramService.getEvents();
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch Telegram events"
        )
      );
    }
  }
);

/* =========================================================
   Deliveries
   ========================================================= */

export const fetchTelegramDeliveries =
  createAsyncThunk(
    "telegram/fetchDeliveries",
    async (
      params: TelegramDeliveryParams = {},
      { rejectWithValue }
    ) => {
      try {
        return await telegramService.getDeliveries(
          params
        );
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch Telegram deliveries"
          )
        );
      }
    }
  );

export const fetchTelegramDelivery =
  createAsyncThunk(
    "telegram/fetchDelivery",
    async (
      id: number,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await telegramService.getDelivery(id);

        return response.item;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch Telegram delivery"
          )
        );
      }
    }
  );

/* =========================================================
   Slice
   ========================================================= */

const telegramSlice = createSlice({
  name: "telegram",

  initialState,

  reducers: {
    clearTelegramError: (state) => {
      state.error = null;
    },

    clearCurrentTelegramBot: (state) => {
      state.currentBot = null;
    },

    clearCurrentTelegramChat: (state) => {
      state.currentChat = null;
      state.scopes = [];
      state.rules = [];
    },

    clearCurrentTelegramDelivery: (state) => {
      state.currentDelivery = null;
    },

    setCurrentTelegramChat: (
      state,
      action: PayloadAction<TelegramChat | null>
    ) => {
      state.currentChat = action.payload;

      state.scopes =
        action.payload?.scopes ?? [];

      state.rules =
        action.payload?.rules ?? [];
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= Overview ================= */

      .addCase(
        fetchTelegramOverview.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTelegramOverview.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.overview = action.payload;
        }
      )

      .addCase(
        fetchTelegramOverview.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      /* ================= Bots ================= */

      .addCase(
        fetchTelegramBots.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTelegramBots.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.bots = action.payload.items;
        }
      )

      .addCase(
        fetchTelegramBots.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        createTelegramBot.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        createTelegramBot.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.bots = [
            action.payload,
            ...state.bots,
          ];

          state.currentBot = action.payload;
        }
      )

      .addCase(
        createTelegramBot.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        updateTelegramBot.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        updateTelegramBot.fulfilled,
        (state, action) => {
          state.isLoading = false;

          const index = state.bots.findIndex(
            (bot) =>
              bot.id === action.payload.id
          );

          if (index !== -1) {
            state.bots[index] =
              action.payload;
          }

          if (
            state.currentBot?.id ===
            action.payload.id
          ) {
            state.currentBot =
              action.payload;
          }
        }
      )

      .addCase(
        updateTelegramBot.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      /* ================= Chats ================= */

      .addCase(
        fetchTelegramChats.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTelegramChats.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.chats = action.payload.items;
        }
      )

      .addCase(
        fetchTelegramChats.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        fetchTelegramChat.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTelegramChat.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.currentChat =
            action.payload;

          state.scopes =
            action.payload.scopes ?? [];

          state.rules =
            action.payload.rules ?? [];
        }
      )

      .addCase(
        fetchTelegramChat.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        createTelegramChat.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        createTelegramChat.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.chats = [
            action.payload,
            ...state.chats,
          ];

          state.currentChat =
            action.payload;

          state.scopes =
            action.payload.scopes ?? [];

          state.rules =
            action.payload.rules ?? [];
        }
      )

      .addCase(
        createTelegramChat.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        updateTelegramChat.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        updateTelegramChat.fulfilled,
        (state, action) => {
          state.isLoading = false;

          const index =
            state.chats.findIndex(
              (chat) =>
                chat.id === action.payload.id
            );

          if (index !== -1) {
            state.chats[index] =
              action.payload;
          }

          if (
            state.currentChat?.id ===
            action.payload.id
          ) {
            state.currentChat =
              action.payload;

            state.scopes =
              action.payload.scopes ??
              state.scopes;

            state.rules =
              action.payload.rules ??
              state.rules;
          }
        }
      )

      .addCase(
        updateTelegramChat.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        verifyTelegramChat.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        verifyTelegramChat.fulfilled,
        (state, action) => {
          state.isLoading = false;

          const index =
            state.chats.findIndex(
              (chat) =>
                chat.id === action.payload.id
            );

          if (index !== -1) {
            state.chats[index] =
              action.payload;
          }

          if (
            state.currentChat?.id ===
            action.payload.id
          ) {
            state.currentChat =
              action.payload;
          }
        }
      )

      .addCase(
        verifyTelegramChat.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      /* ================= Scopes ================= */

      .addCase(
        replaceTelegramScopes.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        replaceTelegramScopes.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.scopes = action.payload.items;

          if (state.currentChat) {
            state.currentChat.scopes =
              action.payload.items;
          }
        }
      )

      .addCase(
        replaceTelegramScopes.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      /* ================= Rules ================= */

      .addCase(
        replaceTelegramRules.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        replaceTelegramRules.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.rules = action.payload.items;

          if (state.currentChat) {
            state.currentChat.rules =
              action.payload.items;
          }
        }
      )

      .addCase(
        replaceTelegramRules.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      /* ================= Events ================= */

      .addCase(
        fetchTelegramEvents.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTelegramEvents.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.events = action.payload.items;
        }
      )

      .addCase(
        fetchTelegramEvents.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      /* ================= Deliveries ================= */

      .addCase(
        fetchTelegramDeliveries.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTelegramDeliveries.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.deliveries =
            action.payload.items;

          if (action.payload.data) {
            state.deliveryPagination = {
              current_page:
                action.payload.data.current_page,

              last_page:
                action.payload.data.last_page,

              total:
                action.payload.data.total,

              per_page:
                action.payload.data.per_page ??
                20,
            };
          }
        }
      )

      .addCase(
        fetchTelegramDeliveries.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        fetchTelegramDelivery.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTelegramDelivery.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.currentDelivery =
            action.payload;
        }
      )

      .addCase(
        fetchTelegramDelivery.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload as string;
        }
      );
  },
});

/* =========================================================
   Exports
   ========================================================= */

export const {
  clearTelegramError,
  clearCurrentTelegramBot,
  clearCurrentTelegramChat,
  clearCurrentTelegramDelivery,
  setCurrentTelegramChat,
} = telegramSlice.actions;

export default telegramSlice.reducer;