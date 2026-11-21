"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  LiveGuard,
  LiveMapNotifyReason,
  LiveMapNotifyReasonPreset,
} from "@/app/types/liveTracking"
import { liveTrackingService } from "@/service/liveTracking.service"
import SweetAlertService from "@/lib/sweetAlert"
import {
  Bell,
  Loader2,
  Megaphone,
  MessageCircle,
} from "lucide-react"

const FALLBACK_REASONS: LiveMapNotifyReasonPreset[] = [
  {
    key: "check_in_reminder",
    label: "Check-in reminder",
    title: "Please check in",
    message:
      "Please check in for your duty and confirm you are on post. Contact ops if you need help.",
  },
  {
    key: "return_to_post",
    label: "Return to post",
    title: "Return to your assigned site",
    message:
      "Please return to your assigned site / post as soon as it is safe to do so.",
  },
  {
    key: "safety_alert",
    label: "Safety alert",
    title: "Safety alert",
    message:
      "Important safety update from operations. Stay alert, follow site instructions, and report anything unusual immediately.",
  },
  {
    key: "motivation",
    label: "Motivation",
    title: "Great work out there",
    message:
      "Thank you for keeping our sites safe. Stay sharp — your presence makes a difference.",
  },
  {
    key: "shift_update",
    label: "Shift update",
    title: "Shift / schedule update",
    message:
      "There is an update to your shift or instructions. Please review the latest details in the app.",
  },
  {
    key: "custom",
    label: "Custom",
    title: "",
    message: "",
  },
]

type AudiencePreset =
  | "manual"
  | "all_filtered"
  | "on_duty"
  | "off_duty"
  | "offline"

interface NotifyGuardsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guards: LiveGuard[]
  initialSelectedIds?: number[]
}

function idsForPreset(
  guards: LiveGuard[],
  preset: AudiencePreset
): number[] {
  switch (preset) {
    case "all_filtered":
      return guards.map((g) => g.id)
    case "on_duty":
      return guards
        .filter((g) => g.current_assignment !== null)
        .map((g) => g.id)
    case "off_duty":
      return guards
        .filter((g) => g.current_assignment === null)
        .map((g) => g.id)
    case "offline":
      return guards
        .filter((g) => g.online_status === "offline")
        .map((g) => g.id)
    default:
      return []
  }
}

