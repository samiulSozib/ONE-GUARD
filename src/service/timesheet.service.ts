import type { ApiResponse } from "@/app/types/api.types";
import type {
  DocumentSendDefaults,
  DocumentSendPayload,
  DocumentSendResult,
} from "@/app/types/document-send";
import type {
  TimesheetExportFormat,
  TimesheetFilters,
  TimesheetGuardReport,
  TimesheetListResponse,
  TimesheetSummary,
  UpsertManualPayDto,
  TimesheetManualPay,
} from "@/app/types/timesheet";
import api, { handleApiResponse } from "./api.service";

const TIMESHEETS_URL = "/admin/timesheets";

function buildQueryParams(
  filters: Partial<TimesheetFilters>
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  ) as Record<string, string | number>;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export const timesheetService = {
  getTimesheets: (filters: TimesheetFilters): Promise<TimesheetListResponse> =>
    handleApiResponse(
      api.get<ApiResponse<TimesheetListResponse>>(TIMESHEETS_URL, {
        params: buildQueryParams(filters),
      })
    ),

  getOverview: (
    filters: TimesheetFilters
  ): Promise<{ summary: TimesheetSummary; filters: TimesheetFilters; generated_at: string }> =>
    handleApiResponse(
      api.get<ApiResponse<{ summary: TimesheetSummary; filters: TimesheetFilters; generated_at: string }>>(
        `${TIMESHEETS_URL}/overview`,
        { params: buildQueryParams(filters) }
      )
    ),

  getGuardReport: (
    guardId: number,
    filters: TimesheetFilters
  ): Promise<TimesheetGuardReport> =>
    handleApiResponse(
      api.get<ApiResponse<TimesheetGuardReport>>(
        `${TIMESHEETS_URL}/guards/${guardId}`,
        { params: buildQueryParams(filters) }
      )
    ),

  upsertManualPay: (
    guardId: number,
    data: UpsertManualPayDto
  ): Promise<{ message: string; item: TimesheetManualPay }> =>
    handleApiResponse(
      api.put<ApiResponse<{ message: string; item: TimesheetManualPay }>>(
        `${TIMESHEETS_URL}/guards/${guardId}/manual-pay`,
        data,
        { params: buildQueryParams({
          period_start: data.period_start,
          period_end: data.period_end,
        }) }
      )
    ),

  deleteManualPay: (
    guardId: number,
    filters: Pick<TimesheetFilters, "period_start" | "period_end">
  ): Promise<{ message: string }> =>
    handleApiResponse(
      api.delete<ApiResponse<{ message: string }>>(
        `${TIMESHEETS_URL}/guards/${guardId}/manual-pay`,
        { params: buildQueryParams(filters) }
      )
    ),

  exportTimesheets: async (
    format: TimesheetExportFormat,
    filters: TimesheetFilters
  ): Promise<void> => {
    const response = await api.get(`${TIMESHEETS_URL}/export/${format}`, {
      params: buildQueryParams(filters),
      responseType: "blob",
    });

    const contentType = String(response.headers["content-type"] || "");
    if (contentType.includes("application/json")) {
      const text = await (response.data as Blob).text();
      const json = JSON.parse(text);
      throw new Error(json.message || "Export failed");
    }

    const ext = format === "excel" ? "xlsx" : format;
    const guardPart = filters.guard_id ? `-guard-${filters.guard_id}` : "";
    downloadBlob(
      response.data as Blob,
      `one-guard-timesheet${guardPart}-${filters.period_start}-to-${filters.period_end}.${ext}`
    );
  },

  getSendDefaults: (guardId?: number): Promise<DocumentSendDefaults> =>
    handleApiResponse(
      api.get<ApiResponse<DocumentSendDefaults>>(
        `${TIMESHEETS_URL}/send-defaults`,
        { params: guardId ? { guard_id: guardId } : {} }
      )
    ),

  sendDocument: (data: DocumentSendPayload): Promise<DocumentSendResult> =>
    handleApiResponse(
      api.post<ApiResponse<DocumentSendResult>>(`${TIMESHEETS_URL}/send`, data)
    ),
};
