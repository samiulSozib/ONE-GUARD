"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientContractServiceCreateForm } from "@/components/client-contract-service/client-contract-service-create-form";
import { ClientContractServiceEditForm } from "@/components/client-contract-service/client-contract-service-edit-form";
import { clientContractServiceService } from "@/service/client-contract-service.service";
import type { ClientContractService } from "@/app/types/client-contract-service";
import { Loader2, Package, Pencil, Plus, RefreshCw } from "lucide-react";

interface ContractServicesPanelProps {
  contractId: number;
  currency?: string | null;
}

function formatMoney(
  value: number | string | null | undefined,
  currency?: string | null
) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency || ""}`.trim();
  }
}

export function ContractServicesPanel({
  contractId,
  currency,
}: ContractServicesPanelProps) {
  const [items, setItems] = useState<ClientContractService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] =
    useState<ClientContractService | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clientContractServiceService.getClientContractServices({
        client_contract_id: contractId,
        per_page: 100,
        include_site: true,
      });
      setItems(response.items || []);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to load contract services"
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Contract services
          </h3>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Add catalog services on demand and override sell rates for this
            contract. Invoices bill from these lines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={load}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add service
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading && items.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No services on this contract yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a company catalog service and set the overridden rates for
                this client.
              </p>
            </div>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add first service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((service) => {
            const name =
              service.company_service?.name ||
              service.company_service?.code ||
              `Service #${service.id}`;
            const siteName =
              service.contract_site?.site?.site_name || null;

            return (
              <Card key={service.id} className="border-border/80">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{name}</p>
                      <Badge
                        variant="outline"
                        className={
                          service.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-zinc-50 text-zinc-600"
                        }
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {service.pricing_type && (
                        <Badge variant="secondary" className="capitalize">
                          {String(service.pricing_type).replaceAll("_", " ")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {siteName ? `Site: ${siteName}` : "Site linked via contract"}
                      {" · "}
                      Qty {service.quantity ?? 1}
                      {" · "}
                      Sell {formatMoney(service.selling_rate, currency)}
                      {service.fixed_amount != null &&
                        Number(service.fixed_amount) > 0 && (
                          <>
                            {" · "}
                            Fixed {formatMoney(service.fixed_amount, currency)}
                          </>
                        )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditItem(service);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit rates
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ClientContractServiceCreateForm
        trigger={<span className="hidden" />}
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
        defaultContractId={contractId}
        onSuccess={() => {
          setCreateOpen(false);
          load();
        }}
      />

      {editItem && (
        <ClientContractServiceEditForm
          trigger={<span className="hidden" />}
          item={editItem}
          isOpen={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditItem(null);
          }}
          onSuccess={() => {
            setEditOpen(false);
            setEditItem(null);
            load();
          }}
        />
      )}
    </div>
  );
}
