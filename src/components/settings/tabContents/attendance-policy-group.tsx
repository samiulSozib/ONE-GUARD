"use client";

import type { SettingGroup, SettingItem, SettingValue } from "@/app/types/settings.types";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

/* ============================================================
   Section mapping — turn a key into a UI section the same way
   the Operational Policies doc describes `section`.
   ============================================================ */
const SECTION_MAP: Record<string, { title: string; description: string }> = {
  engine: { title: "Engine", description: "Advanced engine controls" },
  legacy: { title: "Legacy Checkout", description: "Pre-existing fallback behaviour" },
  reason: { title: "Reasons", description: "Reason catalog & validation" },
  rules: { title: "Time Band Rules", description: "Decision / guard / payroll per time band" },
  ui: { title: "Guard Messages", description: "Message templates shown to the Guard" },
  operations: { title: "Operations Messages", description: "Message templates sent to Operations" },
  client: { title: "Client Messages", description: "Message templates sent to the Client" },
  supervisor: { title: "Supervisor Messages", description: "Message templates sent to Supervisors" },
  other: { title: "Other", description: "" },
};

function classify(item: SettingItem): keyof typeof SECTION_MAP {
  const k = item.key.replace("attendance_policy.", "");
  if (k.startsWith("early_checkout_ui") || k.startsWith("ui.")) return "ui";
  if (k.startsWith("early_checkout.operations")) return "operations";
  if (k.startsWith("early_checkout.client")) return "client";
  if (k.startsWith("early_checkout.supervisor")) return "supervisor";
  if (k.startsWith("early_checkout_rules")) return "rules";
  if (k.startsWith("early_checkout_reason")) return "reason";
  if (k.startsWith("early_checkout_mode") ||
    k.startsWith("early_checkout_notify") ||
    k.startsWith("early_checkout_grace")) return "legacy";
  if (k.startsWith("early_checkout")) return "engine";
  return "other";
}

interface Props {
  group: SettingGroup;
  values: Record<string, SettingValue>;
  onChange: (key: string, value: SettingValue) => void;
  disabled?: boolean;
}

