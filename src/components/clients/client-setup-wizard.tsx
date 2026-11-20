'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileSignature,
  Package,
  SkipForward,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ClientCreateForm } from '@/components/clients/client-create-form'
import { CreateSiteForm } from '@/components/clients/create-site-form'
import { ClientContractCreateForm } from '@/components/client-contract/client-contract-create-form'
import { ClientContractServiceCreateForm } from '@/components/client-contract-service/client-contract-service-create-form'
import { DutyScheduleCreateForm } from '@/components/duty-schedule/duty-schedule-create-form'
import { AssignmentPlansForm } from '@/components/assignment-plans/assignment-plans-form'
import { GuardAssignmentCreateForm } from '@/components/guard-assignment/guard-assignment-create-form'
import { Client } from '@/app/types/client'

type StepId =
  | 'client'
  | 'sites'
  | 'contract'
  | 'services'
  | 'schedule'
  | 'plan'
  | 'assignment'

interface WizardState {
  clientId?: number
  clientName?: string
  siteId?: number
  siteName?: string
  contractId?: number
  contractName?: string
  scheduleId?: number
  scheduleTitle?: string
  planId?: number
}

interface ClientSetupWizardProps {
  trigger: ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** When continuing setup for an existing client */
  initialClient?: Pick<Client, 'id' | 'full_name' | 'company_name'>
  onFinished?: () => void
}

const STEPS: {
  id: StepId
  title: string
  description: string
  icon: typeof UserPlus
  required?: boolean
}[] = [
  {
    id: 'client',
    title: 'Client',
    description: 'Create the client account',
    icon: UserPlus,
    required: true,
  },
  {
    id: 'sites',
    title: 'Sites',
    description: 'Add site(s) and locations',
    icon: Building2,
  },
  {
    id: 'contract',
    title: 'Contract',
    description: 'Link a client contract',
    icon: FileSignature,
  },
  {
    id: 'services',
    title: 'Services',
    description: 'Add contract services / rates',
    icon: Package,
  },
  {
    id: 'schedule',
    title: 'Schedule',
    description: 'Create a shift schedule',
    icon: CalendarDays,
  },
  {
    id: 'plan',
    title: 'Assignment plan',
    description: 'Plan guard coverage',
    icon: ClipboardList,
  },
  {
    id: 'assignment',
    title: 'Assignment',
    description: 'Assign guards to shifts',
    icon: Users,
  },
]

function stepBlocked(id: StepId, state: WizardState): string | null {
  if (id === 'client') return null
  if (!state.clientId) return 'Create a client first'
  if (id === 'sites' || id === 'contract') return null
  if (id === 'services' && !state.contractId) return 'Needs a contract first'
  if ((id === 'schedule' || id === 'plan' || id === 'assignment') && !state.siteId) {
    return 'Needs a site first'
  }
  if (id === 'assignment' && !state.scheduleId) return 'Needs a schedule first'
  return null
}

