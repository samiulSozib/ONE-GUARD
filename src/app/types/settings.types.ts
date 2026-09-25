// app/types/settings.types.ts

/** Value shapes the API can return for a setting. */
export type SettingValue =
  | boolean
  | number
  | string
  | null
  | Record<string, unknown>   // json object  (template)
  | unknown[];                // json array   (catalog, rules)

export type SettingType = 'boolean' | 'integer' | 'string' | 'float' | 'json';

export interface SettingItem {
  id: number;
  group: string;
  key: string;
  label: string;
  value: SettingValue;
  type: SettingType;
  description: string | null;
  is_editable: boolean;
}

export interface SettingGroup {
  group: string;
  items: SettingItem[];
}

export interface SettingsResponseBody {
  groups: SettingGroup[];
  total_groups: number;
  total_settings: number;
}

export interface UpdateSettingsPayload {
  settings: Record<string, SettingValue>;
}

export interface UpdateSettingsResponseBody {
  settings?: Record<string, SettingValue>;
  groups?: SettingGroup[];
  total_groups?: number;
  total_settings?: number;
}

export interface SettingsState {
  groups: SettingGroup[];
  values: Record<string, SettingValue>;
  totalGroups: number;
  totalSettings: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSavedAt: number | null;
}
