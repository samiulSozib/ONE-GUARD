"use client";

import type { InvoiceTaxMode } from "@/app/types/invoice";

export interface LiveInvoicePreviewModel {
  invoice_number?: string;
  client_name?: string | null;
  client_code?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  client_address?: string | null;
  contract_name?: string | null;
  period_start?: string;
  period_end?: string;
  issue_date?: string | null;
  due_date?: string | null;
  payment_terms?: string | null;
  currency?: string | null;
  notes?: string | null;
  lines: Array<{
    description: string;
    unit?: string | null;
    quantity: number;
    unit_rate: number;
    amount: number;
  }>;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  tax_mode?: InvoiceTaxMode | string | null;
  tax_rate?: number | null;
  total: number;
  amount_paid?: number;
  balance_due: number;
}

function money(amount: number, currency?: string | null) {
  const formatted = Number(amount || 0).toFixed(2);
  return !currency || currency === "USD" ? `$${formatted}` : `${formatted} ${currency}`;
}

export default function InvoiceLivePreview({
  model,
  pdfUrl,
}: {
  model: LiveInvoicePreviewModel;
  pdfUrl?: string | null;
}) {
  return (
    <div className="flex h-full min-h-[640px] flex-col gap-3">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3 border-b pb-3">
          <div>
            <div className="text-base font-semibold">
              One<span className="text-[#8B0018]">Guard</span>
            </div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Private Security Services Inc.
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold uppercase tracking-wide">Invoice</div>
            <div className="text-xs text-muted-foreground">
              {model.invoice_number || "Draft preview"}
            </div>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded border bg-slate-50 p-2">
            <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">
              Bill To
            </div>
            <div className="font-medium">{model.client_name || "—"}</div>
            <div className="text-muted-foreground">{model.client_code}</div>
            <div>{model.client_address}</div>
            <div>{model.client_email}</div>
            <div>{model.client_phone}</div>
          </div>
          <div className="rounded border bg-slate-50 p-2">
            <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">
              Details
            </div>
            <div>Period: {model.period_start || "—"} → {model.period_end || "—"}</div>
            <div>Issued: {model.issue_date || "—"}</div>
            <div>Due: {model.due_date || "—"}</div>
            <div>Terms: {model.payment_terms || "—"}</div>
            <div>Contract: {model.contract_name || "—"}</div>
          </div>
        </div>

        <table className="mb-3 w-full text-xs">
          <thead>
            <tr className="border-y text-left">
              <th className="py-2">Description</th>
              <th className="py-2">Unit</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {model.lines.filter((l) => l.description.trim()).map((line, i) => (
              <tr key={`${line.description}-${i}`} className="border-b">
                <td className="py-1.5">{line.description}</td>
                <td className="py-1.5">{line.unit || "—"}</td>
                <td className="py-1.5 text-right">{Number(line.quantity).toFixed(2)}</td>
                <td className="py-1.5 text-right">
                  {money(line.unit_rate, model.currency)}
                </td>
                <td className="py-1.5 text-right font-medium">
                  {money(line.amount, model.currency)}
                </td>
              </tr>
            ))}
            {model.lines.filter((l) => l.description.trim()).length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  Add line items to preview.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="ml-auto w-52 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(model.subtotal, model.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>{money(model.discount_total, model.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              Sales tax
              {model.tax_mode === "auto" || model.tax_mode === "percent"
                ? ` (${Number(model.tax_rate || 0).toFixed(2)}%)`
                : ""}
            </span>
            <span>{money(model.tax_total, model.currency)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-sm font-semibold">
            <span>Amount due</span>
            <span>{money(model.balance_due, model.currency)}</span>
          </div>
        </div>

        {model.notes ? (
          <div className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">
            Notes: {model.notes}
          </div>
        ) : null}
      </div>

      <div className="min-h-[420px] flex-1 overflow-hidden rounded-lg border bg-slate-100">
        {pdfUrl ? (
          <iframe title="Invoice PDF preview" src={pdfUrl} className="h-full min-h-[420px] w-full" />
        ) : (
          <div className="flex h-full min-h-[420px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Save the draft to load an official PDF preview here.
            <br />
            Live HTML preview above updates as you type.
          </div>
        )}
      </div>
    </div>
  );
}

export function computeLiveTotals(input: {
  lines: Array<{ quantity: number; unit_rate: number }>;
  discount_total?: number;
  tax_mode?: InvoiceTaxMode | string;
  tax_rate?: number;
  tax_total?: number;
  amount_paid?: number;
}) {
  const subtotal = input.lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0) * Number(line.unit_rate || 0),
    0
  );
  const discount = Math.max(0, Number(input.discount_total || 0));
  const taxable = Math.max(0, subtotal - discount);
  const mode = input.tax_mode || "none";
  let tax = 0;
  if (mode === "amount") {
    tax = Math.max(0, Number(input.tax_total || 0));
  } else if (mode === "percent" || mode === "auto") {
    tax = (taxable * Number(input.tax_rate || 0)) / 100;
  }
  const total = Math.max(0, taxable + tax);
  const paid = Math.max(0, Number(input.amount_paid || 0));
  return {
    subtotal: round2(subtotal),
    discount_total: round2(discount),
    tax_total: round2(tax),
    total: round2(total),
    balance_due: round2(Math.max(0, total - paid)),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
