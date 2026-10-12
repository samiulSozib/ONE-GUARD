
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
      { params: paramsOf(filters) }
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

    const contentType =
      response.headers?.["content-type"] || "";

    if (contentType.includes("application/json")) {
      const message = await response.data.text();
      throw new Error(message);
    }

    const extension = format === "excel" ? "xlsx" : format;

    const url = URL.createObjectURL(response.data);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `one-guard-shift-operations.${extension}`;

    document.body.appendChild(anchor);

    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  },
};
