// service/settings.service.ts

import { ApiResponse } from '@/app/types/api.types';
import api, { handleApiResponse } from './api.service';
import {
  SettingsResponseBody,
  UpdateSettingsPayload,
  UpdateSettingsResponseBody,
} from '@/app/types/settings.types';

export const settingsService = {
  // GET /admin/settings — fetch all grouped settings
  getSettings: () =>
    handleApiResponse(
      api.get<ApiResponse<SettingsResponseBody>>('/admin/settings')
    ),

  // PUT /admin/settings — update settings (flat key/value map)
  updateSettings: (data: UpdateSettingsPayload) =>
    handleApiResponse(
      api.put<ApiResponse<UpdateSettingsResponseBody>>('/admin/settings', data)
    ),
};
