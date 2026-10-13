
import api, { handleApiResponse } from "./api.service";

import type { ApiResponse } from "@/app/types/api.types";

import type {
  ShiftDetails,
  ShiftExportFormat,
  ShiftFilters,
  ShiftListBody,
  ShiftOverviewBody,
} from "@/app/types/shift-operations";

const BASE_ROUTE = "/admin/shift-operations";

const cleanParams = (filters: ShiftFilters) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all"
    )
  );

async function getExportError(blob: Blob): Promise<string> {
  try {
    const text = await blob.text();
    const parsed = JSON.parse(text);

    return (
      parsed.message ||
      parsed.error ||
      "Failed to export Shift Operations."
    );
  } catch {
    return "Failed to export Shift Operations.";
  }
}

export const shiftOperationsService = {
  getOperations: (
    filters: ShiftFilters = {}
  ): Promise<ShiftListBody> =>
    handleApiResponse(
      api.get<ApiResponse<ShiftListBody>>(
        BASE_ROUTE,
        {
          params: cleanParams(filters),
        }
      )
    ),

  getOverview: (
    filters: ShiftFilters = {}
  ): Promise<ShiftOverviewBody> =>
    handleApiResponse(
      api.get<ApiResponse<ShiftOverviewBody>>(
        `${BASE_ROUTE}/overview`,
        {
          params: cleanParams(filters),
        }
      )
    ),

  getAssignmentDetails: (
    assignmentId: number
  ): Promise<ShiftDetails> =>
    handleApiResponse(
      api.get<ApiResponse<ShiftDetails>>(
        `${BASE_ROUTE}/assignments/${assignmentId}`
      )
    ),

  async exportOperations(
    format: ShiftExportFormat,
    filters: ShiftFilters = {}
  ): Promise<void> {
    const response = await api.get<Blob>(
      `${BASE_ROUTE}/export/${format}`,
      {
        params: cleanParams(filters),
        responseType: "blob",
      }
    );

    const contentType = String(
      response.headers?.["content-type"] ?? ""
    ).toLowerCase();

    if (
      contentType.includes("application/json") ||
      contentType.includes("application/problem+json")
    ) {
      throw new Error(
        await getExportError(response.data)
      );
    }

    const extension =
      format === "excel" ? "xlsx" : format;

    const filename =
      `one-guard-shift-operations.${extension}`;

    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");

    try {
      anchor.href = url;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
    } finally {
      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    }
  },

  list(
    filters: ShiftFilters = {}
  ): Promise<ShiftListBody> {
    return this.getOperations(filters);
  },

  overview(
    filters: ShiftFilters = {}
  ): Promise<ShiftOverviewBody> {
    return this.getOverview(filters);
  },

  details(
    assignmentId: number
  ): Promise<ShiftDetails> {
    return this.getAssignmentDetails(assignmentId);
  },

  exportFile(
    format: ShiftExportFormat,
    filters: ShiftFilters = {}
  ): Promise<void> {
    return this.exportOperations(format, filters);
  },
};

export default shiftOperationsService;
