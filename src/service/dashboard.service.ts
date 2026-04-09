// service/adminDashboard.service.ts

import { ApiResponse } from "@/app/types/api.types";
import { DashboardResponse, DashboardData } from "@/app/types/dashboard";
import api, { handleApiResponse } from "./api.service";

// export const adminDashboardService = {
//   // Get dashboard data
//   getDashboard: () =>
//     handleApiResponse(
//       api.get<ApiResponse<DashboardData>>("/admin/dashboard")
//     ),
  
// };

export const adminDashboardService = {
  // Get dashboard data
  getDashboard: () =>
    handleApiResponse(
      api.get<ApiResponse<DashboardData>>("/admin/dashboard")
    ),
  
};