export function ClientSetupWizard({
  trigger,
  isOpen,
  onOpenChange,
  initialClient,
  onFinished,
}: ClientSetupWizardProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isOpen !== undefined ? isOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (isOpen !== undefined) onOpenChange?.(value)
    else setInternalOpen(value)
  }

  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<WizardState>({})
  const [childOpen, setChildOpen] = useState<StepId | null>(null)

  useEffect(() => {
    if (!open) return
    if (initialClient?.id) {
      setState({
        clientId: initialClient.id,
        clientName: initialClient.company_name || initialClient.full_name,
      })
      setStepIndex(1)
    } else {
      setState({})
      setStepIndex(0)
    }
    setChildOpen(null)
  }, [open, initialClient?.id, initialClient?.company_name, initialClient?.full_name])

  const step = STEPS[stepIndex]
  const blocked = stepBlocked(step.id, state)

  const progressChips = useMemo(() => {
    const chips: { label: string; href?: string }[] = []
    if (state.clientId) {
      chips.push({
        label: state.clientName || `Client #${state.clientId}`,
        href: `/clients/${state.clientId}`,
      })
    }
    if (state.siteId) chips.push({ label: state.siteName || `Site #${state.siteId}` })
    if (state.contractId) chips.push({ label: state.contractName || `Contract #${state.contractId}` })
    if (state.scheduleId) chips.push({ label: state.scheduleTitle || `Schedule #${state.scheduleId}` })
    if (state.planId) chips.push({ label: `Plan #${state.planId}` })
    return chips
  }, [state])

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1)
  }

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => Math.max(initialClient?.id ? 1 : 0, i - 1))
  }

  const finish = () => {
    setOpen(false)
    onFinished?.()
  }

  const openCreate = () => {
    if (blocked) return
    setChildOpen(step.id)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[720px] w-[95vw] max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4 pb-2 border-b">
            <Image src="/images/logo.png" alt="" width={24} height={24} />
            <span>Set up client</span>
          </div>

          {/* Step indicator */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {STEPS.map((s, idx) => {
              const Icon = s.icon
              const done =
                (s.id === 'client' && !!state.clientId) ||
                (s.id === 'sites' && !!state.siteId) ||
                (s.id === 'contract' && !!state.contractId) ||
                (s.id === 'schedule' && !!state.scheduleId) ||
                (s.id === 'plan' && !!state.planId)
              const active = idx === stepIndex
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id === 'client' && initialClient?.id) return
                    if (stepBlocked(s.id, state) && idx > stepIndex) return
                    setStepIndex(idx)
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border transition-colors',
                    active && 'border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
                    !active && done && 'border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30',
                    !active && !done && 'border-border text-muted-foreground'
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  {s.title}
                </button>
              )
            })}
          </div>

          {progressChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {progressChips.map((chip) =>
                chip.href ? (
                  <Link key={chip.label} href={chip.href}>
                    <Badge variant="secondary" className="hover:underline cursor-pointer">
                      {chip.label}
                    </Badge>
                  </Link>
                ) : (
                  <Badge key={chip.label} variant="outline">
                    {chip.label}
                  </Badge>
                )
              )}
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-4 sm:p-5 space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-background border p-2">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base">
                  {step.title}
                  {step.required ? (
                    <span className="text-red-500 text-sm font-normal ml-1">required</span>
                  ) : (
                    <span className="text-muted-foreground text-sm font-normal ml-1">optional</span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </div>

            {blocked ? (
              <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md px-3 py-2">
                {blocked}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Open the create form for this step. Records are saved immediately — you can skip
                remaining steps anytime.
              </p>
            )}

            <Button
              type="button"
              onClick={openCreate}
              disabled={!!blocked}
              className="bg-[#5F0015] hover:bg-[#7a1a2b] text-white"
            >
              {step.id === 'client' && state.clientId
                ? 'Client created — recreate'
                : `Create ${step.title.toLowerCase()}`}
            </Button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button type="button" variant="outline" onClick={goBack} disabled={stepIndex === 0 || (stepIndex === 1 && !!initialClient?.id)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              {!step.required && (
                <Button type="button" variant="ghost" onClick={goNext} disabled={stepIndex >= STEPS.length - 1}>
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
              )}
              {stepIndex < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={step.required && !state.clientId}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" onClick={finish} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Finish
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested create dialogs — one per step */}
      <ClientCreateForm
        trigger={<div />}
        isOpen={childOpen === 'client'}
        onOpenChange={(o) => !o && setChildOpen(null)}
        onSuccess={(client) => {
          if (client?.id) {
            setState((prev) => ({
              ...prev,
              clientId: client.id,
              clientName: client.company_name || client.full_name,
            }))
            setStepIndex(1)
          }
          setChildOpen(null)
        }}
      />

      {state.clientId ? (
        <CreateSiteForm
          trigger={<div />}
          clientId={state.clientId}
          isOpen={childOpen === 'sites'}
          onOpenChange={(o) => !o && setChildOpen(null)}
          onSuccess={(site) => {
            if (site?.id) {
              setState((prev) => ({
                ...prev,
                siteId: site.id,
                siteName: site.site_name || site.title,
              }))
            }
            setChildOpen(null)
          }}
        />
      ) : null}

      <ClientContractCreateForm
        trigger={<div />}
        isOpen={childOpen === 'contract'}
        onOpenChange={(o) => !o && setChildOpen(null)}
        preSelectedClient={state.clientId}
        onSuccess={(contract) => {
          const item = contract?.item || contract
          if (item?.id) {
            setState((prev) => ({
              ...prev,
              contractId: item.id,
              contractName: item.name || `Contract #${item.id}`,
            }))
          }
          setChildOpen(null)
        }}
      />

      <ClientContractServiceCreateForm
        trigger={<div />}
        isOpen={childOpen === 'services'}
        onOpenChange={(o) => !o && setChildOpen(null)}
        onSuccess={() => setChildOpen(null)}
      />

      <DutyScheduleCreateForm
        trigger={<div />}
        isOpen={childOpen === 'schedule'}
        onOpenChange={(o) => !o && setChildOpen(null)}
        onSuccess={(schedule) => {
          const item = schedule?.item || schedule
          if (item?.id) {
            setState((prev) => ({
              ...prev,
              scheduleId: item.id,
              scheduleTitle: item.title || `Schedule #${item.id}`,
              siteId: prev.siteId || item.site_id,
            }))
          }
          setChildOpen(null)
        }}
      />

      <AssignmentPlansForm
        trigger={<div />}
        isOpen={childOpen === 'plan'}
        onOpenChange={(o) => !o && setChildOpen(null)}
        onSuccess={() => setChildOpen(null)}
      />

      <GuardAssignmentCreateForm
        trigger={<div />}
        isOpen={childOpen === 'assignment'}
        onOpenChange={(o) => !o && setChildOpen(null)}
        onSuccess={() => setChildOpen(null)}
      />
    </>
  )
}
