
import api from "./api.service";

import type {
  ApiEnvelope,
  ShiftDetails,
  ShiftFilters,
  ShiftListBody,
  ShiftSummary,
} from "@/app/types/shift-operations";

const route = "/admin/shift-operations";

const paramsOf = (filters: ShiftFilters) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

export const shiftOperationsService = {
  async list(filters: ShiftFilters) {
    const response = await api.get<ApiEnvelope<ShiftListBody>>(
      route,
      {
        params: paramsOf(filters),
      }
    );

    return response.data.body;
  },

  async overview(filters: ShiftFilters) {
    const response = await api.get<
      ApiEnvelope<{
        summary: ShiftSummary;
        filters: ShiftFilters;
        generated_at: string;
      }>
    >(`${route}/overview`, {
      params: paramsOf(filters),
    });

    return response.data.body;
  },

  async details(id: number) {
    const response = await api.get<ApiEnvelope<ShiftDetails>>(
      `${route}/assignments/${id}`
    );

    return response.data.body;
  },

  async exportFile(
    format: "csv" | "excel" | "pdf",
    filters: ShiftFilters
  ) {
    const response = await api.get<Blob>(
      `${route}/export/${format}`,
      {
        params: paramsOf(filters),
        responseType: "blob",
      }
    );

    // Fix: Axios header values can have different types.
    // Convert the content type to a string before using includes().
    const contentType = String(
      response.headers?.["content-type"] ?? ""
    );

    // Handle API errors that arrive as JSON blobs.
    if (
      contentType.includes("application/json") ||
      contentType.includes("application/problem+json")
    ) {
      const errorText = await response.data.text();

      try {
        const errorData = JSON.parse(errorText);

        throw new Error(
          errorData.message ||
          errorData.error ||
          "Failed to export Shift Operations."
        );
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error(errorText);
        }

        throw error;
      }
    }

    const extension =
      format === "excel" ? "xlsx" : format;

    const filename =
      `one-guard-shift-operations.${extension}`;

    const url = URL.createObjectURL(response.data);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    // Release the temporary download URL.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  },
};
