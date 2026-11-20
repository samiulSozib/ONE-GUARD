export type InvoiceStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "sent"
  | "partially_paid"
  | "paid"
  | "void";

export interface InvoiceFilters {
  period_start?: string;
  period_end?: string;
  client_id?: number;
  client_contract_id?: number;
  status?: InvoiceStatus | "";
  search?: string;
  page?: number;
  per_page?: number;
}

export type InvoiceSource = "manual" | "generated";
export type InvoiceTaxMode = "none" | "auto" | "percent" | "amount";

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  client_id: number;
  client_name: string | null;
  client_code: string | null;
  client_contract_id: number | null;
  contract_name: string | null;
  period_start: string;
  period_end: string;
  issue_date: string | null;
  due_date: string | null;
  status: InvoiceStatus;
  source?: InvoiceSource | string | null;
  currency: string | null;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  tax_mode?: InvoiceTaxMode | string | null;
  tax_rate?: number | null;
  total: number;
  amount_paid: number;
  balance_due: number;
  lines_count: number;
  is_overdue: boolean;
}

export interface InvoiceLine {
  id: number;
  client_contract_service_id: number | null;
  site_id: number | null;
  site_name: string | null;
  service_name: string | null;
  description: string;
  unit: string | null;
  quantity: number;
  unit_rate: number;
  amount: number;
  pricing_type: string | null;
  calculation_type: string | null;
  source_summary: Record<string, unknown> | null;
}

export interface InvoicePayment {
  id: number;
  amount: number;
  paid_at: string;
  method: string | null;
  reference: string | null;
  notes: string | null;
  recorded_by: string | null;
}

export interface InvoiceDetail extends InvoiceListItem {
  payment_terms: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  approved_at: string | null;
  sent_at: string | null;
  created_by: string | null;
  approved_by: string | null;
  client: {
    id: number;
    name: string | null;
    code: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  lines: InvoiceLine[];
  payments: InvoicePayment[];
}

export interface InvoiceSummary {
  total_invoices: number;
  drafts: number;
  overdue: number;
  mtd_billed: number;
  mtd_collected: number;
  open_balance: number;
}

export interface InvoiceListResponse {
  items: InvoiceListItem[];
  summary: InvoiceSummary;
  filters: InvoiceFilters;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface GenerateInvoiceDto {
  period_start: string;
  period_end: string;
  client_id?: number | null;
  client_contract_id?: number | null;
  replace_existing?: boolean;
  notes?: string | null;
}

export interface RecordPaymentDto {
  amount: number;
  paid_at: string;
  method?: string | null;
  reference?: string | null;
  notes?: string | null;
}

export interface ManualInvoiceLineDto {
  description: string;
  unit?: string | null;
  quantity: number;
  unit_rate: number;
  site_id?: number | null;
  client_contract_service_id?: number | null;
}

export interface CreateInvoiceDto {
  client_id: number;
  client_contract_id?: number | null;
  period_start: string;
  period_end: string;
  issue_date?: string | null;
  due_date?: string | null;
  currency?: string | null;
  payment_terms?: string | null;
  notes?: string | null;
  discount_total?: number | null;
  tax_mode?: InvoiceTaxMode;
  tax_rate?: number | null;
  tax_total?: number | null;
  lines: ManualInvoiceLineDto[];
}

export interface UpdateInvoiceDto {
  client_id?: number;
  client_contract_id?: number | null;
  period_start?: string;
  period_end?: string;
  issue_date?: string | null;
  due_date?: string | null;
  currency?: string | null;
  payment_terms?: string | null;
  notes?: string | null;
  discount_total?: number | null;
  tax_mode?: InvoiceTaxMode;
  tax_rate?: number | null;
  tax_total?: number | null;
  lines: ManualInvoiceLineDto[];
}
