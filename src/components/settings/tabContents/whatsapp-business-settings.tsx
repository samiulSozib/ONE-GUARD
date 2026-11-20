"use client";

import type { SettingGroup, SettingValue } from "@/app/types/settings.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageCircle } from "lucide-react";

const KEYS = {
  enabled: "whatsapp_business.enabled",
  phoneNumberId: "whatsapp_business.phone_number_id",
  accessToken: "whatsapp_business.access_token",
  apiVersion: "whatsapp_business.api_version",
  wabaId: "whatsapp_business.waba_id",
  template: "whatsapp_business.document_template",
  templateLang: "whatsapp_business.document_template_language",
} as const;

interface Props {
  group: SettingGroup;
  values: Record<string, SettingValue>;
  onChange: (key: string, value: SettingValue) => void;
  disabled?: boolean;
}

function asString(value: SettingValue | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asBool(value: SettingValue | undefined): boolean {
  return value === true || value === 1 || value === "1";
}

export default function WhatsAppBusinessSettings({
  group,
  values,
  onChange,
  disabled,
}: Props) {
  const enabled = asBool(values[KEYS.enabled]);
  const tokenItem = group.items.find((i) => i.key === KEYS.accessToken);
  const tokenSet = !!(tokenItem as { has_value?: boolean } | undefined)?.has_value
    || (asString(values[KEYS.accessToken]).length > 0 && !asString(values[KEYS.accessToken]).includes("•"))
    || asString(values[KEYS.accessToken]).includes("•");
  const phoneSet = asString(values[KEYS.phoneNumberId]).trim() !== "";
  const ready = enabled && phoneSet && tokenSet;

  const desc = (key: string) =>
    group.items.find((i) => i.key === key)?.description || "";

  return (
    <div className="space-y-4">
      <Card className="shadow-sm rounded-2xl border-0 overflow-hidden">
        <div className="bg-[#F4F6F8] dark:bg-gray-800/60 px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp Cloud API (Meta)
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Official Business API credentials. Ask the app owner for Phone Number ID and access token from Meta Developer.
            </p>
          </div>
          <Badge
            variant="secondary"
            className={
              ready
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }
          >
            {ready ? "Ready to send" : enabled ? "Incomplete credentials" : "Disabled"}
          </Badge>
        </div>
        <CardContent className="space-y-5 p-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-3">
            <div>
              <Label className="text-sm">Enable Business API send</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {desc(KEYS.enabled)}
              </p>
            </div>
            <Switch
              checked={enabled}
              disabled={disabled}
              onCheckedChange={(v) => onChange(KEYS.enabled, v)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="wa-phone-id">Phone Number ID</Label>
              <Input
                id="wa-phone-id"
                value={asString(values[KEYS.phoneNumberId])}
                disabled={disabled}
                placeholder="e.g. 123456789012345"
                onChange={(e) => onChange(KEYS.phoneNumberId, e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">{desc(KEYS.phoneNumberId)}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa-waba">WABA ID (optional)</Label>
              <Input
                id="wa-waba"
                value={asString(values[KEYS.wabaId])}
                disabled={disabled}
                placeholder="WhatsApp Business Account ID"
                onChange={(e) => onChange(KEYS.wabaId, e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">{desc(KEYS.wabaId)}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wa-token">Access Token</Label>
            <Input
              id="wa-token"
              type="password"
              autoComplete="new-password"
              value={asString(values[KEYS.accessToken])}
              disabled={disabled}
              placeholder={tokenSet ? "Saved (enter new token to replace)" : "Paste Meta access token"}
              onChange={(e) => onChange(KEYS.accessToken, e.target.value)}
              onFocus={(e) => {
                // Clear masked value so admin can paste a new token cleanly.
                if (asString(values[KEYS.accessToken]).includes("•")) {
                  onChange(KEYS.accessToken, "");
                  e.target.value = "";
                }
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              {desc(KEYS.accessToken)} Leave blank when saving other fields to keep the current token.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="wa-version">API version</Label>
              <Input
                id="wa-version"
                value={asString(values[KEYS.apiVersion]) || "v21.0"}
                disabled={disabled}
                onChange={(e) => onChange(KEYS.apiVersion, e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa-template">Document template (optional)</Label>
              <Input
                id="wa-template"
                value={asString(values[KEYS.template])}
                disabled={disabled}
                placeholder="approved_template_name"
                onChange={(e) => onChange(KEYS.template, e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa-lang">Template language</Label>
              <Input
                id="wa-lang"
                value={asString(values[KEYS.templateLang]) || "en"}
                disabled={disabled}
                onChange={(e) => onChange(KEYS.templateLang, e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/80">What the owner needs to create</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Meta Business + WhatsApp Business Account</li>
              <li>WhatsApp product in a Meta Developer app</li>
              <li>Phone Number ID + permanent System User token</li>
              <li>Optional: approved message template with document header for cold outreach</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
