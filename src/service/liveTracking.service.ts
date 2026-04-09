// service/liveTracking.service.ts

import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { 
  LiveTrackingResponse, 
  LocationHistoryResponse,
  LiveTrackingParams, 
  LiveGuard
} from "@/app/types/liveTracking";

export const liveTrackingService = {
  // Get all live tracking guards
  getGuards: (params?: LiveTrackingParams) =>
    handleApiResponse(
      api.get<ApiResponse<LiveTrackingResponse['body']>>("/admin/live-tracking/guards", { params })
    ),

  // Get guards by status (online/offline)
  getGuardsByStatus: (status: 'online' | 'offline') =>
    handleApiResponse(
      api.get<ApiResponse<LiveTrackingResponse['body']>>(`/admin/live-tracking/guards?status=${status}`)
    ),

  // Get guard location history
  getGuardLocationHistory: (guardId: number, hours: number = 24) =>
    handleApiResponse(
      api.get<ApiResponse<LocationHistoryResponse['body']>>(`/admin/live-tracking/guards/${guardId}/history`, {
        params: { hours }
      })
    ),

  // Get single guard live location
  getGuardLiveLocation: (guardId: number) =>
    handleApiResponse(
      api.get<ApiResponse<{ guard: LiveGuard }>>(`/admin/live-tracking/guards/${guardId}`)
    ),
};