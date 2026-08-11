// components/client-contract-service-component/client-contract-service-component-show.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState, useEffect } from 'react';
import Image from "next/image";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchClientContractServiceComponent } from "@/store/slices/client-contract-service-component.slice";
import { ClientContractServiceComponent } from "@/app/types/client-contract-service-component";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Hash,
  DollarSign,
  Layers,
  Link,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  CheckSquare,
  Square,
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientContractServiceComponentShowProps {
  trigger: ReactNode;
  id: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ClientContractServiceComponentShow({
  trigger,
  id,
  isOpen,
  onOpenChange
}: ClientContractServiceComponentShowProps) {
  const dispatch = useAppDispatch();
  const { currentItem, isLoading } = useAppSelector(
    (state) => state.clientContractServiceComponent
  );
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen && id) {
      loadComponent();
    }
  }, [isOpen, id]);

  const loadComponent = async () => {
    if (!id) return;

    setIsFetching(true);
    try {
      await dispatch(fetchClientContractServiceComponent(id));
    } catch (error) {
      console.error("Failed to load component:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const component = currentItem;

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return `$${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Get flag badge
  const getFlagBadge = (value: boolean, trueLabel: string, falseLabel: string) => {
    if (value) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          {trueLabel}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0">
        <XCircle className="h-3 w-3 mr-1" />
        {falseLabel}
      </Badge>
    );
  };

  // Loading skeleton
  if (isLoading || isFetching) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!component) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Component Not Found
              </h3>
              <p className="text-gray-500">
                The component you're looking for could not be found.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Component Details</span>
          <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-0">
            ID: #{component.id}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            component.is_active
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {component.is_active ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-medium ${
              component.is_active
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {component.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              Updated: {formatDate(component.updated_at)}
            </span>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parent Service */}
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Package className="h-4 w-4" />
                Parent Contract Service
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {component.client_contract_service_id || "N/A"}
              </p>
            </div>

            {/* Component Service */}
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Hash className="h-4 w-4" />
                Component Service
              </div>
              {component.company_service ? (
                <>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {component.company_service.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Code: <code>{component.company_service.code}</code>
                  </p>
                </>
              ) : (
                <p className="text-gray-500">N/A</p>
              )}
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Layers className="h-4 w-4" />
                Quantities
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {component.quantity || 1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Included Quantity</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {component.included_quantity || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                Order
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Sort Order: {component.sort_order || 0}
              </p>
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Component Flags
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Required</p>
                {getFlagBadge(component.is_required, "Required", "Not Required")}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Optional</p>
                {getFlagBadge(component.is_optional, "Optional", "Not Optional")}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Included in Parent Price</p>
                {getFlagBadge(component.is_included_in_parent_price, "Included", "Not Included")}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Client Billable</p>
                {getFlagBadge(component.is_client_billable, "Billable", "Not Billable")}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Selling Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(component.selling_rate)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Internal Cost</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(component.internal_cost)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Additional Unit Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(component.additional_unit_rate)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {component.notes && (
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                Notes
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {component.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              Created: {formatDate(component.created_at)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              Last Updated: {formatDate(component.updated_at)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
