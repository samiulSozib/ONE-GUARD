// src/app/types/liveTracking.ts

export interface GuardLocation {
  latitude: string
  longitude: string
  accuracy: string | number | null
  speed: string | number | null
  is_moving: boolean
  updated_at: string
  updated_ago: string
  duty_location_match: boolean
  distance_from_duty_meters: string | number | null
}

export interface DeviceInfo {
  battery_level: number | string | null
  is_charging: boolean
  network_type: "wifi" | "cellular" | "ethernet" | "unknown" | string
  app_version: string | null
}

export interface SiteLocationInfo {
  id: number
  name: string | null
  address: string | null
  latitude: string | number | null
  longitude: string | number | null
}

export interface AssignmentGeofence {
  latitude: string | number | null
  longitude: string | number | null
  radius_meters: number
  source: "site_location" | "site" | string
}

export interface CurrentAssignment {
  id: number

  /**
   * Backend field.
   */
  duty_id: number | null
  duty_title: string | null
  service_mode: string | null

  /**
   * Kept for backward compatibility with the existing
   * Location Tracking frontend.
   *
   * Redux normalizes this from duty_title.
   */
  title?: string | null

  site_id: number | null
  site_name: string | null
  site_address: string | null

  site_location_id: number | null
  site_location: SiteLocationInfo | null

  geofence: AssignmentGeofence | null

  allowed_radius_meters: number

  start_time: string | null
  end_time: string | null
}

export type GuardOnlineStatus =
  | "online"
  | "offline"
  | "pending"
  | "away"
  | "busy"

export type GuardStatusColor =
  | "success"
  | "secondary"
  | "warning"
  | "danger"
  | string

export interface LiveGuard {
  id: number
  guard_code: string
  full_name: string
  phone: string | null
  profile_image: string | null
  guard_type: string | null

  online_status: GuardOnlineStatus
  status_color: GuardStatusColor

  last_ping_at: string | null
  last_activity_at: string | null

  location: GuardLocation | null
  device_info: DeviceInfo | null
  current_assignment: CurrentAssignment | null
}

export interface LiveTrackingBody {
  guards: LiveGuard[]

  total_online: number
  total_offline: number
  total_guards: number

  total_on_duty: number
  total_moving: number
  total_outside_geofence: number

  allowed_radius_meters: number

  last_updated: string
}

export interface LiveTrackingResponse {
  status: string
  status_code: number
  success: boolean
  body: LiveTrackingBody
}

export interface LocationHistoryPoint {
  latitude: string
  longitude: string

  speed: string | number | null
  accuracy: string | number | null

  duty_location_match: boolean
  distance_from_duty_meters: string | number | null

  time: string
  formatted_time: string
}

export interface LocationHistoryResponse {
  status: string
  status_code: number
  success: boolean

  body: {
    guard_id: number
    locations: LocationHistoryPoint[]
    total_points: number
  }
}

export interface LiveTrackingState {
  guards: LiveGuard[]

  totalOnline: number
  totalOffline: number
  totalGuards: number

  totalOnDuty: number
  totalMoving: number
  totalOutsideGeofence: number

  allowedRadiusMeters: number

  lastUpdated: string | null

  selectedGuard: LiveGuard | null

  locationHistory: LocationHistoryPoint[]
  historyTotalPoints: number

  isLoading: boolean
  error: string | null
}

export interface LiveTrackingParams {
  status?: "online" | "offline" | "all"
  search?: string
  page?: number
  per_page?: number
}