"use client";



import { useEffect, useRef, useState } from "react";

import {

  Activity, AlertTriangle, CalendarClock, CheckCircle2, ClipboardList,

  Clock3, FileText, Footprints, History, Loader2, MapPin,

  ShieldCheck, UserRound, Users, X,

} from "lucide-react";

import { Button } from "@/components/ui/button";

import type {

  ShiftOperationRow,

  ShiftAssignmentDetails,

} from "@/app/types/shift-operations";



type Tab = "overview" | "attendance" | "patrol" | "incidents" | "reports" | "early_checkout" | "history";

const tabs: { key: Tab; title: string; icon: typeof Activity }[] = [

  { key: "overview", title: "Overview", icon: ShieldCheck },

  { key: "attendance", title: "Attendance", icon: CalendarClock },

  { key: "patrol", title: "Patrol", icon: Footprints },

  { key: "incidents", title: "Incidents", icon: AlertTriangle },

  { key: "reports", title: "Reports", icon: FileText },

  { key: "early_checkout", title: "Early Checkout", icon: Clock3 },

  { key: "history", title: "Activity", icon: History },

];

const humanize = (text: unknown): string => {

  if (text === null || text === undefined || text === "") return "—";

  return String(text).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

};

const displayDate = (text?: string | null, timezone?: string | null): string => {

  if (!text) return "—";

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) return text;

  try {

    return new Intl.DateTimeFormat("en-US", { timeZone: timezone || "UTC", dateStyle: "medium", timeStyle: "short" }).format(parsed);

  } catch {

    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }).format(parsed);

  }

};

function labelValue(value: unknown): string {

  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) return value.map(labelValue).join(", ") || "—";

  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, val]) => `${humanize(key)}: ${labelValue(val)}`).join(" · ");

  return String(value);

}

function asRecord(value: unknown): Record<string, unknown> | null {

  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

}

function Metric({ title, value }: { title: string; value: string | number }) {

  return <div className="min-w-0 rounded-xl border bg-background p-3"><p className="text-[11px] text-muted-foreground">{title}</p><p className="mt-1 text-lg font-bold tabular-nums">{value}</p></div>;

}

