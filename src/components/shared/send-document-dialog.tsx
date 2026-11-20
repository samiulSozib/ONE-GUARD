"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MessageCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SweetAlertService from "@/lib/sweetAlert";
import { invoiceService } from "@/service/invoice.service";
import { timesheetService } from "@/service/timesheet.service";
import type {
  DocumentSendChannel,
  DocumentSendResult,
  WhatsAppBusinessCapability,
  WhatsAppDelivery,
} from "@/app/types/document-send";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: "invoice" | "timesheet";
  documentLabel?: string;
  invoiceId?: number;
  guardId?: number;
  periodStart?: string;
  periodEnd?: string;
  defaultTo?: string | null;
  defaultWhatsapp?: string | null;
  onSent?: () => void;
};

export default function SendDocumentDialog({
  open,
  onOpenChange,
  documentType,
  documentLabel,
  invoiceId,
  guardId,
  periodStart,
  periodEnd,
  defaultTo,
  defaultWhatsapp,
  onSent,
}: Props) {
  const [channel, setChannel] = useState<DocumentSendChannel>("email");
  const [whatsappDelivery, setWhatsappDelivery] =
    useState<WhatsAppDelivery>("open");
  const [business, setBusiness] = useState<WhatsAppBusinessCapability | null>(
    null
  );
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState(documentLabel || "");

  const showEmail = channel === "email" || channel === "both";
  const showWhatsapp = channel === "whatsapp" || channel === "both";
  const businessReady = !!business?.configured;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const hydrate = async () => {
      setLoadingDefaults(true);
      setChannel("email");
      setWhatsappDelivery("open");
      setBusiness(null);
      setCc("");
      setBcc("");
      setMessage("");
      setTo(defaultTo || "");
      setWhatsappNumber(defaultWhatsapp || "");
      setResolvedLabel(
        documentLabel || (documentType === "invoice" ? "Invoice" : "Timesheet")
      );
      setSubject(
        documentType === "invoice"
          ? `${documentLabel || "Invoice"} — OneGuard`
          : `${documentLabel || "Timesheet"} — OneGuard`
      );

      try {
        if (documentType === "invoice" && invoiceId) {
          const defaults = await invoiceService.getSendDefaults(invoiceId);
          if (cancelled) return;
          setTo(defaults.to || defaultTo || "");
          setWhatsappNumber(defaults.whatsapp_number || defaultWhatsapp || "");
          if (defaults.whatsapp_business) setBusiness(defaults.whatsapp_business);
          if (defaults.default_whatsapp_delivery) {
            setWhatsappDelivery(defaults.default_whatsapp_delivery);
          }
          if (defaults.document_label) {
            setResolvedLabel(defaults.document_label);
            setSubject(`${defaults.document_label} — OneGuard`);
          }
          if (defaults.client_name) {
            setMessage(
              `Dear ${defaults.client_name},\n\nPlease find attached ${defaults.document_label || "your invoice"} from OneGuard Private Security Services Inc.`
            );
          }
        } else if (documentType === "timesheet") {
          const defaults = await timesheetService.getSendDefaults(guardId);
          if (cancelled) return;
          setTo(defaults.to || defaultTo || "");
          setWhatsappNumber(defaults.whatsapp_number || defaultWhatsapp || "");
          if (defaults.whatsapp_business) setBusiness(defaults.whatsapp_business);
          if (defaults.default_whatsapp_delivery) {
            setWhatsappDelivery(defaults.default_whatsapp_delivery);
          }
          if (defaults.document_label) {
            setResolvedLabel(defaults.document_label);
            setSubject(`${defaults.document_label} — OneGuard`);
          }
          const who = defaults.guard_name || "team";
          const period =
            periodStart && periodEnd ? ` for ${periodStart} to ${periodEnd}` : "";
          setMessage(
            `Hello,\n\nPlease find attached the timesheet for ${who}${period} from OneGuard Private Security Services Inc.`
          );
        }
      } catch {
        // Keep local defaults if API defaults fail.
      } finally {
        if (!cancelled) setLoadingDefaults(false);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    documentType,
    invoiceId,
    guardId,
    documentLabel,
    defaultTo,
    defaultWhatsapp,
    periodStart,
    periodEnd,
  ]);

  const handleSend = async () => {
    if (showEmail && !to.trim()) {
      SweetAlertService.error("Email required", "Add at least one recipient email in To.");
      return;
    }
    if (showWhatsapp && !whatsappNumber.trim()) {
      SweetAlertService.error(
        "WhatsApp number required",
        "Enter a WhatsApp number with country code."
      );
      return;
    }
    if (
      showWhatsapp &&
      (whatsappDelivery === "business" || whatsappDelivery === "both") &&
      !businessReady
    ) {
      SweetAlertService.error(
        "Business API not configured",
        "Enable WhatsApp under Settings → WhatsApp and add Meta credentials, or choose Open WhatsApp."
      );
      return;
    }
    if (documentType === "timesheet" && (!periodStart || !periodEnd)) {
      SweetAlertService.error(
        "Period required",
        "Timesheet period start and end are required."
      );
      return;
    }

    try {
      setSending(true);
      let result: DocumentSendResult;

      const payloadBase = {
        channel,
        whatsapp_delivery: showWhatsapp ? whatsappDelivery : undefined,
        to: to.trim() || undefined,
        cc: cc.trim() || undefined,
        bcc: bcc.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
        whatsapp_number: whatsappNumber.trim() || undefined,
      };

      if (documentType === "invoice" && invoiceId) {
        result = await invoiceService.sendDocument(invoiceId, payloadBase);
      } else {
        result = await timesheetService.sendDocument({
          ...payloadBase,
          guard_id: guardId,
          period_start: periodStart!,
          period_end: periodEnd!,
        });
      }

      if (result.whatsapp_url) {
        window.open(result.whatsapp_url, "_blank", "noopener,noreferrer");
      }

      SweetAlertService.success(
        "Sent",
        result.message ||
          (showWhatsapp
            ? "WhatsApp handled."
            : "Email sent with PDF attached.")
      );
      onOpenChange(false);
      onSent?.();
    } catch (e: any) {
      const msg =
        (typeof e === "string" ? e : null) ||
        e?.response?.data?.message ||
        e?.response?.data?.errors?.whatsapp_delivery?.[0] ||
        e?.response?.data?.errors?.to?.[0] ||
        e?.response?.data?.errors?.whatsapp_number?.[0] ||
        e?.response?.data?.errors?.channel?.[0] ||
        e?.message ||
        "Could not send document.";
      SweetAlertService.error("Send failed", msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send {resolvedLabel || "document"}
          </DialogTitle>
          <DialogDescription>
            Email, open WhatsApp chat, or send via WhatsApp Business API.
          </DialogDescription>
        </DialogHeader>

        {loadingDefaults ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading recipient…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Send via</Label>
              <Select
                value={channel}
                onValueChange={(v) => setChannel(v as DocumentSendChannel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </span>
                  </SelectItem>
                  <SelectItem value="both">Email + WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showEmail && (
              <div className="space-y-3 rounded-md border p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="send-to">To</Label>
                  <Input
                    id="send-to"
                    type="text"
                    placeholder="client@company.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Separate multiple with comma or semicolon.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="send-cc">CC</Label>
                    <Input
                      id="send-cc"
                      type="text"
                      placeholder="optional"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="send-bcc">BCC</Label>
                    <Input
                      id="send-bcc"
                      type="text"
                      placeholder="optional"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="send-subject">Subject</Label>
                  <Input
                    id="send-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>
            )}

            {showWhatsapp && (
              <div className="space-y-3 rounded-md border p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  WhatsApp
                </p>
                <div className="space-y-1.5">
                  <Label>Delivery</Label>
                  <Select
                    value={whatsappDelivery}
                    onValueChange={(v) =>
                      setWhatsappDelivery(v as WhatsAppDelivery)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">
                        Open WhatsApp (wa.me link)
                      </SelectItem>
                      <SelectItem value="business" disabled={!businessReady}>
                        Send via Business API
                        {!businessReady ? " — not configured" : ""}
                      </SelectItem>
                      <SelectItem value="both" disabled={!businessReady}>
                        Business API + open chat
                        {!businessReady ? " — not configured" : ""}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    {businessReady
                      ? `Business API ready (Meta Cloud${
                          business?.template_configured
                            ? ", template on"
                            : ", session/document message"
                        }).`
                      : "Configure Meta Cloud API under Settings → WhatsApp. Open WhatsApp always works."}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="send-wa">WhatsApp number</Label>
                  <Input
                    id="send-wa"
                    type="tel"
                    placeholder="e.g. 15551234567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Digits with country code, no +.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="send-message">Message</Label>
              <Textarea
                id="send-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || loadingDefaults}>
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
