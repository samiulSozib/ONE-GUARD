// app/types/settings.types.ts

/**
 * A single setting item as returned by GET /admin/settings.
 * Each item is one configurable key inside a group.
 */
export interface SettingItem {
  id: number;
  group: string;              // e.g. "client_notifications"
  key: string;                // e.g. "client_notifications.enabled"
  label: string;              // human-readable
  value: boolean | number | string | null;
  type: 'boolean' | 'integer' | 'string' | 'float';
  description: string | null;
  is_editable: boolean;
}

/**
 * A group of settings (e.g. client_notifications, guard_notifications).
 */
export interface SettingGroup {
  group: string;              // group identifier
  items: SettingItem[];
}

/**
 * Response body of GET /admin/settings.
 */
export interface SettingsResponseBody {
  groups: SettingGroup[];
  total_groups: number;
  total_settings: number;
}

/**
 * Payload for PUT /admin/settings.
 * Flat key/value map of setting keys -> new values.
 * Only keys you actually want to change are required.
 */
export interface UpdateSettingsPayload {
  settings: Record<string, boolean | number | string | null>;
}

/**
 * Response body of PUT /admin/settings.
 * Backend may echo the updated settings or the full groups — we accept
 * both shapes defensively.
 */
export interface UpdateSettingsResponseBody {
  // Optional: flat map of updated keys -> values
  settings?: Record<string, boolean | number | string | null>;
  // Optional: full grouped response (same as GET)
  groups?: SettingGroup[];
  total_groups?: number;
  total_settings?: number;
}

/**
 * Redux state for settings.
 */
export interface SettingsState {
  groups: SettingGroup[];
  // Flat lookup map (key -> value), kept in sync with groups.
  // Handy for quickly reading a single setting in a component.
  values: Record<string, boolean | number | string | null>;
  totalGroups: number;
  totalSettings: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSavedAt: number | null;
}
