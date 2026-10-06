// src/store/slices/liveTrackingSlice.ts

import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit"

import {
  GuardLocation,
  GuardOnlineStatus,
  LiveGuard,
  LiveTrackingParams,
  LiveTrackingState,
} from "@/app/types/liveTracking"

import { liveTrackingService } from "@/service/liveTracking.service"

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const normalizeGuard = (guard: LiveGuard): LiveGuard => {
  if (!guard.current_assignment) {
    return guard
  }

  return {
    ...guard,
    current_assignment: {
      ...guard.current_assignment,

      /**
       * Backward compatibility for the existing
       * Location Tracking page.
       *
       * New backend:
       * current_assignment.duty_title
       *
       * Existing frontend:
       * current_assignment.title
       */
      title:
        guard.current_assignment.title ??
        guard.current_assignment.duty_title ??
        null,
    },
  }
}

const normalizeGuards = (
  guards: LiveGuard[] = []
): LiveGuard[] => {
  return guards.map(normalizeGuard)
}

const recalculateLiveCounters = (
  state: LiveTrackingState
) => {
  state.totalGuards = state.guards.length

  state.totalOnline = state.guards.filter(
    (guard) => guard.online_status === "online"
  ).length

  state.totalOffline = state.guards.filter(
    (guard) => guard.online_status === "offline"
  ).length

  state.totalOnDuty = state.guards.filter(
    (guard) => guard.current_assignment !== null
  ).length

  state.totalMoving = state.guards.filter(
    (guard) => guard.location?.is_moving === true
  ).length

  state.totalOutsideGeofence =
    state.guards.filter((guard) => {
      return (
        guard.current_assignment !== null &&
        guard.location !== null &&
        guard.location.duty_location_match === false
      )
    }).length
}

/* -------------------------------------------------------------------------- */
/* Initial State                                                              */
/* -------------------------------------------------------------------------- */

const initialState: LiveTrackingState = {
  guards: [],

  totalOnline: 0,
  totalOffline: 0,
  totalGuards: 0,

  totalOnDuty: 0,
  totalMoving: 0,
  totalOutsideGeofence: 0,

  allowedRadiusMeters: 0,

  lastUpdated: null,

  selectedGuard: null,

  locationHistory: [],
  historyTotalPoints: 0,

  isLoading: false,
  error: null,
}

/* -------------------------------------------------------------------------- */
/* Thunks                                                                     */
/* -------------------------------------------------------------------------- */

export const fetchLiveGuards = createAsyncThunk(
  "liveTracking/fetchGuards",
  async (
    params: LiveTrackingParams = {},
    { rejectWithValue }
  ) => {
    try {
      return await liveTrackingService.getGuards(params)
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch live guards"

      return rejectWithValue(message)
    }
  }
)

export const fetchGuardsByStatus = createAsyncThunk(
  "liveTracking/fetchGuardsByStatus",
  async (
    status: "online" | "offline",
    { rejectWithValue }
  ) => {
    try {
      return await liveTrackingService.getGuardsByStatus(
        status
      )
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch guards by status"

      return rejectWithValue(message)
    }
  }
)

export const fetchGuardLocationHistory =
  createAsyncThunk(
    "liveTracking/fetchLocationHistory",
    async (
      {
        guardId,
        hours = 24,
      }: {
        guardId: number
        hours?: number
      },
      { rejectWithValue }
    ) => {
      try {
        return await liveTrackingService.getGuardLocationHistory(
          guardId,
          hours
        )
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch location history"

        return rejectWithValue(message)
      }
    }
  )

export const fetchGuardLiveLocation =
  createAsyncThunk(
    "liveTracking/fetchGuardLiveLocation",
    async (
      guardId: number,
      { rejectWithValue }
    ) => {
      try {
        return await liveTrackingService.getGuardLiveLocation(
          guardId
        )
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch guard location"

        return rejectWithValue(message)
      }
    }
  )

/* -------------------------------------------------------------------------- */
/* Slice                                                                      */
/* -------------------------------------------------------------------------- */

