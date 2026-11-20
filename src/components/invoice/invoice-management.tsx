"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { FileText, Loader2, Plus, RefreshCw, Search, Wand2 } from "lucide-react";
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
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchInvoices,
  generateInvoices,
} from "@/store/slices/invoiceSlice";
import type { InvoiceStatus } from "@/app/types/invoice";
import SweetAlertService from "@/lib/sweetAlert";
import InvoiceCreateDialog from "@/components/invoice/invoice-create-dialog";

const statusBadge = (status: string, overdue?: boolean) => {
  if (overdue) return "border-red-200 bg-red-50 text-red-700";
  switch (status) {
    case "draft":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "approved":
    case "sent":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "partially_paid":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "void":
      return "border-zinc-200 bg-zinc-100 text-zinc-600";
    default:
      return "";
  }
};

interface Props {
  clientId?: number;
}

export default function InvoiceManagement({ clientId }: Props) {
  const dispatch = useAppDispatch();
  const { items, summary, pagination, isLoading, error } = useAppSelector(
    (s) => s.invoice
  );

  const defaultStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const defaultEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const [periodStart, setPeriodStart] = useState(defaultStart);
  const [periodEnd, setPeriodEnd] = useState(defaultEnd);
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const filters = useMemo(
    () => ({
      period_start: periodStart || undefined,
      period_end: periodEnd || undefined,
      status: status || undefined,
      search: search || undefined,
      client_id: clientId,
      page,
      per_page: 20,
    }),
    [periodStart, periodEnd, status, search, clientId, page]
  );

  const load = () => {
    dispatch(fetchInvoices(filters));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.period_start, filters.period_end, filters.status, filters.page, clientId]);

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) {
      SweetAlertService.error("Period required", "Set period start and end.");
      return;
    }
    try {
      setGenerating(true);
      const result = await dispatch(
        generateInvoices({
          period_start: periodStart,
          period_end: periodEnd,
          client_id: clientId || null,
          replace_existing: true,
        })
      ).unwrap();
      SweetAlertService.success(
        "Drafts created",
        (result as any)?.message || "Invoices generated."
      );
      load();
    } catch (e: any) {
      SweetAlertService.error("Generate failed", e || "Could not generate.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {clientId ? "Client billing" : "Invoices"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manual invoices anytime, or generate drafts from contract rates ×
            attendance / visits / shifts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={load} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate drafts
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["Invoices", summary?.total_invoices ?? 0],
          ["Drafts", summary?.drafts ?? 0],
          ["Overdue", summary?.overdue ?? 0],
          ["MTD billed", (summary?.mtd_billed ?? 0).toFixed(2)],
          ["MTD collected", (summary?.mtd_collected ?? 0).toFixed(2)],
          ["Open balance", (summary?.open_balance ?? 0).toFixed(2)],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-4">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>

      <Card className="grid grid-cols-1 gap-3 p-4 md:grid-cols-5">
        <div>
          <Label>Period start</Label>
          <Input
            type="date"
            value={periodStart}
            onChange={(e) => {
              setPage(1);
              setPeriodStart(e.target.value);
            }}
          />
        </div>
        <div>
          <Label>Period end</Label>
          <Input
            type="date"
            value={periodEnd}
            onChange={(e) => {
              setPage(1);
              setPeriodEnd(e.target.value);
            }}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={status || "all"}
            onValueChange={(v) => {
              setPage(1);
              setStatus(v === "all" ? "" : (v as InvoiceStatus));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="partially_paid">Partially paid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="void">Void</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Search</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Invoice # or client"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  load();
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                load();
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-2">Invoice</th>
                {!clientId && <th className="px-4 py-2">Client</th>}
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Balance</th>
                <th className="px-4 py-2">Due</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-2 font-medium">{row.invoice_number}</td>
                    {!clientId && (
                      <td className="px-4 py-2">
                        <div>{row.client_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.client_code}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-2 text-xs">
                      {row.period_start} → {row.period_end}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">
                        {row.source === "generated" ? "Generated" : "Manual"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant="outline"
                        className={statusBadge(row.status, row.is_overdue)}
                      >
                        {row.is_overdue ? "Overdue" : row.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      {row.total.toFixed(2)} {row.currency || ""}
                    </td>
                    <td className="px-4 py-2">{row.balance_due.toFixed(2)}</td>
                    <td className="px-4 py-2">{row.due_date || "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/invoices/${row.id}`}>
                          <FileText className="mr-1 h-4 w-4" />
                          Open
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <div className="space-y-2">
                      <div>No invoices yet for this period.</div>
                      <div className="text-xs">
                        Use <strong>Create invoice</strong> for manual billing, or{" "}
                        <strong>Generate drafts</strong> when contract services are
                        linked to duties with completed attendance.
                      </div>
                      <div className="flex justify-center gap-2 pt-2">
                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                          <Plus className="mr-1 h-4 w-4" />
                          Create invoice
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGenerate}
                          disabled={generating}
                        >
                          <Wand2 className="mr-1 h-4 w-4" />
                          Generate drafts
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <InvoiceCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clientId={clientId}
        onCreated={load}
      />
    </div>
  );
}
