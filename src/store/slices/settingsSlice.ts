// store/slices/settingsSlice.ts

import {
  SettingGroup,
  SettingItem,
  SettingsState,
  UpdateSettingsPayload,
} from '@/app/types/settings.types';
import { settingsService } from '@/service/settings.service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten groups -> { key: value } map */
const flattenGroups = (
  groups: SettingGroup[]
): Record<string, boolean | number | string | null> => {
  const map: Record<string, boolean | number | string | null> = {};
  groups.forEach((group) => {
    group.items.forEach((item) => {
      map[item.key] = item.value;
    });
  });
  return map;
};

/** Apply a flat key -> value map onto both the flat map and the groups. */
const applyValuesToGroups = (
  state: { values: Record<string, boolean | number | string | null>; groups: SettingGroup[] },
  patch: Record<string, boolean | number | string | null>
) => {
  Object.entries(patch).forEach(([key, value]) => {
    state.values[key] = value;
    for (const group of state.groups) {
      const item = group.items.find((i) => i.key === key);
      if (item) {
        item.value = value;
        break;
      }
    }
  });
};

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: SettingsState = {
  groups: [],
  values: {},
  totalGroups: 0,
  totalSettings: 0,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSavedAt: null,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSettings();
      return response; // { groups, total_groups, total_settings }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch settings';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (payload: UpdateSettingsPayload, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateSettings(payload);
      return {
        // echo back what we sent so the reducer can apply it immediately
        sent: payload.settings,
        // server-side response body (may include the refreshed groups)
        body: response,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update settings';
      return rejectWithValue(errorMessage);
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },

    /** Replace the entire settings payload (e.g. after a fresh GET). */
    setSettings: (
      state,
      action: PayloadAction<{
        groups: SettingGroup[];
        total_groups: number;
        total_settings: number;
      }>
    ) => {
      state.groups = action.payload.groups;
      state.totalGroups = action.payload.total_groups;
      state.totalSettings = action.payload.total_settings;
      state.values = flattenGroups(action.payload.groups);
    },

    /**
     * Optimistically update a single setting value in both the flat map
     * and the matching item inside `groups`. Useful for controlled Switch/
     * Input components that update before hitting Save.
     */
    setSettingValue: (
      state,
      action: PayloadAction<{
        key: string;
        value: boolean | number | string | null;
      }>
    ) => {
      applyValuesToGroups(state, { [action.payload.key]: action.payload.value });
    },

    /**
     * Reset any unsaved local edits back to the last saved snapshot.
     * Requires you to keep `groups` as the source of truth — call
     * `setSettings` first with a fresh GET, or keep the last-known-good
     * groups around.
     */
    resetSettings: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // -------------------- Fetch --------------------
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload.groups;
        state.totalGroups = action.payload.total_groups;
        state.totalSettings = action.payload.total_settings;
        state.values = flattenGroups(action.payload.groups);
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // -------------------- Update --------------------
      .addCase(updateSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSavedAt = Date.now();

        const { sent, body } = action.payload;

        // 1) Server returned fresh groups -> trust them.
        if (body?.groups && body.groups.length > 0) {
          const flat = flattenGroups(body.groups);

          state.groups = body.groups;
          state.totalGroups = body.total_groups ?? body.groups.length;
          state.totalSettings = body.total_settings ?? Object.keys(flat).length;
          state.values = flat;
          return;
        }

        // 2) Server returned a flat settings map -> merge it.
        if (body?.settings) {
          applyValuesToGroups(state, body.settings);
          return;
        }

        // 3) Server returned nothing useful -> apply what we sent.
        applyValuesToGroups(state, sent);
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const {
  clearSettingsError,
  setSettings,
  setSettingValue,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
