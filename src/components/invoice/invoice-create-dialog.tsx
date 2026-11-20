"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import type { Client } from "@/app/types/client";
import { EntityFieldWithCreate } from "@/components/shared/entity-field-with-create";
import { ClientCreateForm } from "@/components/clients/client-create-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchClients } from "@/store/slices/clientSlice";
import { createInvoice } from "@/store/slices/invoiceSlice";
import type { InvoiceTaxMode, ManualInvoiceLineDto } from "@/app/types/invoice";
import SweetAlertService from "@/lib/sweetAlert";
import { computeLiveTotals } from "@/components/invoice/invoice-live-preview";

type LineDraft = ManualInvoiceLineDto & { key: string };

const emptyLine = (): LineDraft => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  description: "",
  unit: "fixed",
  quantity: 1,
  unit_rate: 0,
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: number;
  onCreated?: () => void;
}

export default function InvoiceCreateDialog({
  open,
  onOpenChange,
  clientId,
  onCreated,
}: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { clients } = useAppSelector((s) => s.client);

  const defaultStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const defaultEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const [selectedClientId, setSelectedClientId] = useState<string>(
    clientId ? String(clientId) : ""
  );
  const [periodStart, setPeriodStart] = useState(defaultStart);
  const [periodEnd, setPeriodEnd] = useState(defaultEnd);
  const [currency, setCurrency] = useState("USD");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [notes, setNotes] = useState("");
  const [discountTotal, setDiscountTotal] = useState("0");
  const [taxMode, setTaxMode] = useState<InvoiceTaxMode>("none");
  const [taxRate, setTaxRate] = useState("0");
  const [taxAmount, setTaxAmount] = useState("0");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientCreateOpen, setClientCreateOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (clientId) setSelectedClientId(String(clientId));
    dispatch(fetchClients({ page: 1, per_page: 100 }));
  }, [open, clientId, dispatch]);

  const totals = useMemo(
    () =>
      computeLiveTotals({
        lines,
        discount_total: Number(discountTotal || 0),
        tax_mode: taxMode,
        tax_rate: Number(taxRate || 0),
        tax_total: Number(taxAmount || 0),
      }),
    [lines, discountTotal, taxMode, taxRate, taxAmount]
  );

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      SweetAlertService.error("Client required", "Pick a client for this invoice.");
      return;
    }
    if (!periodStart || !periodEnd) {
      SweetAlertService.error("Period required", "Set period start and end.");
      return;
    }
    const validLines = lines.filter((l) => l.description.trim());
    if (validLines.length === 0) {
      SweetAlertService.error("Lines required", "Add at least one line description.");
      return;
    }

    try {
      setSaving(true);
      const invoice = await dispatch(
        createInvoice({
          client_id: Number(selectedClientId),
          period_start: periodStart,
          period_end: periodEnd,
          currency: currency || "USD",
          payment_terms: paymentTerms || null,
          notes: notes || null,
          discount_total: Number(discountTotal || 0),
          tax_mode: taxMode,
          tax_rate: Number(taxRate || 0),
          tax_total: Number(taxAmount || 0),
          lines: validLines.map(({ description, unit, quantity, unit_rate }) => ({
            description: description.trim(),
            unit: unit || "fixed",
            quantity: Number(quantity) || 0,
            unit_rate: Number(unit_rate) || 0,
          })),
        })
      ).unwrap();

      SweetAlertService.success("Draft created", invoice.invoice_number);
      onOpenChange(false);
      onCreated?.();
      router.push(`/invoices/${invoice.id}`);
    } catch (e: any) {
      SweetAlertService.error("Create failed", e || "Could not create invoice.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <EntityFieldWithCreate
              label="Client"
              required
              createTitle="Create new client"
              onCreateClick={() => setClientCreateOpen(true)}
              dropdownProps={{
                value: selectedClientId,
                onValueChange: (value) => setSelectedClientId(String(value)),
                options: clients.map((c: Client) => ({
                  value: c.id,
                  label: `${c.company_name || c.full_name || `Client #${c.id}`}${c.client_code ? ` (${c.client_code})` : ""}`,
                  ...c,
                })),
                onSearch: (search) => {
                  setClientSearch(search);
                  dispatch(fetchClients({ page: 1, per_page: 50, search }));
                },
                placeholder: "Select client",
                disabled: !!clientId,
                emptyMessage: clientSearch ? "No clients found" : "No clients available",
                searchPlaceholder: "Search clients...",
                icon: Users,
                iconPosition: "left",
                displayValue: (value, options) => {
                  if (!value) return "Select client";
                  const option = options.find((opt) => String(opt.value) === String(value));
                  return option?.label || "Select client";
                },
              }}
            />
          </div>
          <div>
            <Label>Period start</Label>
            <Input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div>
            <Label>Period end</Label>
            <Input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
          <div>
            <Label>Currency</Label>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div>
            <Label>Payment terms</Label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="Net 30"
            />
          </div>
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
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Line items</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setLines((prev) => [...prev, emptyLine()])}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add line
            </Button>
          </div>
          {lines.map((line) => (
            <div
              key={line.key}
              className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-12"
            >
              <div className="md:col-span-5">
                <Label className="text-xs">Description</Label>
                <Input
                  value={line.description}
                  onChange={(e) =>
                    updateLine(line.key, { description: e.target.value })
                  }
                  placeholder="Security coverage — Site A"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Unit</Label>
                <Select
                  value={line.unit || "fixed"}
                  onValueChange={(v) => updateLine(line.key, { unit: v })}
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
                    updateLine(line.key, { quantity: Number(e.target.value) })
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
                    updateLine(line.key, { unit_rate: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex items-end md:col-span-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={lines.length <= 1}
                  onClick={() =>
                    setLines((prev) => prev.filter((l) => l.key !== line.key))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="space-y-1 text-right text-sm">
            <div>Subtotal: {totals.subtotal.toFixed(2)}</div>
            <div>Tax: {totals.tax_total.toFixed(2)}</div>
            <div className="font-medium">
              Amount due: {totals.balance_due.toFixed(2)} {currency || ""}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ClientCreateForm
      trigger={<div />}
      isOpen={clientCreateOpen}
      onOpenChange={setClientCreateOpen}
      onSuccess={() => {
        dispatch(fetchClients({ page: 1, per_page: 100 }));
        setClientCreateOpen(false);
      }}
    />
    </>
  );
}