export default function AttendancePolicyGroup({
  group, values, onChange, disabled,
}: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, SettingItem[]>();
    for (const item of group.items) {
      const section = classify(item);
      (map.get(section) ?? map.set(section, []).get(section)!).push(item);
    }
    return Array.from(map.entries());
  }, [group]);

  return (
    <div className="space-y-4">
      {grouped.map(([section, items]) => {
        const meta = SECTION_MAP[section];
        return (
          <Card key={section} className="shadow-sm rounded-2xl border-0 overflow-hidden">
            <div className="bg-[#F4F6F8] dark:bg-gray-800/60 px-4 py-3 border-b">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {meta.title}
              </h3>
              {meta.description && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {meta.description}
                </p>
              )}
            </div>
            <CardContent className="p-0">
              {items.map((item) => (
                <SettingRow
                  key={item.key}
                  item={item}
                  value={values[item.key]}
                  onChange={(v) => onChange(item.key, v)}
                  disabled={disabled}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ============================================================
   Row renderer — chooses the right control by item.type + key
   ============================================================ */
function SettingRow({
  item, value, onChange, disabled,
}: {
  item: SettingItem;
  value: SettingValue;
  onChange: (v: SettingValue) => void;
  disabled?: boolean;
}) {
  const isEngineFlag = item.key === "attendance_policy.early_checkout_engine_enabled";
  const isCatalog = item.key === "attendance_policy.early_checkout_reason_catalog";
  const isRules = item.key === "attendance_policy.early_checkout_rules";
  const isTemplate = item.key.includes(".ui.") ||
    item.key.includes(".operations.") ||
    item.key.includes(".client.") ||
    item.key.includes(".supervisor.");

  /* -------- control dispatch -------- */
  const renderControl = () => {
    /* engine flag: hard-locked OFF */
    if (isEngineFlag) {
  return (
    <Switch
      checked={Boolean(value)}
      onCheckedChange={(v) => onChange(v)}
      disabled={disabled || !item.is_editable}
    />
  );
}

    /* JSON array — reason catalog */
    if (isCatalog) {
      return <ReasonCatalogEditor value={value as any} onChange={onChange} disabled={disabled} />;
    }

    /* JSON array — rule bands */
    if (isRules) {
      return <RuleBandsEditor value={value as any} onChange={onChange} disabled={disabled} />;
    }

    /* JSON object — template */
    if (isTemplate) {
      return <TemplateEditor value={value as any} onChange={onChange} disabled={disabled} />;
    }

    /* primitive control */
    if (item.type === "boolean") {
      return (
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v)}
          disabled={disabled || !item.is_editable}
        />
      );
    }

    if (item.type === "integer" || item.type === "float") {
      return (
        <Input
          type="number"
          value={value == null ? "" : String(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          disabled={disabled || !item.is_editable}
          className="h-9 w-40 text-sm"
        />
      );
    }

    /* string — use Select for known enumerations */
    if (item.key.endsWith("early_checkout_mode")) {
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
          disabled={disabled || !item.is_editable}
        >
          <SelectTrigger className="h-9 w-56 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="allow">Allow</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="require_reason">Require Reason</SelectItem>
            <SelectItem value="block">Block</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    if (item.key.endsWith("reason_input_mode")) {
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
          disabled={disabled || !item.is_editable}
        >
          <SelectTrigger className="h-9 w-56 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="free_text">Free Text</SelectItem>
            <SelectItem value="predefined">Predefined</SelectItem>
            <SelectItem value="predefined_with_other">Predefined with Other</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || !item.is_editable}
        className="h-9 w-64 text-sm"
      />
    );
  };

  return (
    <div className="flex flex-col gap-3 py-4 px-3 sm:px-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {item.label}
          </Label>
          {item.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">{renderControl()}</div>
      </div>
    </div>
  );
}

/* ============================================================
   Reason catalog editor (JSON array of {code,label,requires_note,is_active})
   ============================================================ */
interface ReasonItem {
  code: string;
  label: { en: string;[k: string]: string | undefined };
  requires_note: boolean;
  is_active: boolean;
}
function ReasonCatalogEditor({
  value, onChange, disabled,
}: { value: ReasonItem[]; onChange: (v: ReasonItem[]) => void; disabled?: boolean }) {
  const items = Array.isArray(value) ? value : [];

  const issues: string[] = [];
  const seen = new Set<string>();
  items.forEach((it, i) => {
    if (!it.code?.trim()) issues.push(`Row ${i + 1}: code is required`);
    if (!it.label?.en?.trim()) issues.push(`Row ${i + 1}: English label is required`);
    if (it.code && seen.has(it.code)) issues.push(`Duplicate code: ${it.code}`);
    if (it.code) seen.add(it.code);
  });

  const update = (idx: number, patch: Partial<ReasonItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <div className="w-full space-y-2">
      {issues.length > 0 && (
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-0.5">
          <div className="flex items-center gap-1 font-medium">
            <AlertTriangle className="h-3 w-3" /> Catalog issues
          </div>
          {issues.map((m, i) => <div key={i}>• {m}</div>)}
        </div>
      )}

      {items.map((it, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border p-2">
          <Input placeholder="code" value={it.code}
            onChange={(e) => update(idx, { code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
            disabled={disabled} className="h-8 text-sm flex-1" />
          <Input placeholder="English label" value={it.label?.en ?? ""}
            onChange={(e) => update(idx, { label: { ...it.label, en: e.target.value } })}
            disabled={disabled} className="h-8 text-sm flex-1" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-[11px]">Note</Label>
              <Switch checked={it.requires_note} onCheckedChange={(v) => update(idx, { requires_note: v })} disabled={disabled} />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-[11px]">Active</Label>
              <Switch checked={it.is_active} onCheckedChange={(v) => update(idx, { is_active: v })} disabled={disabled} />
            </div>
            {!disabled && (
              <Button type="button" variant="ghost" size="sm"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="h-8 px-2 text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {!disabled && (
        <Button type="button" variant="outline" size="sm"
          onClick={() => onChange([...items, { code: "", label: { en: "" }, requires_note: false, is_active: true }])}>
          <Plus className="h-3 w-3 mr-1" /> Add Reason
        </Button>
      )}
    </div>
  );
}

/* ============================================================
   Rule bands editor (JSON array of full time-band rules)
   ============================================================ */
function RuleBandsEditor({
  value, onChange, disabled,
}: { value: any[]; onChange: (v: any[]) => void; disabled?: boolean }) {
  const bands = Array.isArray(value) ? value : [];

  const issues: string[] = [];
  const sorted = [...bands].sort(
    (a, b) => (a.min_minutes_early ?? 0) - (b.min_minutes_early ?? 0)
  );
  for (let i = 0; i < sorted.length; i++) {
    const b = sorted[i];
    if (b.max_minutes_early != null && b.max_minutes_early <= b.min_minutes_early) {
      issues.push(`Band "${b.label?.en ?? b.id}" has max ≤ min`);
    }
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.max_minutes_early != null && prev.max_minutes_early !== b.min_minutes_early) {
        issues.push(`Gap/overlap between "${prev.label?.en ?? prev.id}" and "${b.label?.en ?? b.id}"`);
      }
    }
  }
  const last = sorted[sorted.length - 1];
  if (last && last.max_minutes_early != null) {
    issues.push("Top band must be open-ended (max = ∞)");
  }

  const update = (idx: number, patch: any) =>
    onChange(bands.map((b, i) => (i === idx ? { ...b, ...patch } : b)));

  const updateNested = (idx: number, section: string, patch: any) => {
    update(idx, { [section]: { ...(bands[idx][section] ?? {}), ...patch } });
  };

  return (
    <div className="w-full space-y-3">
      {issues.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1 font-medium"><AlertTriangle className="h-3 w-3" /> Rule issues</div>
          {issues.map((m, i) => <div key={i}>• {m}</div>)}
        </div>
      )}

      {bands.map((band, idx) => (
        <div key={band.id ?? idx} className="rounded-xl border p-3 space-y-3 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-[10px]">
              {band.min_minutes_early}–{band.max_minutes_early ?? "∞"} min
            </Badge>
            <Input value={band.label?.en ?? ""}
              onChange={(e) => update(idx, { label: { ...band.label, en: e.target.value } })}
              disabled={disabled} className="h-8 text-sm flex-1" />
            {!disabled && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(bands.filter((_, i) => i !== idx))}
                className="h-8 px-2 text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Min minutes early</Label>
              <Input type="number" value={band.min_minutes_early ?? 0}
                onChange={(e) => update(idx, { min_minutes_early: Number(e.target.value) })}
                disabled={disabled} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Max minutes early (blank = ∞)</Label>
              <Input type="number" value={band.max_minutes_early ?? ""}
                onChange={(e) => update(idx, { max_minutes_early: e.target.value === "" ? null : Number(e.target.value) })}
                disabled={disabled} className="h-8 text-sm" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Decision</Label>
            <Select value={band.decision} onValueChange={(v) => update(idx, { decision: v })} disabled={disabled}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                <SelectItem value="block">Block</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded border px-2 py-1.5">
              <Label className="text-xs">Require reason</Label>
              <Switch checked={!!band.guard?.require_reason}
                onCheckedChange={(v) => updateNested(idx, "guard", { require_reason: v })} disabled={disabled} />
            </div>
            <div className="flex items-center justify-between rounded border px-2 py-1.5">
              <Label className="text-xs">Require confirmation</Label>
              <Switch checked={!!band.guard?.require_confirmation}
                onCheckedChange={(v) => updateNested(idx, "guard", { require_confirmation: v })} disabled={disabled} />
            </div>
          </div>

          {band.decision === "approval" && band.approval && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2 space-y-2">
              <Label className="text-xs font-medium">Approval</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Completion mode</Label>
                  <Select value={band.approval?.completion_mode ?? "guard_checkout_after_approval"}
                    onValueChange={(v) => updateNested(idx, "approval", { completion_mode: v })} disabled={disabled}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto_checkout_on_approval">Auto checkout on approval</SelectItem>
                      <SelectItem value="guard_checkout_after_approval">Guard checkout after approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Valid minutes</Label>
                  <Input type="number" value={band.approval?.valid_minutes ?? 30}
                    onChange={(e) => updateNested(idx, "approval", { valid_minutes: Number(e.target.value) })}
                    disabled={disabled} className="h-8 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Allow resubmit after rejection</Label>
                <Switch checked={!!band.approval?.allow_resubmit_after_rejection}
                  onCheckedChange={(v) => updateNested(idx, "approval", { allow_resubmit_after_rejection: v })} disabled={disabled} />
              </div>
              {band.approval?.allow_resubmit_after_rejection && (
                <div>
                  <Label className="text-xs">Resubmit cooldown (min)</Label>
                  <Input type="number" value={band.approval?.resubmit_cooldown_minutes ?? 15}
                    onChange={(e) => updateNested(idx, "approval", { resubmit_cooldown_minutes: Number(e.target.value) })}
                    disabled={disabled} className="h-8 text-sm" />
                </div>
              )}
            </div>
          )}

          {/* Payroll */}
          {band.payroll && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2 space-y-2">
              <Label className="text-xs font-medium">Payroll</Label>
              <Select value={band.payroll?.mode ?? "no_effect"}
                onValueChange={(v) => updateNested(idx, "payroll", { mode: v })} disabled={disabled}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_effect">No effect</SelectItem>
                  <SelectItem value="actual_worked_time">Actual worked time</SelectItem>
                  <SelectItem value="unpaid_early_minutes">Unpaid early minutes</SelectItem>
                  <SelectItem value="fixed_deduction_minutes">Fixed deduction</SelectItem>
                  <SelectItem value="percentage_deduction">Percentage deduction</SelectItem>
                  <SelectItem value="admin_decides">Admin decides</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notifications (collapsible to keep UI manageable) */}
          {band.notifications && (
            <Accordion type="single" collapsible>
              <AccordionItem value={`notify-${idx}`} className="border-b-0">
                <AccordionTrigger className="text-xs py-2">Notifications</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  {(["operations", "supervisor", "client", "guard"] as const).map((r) => {
                    const rec = band.notifications?.[r] ?? {};
                    const keys = Object.keys(rec).filter((k) => k !== "detail_level");
                    return (
                      <div key={r} className="space-y-1">
                        <Label className="text-[11px] capitalize">{r}</Label>
                        <div className="flex flex-wrap gap-2">
                          {keys.map((k) => (
                            <label key={k} className="flex items-center gap-1 text-[11px] bg-white dark:bg-gray-900 border rounded px-1.5 py-0.5">
                              <Switch checked={!!rec[k]}
                                onCheckedChange={(v) => updateNested(idx, "notifications", { [r]: { ...rec, [k]: v } })}
                                disabled={disabled} />
                              {k.replace(/_/g, " ")}
                            </label>
                          ))}
                        </div>
                        {r === "client" && (
                          <div className="mt-1">
                            <Label className="text-[11px]">Client detail level</Label>
                            <Select value={rec.detail_level ?? "summary"}
                              onValueChange={(v) => updateNested(idx, "notifications", { client: { ...rec, detail_level: v } })}
                              disabled={disabled}>
                              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="summary">Summary</SelectItem>
                                <SelectItem value="include_reason">Include reason</SelectItem>
                                <SelectItem value="include_admin_note">Include admin note</SelectItem>
                                <SelectItem value="full">Full</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Template editor (JSON object of locale → fields)
   ============================================================ */
function TemplateEditor({
  value, onChange, disabled,
}: { value: Record<string, Record<string, string>>; onChange: (v: any) => void; disabled?: boolean }) {
  const locales = ["en", "fa", "ps"];
  const fields = ["title", "message", "reason_label", "reason_placeholder", "primary_action", "secondary_action"];

  const update = (locale: string, field: string, v: string) => {
    const current = { ...(value ?? {}) };
    current[locale] = { ...(current[locale] ?? {}), [field]: v };
    onChange(current);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="editor" className="border-b-0">
        <AccordionTrigger className="text-xs py-1">Edit template</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          {locales.map((loc) => (
            <div key={loc} className="space-y-1.5">
              <Label className="text-[11px] uppercase text-gray-500">{loc}</Label>
              {fields.map((f) => {
                const isLong = f === "message" || f === "reason_placeholder";
                return (
                  <div key={f} className="space-y-0.5">
                    <Label className="text-[11px] capitalize">{f.replace(/_/g, " ")}</Label>
                    {isLong ? (
                      <Textarea
                        value={value?.[loc]?.[f] ?? ""}
                        onChange={(e) => update(loc, f, e.target.value)}
                        disabled={disabled}
                        rows={2}
                        className="text-xs"
                      />
                    ) : (
                      <Input
                        value={value?.[loc]?.[f] ?? ""}
                        onChange={(e) => update(loc, f, e.target.value)}
                        disabled={disabled}
                        className="h-7 text-xs"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
