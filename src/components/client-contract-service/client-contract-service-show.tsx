// components/client-contract-service/client-contract-service-show.tsx
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
import { fetchClientContractService } from "@/store/slices/client-contract-service.slice";
import { ClientContractService } from "@/app/types/client-contract-service";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  DollarSign,
  Building,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Percent,
  Hash,
  MapPin,
  Users
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientContractServiceShowProps {
  trigger: ReactNode;
  id: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ClientContractServiceShow({
  trigger,
  id,
  isOpen,
  onOpenChange
}: ClientContractServiceShowProps) {
  const dispatch = useAppDispatch();
  const { currentItem, isLoading } = useAppSelector(
    (state) => state.clientContractService
  );
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen && id) {
      loadItem();
    }
  }, [isOpen, id]);

  const loadItem = async () => {
    if (!id) return;

    setIsFetching(true);
    try {
      await dispatch(fetchClientContractService(id));
    } catch (error) {
      console.error("Failed to load contract service:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const item = currentItem;

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return `$${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
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

  if (!item) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Contract Service Not Found
              </h3>
              <p className="text-gray-500">
                The contract service you're looking for could not be found.
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
          <span className="whitespace-nowrap">Contract Service Details</span>
          <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-0">
            ID: #{item.id}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            item.is_active
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {item.is_active ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-medium ${
              item.is_active
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              Updated: {formatDate(item.updated_at)}
            </span>
          </div>

          {/* Service Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Package className="h-4 w-4" />
                Company Service
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.company_service?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Code: <code>{item.company_service?.code || "N/A"}</code>
              </p>
            </div>

            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Building className="h-4 w-4" />
                Contract Site
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.contract_site?.site_id || "N/A"}
              </p>
            </div>
          </div>

          {/* Billing & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <CreditCard className="h-4 w-4" />
                Billing Method
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.billing_method?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Type: <Badge variant="outline" className="text-xs">{item.billing_method?.calculation_type || "N/A"}</Badge>
              </p>
            </div>

            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                Pricing
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Selling Rate</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.selling_rate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Internal Cost</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.internal_cost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pricing Type</p>
                  <Badge variant="outline" className="text-xs">
                    {item.pricing_type?.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {item.quantity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500">Overtime Rate</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.overtime_rate)}
              </p>
            </div>
            <div className="space-y-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500">Holiday Rate</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.holiday_rate)}
              </p>
            </div>
            <div className="space-y-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500">Night Rate</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.night_rate)}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                Start Date
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(item.start_date)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                End Date
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(item.end_date) || "Ongoing"}
              </p>
            </div>
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                Notes
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              Created: {formatDate(item.created_at)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              Last Updated: {formatDate(item.updated_at)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
