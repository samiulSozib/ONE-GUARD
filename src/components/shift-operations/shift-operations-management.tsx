"use client";

import ShiftFilterLookup from "./shift-filter-lookup";

import React, { useCallback, useEffect, useState } from "react";

import {

  Activity, AlertTriangle, CheckCircle2, Clock, Download,

  FileText, FilterX, Footprints, RefreshCcw, Search,

  ShieldCheck, Users, X,

} from "lucide-react";

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { shiftOperationsService } from "@/service/shift-operations.service";

import type {

  ShiftDetails,

  ShiftFilters,

  ShiftListBody,

  ShiftRow,

  ShiftSummary,

} from "@/app/types/shift-operations";

type Tab =

  | "overview"

  | "attendance"

  | "patrol"

  | "incidents"

  | "reports"

  | "replacements"

  | "history";

type FilterKey = keyof ShiftFilters;

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

const createDefaults = (): ShiftFilters => ({

  from: dateKey(new Date(Date.now() - 7 * 86400000)),

  to: dateKey(new Date(Date.now() + 7 * 86400000)),

  page: 1,

  per_page: 20,

});

const filtersList: {

  key: FilterKey;

  title: string;

  options: string[];

}[] = [

    {

      key: "service_mode",

      title: "Shift mode",

      options: ["continuous_shift", "patrol_visits"],

    },

    {

      key: "operational_status",

      title: "Operational status",

      options: [

        "upcoming", "on_duty", "on_break", "checked_out",

        "missing_check_out", "not_checked_in_after_start", "unassigned",

      ],

    },

    {

      key: "attendance",

      title: "Attendance",

      options: ["attended", "not_attended"],

    },

    {

      key: "assignment_status",

      title: "Assignment status",

      options: ["active", "pending", "completed", "cancelled", "replaced"],

    },

    {

      key: "check_in_timing",

      title: "Check-in timing",

      options: ["early", "on_time", "late"],

    },

    {

      key: "check_out_timing",

      title: "Checkout timing",

      options: ["early", "on_time", "late"],

    },

    {

      key: "checkout_source",

      title: "Checkout source",

      options: ["automatic", "manual", "unknown"],

    },

    {

      key: "patrol_status",

      title: "Patrol status",

      options: [

        "not_applicable", "not_started", "in_progress",

        "completed", "incomplete", "missed",

      ],

    },

    {

      key: "coverage_status",

      title: "Coverage",

      options: ["covered", "partial", "unassigned", "overstaffed"],

    },

    {

      key: "has_incidents",

      title: "Has incidents",

      options: ["1", "0"],

    },

    {

      key: "has_reports",

      title: "Has shift reports",

      options: ["1", "0"],

    },

    {

      key: "is_replaced",

      title: "Replaced",

      options: ["1", "0"],

    },

    {

      key: "has_early_checkout_request",

      title: "Early checkout request",

      options: ["1", "0"],

    },

  ];

const idFilters: { key: FilterKey; title: string }[] = [

  { key: "client_id", title: "Client ID" },

  { key: "site_id", title: "Site ID" },

  { key: "site_location_id", title: "Location ID" },

  { key: "guard_id", title: "Guard ID" },

  { key: "duty_schedule_id", title: "Schedule ID" },

  { key: "duty_id", title: "Duty ID" },

];

const pretty = (value: string | null | undefined) =>

  value ? value.replaceAll("_", " ") : "—";

function formatDate(

  value: string | null | undefined,

  timezone?: string | null

) {

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  try {

    return new Intl.DateTimeFormat("en-US", {

      dateStyle: "medium",

      timeStyle: "short",

      timeZone: timezone || "UTC",

    }).format(date);

  } catch {

    return date.toISOString();

  }

}

function errorMessage(error: unknown): string {

  if (error && typeof error === "object" && "response" in error) {

    const response = (

      error as { response?: { data?: { message?: string } } }

    ).response;

    if (response?.data?.message) return response.data.message;

  }

  return error instanceof Error ? error.message : "Request failed";

}

