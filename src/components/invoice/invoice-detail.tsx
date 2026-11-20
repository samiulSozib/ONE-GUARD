"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileDown,
  Loader2,
  Send,
  Ban,
  Wallet,
  Plus,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  clearInvoiceDetail,
  fetchInvoice,
  recordInvoicePayment,
  updateInvoice,
  updateInvoiceStatus,
} from "@/store/slices/invoiceSlice";
import { invoiceService } from "@/service/invoice.service";
import type {
  InvoiceStatus,
  InvoiceTaxMode,
  ManualInvoiceLineDto,
} from "@/app/types/invoice";
import SweetAlertService from "@/lib/sweetAlert";
import InvoiceLivePreview, {
  computeLiveTotals,
} from "@/components/invoice/invoice-live-preview";
import SendDocumentDialog from "@/components/shared/send-document-dialog";
import Can from "@/components/auth/can";

type LineDraft = ManualInvoiceLineDto & { key: string };

function toDraftLines(
  lines: {
    description: string;
    unit: string | null;
    quantity: number;
    unit_rate: number;
  }[]
): LineDraft[] {
  if (!lines.length) {
    return [
      {
        key: "new-1",
        description: "",
        unit: "fixed",
        quantity: 1,
        unit_rate: 0,
      },
    ];
  }
  return lines.map((line, i) => ({
    key: `line-${i}-${line.description}`,
    description: line.description,
    unit: line.unit || "fixed",
    quantity: line.quantity,
    unit_rate: line.unit_rate,
  }));
}

