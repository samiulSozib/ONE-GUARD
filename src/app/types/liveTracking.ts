// app/types/liveTracking.types.ts

export interface GuardLocation {
  latitude: string;
  longitude: string;
  accuracy: string|number | null;
  speed: string | null;
  is_moving: boolean;
  updated_at: string;
  updated_ago: string;
  duty_location_match: boolean;
  distance_from_duty_meters: string | null|number;
}

export interface DeviceInfo {
  battery_level: number|string|null;
  is_charging: boolean;
  network_type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  app_version: string;
}

export interface CurrentAssignment {
  id: number;
  title: string;
  site_name: string;
  start_time: string;
  end_time: string;
}

export interface LiveGuard {
  id: number;
  guard_code: string;
  full_name: string;
  phone: string;
  profile_image: string | null;
  guard_type: string | null;
  online_status: 'online' | 'offline' | 'pending'|'away'|'busy';
  status_color: 'success' | 'secondary' | 'warning' | 'danger';
  last_ping_at: string | null;
  last_activity_at: string | null;
  location: GuardLocation | null;
  device_info: DeviceInfo | null;
  current_assignment: CurrentAssignment | null;
}

export interface LiveTrackingResponse {
  status: string;
  status_code: number;
  success: boolean;
  body: {
    guards: LiveGuard[];
    total_online: number;
    total_offline: number;
    total_guards: number;
    last_updated: string;
  };
}

export interface LocationHistoryPoint {
  latitude: string;
  longitude: string;
  speed: string | null;
  accuracy: string | null;
  duty_location_match: boolean;
  distance_from_duty_meters: string | null;
  time: string;
  formatted_time: string;
}

export interface LocationHistoryResponse {
  status: string;
  status_code: number;
  success: boolean;
  body: {
    guard_id: number;
    locations: LocationHistoryPoint[];
    total_points: number;
  };
}

export interface LiveTrackingState {
  guards: LiveGuard[];
  totalOnline: number;
  totalOffline: number;
  totalGuards: number;
  lastUpdated: string | null;
  selectedGuard: LiveGuard | null;
  locationHistory: LocationHistoryPoint[];
  historyTotalPoints: number;
  isLoading: boolean;
  error: string | null;
}

export interface LiveTrackingParams {
  status?: 'online' | 'offline' | 'all';
  search?: string;
  page?: number;
  per_page?: number;
}