function Status({ value }: { value?: string | null }) {

  const status = value || "";

  const color =

    ["on_duty", "covered", "attended", "checked_out", "completed"].includes(status)

      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"

      : ["missing_check_out", "unassigned", "missed", "cancelled"].includes(status)

        ? "bg-red-500/10 text-red-700 dark:text-red-400"

        : ["partial", "replaced", "on_break", "late", "incomplete"].includes(status)

          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"

          : "bg-muted text-muted-foreground";

  return (

    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium capitalize ${color}`}>

      {pretty(status)}

    </span>

  );

}

function InfoRow({

  title,

  value,

}: {

  title: string;

  value: React.ReactNode;

}) {

  return (

    <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0">

      <span className="shrink-0 text-muted-foreground">{title}</span>

      <div className="min-w-0 break-words text-right font-medium">

        {value ?? "—"}

      </div>

    </div>

  );

}

function RecordList({

  title,

  records,

}: {

  title: string;

  records: Array<Record<string, unknown>>;

}) {

  if (!records.length) {

    return (

      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">

        No {title.toLowerCase()} found.

      </div>

    );

  }

  return (

    <div className="space-y-3">

      {records.map((record, index) => (

        <Card key={String(record.id ?? index)} className="p-4">

          {Object.entries(record)

            .filter(([, value]) => value !== null && value !== undefined)

            .map(([key, value]) => (

              <InfoRow

                key={key}

                title={pretty(key)}

                value={

                  typeof value === "object"

                    ? <pre className="max-w-xs whitespace-pre-wrap break-all text-xs">

                      {JSON.stringify(value, null, 2)}

                    </pre>

                    : String(value)

                }

              />

            ))}

        </Card>

      ))}

    </div>

  );

}

function DetailsDrawer({

  detail,

  loading,

  error,

  onClose,

}: {

  detail: ShiftDetails | null;

  loading: boolean;

  error: string | null;

  onClose: () => void;

}) {

  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { key: Tab; title: string }[] = [

    { key: "overview", title: "Overview" },

    { key: "attendance", title: "Attendance" },

    { key: "patrol", title: "Patrol Visits" },

    { key: "incidents", title: "Incidents" },

    { key: "reports", title: "Shift Reports" },

    { key: "replacements", title: "Assignments" },

    { key: "history", title: "Activity History" },

  ];

  const item = detail?.item;

  const timezone = item?.duty.site_timezone;

  return (

    <div

      className="fixed inset-0 z-50 flex justify-end bg-black/50"

      onMouseDown={onClose}

    >

      <div

        role="dialog"

        aria-modal="true"

        aria-label="Shift operation details"

        onMouseDown={(event) => event.stopPropagation()}

        className="flex h-full w-full max-w-2xl flex-col bg-background shadow-2xl"

      >

        <div className="flex items-start justify-between border-b p-5">

          <div>

            <h2 className="text-lg font-semibold">Assignment Details</h2>

            <p className="text-sm text-muted-foreground">

              {item?.duty.title || "Shift Operations"}

              {item?.assignment_id ? ` · #${item.assignment_id}` : ""}

            </p>

          </div>

          <Button size="icon" variant="ghost" onClick={onClose}>

            <X className="h-5 w-5" />

          </Button>

        </div>

        <div className="flex gap-2 overflow-x-auto border-b p-3">

          {tabs.map((entry) => (

            <button

              key={entry.key}

              type="button"

              onClick={() => setTab(entry.key)}

              className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium ${tab === entry.key

                  ? "bg-primary text-primary-foreground"

                  : "bg-muted text-muted-foreground"

                }`}

            >

              {entry.title}

            </button>

          ))}

        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">

          {loading ? (

            <p className="text-muted-foreground">Loading details…</p>

          ) : error ? (

            <p className="text-red-600">{error}</p>

          ) : !item || !detail ? (

            <p className="text-muted-foreground">No assignment found.</p>

          ) : (

            <>

              {tab === "overview" && (

                <Card className="p-4">

                  <InfoRow title="Guard" value={item.guard?.name || `Guard #${item.guard?.id ?? "—"}`} />

                  <InfoRow title="Guard code" value={item.guard?.code} />

                  <InfoRow title="Client ID" value={item.duty.client_id} />

                  <InfoRow title="Site" value={item.duty.site_name} />

                  <InfoRow title="Location" value={item.duty.site_location_name} />

                  <InfoRow title="Service" value={pretty(item.duty.service_mode)} />

                  <InfoRow title="Start" value={formatDate(item.duty.start_datetime, timezone)} />

                  <InfoRow title="End" value={formatDate(item.duty.end_datetime, timezone)} />

                  <InfoRow title="Timezone" value={timezone || "UTC"} />

                  <InfoRow title="Operational status" value={<Status value={item.operational_status} />} />

                  <InfoRow title="Assignment status" value={<Status value={item.assignment_status} />} />

                  <InfoRow title="Coverage" value={<Status value={item.coverage.status} />} />

                  <InfoRow title="Required guards" value={item.coverage.required} />

                  <InfoRow title="Assigned guards" value={item.coverage.assigned} />

                  <InfoRow title="Attended guards" value={item.coverage.attended} />

                </Card>

              )}

              {tab === "attendance" && (

                <>

                  <Card className="p-4">

                    <InfoRow title="Attended" value={item.attended ? "Yes" : "No"} />

                    <InfoRow title="Check-in" value={formatDate(item.check_in_time, timezone)} />

                    <InfoRow

                      title="Check-in timing"

                      value={

                        item.check_in_timing

                          ? `${pretty(item.check_in_timing.classification)} (${item.check_in_timing.difference_minutes} minutes)`

                          : "—"

                      }

                    />

                    <InfoRow title="Checkout" value={formatDate(item.check_out_time, timezone)} />

                    <InfoRow

                      title="Checkout timing"

                      value={

                        item.check_out_timing

                          ? `${pretty(item.check_out_timing.classification)} (${item.check_out_timing.difference_minutes} minutes)`

                          : "—"

                      }

                    />

                    <InfoRow title="Checkout source" value={pretty(item.checkout_source)} />

                  </Card>

                  <h3 className="font-semibold">Attendance record</h3>

                  <RecordList

                    title="Attendance"

                    records={detail.attendance ? [detail.attendance] : []}

                  />

                  <h3 className="font-semibold">Early Checkout Requests</h3>

                  <RecordList

                    title="Early Checkout Requests"

                    records={detail.early_checkout_requests ?? []}

                  />

                </>

              )}

              {tab === "patrol" && (

                <>

                  <Card className="p-4">

                    <InfoRow title="Status" value={<Status value={item.patrol?.status} />} />

                    <InfoRow title="Required visits" value={item.patrol?.required ?? 0} />

                    <InfoRow title="Completed" value={item.patrol?.completed ?? 0} />

                    <InfoRow title="Missed" value={item.patrol?.missed ?? 0} />

                  </Card>

                  <RecordList title="Patrol Visits" records={detail.patrol_visits ?? []} />

                </>

              )}

              {tab === "incidents" && (

                <RecordList title="Incidents" records={detail.incidents ?? []} />

              )}

              {tab === "reports" && (

                <RecordList title="Shift Reports" records={detail.shift_reports ?? []} />

              )}

              {tab === "replacements" && (

                <RecordList

                  title="Assignments"

                  records={(detail.assignments ?? []).map((a) => ({ ...a }))}

                />

              )}

              {tab === "history" && (

                <RecordList

                  title="Shift Logs"

                  records={(detail.shift_logs ?? []).map((log) => ({ ...log }))}

                />

              )}

            </>

          )}

        </div>

      </div>

    </div>

  );

}

