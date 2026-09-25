"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PolicyItem, TemplateValue, TemplateLocaleValue } from "@/app/types/attendancePolicy";
import { LOCALE_DISPLAY } from "./locale-utils";

interface Props {
  value: TemplateValue | any;
  definition: PolicyItem;
  readOnly?: boolean;
  onChange: (v: TemplateValue) => void;
}

const DEFAULT_LOCALES = ["en", "fa", "ps"];
const DEFAULT_PLACEHOLDERS = ["{early_duration}"];
const DEFAULT_FIELDS = ["title", "message", "reason_label", "reason_placeholder", "primary_action", "secondary_action"];

export default function TemplateEditor({ value, definition, readOnly, onChange }: Props) {
  const md = (definition.metadata ?? {}) as any;
  const locales: string[] = md.supported_locales ?? DEFAULT_LOCALES;
  const placeholders: string[] = md.supported_placeholders ?? DEFAULT_PLACEHOLDERS;
  const templateFields: string[] = md.template_fields ?? DEFAULT_FIELDS;

  const current: TemplateValue = value && typeof value === "object" ? value : {};
  const [active, setActive] = useState<string>(locales[0] ?? "en");

  const updateField = (locale: string, field: string, v: string) => {
    const obj: TemplateLocaleValue = { ...(current[locale] ?? {}) };
    obj[field] = v;
    onChange({ ...current, [locale]: obj });
  };

  return (
    <div className="space-y-3">
      {placeholders.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-gray-500">
          <span>Supported placeholders:</span>
          {placeholders.map((p) => (
            <Badge key={p} variant="outline" className="text-[10px] font-mono">{p}</Badge>
          ))}
        </div>
      )}

      <Tabs value={active} onValueChange={setActive}>
        <TabsList>
          {locales.map((loc) => (
            <TabsTrigger key={loc} value={loc} className="text-xs">
              {LOCALE_DISPLAY[loc] ?? loc.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        {locales.map((loc) => {
          const obj = current[loc] ?? {};
          return (
            <TabsContent key={loc} value={loc} className="space-y-2 mt-2">
              {templateFields.map((field) => {
                const isLong = field === "message" || field === "reason_placeholder";
                const label = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    {isLong ? (
                      <Textarea value={obj[field] ?? ""}
                        onChange={(e) => updateField(loc, field, e.target.value)}
                        disabled={readOnly} rows={3} className="text-sm"
                        placeholder={placeholders.length ? `Use ${placeholders.join(", ")}` : ""} />
                    ) : (
                      <Input value={obj[field] ?? ""}
                        onChange={(e) => updateField(loc, field, e.target.value)}
                        disabled={readOnly} className="h-8 text-sm" />
                    )}
                  </div>
                );
              })}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
