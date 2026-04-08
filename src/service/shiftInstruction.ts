// service/duty-instruction.service.ts

import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { 
  DutyInstruction, 
  DutyInstructionParams, 
  CreateDutyInstructionData,
  UpdateDutyInstructionData 
} from "@/app/types/shiftInstruction";

export const dutyInstructionService = {
  // Get all duty instructions
  getInstructions: (params?: DutyInstructionParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: DutyInstruction[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/duty-instructions", { params })
    ),

  // Get single duty instruction
  getInstruction: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{item: DutyInstruction}>>(`/admin/duty-instructions/${id}/show`, { params })
    ),

  // Create duty instruction
  createInstruction: (
    data: FormData | CreateDutyInstructionData
  ) =>
    handleApiResponse(
      api.post<ApiResponse<{item: DutyInstruction}>>("/admin/duty-instructions", data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Update duty instruction
  updateInstruction: (id: number, data: FormData | UpdateDutyInstructionData) =>
    handleApiResponse(
      api.put<ApiResponse<{item: DutyInstruction}>>(`/admin/duty-instructions/${id}`, data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Delete duty instruction
  deleteInstruction: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/duty-instructions/${id}`)
    ),

  // Toggle instruction status
  toggleInstructionStatus: (id: number, status: string) =>
    handleApiResponse(
      api.get<ApiResponse<{message: string}>>(
        `/admin/duty-instructions/${id}/change-status?status=${status}`
      )
    ),

  // Bulk update order
  bulkUpdateOrder: (data: { id: number; order: number }[]) =>
    handleApiResponse(
      api.post<ApiResponse<{message: string}>>("/admin/duty-instructions/bulk-order", { items: data })
    ),

  // Get instructions by instructionable (duty/shift/etc)
  getInstructionsByInstructionable: (instructionableType: string, instructionableId: number) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: DutyInstruction[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>(`/admin/duty-instructions/by-instructionable/${instructionableType}/${instructionableId}`)
    ),
};