export default function ShiftOperationsManagement() {

  const [draft, setDraft] = useState<ShiftFilters>(createDefaults);

  const [applied, setApplied] = useState<ShiftFilters>(createDefaults);

  const [data, setData] = useState<ShiftListBody | null>(null);

  const [summary, setSummary] = useState<ShiftSummary | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [advanced, setAdvanced] = useState(false);

  const [exporting, setExporting] = useState<string | null>(null);

  const [assignmentId, setAssignmentId] = useState<number | null>(null);

  const [details, setDetails] = useState<ShiftDetails | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [detailsError, setDetailsError] = useState<string | null>(null);

  const load = useCallback(async () => {

    setLoading(true);

    setError(null);

    try {

      const [result, overview] = await Promise.all([

        shiftOperationsService.list(applied),

        shiftOperationsService.overview(applied),

      ]);

      setData(result);

      setSummary(overview.summary);

    } catch (e) {

      setError(errorMessage(e));

    } finally {

      setLoading(false);

    }

  }, [applied]);

  useEffect(() => {

    void load();

  }, [load]);

  useEffect(() => {

    if (assignmentId === null) return;

    let cancelled = false;

    setDetails(null);

    setDetailsError(null);

    setDetailsLoading(true);

    shiftOperationsService

      .details(assignmentId)

      .then((result) => {

        if (!cancelled) setDetails(result);

      })

      .catch((e) => {

        if (!cancelled) setDetailsError(errorMessage(e));

      })

      .finally(() => {

        if (!cancelled) setDetailsLoading(false);

      });

    return () => {

      cancelled = true;

    };

  }, [assignmentId]);

  const update = (key: FilterKey, value: string) => {

    setDraft((old) => ({ ...old, [key]: value }));

  };

  const apply = () => {

    setApplied({ ...draft, page: 1 });

  };

  const reset = () => {

    const next = createDefaults();

    setDraft(next);

    setApplied(next);

  };

  const pageTo = (page: number) => {

    setApplied((old) => ({ ...old, page }));

  };

  const download = async (format: "csv" | "excel" | "pdf") => {

    setExporting(format);

    setError(null);

    try {

      await shiftOperationsService.exportFile(format, applied);

    } catch (e) {

      setError(errorMessage(e));

    } finally {

      setExporting(null);

    }

  };

  const stats = summary || data?.summary || {};

  const rows = data?.items || [];

  const cards = [

    { title: "Assignments", key: "assignment_rows", icon: Users },

    { title: "Attended", key: "attended_assignments", icon: CheckCircle2 },

    { title: "On Duty", key: "on_duty", icon: ShieldCheck },

    { title: "On Break", key: "on_break", icon: Clock },

    { title: "Missing Checkout", key: "missing_check_out", icon: AlertTriangle },

    { title: "Unfilled Positions", key: "unfilled_positions", icon: Users },

    { title: "Completed Patrols", key: "patrol_completed", icon: Footprints },

    { title: "Incident Duties", key: "shifts_with_incidents", icon: Activity },

    { title: "Shift Report Duties", key: "shifts_with_reports", icon: FileText },

    { title: "Replacements", key: "replaced_assignments", icon: RefreshCcw },

  ];

  const field =

    "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

  return (

    <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-clip">

      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">

        <div>

          <h1 className="text-2xl font-semibold tracking-tight">

            Shift Operations

          </h1>

          <p className="text-sm text-muted-foreground">

            Unified guard attendance, coverage, patrols and operational reports

          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <Button

            variant="outline"

            onClick={() => void load()}

            disabled={loading}

          >

            <RefreshCcw className="mr-2 h-4 w-4" />

            Refresh

          </Button>

          {(["csv", "excel", "pdf"] as const).map((format) => (

            <Button

              key={format}

              variant="outline"

              disabled={exporting !== null}

              onClick={() => void download(format)}

            >

              <Download className="mr-2 h-4 w-4" />

              {exporting === format ? "Preparing…" : format.toUpperCase()}

            </Button>

          ))}

        </div>

      </div>

      {error && (

        <Card className="border-red-500/30 p-4 text-sm text-red-600">

          {error}

        </Card>

      )}

      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">

        {cards.map(({ title, key, icon: Icon }) => (

          <Card key={key} className="p-4">

            <div className="flex items-center justify-between gap-2">

              <span className="text-xs text-muted-foreground">{title}</span>

              <Icon className="h-4 w-4 text-muted-foreground" />

            </div>

            <div className="mt-2 text-2xl font-semibold tabular-nums">

              {loading && !summary

                ? "…"

                : typeof stats[key] === "number"

                  ? stats[key].toLocaleString()

                  : "—"}

            </div>

          </Card>

        ))}

      </div>

      <Card className="w-full min-w-0 max-w-full space-y-4 p-3 sm:p-4">

        <div className="flex flex-wrap items-end gap-3">

          <div className="w-full min-w-0 flex-1 sm:min-w-[190px]">

            <label className={labelClass}>Search</label>

            <div className="relative">

              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

              <input

                className={`${field} pl-9`}

                value={draft.search || ""}

                placeholder="Guard, shift or site"

                onChange={(e) => update("search", e.target.value)}

                onKeyDown={(e) => {

                  if (e.key === "Enter") apply();

                }}

              />

            </div>

          </div>

          <div>

            <label className={labelClass}>From (UTC)</label>

            <input

              type="date"

              className={field}

              value={draft.from || ""}

              onChange={(e) => update("from", e.target.value)}

            />

          </div>

          <div>

            <label className={labelClass}>To (UTC)</label>

            <input

              type="date"

              className={field}

              value={draft.to || ""}

              onChange={(e) => update("to", e.target.value)}

            />

          </div>

          <Button onClick={apply}>Apply Filters</Button>

          <Button variant="outline" onClick={() => setAdvanced((v) => !v)}>

            {advanced ? "Hide Filters" : "Advanced Filters"}

          </Button>

          <Button variant="ghost" onClick={reset}>

            <FilterX className="mr-2 h-4 w-4" />

            Reset

          </Button>

        </div>

        {advanced && (

          <div className="grid w-full min-w-0 grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">

            {idFilters.map(({ key, title }) => (

              <div key={key} className="min-w-0">

                <label className={labelClass}>

                  {title.replace(" ID", "")}

                </label>

                <ShiftFilterLookup

                  field={key as

                    | "client_id"

                    | "site_id"

                    | "site_location_id"

                    | "guard_id"

                    | "duty_schedule_id"

                    | "duty_id"

                  }

                  value={String(draft[key] ?? "")}

                  onChange={(value) => {

                    setDraft((current) => {

                      const next = { ...current, [key]: value };

                      if (key === "client_id") {

                        next.site_id = "";

                        next.site_location_id = "";

                      }

                      if (key === "site_id") {

                        next.site_location_id = "";

                      }

                      return next;

                    });

                  }}

                  clientId={String(draft.client_id ?? "")}

                  siteId={String(draft.site_id ?? "")}

                  className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"

                />

              </div>

            ))}

            {filtersList.map(({ key, title, options }) => (

              <div key={key}>

                <label className={labelClass}>{title}</label>

                <select

                  className={field}

                  value={String(draft[key] ?? "")}

                  onChange={(e) => update(key, e.target.value)}

                >

                  <option value="">All</option>

                  {options.map((value) => (

                    <option key={value} value={value}>

                      {value === "1"

                        ? "Yes"

                        : value === "0"

                          ? "No"

                          : pretty(value)}

                    </option>

                  ))}

                </select>

              </div>

            ))}

          </div>

        )}

        <p className="text-xs text-muted-foreground">

          Date filters use the backend UTC range. Individual shift times

          are displayed in each site's timezone.

        </p>

      </Card>

      <Card className="w-full min-w-0 max-w-full overflow-hidden">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">

          <div>

            <h2 className="font-semibold">Operational Records</h2>

            <p className="text-xs text-muted-foreground">

              {data

                ? `${data.pagination.total ?? 0} matching rows`

                : "Loading operations"}

            </p>

          </div>

          <div className="flex items-center gap-2">

            <span className="text-xs text-muted-foreground">Per page</span>

            <select

              className={`${field} w-24`}

              value={applied.per_page ?? 20}

              onChange={(e) => {

                const size = Number(e.target.value);

                setApplied((old) => ({ ...old, per_page: size, page: 1 }));

                setDraft((old) => ({ ...old, per_page: size, page: 1 }));

              }}

            >

              {[10, 20, 50, 100].map((value) => (

                <option key={value} value={value}>{value}</option>

              ))}

            </select>

          </div>

        </div>

        <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">

          <table className="w-full min-w-[1350px] text-left text-xs">

            <thead className="bg-muted/60 text-muted-foreground">

              <tr>

                {[

                  "Guard / Assignment", "Site / Client", "Duty",

                  "Scheduled Start", "Scheduled End", "Check-In",

                  "Checkout", "Operational Status", "Coverage",

                  "Patrol", "Incidents", "Reports", "Details",

                ].map((title) => (

                  <th key={title} className="whitespace-nowrap px-3 py-3 font-semibold">

                    {title}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {rows.map((row: ShiftRow, index) => {

                const timezone = row.duty.site_timezone;

                return (

                  <tr

                    key={`${row.row_type}-${row.duty_id}-${row.assignment_id ?? index}`}

                    className="border-t hover:bg-muted/30"

                  >

                    <td className="px-3 py-3">

                      <div className="font-medium">

                        {row.row_type === "unfilled_slots"

                          ? `${row.unfilled_count ?? 1} unfilled position(s)`

                          : row.guard?.name || `Guard #${row.guard?.id ?? "—"}`}

                      </div>

                      <div className="text-muted-foreground">

                        {row.guard?.code || "—"}

                        {row.assignment_id ? ` · #${row.assignment_id}` : ""}

                      </div>

                      {row.guard?.is_missing && (

                        <span className="text-red-600">Guard record unavailable</span>

                      )}

                    </td>

                    <td className="px-3 py-3">

                      <div className="font-medium">{row.duty.site_name || "—"}</div>

                      <div className="text-muted-foreground">

                        Client #{row.duty.client_id ?? "—"}

                      </div>

                      <div className="max-w-[180px] truncate text-muted-foreground">

                        {row.duty.site_location_name || "—"}

                      </div>

                    </td>

                    <td className="px-3 py-3">

                      <div className="max-w-[180px] truncate font-medium">

                        {row.duty.title || "—"}

                      </div>

                      <div className="text-muted-foreground capitalize">

                        {pretty(row.duty.service_mode)}

                      </div>

                    </td>

                    <td className="whitespace-nowrap px-3 py-3">

                      {formatDate(row.duty.start_datetime, timezone)}

                    </td>

                    <td className="whitespace-nowrap px-3 py-3">

                      {formatDate(row.duty.end_datetime, timezone)}

                    </td>

                    <td className="whitespace-nowrap px-3 py-3">

                      <div>{formatDate(row.check_in_time, timezone)}</div>

                      {row.check_in_timing && (

                        <Status value={row.check_in_timing.classification} />

                      )}

                    </td>

                    <td className="whitespace-nowrap px-3 py-3">

                      <div>{formatDate(row.check_out_time, timezone)}</div>

                      {row.check_out_timing && (

                        <Status value={row.check_out_timing.classification} />

                      )}

                    </td>

                    <td className="px-3 py-3">

                      <Status value={row.operational_status} />

                      {row.is_replaced && (

                        <div className="mt-1"><Status value="replaced" /></div>

                      )}

                    </td>

                    <td className="px-3 py-3">

                      <Status value={row.coverage.status} />

                      <div className="mt-1 text-muted-foreground">

                        {row.coverage.assigned}/{row.coverage.required} assigned

                      </div>

                    </td>

                    <td className="px-3 py-3">

                      <Status value={row.patrol?.status} />

                      <div className="mt-1 text-muted-foreground">

                        {row.patrol?.completed ?? 0}/{row.patrol?.required ?? 0}

                      </div>

                    </td>

                    <td className="px-3 py-3">

                      {row.incidents?.duty_count ?? 0}

                    </td>

                    <td className="px-3 py-3">

                      {row.shift_reports?.duty_count ?? 0}

                    </td>

                    <td className="px-3 py-3">

                      <Button

                        size="sm"

                        variant="outline"

                        disabled={!row.assignment_id}

                        onClick={() => {

                          if (row.assignment_id) setAssignmentId(row.assignment_id);

                        }}

                      >

                        View

                      </Button>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

          {loading && (

            <div className="p-8 text-center text-sm text-muted-foreground">

              Loading shift operations…

            </div>

          )}

          {!loading && rows.length === 0 && (

            <div className="p-8 text-center text-sm text-muted-foreground">

              No operational records match these filters.

            </div>

          )}

        </div>

        <div className="flex items-center justify-between gap-3 border-t p-4">

          <span className="text-xs text-muted-foreground">

            Showing {rows.length} records

          </span>

          <div className="flex items-center gap-2">

            <Button

              size="sm"

              variant="outline"

              disabled={loading || (applied.page ?? 1) <= 1}

              onClick={() => pageTo((applied.page ?? 1) - 1)}

            >

              Previous

            </Button>

            <span className="text-xs">

              {data?.pagination.current_page ?? 1}

              {" / "}

              {data?.pagination.last_page ?? 1}

            </span>

            <Button

              size="sm"

              variant="outline"

              disabled={

                loading ||

                (applied.page ?? 1) >= (data?.pagination.last_page ?? 1)

              }

              onClick={() => pageTo((applied.page ?? 1) + 1)}

            >

              Next

            </Button>

          </div>

        </div>

      </Card>

      {assignmentId !== null && (

        <DetailsDrawer

          key={assignmentId}

          detail={details}

          loading={detailsLoading}

          error={detailsError}

          onClose={() => setAssignmentId(null)}

        />

      )}

    </div>

  );

}
