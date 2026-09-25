"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Lock, AlertCircle, Info } from "lucide-react";
import type { PolicyItem } from "@/app/types/attendancePolicy";
import { cn } from "@/lib/utils";
import { pickLabel } from "./locale-utils";
import { ENGINE_FLAG_KEY } from "./section-config";
import RuleBuilderEditor from "./rule-builder-editor";
import ReasonCatalogEditor from "./reason-catalog-editor";
import TemplateEditor from "./template-editor";

interface Props {
  item: PolicyItem;
  draftValue: unknown;
  hasDraft: boolean;
  overrideEnabled: boolean;
  fieldErrors?: string[];
  isDeleting?: boolean;
  onChange: (value: unknown) => void;
  onEnableOverride: () => void;
  onDisableOverride: () => void;
}

const sourceLabel = (s: string | null | undefined) =>
  s === "global" ? "Global"
  : s === "site" ? "Site"
  : s === "site_location" ? "Site Location"
  : s === "duty" ? "Duty"
  : "—";

export default function PolicyControlRow({
  item, draftValue, hasDraft, overrideEnabled,
  fieldErrors, isDeleting, onChange, onEnableOverride, onDisableOverride,
}: Props) {
  const isGlobal = item.scope_type === "global";
  const isEngineFlag = item.key === ENGINE_FLAG_KEY;

  /* §5 — respect flags */
  const canEdit = item.is_editable;
  const canOverride = !isGlobal && item.can_override && item.is_editable && item.is_inheritable;

  /* §7.4 — Global editable; §7.5–7.6 — scoped read-only until override enabled */
  const readOnly = isGlobal ? !canEdit : !overrideEnabled;

  const currentValue = hasDraft ? draftValue : item.effective_value;
  const isOverridden = item.has_override || overrideEnabled;

  /* ---------- Controls ---------- */
  const renderToggle = () => (
    <Switch
      checked={isEngineFlag ? false : Boolean(currentValue)}
      onCheckedChange={(v) => !isEngineFlag && onChange(v)}
      disabled={readOnly || isEngineFlag}
    />
  );
  const renderNumber = () => (
    <Input
      type="number"
      value={currentValue == null ? "" : String(currentValue)}
      min={item.validation_rules?.min}
      max={item.validation_rules?.max}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      disabled={readOnly}
      className="h-9 text-sm w-full sm:w-40"
    />
  );
  const renderSelect = () => (
    <Select
      value={currentValue == null ? "" : String(currentValue)}
      onValueChange={onChange}
      disabled={readOnly}
    >
      <SelectTrigger className="h-9 text-sm w-full sm:w-56"><SelectValue placeholder="Select..." /></SelectTrigger>
      <SelectContent>
        {item.options?.map((opt) => (
          <SelectItem key={String(opt.value)} value={String(opt.value)}>{pickLabel(opt.label)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderControl = () => {
    switch (item.control_type) {
      case "toggle": return renderToggle();
      case "number": return renderNumber();
      case "select": return renderSelect();
      case "repeater":
        return <ReasonCatalogEditor value={(currentValue ?? []) as any} definition={item} readOnly={readOnly} onChange={onChange} />;
      case "rule_builder":
        return <RuleBuilderEditor value={(currentValue ?? []) as any} definition={item} readOnly={readOnly} onChange={onChange} />;
      case "template_editor":
        return <TemplateEditor value={(currentValue ?? {}) as any} definition={item} readOnly={readOnly} onChange={onChange} />;
      default: return null;
    }
  };

  /* ---------- Inherited / override source badge ---------- */
  const sourceBadge = () => {
    if (isGlobal) return null;
    if (isOverridden) {
      return (
        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-900/30">
          Override at this level
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] border-gray-300 text-gray-600">
        Inherited from {sourceLabel(item.effective_source)}
        {item.effective_source_id != null ? ` #${item.effective_source_id}` : ""}
      </Badge>
    );
  };

  return (
    <div className={cn(
      "flex flex-col gap-3 py-4 px-3 sm:px-4 border-b border-gray-100 dark:border-gray-800 last:border-0",
      hasDraft && "bg-amber-50/40 dark:bg-amber-900/10"
    )}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm font-medium">{pickLabel(item.label)}</Label>
            {sourceBadge()}
            {isEngineFlag && (
              <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-900/30">
                <Lock className="h-3 w-3 mr-1" /> Locked OFF
              </Badge>
            )}
            {!item.is_editable && (
              <Badge variant="outline" className="text-[10px]">Read-only</Badge>
            )}
          </div>

          {item.description && (
            <p className="text-xs text-gray-500 mt-1">{pickLabel(item.description)}</p>
          )}

          {/* §5 — show inherited value + source for non-overridden scoped fields */}
          {!isGlobal && !isOverridden && (
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Inherited:{" "}
              <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] max-w-[220px] truncate">
                {typeof item.inherited_value === "string"
                  ? item.inherited_value
                  : JSON.stringify(item.inherited_value)}
              </code>
              <span className="ml-1">({sourceLabel(item.effective_source)})</span>
            </p>
          )}

          {fieldErrors?.length ? (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {fieldErrors.join(", ")}
            </p>
          ) : null}
        </div>

        {/* §7.5–7.6 — Enable Override switch for scoped fields */}
        {canOverride && (
          <div className="flex items-center gap-2 shrink-0">
            <Label className="text-xs text-gray-600">Enable Override</Label>
            <Switch
              checked={overrideEnabled || item.has_override}
              onCheckedChange={(v) => (v ? onEnableOverride() : onDisableOverride())}
              disabled={isDeleting}
            />
          </div>
        )}
      </div>

      <div className="flex items-start gap-2">
        <div className="flex-1">{renderControl()}</div>
      </div>
    </div>
  );
}
