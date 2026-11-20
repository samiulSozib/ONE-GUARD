"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Loader2,
  Download,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import SendDocumentDialog from "@/components/shared/send-document-dialog";
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
  clearTimesheetManualPay,
  fetchTimesheetGuardReport,
  saveTimesheetManualPay,
} from "@/store/slices/timesheetSlice";
import { timesheetService } from "@/service/timesheet.service";
import { dutyService } from "@/service/duty.service";
import type {
  GuardPayBasis,
  ManualPayBasis,
  TimesheetExportFormat,
  TimesheetLine,
  TimesheetTiming,
} from "@/app/types/timesheet";
import SweetAlertService from "@/lib/sweetAlert";

type DutyPayDraft = {
  basis: GuardPayBasis;
  rate: string;
};

type LineFilter = "all" | "late" | "short" | "incomplete" | "patrol";

interface Props {
  guardId: number;
  periodStart: string;
  periodEnd: string;
}

const adminTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const isSameTimezone = (siteTimezone?: string | null) => {
  if (!siteTimezone) return true;
  return siteTimezone === adminTimezone();
};

const formatInTz = (
  value: string | null | undefined,
  timezone: string | null | undefined,
  pattern = "MMM d, HH:mm"
) => {
  if (!value) return "—";
  try {
    return formatInTimeZone(new Date(value), timezone || "UTC", pattern);
  } catch {
    return value;
  }
};

const formatClockRange = (
  start: string | null | undefined,
  end: string | null | undefined,
  timezone: string | null | undefined
) => {
  if (!start && !end) return "—";
  return `${formatInTz(start, timezone, "HH:mm")}–${formatInTz(end, timezone, "HH:mm")}`;
};

const timingLabel = (timing: TimesheetTiming | null | undefined) => {
  if (!timing) return null;
  const mins = Math.abs(timing.difference_minutes);
  const suffix = mins ? ` ${mins}m` : "";
  if (timing.classification === "late") return `Late${suffix}`;
  if (timing.classification === "early") return `Early${suffix}`;
  return "On time";
};

const timingBadgeClass = (timing: TimesheetTiming | null | undefined) => {
  if (!timing) return "";
  if (timing.classification === "late") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (timing.classification === "early") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
};

const varianceText = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
};

const varianceClass = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "";
  if (value < -0.25) return "text-red-600";
  if (value > 0.25) return "text-emerald-600";
  return "text-muted-foreground";
};

function DualTime({
  value,
  siteTimezone,
  pattern = "MMM d, HH:mm",
}: {
  value: string | null | undefined;
  siteTimezone?: string | null;
  pattern?: string;
}) {
  const site = formatInTz(value, siteTimezone, pattern);
  if (!value || isSameTimezone(siteTimezone)) {
    return <span>{site}</span>;
  }

  return (
    <span className="block space-y-0.5">
      <span className="block">{site}</span>
      <span className="block text-[10px] text-blue-600">
        You: {formatInTz(value, adminTimezone(), pattern)}
      </span>
    </span>
  );
}