const liveTrackingSlice = createSlice({
  name: "liveTracking",

  initialState,

  reducers: {
    clearTrackingError: (state) => {
      state.error = null
    },

    resetTrackingState: (state) => {
      state.guards = []

      state.totalOnline = 0
      state.totalOffline = 0
      state.totalGuards = 0

      state.totalOnDuty = 0
      state.totalMoving = 0
      state.totalOutsideGeofence = 0

      state.allowedRadiusMeters = 0

      state.lastUpdated = null

      state.selectedGuard = null

      state.locationHistory = []
      state.historyTotalPoints = 0

      state.isLoading = false
      state.error = null
    },

    setSelectedGuard: (
      state,
      action: PayloadAction<LiveGuard | null>
    ) => {
      state.selectedGuard = action.payload
        ? normalizeGuard(action.payload)
        : null
    },

    clearLocationHistory: (state) => {
      state.locationHistory = []
      state.historyTotalPoints = 0
    },

    updateGuardLocation: (
      state,
      action: PayloadAction<{
        guard_id: number

        latitude: number
        longitude: number

        accuracy: number | null
        speed?: number | null
        is_moving?: boolean

        duty_location_match: boolean
        distance_from_duty_meters: number | null

        battery_level: number | null

        updated_at: string
      }>
    ) => {
      const {
        guard_id,
        latitude,
        longitude,
        accuracy,
        speed,
        is_moving,
        duty_location_match,
        distance_from_duty_meters,
        battery_level,
        updated_at,
      } = action.payload

      const guard = state.guards.find(
        (item) => item.id === guard_id
      )

      if (!guard) {
        return
      }

      const resolvedMoving =
        is_moving !== undefined
          ? is_moving
          : speed !== undefined && speed !== null
            ? speed > 0
            : guard.location?.is_moving ?? false

      const updatedLocation: GuardLocation = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),

        accuracy,

        speed:
          speed !== undefined
            ? speed
            : guard.location?.speed ?? null,

        is_moving: resolvedMoving,

        updated_at,
        updated_ago: "Just now",

        duty_location_match,

        distance_from_duty_meters,
      }

      guard.location = updatedLocation
      guard.last_ping_at = updated_at
      guard.last_activity_at = updated_at

      if (guard.device_info) {
        guard.device_info.battery_level =
          battery_level
      }

      if (
        state.selectedGuard?.id === guard_id
      ) {
        state.selectedGuard.location = {
          ...updatedLocation,
        }

        state.selectedGuard.last_ping_at =
          updated_at

        state.selectedGuard.last_activity_at =
          updated_at

        if (
          state.selectedGuard.device_info
        ) {
          state.selectedGuard.device_info.battery_level =
            battery_level
        }
      }

      state.lastUpdated = updated_at

      recalculateLiveCounters(state)
    },

    updateGuardStatus: (
      state,
      action: PayloadAction<{
        guard_id: number
        status: GuardOnlineStatus
        last_ping_at: string | null
      }>
    ) => {
      const {
        guard_id,
        status,
        last_ping_at,
      } = action.payload

      const guard = state.guards.find(
        (item) => item.id === guard_id
      )

      if (!guard) {
        return
      }

      guard.online_status = status
      guard.last_ping_at = last_ping_at

      if (
        state.selectedGuard?.id === guard_id
      ) {
        state.selectedGuard.online_status =
          status

        state.selectedGuard.last_ping_at =
          last_ping_at
      }

      if (last_ping_at) {
        state.lastUpdated = last_ping_at
      }

      recalculateLiveCounters(state)
    },
  },

  extraReducers: (builder) => {
    builder

      /* -------------------------------------------------------------------- */
      /* Fetch Live Guards                                                    */
      /* -------------------------------------------------------------------- */

      .addCase(
        fetchLiveGuards.pending,
        (state) => {
          state.isLoading = true
          state.error = null
        }
      )

      .addCase(
        fetchLiveGuards.fulfilled,
        (state, action) => {
          state.isLoading = false

          state.guards = normalizeGuards(
            action.payload.guards ?? []
          )

          state.totalOnline =
            action.payload.total_online ?? 0

          state.totalOffline =
            action.payload.total_offline ?? 0

          state.totalGuards =
            action.payload.total_guards ??
            state.guards.length

          state.totalOnDuty =
            action.payload.total_on_duty ?? 0

          state.totalMoving =
            action.payload.total_moving ?? 0

          state.totalOutsideGeofence =
            action.payload
              .total_outside_geofence ?? 0

          state.allowedRadiusMeters =
            action.payload
              .allowed_radius_meters ?? 0

          state.lastUpdated =
            action.payload.last_updated ?? null

          if (state.selectedGuard) {
            const refreshedSelectedGuard =
              state.guards.find(
                (guard) =>
                  guard.id ===
                  state.selectedGuard?.id
              )

            if (refreshedSelectedGuard) {
              state.selectedGuard =
                refreshedSelectedGuard
            }
          }
        }
      )

      .addCase(
        fetchLiveGuards.rejected,
        (state, action) => {
          state.isLoading = false

          state.error =
            (action.payload as string) ??
            "Failed to fetch live guards"
        }
      )

      /* -------------------------------------------------------------------- */
      /* Fetch Guards By Status                                               */
      /* -------------------------------------------------------------------- */

      .addCase(
        fetchGuardsByStatus.pending,
        (state) => {
          state.isLoading = true
          state.error = null
        }
      )

      .addCase(
        fetchGuardsByStatus.fulfilled,
        (state, action) => {
          state.isLoading = false

          state.guards = normalizeGuards(
            action.payload.guards ?? []
          )

          state.totalOnline =
            action.payload.total_online ?? 0

          state.totalOffline =
            action.payload.total_offline ?? 0

          state.totalGuards =
            action.payload.total_guards ??
            state.guards.length

          state.totalOnDuty =
            action.payload.total_on_duty ?? 0

          state.totalMoving =
            action.payload.total_moving ?? 0

          state.totalOutsideGeofence =
            action.payload
              .total_outside_geofence ?? 0

          state.allowedRadiusMeters =
            action.payload
              .allowed_radius_meters ?? 0

          state.lastUpdated =
            action.payload.last_updated ?? null
        }
      )

      .addCase(
        fetchGuardsByStatus.rejected,
        (state, action) => {
          state.isLoading = false

          state.error =
            (action.payload as string) ??
            "Failed to fetch guards by status"
        }
      )

      /* -------------------------------------------------------------------- */
      /* Fetch Guard Location History                                         */
      /* -------------------------------------------------------------------- */

      .addCase(
        fetchGuardLocationHistory.pending,
        (state) => {
          state.isLoading = true
          state.error = null
        }
      )

      .addCase(
        fetchGuardLocationHistory.fulfilled,
        (state, action) => {
          state.isLoading = false

          state.locationHistory =
            action.payload.locations ?? []

          state.historyTotalPoints =
            action.payload.total_points ?? 0
        }
      )

      .addCase(
        fetchGuardLocationHistory.rejected,
        (state, action) => {
          state.isLoading = false

          state.error =
            (action.payload as string) ??
            "Failed to fetch location history"
        }
      )

      /* -------------------------------------------------------------------- */
      /* Fetch Single Guard Live Location                                     */
      /* -------------------------------------------------------------------- */

      .addCase(
        fetchGuardLiveLocation.pending,
        (state) => {
          state.isLoading = true
          state.error = null
        }
      )

      .addCase(
        fetchGuardLiveLocation.fulfilled,
        (state, action) => {
          state.isLoading = false

          state.selectedGuard =
            action.payload.guard
              ? normalizeGuard(
                action.payload.guard
              )
              : null
        }
      )

      .addCase(
        fetchGuardLiveLocation.rejected,
        (state, action) => {
          state.isLoading = false

          state.error =
            (action.payload as string) ??
            "Failed to fetch guard location"
        }
      )
  },
})

export const {
  clearTrackingError,
  resetTrackingState,
  setSelectedGuard,
  clearLocationHistory,
  updateGuardLocation,
  updateGuardStatus,
} = liveTrackingSlice.actions

export default liveTrackingSlice.reducer