export default function InvoiceDetail({ invoiceId }: { invoiceId: number }) {
  const dispatch = useAppDispatch();
  const { detail, isDetailLoading, error } = useAppSelector((s) => s.invoice);
  const [busy, setBusy] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payMethod, setPayMethod] = useState("bank_transfer");
  const [payRef, setPayRef] = useState("");

  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [discountTotal, setDiscountTotal] = useState("0");
  const [taxMode, setTaxMode] = useState<InvoiceTaxMode>("none");
  const [taxRate, setTaxRate] = useState("0");
  const [taxAmount, setTaxAmount] = useState("0");
  const [editLines, setEditLines] = useState<LineDraft[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  const canEdit =
    detail?.status === "draft" || detail?.status === "pending_review";
  const source =
    detail?.source ||
    (detail?.metadata?.source as string | undefined) ||
    (detail?.metadata?.generated_from ? "generated" : "manual");

  const liveTotals = useMemo(
    () =>
      computeLiveTotals({
        lines: editLines,
        discount_total: Number(discountTotal || 0),
        tax_mode: taxMode,
        tax_rate: Number(taxRate || 0),
        tax_total: Number(taxAmount || 0),
        amount_paid: detail?.amount_paid || 0,
      }),
    [editLines, discountTotal, taxMode, taxRate, taxAmount, detail?.amount_paid]
  );

  const previewModel = useMemo(
    () => ({
      invoice_number: detail?.invoice_number,
      client_name: detail?.client?.name,
      client_code: detail?.client?.code,
      client_email: detail?.client?.email,
      client_phone: detail?.client?.phone,
      client_address: detail?.client?.address,
      contract_name: detail?.contract_name,
      period_start: detail?.period_start,
      period_end: detail?.period_end,
      issue_date: detail?.issue_date,
      due_date: dueDate || detail?.due_date,
      payment_terms: paymentTerms || detail?.payment_terms,
      currency: currency || detail?.currency,
      notes,
      lines: editLines.map((l) => ({
        description: l.description,
        unit: l.unit,
        quantity: Number(l.quantity || 0),
        unit_rate: Number(l.unit_rate || 0),
        amount: Number(l.quantity || 0) * Number(l.unit_rate || 0),
      })),
      subtotal: liveTotals.subtotal,
      discount_total: liveTotals.discount_total,
      tax_total: liveTotals.tax_total,
      tax_mode: taxMode,
      tax_rate: Number(taxRate || 0),
      total: liveTotals.total,
      amount_paid: detail?.amount_paid || 0,
      balance_due: liveTotals.balance_due,
    }),
    [
      detail,
      dueDate,
      paymentTerms,
      currency,
      notes,
      editLines,
      liveTotals,
      taxMode,
      taxRate,
    ]
  );

  const loadPdfPreview = async () => {
    try {
      setPdfLoading(true);
      const blob = await invoiceService.getPdfBlob(invoiceId);
      const url = URL.createObjectURL(blob);
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      // keep live HTML preview even if PDF fails
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchInvoice(invoiceId));
    return () => {
      dispatch(clearInvoiceDetail());
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [dispatch, invoiceId]);

  useEffect(() => {
    if (!detail) return;
    setNotes(detail.notes || "");
    setPaymentTerms(detail.payment_terms || "");
    setDueDate(detail.due_date || "");
    setCurrency(detail.currency || "USD");
    setDiscountTotal(String(detail.discount_total ?? 0));
    setTaxMode((detail.tax_mode as InvoiceTaxMode) || "none");
    setTaxRate(String(detail.tax_rate ?? 0));
    setTaxAmount(String(detail.tax_total ?? 0));
    setEditLines(toDraftLines(detail.lines));
    loadPdfPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const setStatus = async (status: InvoiceStatus) => {
    try {
      setBusy(true);
      await dispatch(updateInvoiceStatus({ id: invoiceId, status })).unwrap();
      SweetAlertService.success(
        "Updated",
        `Invoice marked ${status.replaceAll("_", " ")}.`
      );
      await loadPdfPreview();
    } catch (e: any) {
      SweetAlertService.error("Update failed", e || "Could not update status.");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveDraft = async () => {
    const validLines = editLines.filter((l) => l.description.trim());
    if (validLines.length === 0) {
      SweetAlertService.error("Lines required", "Keep at least one line.");
      return;
    }
    try {
      setBusy(true);
      await dispatch(
        updateInvoice({
          id: invoiceId,
          data: {
            notes: notes || null,
            payment_terms: paymentTerms || null,
            due_date: dueDate || null,
            currency: currency || "USD",
            discount_total: Number(discountTotal || 0),
            tax_mode: taxMode,
            tax_rate: Number(taxRate || 0),
            tax_total: Number(taxAmount || 0),
            lines: validLines.map((l) => ({
              description: l.description.trim(),
              unit: l.unit || "fixed",
              quantity: Number(l.quantity) || 0,
              unit_rate: Number(l.unit_rate) || 0,
            })),
          },
        })
      ).unwrap();
      SweetAlertService.success("Saved", "Draft updated. PDF preview refreshed.");
      await loadPdfPreview();
    } catch (e: any) {
      SweetAlertService.error("Save failed", e || "Could not update invoice.");
    } finally {
      setBusy(false);
    }
  };

  const handlePayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      SweetAlertService.error("Amount required", "Enter a payment amount.");
      return;
    }
    try {
      setBusy(true);
      await dispatch(
        recordInvoicePayment({
          id: invoiceId,
          data: {
            amount: Number(payAmount),
            paid_at: payDate,
            method: payMethod,
            reference: payRef || null,
          },
        })
      ).unwrap();
      setPayAmount("");
      setPayRef("");
      SweetAlertService.success("Payment recorded", "Balance updated.");
      await loadPdfPreview();
    } catch (e: any) {
      SweetAlertService.error("Payment failed", e || "Could not record payment.");
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = async () => {
    try {
      setBusy(true);
      await invoiceService.downloadPdf(invoiceId, detail?.invoice_number);
    } catch (e: any) {
      SweetAlertService.error("PDF failed", e?.message || "Could not download PDF.");
    } finally {
      setBusy(false);
    }
  };

  if (isDetailLoading && !detail) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4 p-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Invoice not found."}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All invoices
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{detail.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">
            {detail.client.name} · {detail.period_start} → {detail.period_end}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="outline">
              {detail.is_overdue ? "Overdue · " : ""}
              {detail.status.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline">
              {source === "generated" ? "Generated" : "Manual"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={busy || pdfLoading} onClick={loadPdfPreview}>
            {pdfLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh PDF
          </Button>
          <Button variant="outline" disabled={busy} onClick={downloadPdf}>
            <FileDown className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Can permission="invoices.send">
            <Button variant="outline" disabled={busy} onClick={() => setSendOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </Can>
          {canEdit && (
            <Button disabled={busy} onClick={handleSaveDraft}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save & preview
            </Button>
          )}
          {detail.status === "draft" && (
            <Button disabled={busy} onClick={() => setStatus("approved")}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          {["approved", "draft", "pending_review"].includes(detail.status) && (
            <Button disabled={busy} onClick={() => setStatus("sent")}>
              <Send className="mr-2 h-4 w-4" />
              Mark sent
            </Button>
          )}
          {detail.status !== "void" && detail.status !== "paid" && (
            <Button variant="outline" disabled={busy} onClick={() => setStatus("void")}>
              <Ban className="mr-2 h-4 w-4" />
              Void
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Card className="space-y-3 p-4">
            <h2 className="font-medium">Live editor</h2>
            <p className="text-xs text-muted-foreground">
              Edit lines, tax, and notes. The preview updates live; save to refresh the official PDF.
            </p>

            {canEdit ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Currency</Label>
                    <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
                  </div>
                  <div>
                    <Label>Due date</Label>
                    <Input
                      type="date"
                      value={dueDate || ""}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Payment terms</Label>
                    <Input
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Net 30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Discount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountTotal}
                      onChange={(e) => setDiscountTotal(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Tax mode</Label>
                    <Select
                      value={taxMode}
                      onValueChange={(v) => setTaxMode(v as InvoiceTaxMode)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No tax</SelectItem>
                        <SelectItem value="auto">Automatic (% rate)</SelectItem>
                        <SelectItem value="percent">Manual percent</SelectItem>
                        <SelectItem value="amount">Manual amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(taxMode === "auto" || taxMode === "percent") && (
                    <div>
                      <Label>Tax rate %</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                      />
                    </div>
                  )}
                  {taxMode === "amount" && (
                    <div>
                      <Label>Tax amount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={taxAmount}
                        onChange={(e) => setTaxAmount(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Line items</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditLines((prev) => [
                        ...prev,
                        {
                          key: `new-${Date.now()}`,
                          description: "",
                          unit: "fixed",
                          quantity: 1,
                          unit_rate: 0,
                        },
                      ])
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add line
                  </Button>
                </div>

                {editLines.map((line) => (
                  <div
                    key={line.key}
                    className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-12"
                  >
                    <div className="md:col-span-5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={line.description}
                        onChange={(e) =>
                          setEditLines((prev) =>
                            prev.map((l) =>
                              l.key === line.key
                                ? { ...l, description: e.target.value }
                                : l
                            )
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Unit</Label>
                      <Select
                        value={line.unit || "fixed"}
                        onValueChange={(v) =>
                          setEditLines((prev) =>
                            prev.map((l) =>
                              l.key === line.key ? { ...l, unit: v } : l
                            )
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="shift">Shift</SelectItem>
                          <SelectItem value="visit">Visit</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="qty">Qty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) =>
                          setEditLines((prev) =>
                            prev.map((l) =>
                              l.key === line.key
                                ? { ...l, quantity: Number(e.target.value) }
                                : l
                            )
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Rate</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unit_rate}
                        onChange={(e) =>
                          setEditLines((prev) =>
                            prev.map((l) =>
                              l.key === line.key
                                ? { ...l, unit_rate: Number(e.target.value) }
                                : l
                            )
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end md:col-span-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={editLines.length <= 1}
                        onClick={() =>
                          setEditLines((prev) =>
                            prev.filter((l) => l.key !== line.key)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="rounded-md bg-muted/40 p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Live subtotal</span>
                    <span>{liveTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Live tax</span>
                    <span>{liveTotals.tax_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Live amount due</span>
                    <span>{liveTotals.balance_due.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                This invoice is {detail.status.replaceAll("_", " ")}. Editing is locked;
                you can still preview and download the PDF.
              </div>
            )}
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="flex items-center gap-2 font-medium">
              <Wallet className="h-4 w-4" />
              Record payment
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder={String(detail.balance_due)}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Method</Label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reference</Label>
                <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} />
              </div>
            </div>
            <Button
              disabled={busy || detail.status === "draft" || detail.status === "void"}
              onClick={handlePayment}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save payment
            </Button>
          </Card>
        </div>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Live preview</h2>
            <span className="text-xs text-muted-foreground">
              HTML live · PDF after save
            </span>
          </div>
          <InvoiceLivePreview model={previewModel} pdfUrl={pdfUrl} />
        </Card>
      </div>

      <SendDocumentDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        documentType="invoice"
        documentLabel={detail.invoice_number}
        invoiceId={invoiceId}
        defaultTo={detail.client?.email}
        defaultWhatsapp={detail.client?.phone}
        onSent={() => dispatch(fetchInvoice(invoiceId))}
      />
    </div>
  );
}
