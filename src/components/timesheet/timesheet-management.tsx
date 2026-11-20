"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import SendDocumentDialog from "@/components/shared/send-document-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShiftEntitySearchSelect from "@/components/shift-operations/shift-entity-search-select";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchTimesheets } from "@/store/slices/timesheetSlice";
import { timesheetService } from "@/service/timesheet.service";
import type { TimesheetExportFormat, TimesheetFilters } from "@/app/types/timesheet";
import SweetAlertService from "@/lib/sweetAlert";

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const toIso = (d: Date) => d.toISOString().slice(0, 10);
  return { period_start: toIso(start), period_end: toIso(end) };
}

export default function TimesheetManagement() {
  const dispatch = useAppDispatch();
  const { items, summary, pagination, isLoading, error } = useAppSelector(
    (state) => state.timesheet
  );

  const defaults = useMemo(() => monthBounds(), []);

  // Draft filters (what admin edits)
  const [periodStart, setPeriodStart] = useState(defaults.period_start);
  const [periodEnd, setPeriodEnd] = useState(defaults.period_end);
  const [serviceMode, setServiceMode] = useState<string>("");
  const [guardId, setGuardId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState<TimesheetExportFormat | null>(null);
  const [sendOpen, setSendOpen] = useState(false);

  // Applied filters (what API uses)
  const [applied, setApplied] = useState<TimesheetFilters>({
    period_start: defaults.period_start,
    period_end: defaults.period_end,
    page: 1,
    per_page: 20,
  });

  const buildFilters = (nextPage = page): TimesheetFilters => ({
    period_start: periodStart,
    period_end: periodEnd,
    service_mode: (serviceMode as TimesheetFilters["service_mode"]) || undefined,
    guard_id: guardId ? Number(guardId) : undefined,
    site_id: siteId ? Number(siteId) : undefined,
    page: nextPage,
    per_page: 20,
  });

  const applyFilters = (nextPage = 1) => {
    const filters = buildFilters(nextPage);
    setPage(nextPage);
    setApplied(filters);
    dispatch(fetchTimesheets(filters));
  };

  useEffect(() => {
    dispatch(fetchTimesheets(applied));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page === applied.page) return;
    const filters = { ...applied, page, per_page: 20 };
    setApplied(filters);
    dispatch(fetchTimesheets(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const clearFilters = () => {
    const bounds = monthBounds();
    setPeriodStart(bounds.period_start);
    setPeriodEnd(bounds.period_end);
    setServiceMode("");
    setGuardId("");
    setSiteId("");
    setPage(1);
    const filters: TimesheetFilters = {
      period_start: bounds.period_start,
      period_end: bounds.period_end,
      page: 1,
      per_page: 20,
    };
    setApplied(filters);
    dispatch(fetchTimesheets(filters));
  };

  const handleExport = async (format: TimesheetExportFormat) => {
    try {
      setExporting(format);
      await timesheetService.exportTimesheets(format, {
        period_start: applied.period_start,
        period_end: applied.period_end,
        service_mode: applied.service_mode,
        guard_id: applied.guard_id,
        site_id: applied.site_id,
      });
      SweetAlertService.success("Exported", `Timesheet ${format.toUpperCase()} downloaded.`);
    } catch (e: any) {
      SweetAlertService.error("Export failed", e?.message || "Could not export timesheet.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Timesheet</h1>
          <p className="text-sm text-muted-foreground">
            Period hours, shifts, and pay from duty attendance for salary.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => applyFilters(page)} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport("csv")} disabled={!!exporting}>
            {exporting === "csv" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={!!exporting}>
            {exporting === "excel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Excel
          </Button>
          <Button onClick={() => handleExport("pdf")} disabled={!!exporting}>
            {exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            PDF
          </Button>
          <Button variant="outline" onClick={() => setSendOpen(true)}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Period start</label>
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Period end</label>
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Service mode</label>
            <Select
              value={serviceMode || "all"}
              onValueChange={(v) => setServiceMode(v === "all" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modes</SelectItem>
                <SelectItem value="continuous_shift">Continuous shift</SelectItem>
                <SelectItem value="patrol_visits">Patrol visits</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Guard</label>
            <ShiftEntitySearchSelect
              field="guard_id"
              value={guardId}
              onChange={setGuardId}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Site</label>
            <ShiftEntitySearchSelect
              field="site_id"
              value={siteId}
              onChange={setSiteId}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const bounds = monthBounds();
                setPeriodStart(bounds.period_start);
                setPeriodEnd(bounds.period_end);
              }}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              This month
            </Button>
            <Button onClick={() => applyFilters(1)} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
            <Button variant="outline" onClick={clearFilters} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Guards", value: summary?.guards ?? 0, icon: Users },
          { label: "Shifts", value: summary?.shift_count ?? 0 },
          { label: "Hours", value: summary?.total_working_hours ?? 0 },
          { label: "Payable", value: summary?.payable_amount ?? 0 },
          { label: "Incomplete", value: summary?.incomplete_shifts ?? 0 },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold">
              {typeof stat.value === "number" &&
              stat.label !== "Guards" &&
              stat.label !== "Shifts" &&
              stat.label !== "Incomplete"
                ? Number(stat.value).toFixed(2)
                : stat.value}
            </div>
          </Card>
        ))}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Guard</th>
                <th className="px-4 py-3 font-medium">Days</th>
                <th className="px-4 py-3 font-medium">Shifts</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Visits</th>
                <th className="px-4 py-3 font-medium">Computed</th>
                <th className="px-4 py-3 font-medium">Payable</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No attendance in this period.
                    <div className="mt-2 text-xs">
                      Local DB currently needs duty attendance data. Import from the server database
                      (or generate duties and check guards in/out) to see timesheet rows.
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading &&
                items.map((row) => (
                  <tr key={row.guard_id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.guard_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{row.guard_code}</div>
                    </td>
                    <td className="px-4 py-3">{row.days_worked}</td>
                    <td className="px-4 py-3">
                      {row.shift_count}
                      {row.incomplete_shifts > 0 && (
                        <span className="ml-1 text-xs text-amber-600">
                          +{row.incomplete_shifts} open
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.total_working_hours.toFixed(2)}</td>
                    <td className="px-4 py-3">{row.completed_visits}</td>
                    <td className="px-4 py-3">{row.computed_pay.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium">{row.payable_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/timesheet/${row.guard_id}?period_start=${applied.period_start}&period_end=${applied.period_end}`}
                        >
                          Open
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span>
              Page {pagination.current_page} of {pagination.last_page} · {pagination.total} guards
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <SendDocumentDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        documentType="timesheet"
        documentLabel="Timesheet summary"
        guardId={applied.guard_id}
        periodStart={applied.period_start}
        periodEnd={applied.period_end}
      />
    </div>
  );
}
