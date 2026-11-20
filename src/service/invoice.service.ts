import type { ApiResponse } from "@/app/types/api.types";
import type {
  DocumentSendDefaults,
  DocumentSendPayload,
  DocumentSendResult,
} from "@/app/types/document-send";
import type {
  CreateInvoiceDto,
  GenerateInvoiceDto,
  InvoiceDetail,
  InvoiceFilters,
  InvoiceListResponse,
  InvoiceStatus,
  RecordPaymentDto,
  UpdateInvoiceDto,
} from "@/app/types/invoice";
import api, { handleApiResponse } from "./api.service";

const INVOICES_URL = "/admin/invoices";

function buildQueryParams(
  filters: Partial<InvoiceFilters>
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

export const invoiceService = {
  getInvoices: (filters: InvoiceFilters = {}): Promise<InvoiceListResponse> =>
    handleApiResponse(
      api.get<ApiResponse<InvoiceListResponse>>(INVOICES_URL, {
        params: buildQueryParams(filters),
      })
    ),

  getInvoice: (id: number): Promise<InvoiceDetail> =>
    handleApiResponse(
      api.get<ApiResponse<InvoiceDetail>>(`${INVOICES_URL}/${id}/show`)
    ),

  preview: (data: GenerateInvoiceDto) =>
    handleApiResponse(api.get(`${INVOICES_URL}/preview`, { params: data })),

  generate: (data: GenerateInvoiceDto) =>
    handleApiResponse(api.post(`${INVOICES_URL}/generate`, data)),

  createInvoice: (data: CreateInvoiceDto): Promise<InvoiceDetail> =>
    handleApiResponse(
      api.post<ApiResponse<InvoiceDetail>>(INVOICES_URL, data)
    ),

  updateInvoice: (id: number, data: UpdateInvoiceDto): Promise<InvoiceDetail> =>
    handleApiResponse(
      api.put<ApiResponse<InvoiceDetail>>(`${INVOICES_URL}/${id}`, data)
    ),

  updateStatus: (id: number, status: InvoiceStatus, notes?: string | null) =>
    handleApiResponse(
      api.patch(`${INVOICES_URL}/${id}/status`, { status, notes })
    ),

  recordPayment: (id: number, data: RecordPaymentDto) =>
    handleApiResponse(api.post(`${INVOICES_URL}/${id}/payments`, data)),

  deleteInvoice: (id: number) =>
    handleApiResponse(api.delete(`${INVOICES_URL}/${id}`)),

  getPdfBlob: async (id: number): Promise<Blob> => {
    const response = await api.get(`${INVOICES_URL}/${id}/pdf`, {
      responseType: "blob",
    });

    const contentType = String(response.headers["content-type"] || "");
    if (contentType.includes("application/json")) {
      const text = await (response.data as Blob).text();
      const json = JSON.parse(text);
      throw new Error(json.message || "PDF download failed");
    }

    return response.data as Blob;
  },

  downloadPdf: async (id: number, invoiceNumber?: string) => {
    const blob = await invoiceService.getPdfBlob(id);
    downloadBlob(blob, `${invoiceNumber || `invoice-${id}`}.pdf`);
  },

  getSendDefaults: (id: number): Promise<DocumentSendDefaults> =>
    handleApiResponse(
      api.get<ApiResponse<DocumentSendDefaults>>(
        `${INVOICES_URL}/${id}/send-defaults`
      )
    ),

  sendDocument: (
    id: number,
    data: DocumentSendPayload
  ): Promise<DocumentSendResult> =>
    handleApiResponse(
      api.post<ApiResponse<DocumentSendResult>>(
        `${INVOICES_URL}/${id}/send`,
        data
      )
    ),
};
