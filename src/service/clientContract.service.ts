import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
  ClientContract,
  ClientContractParams,
  CreateClientContractDto
} from "@/app/types/clientContract";

export const clientContractService = {
  // Get all contracts
  getContracts: (params?: ClientContractParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: ClientContract[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page?: number;
        };
      }>>("/admin/client-contracts", { params })
    ),

  // Get single contract
  getContract: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: ClientContract }>>(`/admin/client-contracts/${id}/show`, { params })
    ),

  // Create contract
  createContract: (
    data: FormData | CreateClientContractDto
  ) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: ClientContract }>>("/admin/client-contracts", data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Update contract
  updateContract: (id: number, data: FormData | CreateClientContractDto) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: ClientContract }>>(`/admin/client-contracts/${id}`, data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Delete contract
  deleteContract: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/client-contracts/${id}`)
    ),

  // Activate contract
  activateContract: (id: number) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: ClientContract }>>(
        `/admin/client-contracts/${id}/activate`
      )
    ),

  // Suspend contract
  suspendContract: (id: number, data?: { reason?: string }) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: ClientContract }>>(
        `/admin/client-contracts/${id}/suspend`,
        data
      )
    ),

  // Terminate contract
  terminateContract: (id: number, data?: { reason?: string; effective_date?: string }) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: ClientContract }>>(
        `/admin/client-contracts/${id}/terminate`,
        data
      )
    ),

  // Renew contract
  renewContract: (id: number, data?: { end_date?: string; notes?: string }) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: ClientContract }>>(
        `/admin/client-contracts/${id}/renew`,
        data
      )
    ),

  // Toggle contract status
  toggleStatus: (id: number, status: string) =>
    handleApiResponse(
      api.get<ApiResponse<{ message: string }>>(
        `/admin/client-contracts/${id}/change-status?status=${status}`,
      )
    ),

  // Get contract sites
  getContractSites: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{ items: ClientContract['sites'] }>>(
        `/admin/client-contracts/${id}/sites`
      )
    ),

  // Add site to contract
  addContractSite: (id: number, data: { site_id: number; guards_required?: number; site_specific_rate?: number; is_primary?: boolean }) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: ClientContract }>>(
        `/admin/client-contracts/${id}/sites`,
        data
      )
    ),

  // Remove site from contract
  removeContractSite: (contractId: number, siteId: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(
        `/admin/client-contracts/${contractId}/sites/${siteId}`
      )
    ),

  // Update contract site
  updateContractSite: (contractId: number, siteId: number, data: { guards_required?: number; site_specific_rate?: number; is_primary?: boolean }) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: ClientContract }>>(
        `/admin/client-contracts/${contractId}/sites/${siteId}`,
        data
      )
    ),

  // Download contract document
  downloadContract: (id: number) =>
    handleApiResponse(
      api.get(`/admin/client-contracts/${id}/download`, {
        responseType: 'blob'
      })
    ),

  // Get contract statistics
  getContractStats: () =>
    handleApiResponse(
      api.get<ApiResponse<{
        total: number;
        active: number;
        draft: number;
        suspended: number;
        terminated: number;
        expiring_soon: number;
      }>>("/admin/client-contracts/stats")
    ),
};