function Pair({ title, value }: { title: string; value: unknown }) {

  return <div className="flex min-w-0 justify-between gap-4 border-b border-border/60 py-2.5 last:border-0"><dt className="shrink-0 text-xs text-muted-foreground">{title}</dt><dd className="min-w-0 break-words text-right text-xs font-medium">{labelValue(value)}</dd></div>;

}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: React.ReactNode }) {

  return <section className="rounded-xl border bg-card p-4 shadow-sm"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-[#5F0015]" />{title}</h3>{children}</section>;

}

function Records({ records, singular, icon: Icon }: { records: unknown; singular: string; icon: typeof Activity }) {

  const entries = Array.isArray(records) ? records : records ? [records] : [];

  if (!entries.length) return <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-12 text-center"><Icon className="mx-auto mb-3 h-7 w-7 text-muted-foreground/60" /><p className="text-sm font-medium">No {singular.toLowerCase()} records</p><p className="mt-1 text-xs text-muted-foreground">Nothing was returned for this assignment.</p></div>;

  return <div className="space-y-3">{entries.map((entry, index) => {

    const record = asRecord(entry);

    return <section key={String(record?.id ?? index)} className="rounded-xl border bg-card p-4 shadow-sm">

      <div className="mb-2 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10"><Icon className="h-3.5 w-3.5 text-[#5F0015]" /></span><span className="truncate text-sm font-semibold">{singular} {entries.length > 1 ? `#${index + 1}` : ""}</span></div>{record?.status !== undefined && <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium">{humanize(record.status)}</span>}</div>

      {record ? <dl>{Object.entries(record).filter(([key, value]) => key !== "status" && value !== null && value !== undefined).map(([key, value]) => <Pair key={key} title={humanize(key)} value={value} />)}</dl> : <p className="text-xs">{labelValue(entry)}</p>}

    </section>;

  })}</div>;

}


type PatrolView = Record<string, unknown>;
const patrolNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value :
  typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
const patrolText = (value: unknown): string | null =>
  value === null || value === undefined || value === "" ? null : String(value);
const patrolTime = (value: unknown, timezone: string): string =>
  displayDate(patrolText(value), timezone);

function PatrolDetails({ row, details, timezone, loading }: {
  row: ShiftOperationRow;
  details: ShiftAssignmentDetails | null;
  timezone: string;
  loading: boolean;
}) {
  const payload = asRecord(details);
  const item = asRecord(payload?.item);
  const rawPatrol = asRecord(item?.patrol) ?? asRecord(row.patrol) ?? {};
  const visits = (Array.isArray(payload?.patrol_visits) ? payload.patrol_visits : [])
    .map(asRecord).filter((v): v is PatrolView => v !== null)
    .sort((a,b) => (patrolNumber(a.visit_number) ?? 0) - (patrolNumber(b.visit_number) ?? 0));
  const count = (key: string, status?: string): number =>
    patrolNumber(rawPatrol[key]) ?? (status ? visits.filter(v => v.status === status).length : 0);
  const required = count("required");
  const completed = count("completed", "completed");
  const checkedIn = patrolNumber(rawPatrol.checked_in) ?? patrolNumber(rawPatrol.in_progress) ?? visits.filter(v => v.status === "checked_in").length;
  const pending = count("pending", "pending");
  const missed = count("missed", "missed");
  const cancelled = count("cancelled", "cancelled");
  const recorded = patrolNumber(rawPatrol.recorded) ?? visits.length;
  const remaining = Math.max(0, required - completed);
  const unrecorded = Math.max(0, required - recorded + cancelled);
  const percent = required > 0 ? Math.min(100, Math.round(completed / required * 100)) : 0;
  const isPatrol = row.duty.service_mode === "patrol_visits";
  if (!isPatrol) return <Section title="Patrol Visits" icon={Footprints}><p className="text-sm text-muted-foreground">This assignment uses {humanize(row.duty.service_mode)}, not Patrol Visits.</p></Section>;
  return <div className="space-y-4">
    <Section title="Patrol Progress" icon={Footprints}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{completed} of {required} visits completed</span>
        <span className="rounded-full border bg-muted px-2.5 py-1 text-xs font-semibold">{humanize(rawPatrol.status)} · {percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Patrol completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className="h-full rounded-full bg-[#5F0015]" style={{width: `${percent}%`}} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric title="Required" value={required}/>
        <Metric title="Completed" value={completed}/>
        <Metric title="Checked In" value={checkedIn}/>
        <Metric title="Pending" value={pending}/>
        <Metric title="Missed" value={missed}/>
        <Metric title="Not Completed" value={remaining}/>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Not completed = required minus completed. It includes visits still pending or in progress; it does not necessarily mean missed.</p>
      {cancelled > 0 && <p className="mt-2 text-xs text-muted-foreground">Cancelled visit records: {cancelled}</p>}
      {unrecorded > 0 && <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{unrecorded} required visit slot(s) do not have an active visit record yet.</p>}
    </Section>
    <Section title="Individual Visit Timeline" icon={Clock3}>
      {loading ? <p className="text-sm text-muted-foreground">Loading patrol visit history…</p> : visits.length === 0 ?
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No patrol visit records found for this assignment.</p> :
        <div className="space-y-3">{visits.map((visit, index) => {
          const inAt = patrolText(visit.checked_in_at);
          const outAt = patrolText(visit.checked_out_at);
          const duration = patrolNumber(visit.duration_minutes);
          const startCoords = [patrolText(visit.checkin_latitude), patrolText(visit.checkin_longitude)];
          const endCoords = [patrolText(visit.checkout_latitude), patrolText(visit.checkout_longitude)];
          return <div key={String(visit.id ?? index)} className="rounded-xl border bg-background p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold">Visit #{patrolNumber(visit.visit_number) ?? index + 1}</span>
              <span className="rounded-full border bg-muted px-2.5 py-1 text-xs font-semibold">{humanize(visit.status)}</span>
            </div>
            <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
              <div><dt className="text-muted-foreground">Check-in</dt><dd className="mt-1 font-medium">{patrolTime(inAt, timezone)}</dd></div>
              <div><dt className="text-muted-foreground">Checkout</dt><dd className="mt-1 font-medium">{patrolTime(outAt, timezone)}</dd></div>
              <div><dt className="text-muted-foreground">Duration</dt><dd className="mt-1 font-medium">{duration === null ? "—" : `${duration} min`}</dd></div>
            </dl>
            {startCoords.every(Boolean) && <p className="mt-3 text-xs text-muted-foreground">Check-in GPS: {startCoords.join(", ")}</p>}
            {endCoords.every(Boolean) && <p className="mt-1 text-xs text-muted-foreground">Checkout GPS: {endCoords.join(", ")}</p>}
            {patrolText(visit.notes) && <p className="mt-3 rounded-lg bg-muted/40 p-2 text-xs">{patrolText(visit.notes)}</p>}
          </div>;
        })}</div>}
    </Section>
  </div>;
}

export default function ShiftAssignmentDetailsDrawer({ row, details, loading, error, onClose }: {

  row: ShiftOperationRow | null;

  details: ShiftAssignmentDetails | null;

  loading: boolean;

  error: string | null;

  onClose: () => void;

}) {

  const [tab, setTab] = useState<Tab>("overview");

  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (row) { setTab("overview"); closeRef.current?.focus(); } }, [row?.assignment_id]);

  useEffect(() => {

    if (!row) return;

    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", onKey);

    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };

  }, [row, onClose]);

  if (!row) return null;

  const timezone = row.duty.site_timezone;

  const detailData = asRecord(details);

  const getRecords = (key: string): unknown => detailData?.[key];

  const attendance = asRecord(getRecords("attendance"));

  const logs = Array.isArray(getRecords("shift_logs"))

    ? (getRecords("shift_logs") as unknown[]).map(asRecord).filter((item): item is Record<string, unknown> => item !== null)

    : [];

  return <div className="fixed inset-0 z-[100] flex justify-end" role="presentation">

    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

    <aside role="dialog" aria-modal="true" aria-label="Assignment details" className="relative flex h-[100dvh] w-full max-w-[760px] min-w-0 flex-col overflow-hidden border-l bg-background shadow-2xl sm:w-[min(760px,96vw)]">

      <header className="shrink-0 border-b bg-card px-4 py-4 sm:px-6">

        <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5F0015]/10"><ShieldCheck className="h-5 w-5 text-[#5F0015]" /></div><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">One Guard Security · Shift Operations</p><h2 className="truncate text-base font-bold sm:text-lg">Assignment #{row.assignment_id ?? "—"}</h2><p className="truncate text-xs text-muted-foreground">{row.duty.title || "Security shift"}</p></div></div><Button ref={closeRef} variant="ghost" size="icon" className="shrink-0" onClick={onClose} aria-label="Close assignment details"><X className="h-5 w-5" /></Button></div>

        <div className="mt-4 flex flex-wrap gap-2">{[row.operational_status, row.assignment_status, row.coverage.status].filter(Boolean).map((status, i) => <span key={`${status}-${i}`} className="rounded-full border bg-muted/70 px-2.5 py-1 text-[11px] font-semibold">{humanize(status)}</span>)}</div>

      </header>

      <nav aria-label="Assignment sections" className="flex shrink-0 gap-1 overflow-x-auto border-b px-3 py-2 sm:px-5">{tabs.map(item => <button key={item.key} type="button" onClick={() => setTab(item.key)} aria-current={tab === item.key ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${tab === item.key ? "bg-[#5F0015] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><item.icon className="h-3.5 w-3.5" />{item.title}</button>)}</nav>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/20 p-3 sm:p-5">

        {loading && <div className="flex items-center justify-center gap-2 rounded-xl border bg-card py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading assignment records…</div>}

        {error && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        {tab === "overview" && <div className="space-y-4">

          <div className="grid grid-cols-3 gap-2 sm:gap-3"><Metric title="Required" value={row.coverage.required} /><Metric title="Assigned" value={row.coverage.assigned} /><Metric title="Attended" value={row.coverage.attended ?? 0} /></div>

          <Section title="Security Officer" icon={UserRound}><dl><Pair title="Name" value={row.guard?.is_missing ? "Guard record unavailable" : row.guard?.name} /><Pair title="Officer Code" value={row.guard?.code} /><Pair title="Attendance" value={humanize(row.attendance_status)} /><Pair title="Assignment Status" value={humanize(row.assignment_status)} /></dl></Section>

          <Section title="Shift & Location" icon={MapPin}><dl><Pair title="Duty" value={row.duty.title} /><Pair title="Service Mode" value={humanize(row.duty.service_mode)} /><Pair title="Site" value={row.duty.site_name} /><Pair title="Site Location" value={row.duty.site_location_name} /><Pair title="Client ID" value={row.duty.client_id} /><Pair title="Timezone" value={timezone || "UTC"} /></dl></Section>

          <Section title="Scheduled Times" icon={CalendarClock}><dl><Pair title="Start" value={displayDate(row.duty.start_datetime, timezone)} /><Pair title="End" value={displayDate(row.duty.end_datetime, timezone)} /><Pair title="Check-in" value={displayDate(row.check_in_time, timezone)} /><Pair title="Checkout" value={displayDate(row.check_out_time, timezone)} /></dl></Section>

          <Section title="Coverage" icon={Users}><dl><Pair title="Status" value={humanize(row.coverage.status)} /><Pair title="Required Positions" value={row.coverage.required} /><Pair title="Filled Positions" value={row.coverage.assigned} /><Pair title="Attended Officers" value={row.coverage.attended} /></dl></Section>

        </div>}

        {tab === "attendance" && <div className="space-y-4"><Section title="Check-in & Checkout" icon={Clock3}><dl><Pair title="Attendance" value={humanize(row.attendance_status)} /><Pair title="Check-in" value={displayDate(row.check_in_time, timezone)} /><Pair title="Check-in Timing" value={humanize(row.check_in_timing?.classification)} /><Pair title="Check-in Difference" value={row.check_in_timing ? `${row.check_in_timing.difference_minutes} minutes` : "—"} /><Pair title="Checkout" value={displayDate(row.check_out_time, timezone)} /><Pair title="Checkout Timing" value={humanize(row.check_out_timing?.classification)} /><Pair title="Checkout Difference" value={row.check_out_timing ? `${row.check_out_timing.difference_minutes} minutes` : "—"} /><Pair title="Checkout Source" value={humanize(row.checkout_source)} /></dl></Section>{attendance ? <Records singular="Attendance Detail" icon={ClipboardList} records={[attendance]} /> : !loading && <Records singular="Attendance Detail" icon={ClipboardList} records={[]} />}</div>}

        {tab === "patrol" && <PatrolDetails row={row} details={details} timezone={timezone || "UTC"} loading={loading} />}

      {tab === "incidents" && !loading && <Records singular="Incident" icon={AlertTriangle} records={getRecords("incidents")} />}

        {tab === "reports" && !loading && <Records singular="Shift Report" icon={FileText} records={getRecords("shift_reports")} />}

        {tab === "early_checkout" && <div className="space-y-4">{row.early_checkout_request && <Section title="Current Request" icon={Clock3}><dl><Pair title="Status" value={humanize(row.early_checkout_request.status)} /><Pair title="Reason" value={row.early_checkout_request.reason_text} /></dl></Section>}{!loading && <Records singular="Early Checkout Request" icon={Clock3} records={getRecords("early_checkout_requests")} />}</div>}

        {tab === "history" && !loading && <div className="space-y-4">{logs.length > 0 && <Section title="Shift Timeline" icon={Activity}><ol className="relative ml-2 border-l border-[#5F0015]/30 pl-5">{logs.map((log, index) => <li key={String(log.id ?? index)} className="relative pb-5 last:pb-0"><span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-[#5F0015] ring-4 ring-background" /><p className="text-xs font-semibold">{humanize(log.action)}</p><p className="mt-1 text-[11px] text-muted-foreground">{displayDate(typeof log.action_time === "string" ? log.action_time : null, timezone)}{log.is_auto ? " · Automatic" : ""}</p>{log.remarks && <p className="mt-1 text-xs">{labelValue(log.remarks)}</p>}</li>)}</ol></Section>}<Records singular="Assignment" icon={Users} records={getRecords("assignments")} />{!logs.length && <Records singular="Shift Log" icon={History} records={[]} />}</div>}

      </div>

      <footer className="flex shrink-0 items-center justify-between gap-3 border-t bg-card px-4 py-3 sm:px-6"><p className="truncate text-[11px] text-muted-foreground">Duty #{row.duty_id} · {timezone || "UTC"}</p><Button onClick={onClose} size="sm" variant="outline">Close</Button></footer>

    </aside>

  </div>;

}