export function NotifyGuardsDialog({
  open,
  onOpenChange,
  guards,
  initialSelectedIds = [],
}: NotifyGuardsDialogProps) {
  const [reasons, setReasons] =
    useState<LiveMapNotifyReasonPreset[]>(FALLBACK_REASONS)
  const [whatsappConfigured, setWhatsappConfigured] =
    useState(false)
  const [loadingDefaults, setLoadingDefaults] = useState(false)
  const [sending, setSending] = useState(false)

  const [reason, setReason] =
    useState<LiveMapNotifyReason>("motivation")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set()
  )

  const [channelFcm, setChannelFcm] = useState(true)
  const [channelInbox, setChannelInbox] = useState(true)
  const [channelWhatsapp, setChannelWhatsapp] = useState(true)

  useEffect(() => {
    if (!open) return

    const seed = new Set(
      initialSelectedIds.filter((id) =>
        guards.some((g) => g.id === id)
      )
    )
    if (seed.size === 0 && guards.length === 1) {
      seed.add(guards[0].id)
    }
    setSelectedIds(seed)

    const motivation =
      FALLBACK_REASONS.find((r) => r.key === "motivation") ||
      FALLBACK_REASONS[0]
    setReason(motivation.key)
    setTitle(motivation.title)
    setMessage(motivation.message)
    setChannelFcm(true)
    setChannelInbox(true)
    setChannelWhatsapp(true)

    let cancelled = false
    setLoadingDefaults(true)
    liveTrackingService
      .getNotifyDefaults()
      .then((defaults) => {
        if (cancelled) return
        if (defaults.reasons?.length) {
          setReasons(defaults.reasons)
        }
        setWhatsappConfigured(
          Boolean(defaults.whatsapp_configured)
        )
        if (!defaults.whatsapp_configured) {
          setChannelWhatsapp(false)
        }
      })
      .catch(() => {
        if (!cancelled) setWhatsappConfigured(false)
      })
      .finally(() => {
        if (!cancelled) setLoadingDefaults(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, guards, initialSelectedIds])

  const selectedCount = selectedIds.size

  const guardById = useMemo(() => {
    const map = new Map<number, LiveGuard>()
    guards.forEach((g) => map.set(g.id, g))
    return map
  }, [guards])

  const applyReason = (key: LiveMapNotifyReason) => {
    setReason(key)
    const preset =
      reasons.find((r) => r.key === key) ||
      FALLBACK_REASONS.find((r) => r.key === key)
    if (!preset) return
    if (key !== "custom") {
      setTitle(preset.title)
      setMessage(preset.message)
    }
  }

  const applyAudience = (preset: AudiencePreset) => {
    if (preset === "manual") return
    setSelectedIds(new Set(idsForPreset(guards, preset)))
  }

  const toggleGuard = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(guards.map((g) => g.id)))
  }

  const clearAll = () => setSelectedIds(new Set())

  const handleSend = async () => {
    if (selectedCount < 1) {
      await SweetAlertService.warning(
        "No guards selected",
        "Select at least one guard to notify."
      )
      return
    }
    if (!title.trim() || !message.trim()) {
      await SweetAlertService.warning(
        "Message required",
        "Enter a title and message before sending."
      )
      return
    }
    if (!channelFcm && !channelInbox && !channelWhatsapp) {
      await SweetAlertService.warning(
        "No channel",
        "Turn on at least one delivery channel."
      )
      return
    }

    setSending(true)
    try {
      const result = await liveTrackingService.notifyGuards({
        guard_ids: Array.from(selectedIds),
        reason,
        title: title.trim(),
        message: message.trim(),
        channels: {
          fcm: channelFcm,
          inbox: channelInbox,
          whatsapp: channelWhatsapp,
        },
      })

      const s = result.summary
      await SweetAlertService.success(
        "Notifications sent",
        `Requested ${s.requested} · Push ${s.fcm_ok} · Inbox ${s.inbox_ok} · WhatsApp ${s.whatsapp_ok}` +
          (s.whatsapp_skipped
            ? ` (${s.whatsapp_skipped} WA skipped)`
            : "")
      )
      onOpenChange(false)
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Failed to send notifications."
      await SweetAlertService.error("Notify failed", msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90vh,760px)] w-[95vw] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-5 w-5 text-[#a4081f]" />
            Notify guards
          </DialogTitle>
          <DialogDescription>
            Send push, in-app inbox, and WhatsApp (when configured)
            to one or many officers on the live map.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <div className="space-y-5 pb-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Quick audience
              </Label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all_filtered", "All filtered"],
                    ["on_duty", "On duty"],
                    ["off_duty", "Off duty"],
                    ["offline", "Offline"],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => applyAudience(key)}
                  >
                    {label}
                    <Badge
                      variant="secondary"
                      className="ml-2"
                    >
                      {idsForPreset(guards, key).length}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-medium">
                  Recipients ({selectedCount})
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={selectAll}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={clearAll}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="max-h-36 overflow-y-auto overscroll-contain rounded-lg border border-zinc-200">
                {guards.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    No guards in the current filter.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {guards.map((guard) => {
                      const checked = selectedIds.has(
                        guard.id
                      )
                      return (
                        <li
                          key={guard.id}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <Checkbox
                            id={`notify-guard-${guard.id}`}
                            checked={checked}
                            onCheckedChange={(v) =>
                              toggleGuard(
                                guard.id,
                                v === true
                              )
                            }
                          />
                          <label
                            htmlFor={`notify-guard-${guard.id}`}
                            className="flex min-w-0 flex-1 cursor-pointer flex-col"
                          >
                            <span className="truncate text-sm font-medium">
                              {guard.full_name}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {guard.guard_code}
                              {guard.current_assignment
                                ? " · On duty"
                                : " · Off duty"}
                              {guard.online_status ===
                              "offline"
                                ? " · Offline"
                                : ""}
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Reason
              </Label>
              <div className="flex flex-wrap gap-2">
                {reasons.map((preset) => (
                  <Button
                    key={preset.key}
                    type="button"
                    size="sm"
                    variant={
                      reason === preset.key
                        ? "default"
                        : "outline"
                    }
                    className={
                      reason === preset.key
                        ? "bg-[#a4081f] hover:bg-[#8b071b]"
                        : ""
                    }
                    onClick={() => applyReason(preset.key)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notify-title">Title</Label>
              <Input
                id="notify-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={180}
                placeholder="Notification title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notify-message">Message</Label>
              <Textarea
                id="notify-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Write the message guards will receive…"
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/1000
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-zinc-200 p-3">
              <p className="text-sm font-medium">Channels</p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-zinc-500" />
                  <div>
                    <p className="text-sm">Push (FCM)</p>
                    <p className="text-xs text-muted-foreground">
                      Device push when tokens exist
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channelFcm}
                  onCheckedChange={setChannelFcm}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-zinc-500" />
                  <div>
                    <p className="text-sm">In-app inbox</p>
                    <p className="text-xs text-muted-foreground">
                      Saved to notification records
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channelInbox}
                  onCheckedChange={setChannelInbox}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-zinc-500" />
                  <div>
                    <p className="text-sm">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">
                      {loadingDefaults
                        ? "Checking credentials…"
                        : whatsappConfigured
                          ? "Meta credentials detected"
                          : "Not configured — enable in Settings → WhatsApp"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channelWhatsapp}
                  disabled={!whatsappConfigured}
                  onCheckedChange={setChannelWhatsapp}
                />
              </div>
            </div>

            {selectedCount > 0 && selectedCount <= 5 && (
              <p className="text-xs text-muted-foreground">
                Sending to:{" "}
                {Array.from(selectedIds)
                  .map(
                    (id) =>
                      guardById.get(id)?.full_name || `#${id}`
                  )
                  .join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t bg-background px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#a4081f] text-white hover:bg-[#8b071b]"
            onClick={handleSend}
            disabled={sending || selectedCount < 1}
          >
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bell className="mr-2 h-4 w-4" />
            )}
            Send to {selectedCount || 0}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
