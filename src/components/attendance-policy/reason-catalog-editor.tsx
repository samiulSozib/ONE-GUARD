"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import type { PolicyItem, ReasonCatalogItem } from "@/app/types/attendancePolicy";

interface Props {
  value: ReasonCatalogItem[] | any;
  definition: PolicyItem;
  readOnly?: boolean;
  onChange: (v: ReasonCatalogItem[]) => void;
}

const emptyItem = (): ReasonCatalogItem => ({
  code: "", label: { en: "" }, requires_note: false, is_active: true,
});

export default function ReasonCatalogEditor({ value, definition, readOnly, onChange }: Props) {
  const items: ReasonCatalogItem[] = Array.isArray(value) ? value : [];

  /* §7.8 — unique codes + English labels required */
  const issues: string[] = [];
  const seen = new Set<string>();
  items.forEach((it, i) => {
    if (!it.code?.trim()) issues.push(`Row ${i + 1}: code is required`);
    if (!it.label?.en?.trim()) issues.push(`Row ${i + 1}: English label is required`);
    if (it.code && seen.has(it.code)) issues.push(`Duplicate code: ${it.code}`);
    if (it.code) seen.add(it.code);
  });

  const update = (idx: number, patch: Partial<ReasonCatalogItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <div className="space-y-2">
      {issues.length > 0 && (
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-0.5">
          <div className="flex items-center gap-1 font-medium"><AlertTriangle className="h-3 w-3" /> Catalog issues</div>
          {issues.map((m, i) => <div key={i}>• {m}</div>)}
        </div>
      )}

      {items.map((it, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
          <Input placeholder="code (e.g. medical_emergency)" value={it.code}
            onChange={(e) => update(idx, { code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
            disabled={readOnly} className="h-8 text-sm flex-1" />
          <Input placeholder="English label" value={it.label?.en ?? ""}
            onChange={(e) => update(idx, { label: { ...it.label, en: e.target.value } })}
            disabled={readOnly} className="h-8 text-sm flex-1" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-[11px]">Note</Label>
              <Switch checked={it.requires_note}
                onCheckedChange={(v) => update(idx, { requires_note: v })} disabled={readOnly} />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-[11px]">Active</Label>
              <Switch checked={it.is_active}
                onCheckedChange={(v) => update(idx, { is_active: v })} disabled={readOnly} />
            </div>
            {!readOnly && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, i) => i !== idx))} className="h-8 px-2 text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {!readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, emptyItem()])}>
          <Plus className="h-3 w-3 mr-1" /> Add Reason
        </Button>
      )}
    </div>
  );
}
