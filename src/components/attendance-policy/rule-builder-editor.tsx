"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, AlertTriangle, Clock } from "lucide-react";
import type { PolicyItem, RuleBand } from "@/app/types/attendancePolicy";
import { pickLabel } from "./locale-utils";

interface Props {
  value: RuleBand[] | any;
  definition: PolicyItem;
  readOnly?: boolean;
  onChange: (v: RuleBand[]) => void;
}

const DEFAULT_BAND = (): RuleBand => ({
  id: `band_${Date.now()}`,
  label: { en: "New Band" },
  min_minutes_early: 0,
  max_minutes_early: 30,
  decision: "immediate",
  guard: { require_reason: false, require_confirmation: false },
  payroll: { mode: "no_effect" },
  notifications: {
    operations: { on_request: false, on_approval: false, on_rejection: false, on_completion: false },
    supervisor: { on_request: false, on_approval: false, on_rejection: false, on_completion: false },
    client: { on_request: false, on_approval: false, on_rejection: false, on_completion: false, on_approval_expired: false, detail_level: "summary" },
    guard: { on_submission: true, on_approval: true, on_rejection: true, on_expiry: true, on_completion: true },
  },
});

export default function RuleBuilderEditor({ value, definition, readOnly, onChange }: Props) {
  const bands: RuleBand[] = Array.isArray(value) ? value : [];

  /* §7.7 — validate time ranges (coverage, non-overlap, open-ended max) */
  const issues: string[] = [];
  const sorted = [...bands].sort((a, b) => a.min_minutes_early - b.min_minutes_early);
  for (let i = 0; i < sorted.length; i++) {
    const b = sorted[i];
    if (b.max_minutes_early != null && b.max_minutes_early <= b.min_minutes_early) {
      issues.push(`Band "${pickLabel(b.label)}" has max ≤ min`);
    }
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.max_minutes_early != null && prev.max_minutes_early !== b.min_minutes_early) {
        issues.push(`Gap or overlap between "${pickLabel(prev.label)}" and "${pickLabel(b.label)}"`);
      }
    }
  }
  const last = sorted[sorted.length - 1];
  if (last && last.max_minutes_early != null) {
    issues.push("Top band should be open-ended (max = ∞) to cover 121+ minutes");
  }

  const update = (idx: number, patch: Partial<RuleBand>) =>
    onChange(bands.map((b, i) => (i === idx ? { ...b, ...patch } : b)));

  const updateNested = (idx: number, section: keyof RuleBand, patch: Record<string, any>) => {
    const current = (bands[idx] as any)[section] ?? {};
    update(idx, { [section]: { ...current, ...patch } } as any);
  };

  const add = () => onChange([...bands, DEFAULT_BAND()]);
  const remove = (idx: number) => onChange(bands.filter((_, i) => i !== idx));

  /* §6 — read metadata, not the seed */
  const md = (definition.metadata ?? {}) as any;
  const decisionOptions = md.decision_options ?? [
    { value: "immediate", label: { en: "Immediate" } },
    { value: "approval", label: { en: "Approval" } },
    { value: "block", label: { en: "Block" } },
  ];
  const payrollOptions = md.payroll_mode_options ?? [
    { value: "no_effect", label: { en: "No effect" } },
    { value: "actual_worked_time", label: { en: "Actual worked time" } },
    { value: "unpaid_early_minutes", label: { en: "Unpaid early minutes" } },
    { value: "fixed_deduction_minutes", label: { en: "Fixed deduction" } },
    { value: "percentage_deduction", label: { en: "Percentage deduction" } },
    { value: "admin_decides", label: { en: "Admin decides" } },
  ];
  const completionOptions = md.completion_options ?? [
    { value: "auto_checkout_on_approval", label: { en: "Auto checkout on approval" } },
    { value: "guard_checkout_after_approval", label: { en: "Guard checkout after approval" } },
  ];
  const clientDetailOptions = md.client_detail_options ?? [
    { value: "summary", label: { en: "Summary" } },
    { value: "include_reason", label: { en: "Include reason" } },
    { value: "include_admin_note", label: { en: "Include admin note" } },
    { value: "full", label: { en: "Full" } },
  ];

  return (
    <div className="space-y-3">
      {issues.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1 font-medium"><AlertTriangle className="h-3 w-3" /> Rule issues</div>
          {issues.map((m, i) => <div key={i}>• {m}</div>)}
        </div>
      )}

      {bands.map((band, idx) => (
        <div key={band.id ?? idx} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-3 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {band.min_minutes_early}–{band.max_minutes_early ?? "∞"} min
            </Badge>
            <Input
              value={pickLabel(band.label)}
              onChange={(e) => update(idx, { label: { ...band.label, en: e.target.value } })}
              disabled={readOnly}
              className="h-8 text-sm flex-1"
              placeholder="Band label"
            />
            {!readOnly && (
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)} className="h-8 px-2 text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* time range */}
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Min minutes early</Label>
              <Input type="number" min={0} value={band.min_minutes_early}
                onChange={(e) => update(idx, { min_minutes_early: Number(e.target.value) })}
                disabled={readOnly} className="h-8 text-sm" />
            </div>
            <div><Label className="text-xs">Max minutes early (blank = open-ended)</Label>
              <Input type="number" min={0} value={band.max_minutes_early ?? ""}
                onChange={(e) => update(idx, { max_minutes_early: e.target.value === "" ? null : Number(e.target.value) })}
                disabled={readOnly} className="h-8 text-sm" />
            </div>
          </div>

          {/* decision */}
          <div>
            <Label className="text-xs">Decision</Label>
            <Select value={band.decision}
              onValueChange={(v) => update(idx, { decision: v as RuleBand["decision"] })}
              disabled={readOnly}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {decisionOptions.map((o: any) => (
                  <SelectItem key={o.value} value={o.value}>{pickLabel(o.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* guard */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5">
              <Label className="text-xs">Require reason</Label>
              <Switch checked={band.guard.require_reason}
                onCheckedChange={(v) => update(idx, { guard: { ...band.guard, require_reason: v } })}
                disabled={readOnly} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5">
              <Label className="text-xs">Require confirmation</Label>
              <Switch checked={band.guard.require_confirmation}
                onCheckedChange={(v) => update(idx, { guard: { ...band.guard, require_confirmation: v } })}
                disabled={readOnly} />
            </div>
          </div>

          {/* approval block (only for approval decision) */}
          {band.decision === "approval" && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2 space-y-2">
              <Label className="text-xs font-medium">Approval settings</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Completion mode</Label>
                  <Select value={band.approval?.completion_mode ?? "guard_checkout_after_approval"}
                    onValueChange={(v) => updateNested(idx, "approval", { completion_mode: v })}
                    disabled={readOnly}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {completionOptions.map((o: any) => (
                        <SelectItem key={o.value} value={o.value}>{pickLabel(o.label)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Valid minutes</Label>
                  <Input type="number" min={1} value={band.approval?.valid_minutes ?? 30}
                    onChange={(e) => updateNested(idx, "approval", { valid_minutes: Number(e.target.value) })}
                    disabled={readOnly} className="h-8 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Allow resubmit after rejection</Label>
                <Switch checked={!!band.approval?.allow_resubmit_after_rejection}
                  onCheckedChange={(v) => updateNested(idx, "approval", { allow_resubmit_after_rejection: v })}
                  disabled={readOnly} />
              </div>
              {band.approval?.allow_resubmit_after_rejection && (
                <div>
                  <Label className="text-xs">Resubmit cooldown (minutes)</Label>
                  <Input type="number" min={0} value={band.approval?.resubmit_cooldown_minutes ?? 15}
                    onChange={(e) => updateNested(idx, "approval", { resubmit_cooldown_minutes: Number(e.target.value) })}
                    disabled={readOnly} className="h-8 text-sm" />
                </div>
              )}
            </div>
          )}

          {/* payroll */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2 space-y-2">
            <Label className="text-xs font-medium">Payroll</Label>
            <Select value={band.payroll?.mode ?? "no_effect"}
              onValueChange={(v) => updateNested(idx, "payroll", { mode: v })}
              disabled={readOnly}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {payrollOptions.map((o: any) => (
                  <SelectItem key={o.value} value={o.value}>{pickLabel(o.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(band.payroll?.mode === "actual_worked_time" || band.payroll?.mode === "unpaid_early_minutes") && (
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Paid grace</Label>
                  <Input type="number" min={0} value={band.payroll?.paid_grace_minutes ?? 0}
                    onChange={(e) => updateNested(idx, "payroll", { paid_grace_minutes: Number(e.target.value) })}
                    disabled={readOnly} className="h-8 text-sm" />
                </div>
                <div><Label className="text-xs">Rounding</Label>
                  <Input type="number" min={0} value={band.payroll?.rounding_minutes ?? 0}
                    onChange={(e) => updateNested(idx, "payroll", { rounding_minutes: Number(e.target.value) })}
                    disabled={readOnly} className="h-8 text-sm" />
                </div>
              </div>
            )}
          </div>

          {/* notifications (per-recipient, §7.7) */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2 space-y-2">
            <Label className="text-xs font-medium">Notifications</Label>
            {(["operations", "supervisor", "client", "guard"] as const).map((recipient) => {
              const r = (band.notifications as any)?.[recipient] ?? {};
              const keys = Object.keys(r).filter((k) => k !== "detail_level");
              return (
                <div key={recipient} className="space-y-1">
                  <Label className="text-[11px] capitalize">{recipient}</Label>
                  <div className="flex flex-wrap gap-2">
                    {keys.map((k) => (
                      <label key={k} className="flex items-center gap-1 text-[11px] bg-white dark:bg-gray-900 border rounded px-1.5 py-0.5">
                        <Switch
                          checked={!!r[k]}
                          onCheckedChange={(v) => updateNested(idx, "notifications", {
                            [recipient]: { ...r, [k]: v },
                          })}
                          disabled={readOnly}
                        />
                        {k.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                  {recipient === "client" && (
                    <div className="mt-1">
                      <Label className="text-[11px]">Client detail level</Label>
                      <Select value={r.detail_level ?? "summary"}
                        onValueChange={(v) => updateNested(idx, "notifications", { client: { ...r, detail_level: v } })}
                        disabled={readOnly}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {clientDetailOptions.map((o: any) => (
                            <SelectItem key={o.value} value={o.value}>{pickLabel(o.label)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3 w-3 mr-1" /> Add Band
        </Button>
      )}
    </div>
  );
}