export default function TimesheetGuardDetail({
  guardId,
  periodStart,
  periodEnd,
}: Props) {
  const dispatch = useAppDispatch();
  const { report, isReportLoading, error } = useAppSelector((state) => state.timesheet);
  const [exporting, setExporting] = useState<TimesheetExportFormat | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [payBasis, setPayBasis] = useState<ManualPayBasis>("fixed");
  const [manualRate, setManualRate] = useState<string>("");
  const [manualTotal, setManualTotal] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [savingPay, setSavingPay] = useState(false);
  const [dutyPayDrafts, setDutyPayDrafts] = useState<Record<number, DutyPayDraft>>({});
  const [savingDutyId, setSavingDutyId] = useState<number | null>(null);
  const [lineFilter, setLineFilter] = useState<LineFilter>("all");

  const filters = {
    period_start: periodStart,
    period_end: periodEnd,
  };

  const load = () => {
    dispatch(fetchTimesheetGuardReport({ guardId, filters }));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardId, periodStart, periodEnd]);

  useEffect(() => {
    if (!report?.manual_pay) {
      setPayBasis("fixed");
      setManualRate("");
      setManualTotal("");
      setNotes("");
      return;
    }
    setPayBasis(report.manual_pay.pay_basis);
    setManualRate(
      report.manual_pay.manual_rate !== null ? String(report.manual_pay.manual_rate) : ""
    );
    setManualTotal(
      report.manual_pay.manual_total_amount !== null
        ? String(report.manual_pay.manual_total_amount)
        : ""
    );
    setNotes(report.manual_pay.notes || "");
  }, [report?.manual_pay]);

  useEffect(() => {
    if (!report?.by_duty) return;
    const next: Record<number, DutyPayDraft> = {};
    report.by_duty.forEach((row) => {
      if (!row.duty_id) return;
      const defaultBasis: GuardPayBasis =
        row.service_mode === "patrol_visits" ? "per_visit" : "per_shift";
      next[row.duty_id] = {
        basis: (row.guard_pay_basis as GuardPayBasis) || defaultBasis,
        rate:
          row.guard_pay_rate !== null && row.guard_pay_rate !== undefined
            ? String(row.guard_pay_rate)
            : "",
      };
    });
    setDutyPayDrafts(next);
  }, [report?.by_duty]);

  const updateDutyDraft = (dutyId: number, patch: Partial<DutyPayDraft>) => {
    setDutyPayDrafts((prev) => ({
      ...prev,
      [dutyId]: {
        basis: prev[dutyId]?.basis || "per_shift",
        rate: prev[dutyId]?.rate || "",
        ...patch,
      },
    }));
  };

  const handleSaveDutyPay = async (dutyId: number) => {
    const draft = dutyPayDrafts[dutyId];
    if (!draft) return;
    if (draft.rate === "" || Number.isNaN(Number(draft.rate))) {
      SweetAlertService.error("Rate required", "Enter a cost/rate for this shift.");
      return;
    }

    try {
      setSavingDutyId(dutyId);
      await dutyService.updateDuty(dutyId, {
        guard_pay_basis: draft.basis,
        guard_pay_rate: Number(draft.rate),
      });
      SweetAlertService.success("Shift cost saved", "Pay rate updated for this duty.");
      load();
    } catch (e: any) {
      SweetAlertService.error("Save failed", e?.message || "Could not update shift cost.");
    } finally {
      setSavingDutyId(null);
    }
  };

  const handleExport = async (format: TimesheetExportFormat) => {
    try {
      setExporting(format);
      await timesheetService.exportTimesheets(format, {
        ...filters,
        guard_id: guardId,
      });
      SweetAlertService.success("Exported", `Guard timesheet ${format.toUpperCase()} downloaded.`);
    } catch (e: any) {
      SweetAlertService.error("Export failed", e?.message || "Could not export.");
    } finally {
      setExporting(null);
    }
  };

  const handleSavePay = async () => {
    try {
      setSavingPay(true);
      await dispatch(
        saveTimesheetManualPay({
          guardId,
          data: {
            ...filters,
            pay_basis: payBasis,
            manual_rate: manualRate === "" ? null : Number(manualRate),
            manual_total_amount: manualTotal === "" ? null : Number(manualTotal),
            notes: notes || null,
          },
        })
      ).unwrap();
      SweetAlertService.success("Saved", "Manual pay saved for this period.");
      load();
    } catch (e: any) {
      SweetAlertService.error("Save failed", e || "Could not save manual pay.");
    } finally {
      setSavingPay(false);
    }
  };

  const handleClearPay = async () => {
    try {
      setSavingPay(true);
      await dispatch(clearTimesheetManualPay({ guardId, filters })).unwrap();
      SweetAlertService.success("Cleared", "Manual pay removed.");
      load();
    } catch (e: any) {
      SweetAlertService.error("Clear failed", e || "Could not clear manual pay.");
    } finally {
      setSavingPay(false);
    }
  };

  const summary = report?.summary;

  const filteredLines = useMemo(() => {
    const lines = report?.lines || [];
    return lines.filter((line: TimesheetLine) => {
      if (lineFilter === "late") {
        return line.is_late_check_in || line.is_late_check_out;
      }
      if (lineFilter === "short") {
        return !!line.is_short_shift || (line.visits_shortfall ?? 0) > 0;
      }
      if (lineFilter === "incomplete") {
        return !line.is_completed || !!line.visits_incomplete;
      }
      if (lineFilter === "patrol") return line.service_mode === "patrol_visits";
      return true;
    });
  }, [report?.lines, lineFilter]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link href={`/timesheet?period_start=${periodStart}&period_end=${periodEnd}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">
            {summary?.guard_name || `Guard #${guardId}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {periodStart} → {periodEnd}
            {summary?.guard_code ? ` · ${summary.guard_code}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")} disabled={!!exporting}>
            {exporting === "csv" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={!!exporting}>
            {exporting === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Excel
          </Button>
          <Button onClick={() => handleExport("pdf")} disabled={!!exporting}>
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            PDF
          </Button>
          <Button variant="outline" onClick={() => setSendOpen(true)}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</Card>
      )}

      {isReportLoading && !report ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {[
              ["Days", summary?.days_worked ?? 0],
              ["Shifts", summary?.shift_count ?? 0],
              ["Worked h", summary?.total_working_hours ?? 0],
              ["Scheduled h", summary?.scheduled_hours ?? 0],
              ["Computed", summary?.computed_pay ?? 0],
              ["Payable", summary?.payable_amount ?? 0],
            ].map(([label, value]) => (
              <Card key={String(label)} className="p-4">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 text-xl font-semibold">
                  {typeof value === "number" &&
                  ["Worked h", "Scheduled h", "Computed", "Payable"].includes(String(label))
                    ? Number(value).toFixed(2)
                    : value}
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              ["Late in", summary?.late_check_ins ?? 0],
              ["Late out", summary?.late_check_outs ?? 0],
              ["Short shifts", summary?.short_shifts ?? 0],
              [
                "Visits",
                `${summary?.completed_visits ?? 0}/${summary?.required_visits ?? 0}`,
              ],
              ["Visit shortfall", summary?.visits_shortfall ?? 0],
            ].map(([label, value]) => (
              <Card key={String(label)} className="p-4">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 text-lg font-semibold">{value}</div>
              </Card>
            ))}
          </div>

          <Card className="space-y-4 p-4">
            <div>
              <h2 className="text-lg font-medium">Manual pay (optional)</h2>
              <p className="text-sm text-muted-foreground">
                Override or set a period amount. Schedule rates still drive computed pay on lines.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <Label>Basis</Label>
                <Select value={payBasis} onValueChange={(v) => setPayBasis(v as ManualPayBasis)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed total</SelectItem>
                    <SelectItem value="per_hour">Per hour</SelectItem>
                    <SelectItem value="per_shift">Per shift</SelectItem>
                    <SelectItem value="per_day">Per day</SelectItem>
                    <SelectItem value="adjustment">Adjustment total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualRate}
                  onChange={(e) => setManualRate(e.target.value)}
                  disabled={payBasis === "fixed" || payBasis === "adjustment"}
                />
              </div>
              <div>
                <Label>Total amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualTotal}
                  onChange={(e) => setManualTotal(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSavePay} disabled={savingPay} className="flex-1">
                  {savingPay ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearPay}
                  disabled={savingPay || !report?.manual_pay}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b px-4 py-3 font-medium">By site</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="px-4 py-2">Site</th>
                    <th className="px-4 py-2">Days</th>
                    <th className="px-4 py-2">Shifts</th>
                    <th className="px-4 py-2">Window / sched</th>
                    <th className="px-4 py-2">Worked</th>
                    <th className="px-4 py-2">Variance</th>
                    <th className="px-4 py-2">Visits</th>
                    <th className="px-4 py-2">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {(report?.by_site || []).map((row) => (
                    <tr key={`${row.site_id}-${row.site_name}`} className="border-t">
                      <td className="px-4 py-2">
                        <div>{row.site_name || "—"}</div>
                        {row.site_timezone && !isSameTimezone(row.site_timezone) && (
                          <div className="text-[10px] text-muted-foreground">
                            {row.site_timezone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">{row.days_worked}</td>
                      <td className="px-4 py-2">{row.shift_count}</td>
                      <td className="px-4 py-2">{(row.scheduled_hours ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-2">{row.total_working_hours.toFixed(2)}</td>
                      <td className={`px-4 py-2 ${varianceClass(row.hours_variance)}`}>
                        {row.hours_variance === null || row.hours_variance === undefined
                          ? "—"
                          : varianceText(row.hours_variance)}
                      </td>
                      <td className="px-4 py-2">
                        {row.completed_visits}/{row.required_visits}
                        {(row.visits_shortfall ?? 0) > 0 && (
                          <div className="text-[10px] text-red-600">
                            short {row.visits_shortfall}
                          </div>
                        )}
                        {row.visit_hours ? (
                          <div className="text-[10px] text-muted-foreground">
                            {row.visit_hours.toFixed(2)}h visits
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-2">{row.computed_pay.toFixed(2)}</td>
                    </tr>
                  ))}
                  {(report?.by_site || []).length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                        No completed shifts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b px-4 py-3">
              <div className="font-medium">By duty / shift</div>
              <p className="text-xs text-muted-foreground">
                Set cost per shift: choose basis + rate, then Save. Pay recalculates from attendance.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="px-4 py-2">Duty</th>
                    <th className="px-4 py-2">Mode</th>
                    <th className="px-4 py-2">Shifts</th>
                    <th className="px-4 py-2">Window / sched</th>
                    <th className="px-4 py-2">Worked</th>
                    <th className="px-4 py-2">Variance</th>
                    <th className="px-4 py-2">Visits</th>
                    <th className="px-4 py-2 min-w-[140px]">Pay basis</th>
                    <th className="px-4 py-2 min-w-[120px]">Cost / rate</th>
                    <th className="px-4 py-2">Pay</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(report?.by_duty || []).map((row) => {
                    const dutyId = row.duty_id;
                    if (!dutyId) return null;
                    const draft = dutyPayDrafts[dutyId] || {
                      basis: "per_shift" as GuardPayBasis,
                      rate: "",
                    };
                    return (
                      <tr key={`${dutyId}`} className="border-t">
                        <td className="px-4 py-2">
                          <div className="font-medium">{row.duty_title || "—"}</div>
                          <div className="text-xs text-muted-foreground">{row.site_name}</div>
                          {row.site_timezone && !isSameTimezone(row.site_timezone) && (
                            <div className="text-[10px] text-muted-foreground">
                              {row.site_timezone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {(row.service_mode || "").replaceAll("_", " ")}
                        </td>
                        <td className="px-4 py-2">{row.shift_count}</td>
                        <td className="px-4 py-2">
                          {(row.scheduled_hours ?? 0).toFixed(2)}
                          {row.service_mode === "patrol_visits" && (
                            <div className="text-[10px] text-muted-foreground">window</div>
                          )}
                        </td>
                        <td className="px-4 py-2">{row.total_working_hours.toFixed(2)}</td>
                        <td className={`px-4 py-2 ${varianceClass(row.hours_variance)}`}>
                          {row.service_mode === "patrol_visits" ||
                          row.hours_variance === null ||
                          row.hours_variance === undefined
                            ? "—"
                            : varianceText(row.hours_variance)}
                        </td>
                        <td className="px-4 py-2">
                          {row.completed_visits}/{row.required_visits}
                          {(row.visits_shortfall ?? 0) > 0 && (
                            <div className="text-[10px] text-red-600">
                              short {row.visits_shortfall}
                            </div>
                          )}
                          {row.visit_hours ? (
                            <div className="text-[10px] text-muted-foreground">
                              {row.visit_hours.toFixed(2)}h
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-2">
                          <Select
                            value={draft.basis}
                            onValueChange={(v) =>
                              updateDutyDraft(dutyId, { basis: v as GuardPayBasis })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="per_shift">Per shift</SelectItem>
                              <SelectItem value="per_hour">Per hour</SelectItem>
                              <SelectItem value="per_visit">Per visit</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            className="h-8"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 80"
                            value={draft.rate}
                            onChange={(e) =>
                              updateDutyDraft(dutyId, { rate: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {row.computed_pay.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={savingDutyId === dutyId}
                            onClick={() => handleSaveDutyPay(dutyId)}
                          >
                            {savingDutyId === dutyId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            <span className="ml-1">Save</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {(report?.by_duty || []).length === 0 && (
                    <tr>
                      <td colSpan={11} className="px-4 py-6 text-center text-muted-foreground">
                        No completed shifts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium">Day-by-day lines</div>
                <p className="text-xs text-muted-foreground">
                  Patrol rows use a visit window (not a continuous shift). Site clocks first; your
                  timezone only when it differs.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All"],
                    ["late", "Late"],
                    ["short", "Short / visit short"],
                    ["incomplete", "Incomplete"],
                    ["patrol", "Patrol"],
                  ] as Array<[LineFilter, string]>
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={lineFilter === key ? "default" : "outline"}
                    onClick={() => setLineFilter(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Site / Duty</th>
                    <th className="px-4 py-2">Window / shift</th>
                    <th className="px-4 py-2">In / Out</th>
                    <th className="px-4 py-2">Worked</th>
                    <th className="px-4 py-2">Variance</th>
                    <th className="px-4 py-2">Visits</th>
                    <th className="px-4 py-2">Line pay</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLines.map((line) => {
                    const isPatrol = line.service_mode === "patrol_visits";
                    const inLabel = timingLabel(line.check_in_timing);
                    const outLabel = isPatrol ? null : timingLabel(line.check_out_timing);
                    return (
                      <tr key={line.attendance_id} className="border-t align-top">
                        <td className="px-4 py-2 whitespace-nowrap">
                          {line.work_date || "—"}
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{line.site_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{line.duty_title}</div>
                          {line.site_timezone && !isSameTimezone(line.site_timezone) && (
                            <div className="text-[10px] text-muted-foreground">
                              {line.site_timezone}
                            </div>
                          )}
                          {(!line.is_completed || line.visits_incomplete) && (
                            <Badge
                              variant="outline"
                              className="mt-1 border-amber-200 bg-amber-50 text-amber-700"
                            >
                              {line.visits_incomplete ? "Visits incomplete" : "Incomplete"}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {isPatrol || line.schedule_kind === "visit_window"
                              ? "Visit window"
                              : "Shift"}
                          </div>
                          <div>
                            {formatClockRange(
                              line.scheduled_start,
                              line.scheduled_end,
                              line.site_timezone
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {line.scheduled_hours !== null && line.scheduled_hours !== undefined
                              ? `${line.scheduled_hours.toFixed(2)}h${isPatrol ? " window" : ""}`
                              : "—"}
                          </div>
                          {!isSameTimezone(line.site_timezone) && (
                            <div className="mt-1 text-[10px] text-blue-600">
                              You:{" "}
                              {formatClockRange(
                                line.scheduled_start,
                                line.scheduled_end,
                                adminTimezone()
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          <div className="space-y-1">
                            <div>
                              <DualTime
                                value={line.check_in_time}
                                siteTimezone={line.site_timezone}
                              />
                              {inLabel && (
                                <Badge
                                  variant="outline"
                                  className={`ml-1 ${timingBadgeClass(line.check_in_timing)}`}
                                >
                                  {inLabel}
                                </Badge>
                              )}
                            </div>
                            <div>
                              <DualTime
                                value={line.check_out_time}
                                siteTimezone={line.site_timezone}
                              />
                              {outLabel && (
                                <Badge
                                  variant="outline"
                                  className={`ml-1 ${timingBadgeClass(line.check_out_timing)}`}
                                >
                                  {outLabel}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {line.total_working_hours !== null
                            ? line.total_working_hours.toFixed(2)
                            : "—"}
                        </td>
                        <td className={`px-4 py-2 ${varianceClass(line.hours_variance)}`}>
                          {isPatrol || line.hours_variance === null || line.hours_variance === undefined
                            ? "—"
                            : varianceText(line.hours_variance)}
                          {!isPatrol && line.is_short_shift && (
                            <div className="text-[10px] text-red-600">Short</div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {line.completed_visits}/{line.required_visits}
                          {(line.visits_shortfall ?? 0) > 0 && (
                            <div className="text-[10px] text-red-600">
                              short {line.visits_shortfall}
                            </div>
                          )}
                          {isPatrol && (
                            <div className="text-[10px] text-muted-foreground">
                              {(line.visit_hours ?? 0).toFixed(2)}h visits
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">{line.line_pay.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {filteredLines.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                        No attendance lines for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <SendDocumentDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        documentType="timesheet"
        documentLabel={summary?.guard_name ? `${summary.guard_name} timesheet` : "Employee timesheet"}
        guardId={guardId}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />
    </div>
  );
}
