import {
  SettingGroup,
  SettingItem,
  SettingValue,
  SettingsState,
  UpdateSettingsPayload,
} from '@/app/types/settings.types';
import { settingsService } from '@/service/settings.service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

const flattenGroups = (groups: SettingGroup[]): Record<string, SettingValue> => {
  const map: Record<string, SettingValue> = {};
  groups.forEach((group) => {
    group.items.forEach((item) => {
      map[item.key] = item.value;
    });
  });
  return map;
};

const applyValuesToGroups = (
  state: { values: Record<string, SettingValue>; groups: SettingGroup[] },
  patch: Record<string, SettingValue>
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

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await settingsService.getSettings();
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
      return { sent: payload.settings, body: response };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update settings';
      return rejectWithValue(errorMessage);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },

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

    setSettingValue: (
      state,
      action: PayloadAction<{ key: string; value: SettingValue }>
    ) => {
      applyValuesToGroups(state, { [action.payload.key]: action.payload.value });
    },

    resetSettings: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
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

      .addCase(updateSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSavedAt = Date.now();

        const { sent, body } = action.payload;

        if (body?.groups && body.groups.length > 0) {
          const flat = flattenGroups(body.groups);
          state.groups = body.groups;
          state.totalGroups = body.total_groups ?? body.groups.length;
          state.totalSettings = body.total_settings ?? Object.keys(flat).length;
          state.values = flat;
          return;
        }
        if (body?.settings) {
          applyValuesToGroups(state, body.settings);
          return;
        }
        applyValuesToGroups(state, sent);
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSettingsError,
  setSettings,
  setSettingValue,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
