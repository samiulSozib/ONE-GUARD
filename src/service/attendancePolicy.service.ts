import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
  DefinitionsBody,
  ScopeBody,
  DeleteOverrideBody,
  PolicyParams,
  UpdatePolicyPayload,
} from "@/app/types/attendancePolicy";

const BASE = "/admin/operational-policies";
const DEFAULT_GROUP = "attendance_policy";

export const attendancePolicyService = {
  getDefinitions: (params?: PolicyParams) =>
    handleApiResponse(
      api.get<ApiResponse<DefinitionsBody>>(`${BASE}/definitions`, {
        params: { group: params?.group ?? DEFAULT_GROUP },
      })
    ),

  getGlobal: (params?: PolicyParams) =>
    handleApiResponse(
      api.get<ApiResponse<ScopeBody>>(`${BASE}/global`, {
        params: { group: params?.group ?? DEFAULT_GROUP },
      })
    ),

  /* §4.4 — site_location uses underscore */
  getSite: (id: number, params?: PolicyParams) =>
    handleApiResponse(
      api.get<ApiResponse<ScopeBody>>(`${BASE}/site/${id}`, {
        params: { group: params?.group ?? DEFAULT_GROUP },
      })
    ),
  getSiteLocation: (id: number, params?: PolicyParams) =>
    handleApiResponse(
      api.get<ApiResponse<ScopeBody>>(`${BASE}/site_location/${id}`, {
        params: { group: params?.group ?? DEFAULT_GROUP },
      })
    ),
  getDuty: (id: number, params?: PolicyParams) =>
    handleApiResponse(
      api.get<ApiResponse<ScopeBody>>(`${BASE}/duty/${id}`, {
        params: { group: params?.group ?? DEFAULT_GROUP },
      })
    ),

  updateGlobal: (payload: UpdatePolicyPayload) =>
    handleApiResponse(api.put<ApiResponse<ScopeBody>>(`${BASE}/global`, payload)),
  updateSite: (id: number, payload: UpdatePolicyPayload) =>
    handleApiResponse(api.put<ApiResponse<ScopeBody>>(`${BASE}/site/${id}`, payload)),
  updateSiteLocation: (id: number, payload: UpdatePolicyPayload) =>
    handleApiResponse(
      api.put<ApiResponse<ScopeBody>>(`${BASE}/site_location/${id}`, payload)
    ),
  updateDuty: (id: number, payload: UpdatePolicyPayload) =>
    handleApiResponse(api.put<ApiResponse<ScopeBody>>(`${BASE}/duty/${id}`, payload)),

  deleteOverride: (scopeType: string, scopeId: number, key: string) =>
    handleApiResponse(
      api.delete<ApiResponse<DeleteOverrideBody>>(
        `${BASE}/${scopeType}/${scopeId}/${key}`
      )
    ),
};
