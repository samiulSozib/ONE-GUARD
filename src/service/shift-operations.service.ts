
import type { ApiResponse } from "@/app/types/api.types";

import type {
  ShiftFilters,
  ShiftOperationsList,
  ShiftOperationsOverview,
  ShiftAssignmentDetails,
} from "@/app/types/shift-operations";

import api, { handleApiResponse } from "./api.service";

/**
 * ONE GUARD SECURITY
 * Shift Operations API Service
 *
 * The API base URL and Bearer token are managed
 * by the existing api.service.ts file.
 */

const SHIFT_OPERATIONS_URL = "/admin/shift-operations";

export type ShiftExportFormat = "csv" | "excel" | "pdf";

/**
 * Prepare API query parameters.
 *
 * Important:
 * We preserve "0" because boolean filters such as
 * has_incidents=0 are valid backend filters.
 */
function buildQueryParams(
  filters: ShiftFilters
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  ) as Record<string, string | number>;
}

/**
 * Download a server-generated file in the browser.
 */
function downloadBlob(
  blob: Blob,
  filename: string
): void {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

export const shiftOperationsService = {
  /**
   * 1. Operational shift listing
   *
   * GET /admin/shift-operations
   *
   * Supports date range, search, filters,
   * and server-side pagination.
   */
  getOperations: (
    filters: ShiftFilters
  ): Promise<ShiftOperationsList> =>
    handleApiResponse(
      api.get<ApiResponse<ShiftOperationsList>>(
        SHIFT_OPERATIONS_URL,
        {
          params: buildQueryParams(filters),
        }
      )
    ),

  /**
   * 2. Operational overview
   *
   * GET /admin/shift-operations/overview
   *
   * Returns summary statistics across all
   * matching operational rows.
   */
  getOverview: (
    filters: ShiftFilters
  ): Promise<ShiftOperationsOverview> =>
    handleApiResponse(
      api.get<ApiResponse<ShiftOperationsOverview>>(
        `${SHIFT_OPERATIONS_URL}/overview`,
        {
          params: buildQueryParams(filters),
        }
      )
    ),

  /**
   * 3. Assignment details
   *
   * GET /admin/shift-operations/assignments/{id}
   *
   * Used by the right-side details drawer.
   */
  getAssignmentDetails: (
    assignmentId: number
  ): Promise<ShiftAssignmentDetails> =>
    handleApiResponse(
      api.get<ApiResponse<ShiftAssignmentDetails>>(
        `${SHIFT_OPERATIONS_URL}/assignments/${assignmentId}`
      )
    ),

  /**
   * 4-6. Export Shift Operations
   *
   * GET /admin/shift-operations/export/csv
   * GET /admin/shift-operations/export/excel
   * GET /admin/shift-operations/export/pdf
   *
   * Downloads all matching filtered rows,
   * subject to the backend export limits.
   */
  exportOperations: async (
    format: ShiftExportFormat,
    filters: ShiftFilters
  ): Promise<void> => {
    const response = await api.get<Blob>(
      `${SHIFT_OPERATIONS_URL}/export/${format}`,
      {
        params: buildQueryParams(filters),
        responseType: "blob",
        headers: {
          Accept: "*/*",
        },
      }
    );

    const blob = response.data;

    // The backend might return a JSON error
    // instead of an exported file.
    if (
      blob.type.includes("application/json") ||
      blob.type.includes("text/json")
    ) {
      const responseText = await blob.text();

      let errorMessage = "Export failed.";

      try {
        const errorData = JSON.parse(responseText);
        errorMessage =
          errorData.message ||
          errorData.errors?.message ||
          errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const extension =
      format === "excel" ? "xlsx" : format;

    const filename =
      `shift-operations-${filters.from}-to-${filters.to}.${extension}`;

    downloadBlob(blob, filename);
  },
};
