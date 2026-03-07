"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building,
  CalendarIcon,
  DollarSign,
  FileText,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Hash,
  FileCheck,
  RefreshCw,
  CheckCircle,
  XCircle,
  Pause,
  Ban,
  Download,
  Printer,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ClientContract } from "@/app/types/clientContract";
import { format } from "date-fns";
import { clientContractService } from "@/service/clientContract.service";

// Status colors mapping
const contractStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  active: "bg-green-100 text-green-800 border-green-200",
  suspended: "bg-orange-100 text-orange-800 border-orange-200",
  terminated: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-gray-100 text-gray-800 border-gray-200",
  renewed: "bg-blue-100 text-blue-800 border-blue-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

// Type colors mapping
const contractTypeColors: Record<string, string> = {
  ongoing: "bg-blue-50 text-blue-700 border-blue-200",
  fixed_term: "bg-purple-50 text-purple-700 border-purple-200",
  trial: "bg-cyan-50 text-cyan-700 border-cyan-200",
  one_time: "bg-indigo-50 text-indigo-700 border-indigo-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
};

interface ClientContractViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: number | null;
  onEdit?: (contract: ClientContract) => void;
  onDownload?: (contractId: number) => void;
}

// Define the actual API response structure
interface ApiContractSite {
  id: number;
  site: {
    id: number;
    client_id: number;
    site_name: string;
    site_instruction?: string;
    address?: string;
    guards_required?: number;
    latitude?: string;
    longitude?: string;
    status?: string;
    current_contract_id?: number | null;
    has_active_contract?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  pivot: {
    id: number;
    guards_required?: number;
    site_specific_rate?: string;
    site_specific_rate_formatted?: string;
    operating_hours?: string;
    special_instructions?: string;
    is_primary?: boolean;
    is_active?: boolean;
    assigned_at?: string;
    assigned_at_formatted?: string;
    removed_at?: string;
    removed_at_formatted?: string;
    site_restrictions?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export function ClientContractViewDialog({
  isOpen,
  onOpenChange,
  contractId,
  onEdit,
  onDownload,
}: ClientContractViewDialogProps) {
  const [contract, setContract] = useState<ClientContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentSiteIndex, setCurrentSiteIndex] = useState(0);

  // Fetch contract data
  useEffect(() => {
    if (isOpen && contractId) {
      fetchContractDetails(contractId);
    }
  }, [isOpen, contractId]);

  const fetchContractDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await clientContractService.getContract(id, {
        include: ["client", "sites", "created_by", "updated_by"],
      });
      setContract(response.item)
    //   if (response.success && response.body?.item) {
    //     setContract(response.body.item);
    //   }
    } catch (error) {
      console.error("Failed to fetch contract:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (contract && onEdit) {
      onEdit(contract);
      onOpenChange(false);
    }
  };

  const handleDownload = () => {
    if (contract && onDownload) {
      onDownload(contract.id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Format currency
  const formatCurrency = (value?: string | number, currency: string = "USD") => {
    if (!value) return "N/A";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  // Format datetime
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string = "draft") => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "suspended":
        return <Pause className="h-4 w-4" />;
      case "terminated":
        return <Ban className="h-4 w-4" />;
      case "expired":
        return <Clock className="h-4 w-4" />;
      case "renewed":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get status display
  const getStatusDisplay = (status: string = "draft") => {
    const statusMap: Record<string, string> = {
      draft: "Draft",
      pending: "Pending",
      active: "Active",
      suspended: "Suspended",
      terminated: "Terminated",
      expired: "Expired",
      renewed: "Renewed",
    };
    return statusMap[status] || status;
  };

  // Get type display
  const getTypeDisplay = (type: string = "ongoing") => {
    const typeMap: Record<string, string> = {
      ongoing: "Ongoing",
      fixed_term: "Fixed Term",
      trial: "Trial",
      one_time: "One Time",
    };
    return typeMap[type] || type;
  };

  // Navigation for sites carousel
  const nextSite = () => {
    if (contract?.sites && currentSiteIndex < contract.sites.length - 1) {
      setCurrentSiteIndex(currentSiteIndex + 1);
    }
  };

  const prevSite = () => {
    if (currentSiteIndex > 0) {
      setCurrentSiteIndex(currentSiteIndex - 1);
    }
  };

  if (!contract && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-semibold">
                  Contract Details
                </DialogTitle>
                <p className="text-xs sm:text-sm text-gray-500">
                  {contract?.contract_number || "Loading..."}
                </p>
              </div>
            </div>
            
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Status Banner */}
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 dark:bg-gray-800 border-b flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-500">Status:</span>
                <Badge
                  className={`
                    ${contractStatusColors[contract?.status || "default"]}
                    border px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm
                  `}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(contract?.status)}
                    {getStatusDisplay(contract?.status)}
                  </span>
                </Badge>
              </div>
              <div className="flex items-center gap-2 sm:ml-4">
                <span className="text-xs sm:text-sm font-medium text-gray-500">Type:</span>
                <Badge
                  variant="outline"
                  className={`
                    ${contractTypeColors[contract?.type || "default"]}
                    border px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm
                  `}
                >
                  {getTypeDisplay(contract?.type)}
                </Badge>
              </div>
              {contract?.auto_renew && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-auto">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Auto Renew
                </Badge>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <div className="border-b px-4 sm:px-6 overflow-x-auto">
                <TabsList className="w-full sm:w-auto inline-flex h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="overview"
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="sites"
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    Sites ({contract?.sites?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="financial"
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    Financial
                  </TabsTrigger>
                  <TabsTrigger
                    value="legal"
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    Legal
                  </TabsTrigger>
                  <TabsTrigger
                    value="signatures"
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    Signatures
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-[calc(90vh-220px)] sm:h-[calc(90vh-200px)]">
                <TabsContent value="overview" className="p-4 sm:p-6 space-y-4 sm:space-y-6 m-0">
                  {/* Client Information */}
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Client Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Company Name</p>
                            <p className="text-sm sm:text-base font-medium truncate">
                              {contract?.client?.company_name || contract?.client?.full_name || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                            <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Client Code</p>
                            <p className="text-sm sm:text-base font-medium truncate">
                              {contract?.client?.client_code || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm sm:text-base font-medium truncate">
                              {contract?.client?.email || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm sm:text-base font-medium">
                              {contract?.client?.phone || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3 sm:col-span-2">
                          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm sm:text-base font-medium">
                              {[
                                contract?.client?.address,
                                contract?.client?.city,
                                contract?.client?.zip_code,
                              ]
                                .filter(Boolean)
                                .join(", ") || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contract Details */}
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Contract Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Contract Name</p>
                          <p className="text-sm sm:text-base font-medium">{contract?.name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reference Number</p>
                          <p className="text-sm sm:text-base font-medium">{contract?.reference_number || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="text-sm sm:text-base font-medium">{formatDate(contract?.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="text-sm sm:text-base font-medium">{formatDate(contract?.end_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Signed Date</p>
                          <p className="text-sm sm:text-base font-medium">{formatDate(contract?.signed_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Effective Date</p>
                          <p className="text-sm sm:text-base font-medium">{formatDate(contract?.effective_date)}</p>
                        </div>
                      </div>

                      {contract?.notes && (
                        <>
                          <Separator className="my-3 sm:my-4" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm bg-gray-50 p-2 sm:p-3 rounded-lg">{contract.notes}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Created/Updated Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>
                        Created by {contract?.created_by?.first_name} {contract?.created_by?.last_name} on{" "}
                        {formatDateTime(contract?.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        Updated by {contract?.updated_by?.first_name} {contract?.updated_by?.last_name} on{" "}
                        {formatDateTime(contract?.updated_at)}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sites" className="p-4 sm:p-6 space-y-4 sm:space-y-6 m-0">
                  {contract?.sites && contract.sites.length > 0 ? (
                    <>
                      {/* Mobile Carousel View */}
                      <div className="sm:hidden">
                        <div className="relative">
                          <div className="overflow-hidden">
                            <div
                              className="flex transition-transform duration-300 ease-in-out"
                              style={{ transform: `translateX(-${currentSiteIndex * 100}%)` }}
                            >
                              {(contract.sites as unknown as ApiContractSite[]).map((siteData, index: number) => (
                                <div key={siteData.id} className="w-full flex-shrink-0 px-2">
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                          <Building className="h-4 w-4 text-blue-600" />
                                          Site #{index + 1}
                                        </CardTitle>
                                        {siteData.pivot?.is_primary && (
                                          <Badge className="bg-green-100 text-green-800 border-green-200">
                                            Primary
                                          </Badge>
                                        )}
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div>
                                        <p className="text-xs text-gray-500">Site Name</p>
                                        <p className="text-sm font-medium">{siteData.site?.site_name}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-sm">{siteData.site?.address || "N/A"}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <p className="text-xs text-gray-500">Guards Required</p>
                                          <p className="text-sm font-medium">{siteData.pivot?.guards_required || 0}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Rate</p>
                                          <p className="text-sm font-medium">
                                            {formatCurrency(siteData.pivot?.site_specific_rate)}
                                          </p>
                                        </div>
                                      </div>
                                      {siteData.site?.site_instruction && (
                                        <div>
                                          <p className="text-xs text-gray-500">Instructions</p>
                                          <p className="text-sm">{siteData.site.site_instruction}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Navigation Buttons */}
                          {contract.sites.length > 1 && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 h-8 w-8 rounded-full bg-white shadow-lg"
                                onClick={prevSite}
                                disabled={currentSiteIndex === 0}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 h-8 w-8 rounded-full bg-white shadow-lg"
                                onClick={nextSite}
                                disabled={currentSiteIndex === contract.sites.length - 1}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* Indicators */}
                          <div className="flex justify-center gap-1 mt-3">
                            {contract.sites.map((_, index: number) => (
                              <button
                                key={index}
                                className={`h-1.5 rounded-full transition-all ${
                                  index === currentSiteIndex ? "w-4 bg-blue-600" : "w-1.5 bg-gray-300"
                                }`}
                                onClick={() => setCurrentSiteIndex(index)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Grid View */}
                      <div className="hidden sm:grid sm:grid-cols-2 gap-4">
                        {(contract.sites as unknown as ApiContractSite[]).map((siteData, index: number) => (
                          <Card key={siteData.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                  <Building className="h-4 w-4 text-blue-600" />
                                  Site #{index + 1}
                                </CardTitle>
                                {siteData.pivot?.is_primary && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500">Site Name</p>
                                  <p className="text-sm font-medium">{siteData.site?.site_name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Status</p>
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${siteData.site?.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}
                                      border mt-1
                                    `}
                                  >
                                    {siteData.site?.status || "N/A"}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm">{siteData.site?.address || "N/A"}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500">Guards Required</p>
                                  <p className="text-sm font-medium">{siteData.pivot?.guards_required || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Site Specific Rate</p>
                                  <p className="text-sm font-medium">
                                    {formatCurrency(siteData.pivot?.site_specific_rate)}
                                  </p>
                                </div>
                              </div>
                              {siteData.site?.latitude && siteData.site?.longitude && (
                                <div>
                                  <p className="text-xs text-gray-500">Coordinates</p>
                                  <p className="text-sm">
                                    {parseFloat(siteData.site.latitude).toFixed(6)},{" "}
                                    {parseFloat(siteData.site.longitude).toFixed(6)}
                                  </p>
                                </div>
                              )}
                              {siteData.site?.site_instruction && (
                                <div>
                                  <p className="text-xs text-gray-500">Instructions</p>
                                  <p className="text-sm bg-gray-50 p-2 rounded">{siteData.site.site_instruction}</p>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 border-t pt-2">
                                <p>Assigned: {formatDate(siteData.pivot?.assigned_at)}</p>
                                {siteData.pivot?.removed_at && (
                                  <p>Removed: {formatDate(siteData.pivot.removed_at)}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <Building className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">No sites assigned</h3>
                      <p className="text-xs sm:text-sm text-gray-500">This contract has no sites associated with it.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="financial" className="p-4 sm:p-6 space-y-4 sm:space-y-6 m-0">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Financial Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Contract Value</p>
                          <p className="text-base sm:text-lg font-semibold">
                            {formatCurrency(contract?.contract_value, contract?.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Currency</p>
                          <p className="text-sm sm:text-base font-medium">{contract?.currency || "USD"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hourly Rate</p>
                          <p className="text-sm sm:text-base font-medium">
                            {formatCurrency(contract?.hourly_rate, contract?.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Overtime Rate</p>
                          <p className="text-sm sm:text-base font-medium">
                            {formatCurrency(contract?.overtime_rate, contract?.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Holiday Rate</p>
                          <p className="text-sm sm:text-base font-medium">
                            {formatCurrency(contract?.holiday_rate, contract?.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Admin Fee</p>
                          <p className="text-sm sm:text-base font-medium">
                            {contract?.admin_fee_percentage ? `${contract.admin_fee_percentage}%` : "N/A"}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Billing Cycle</p>
                          <p className="text-sm sm:text-base font-medium capitalize">
                            {contract?.billing_cycle?.replace("_", " ") || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment Terms</p>
                          <p className="text-sm sm:text-base font-medium capitalize">
                            {contract?.payment_terms?.replace("_", " ") || "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="legal" className="p-4 sm:p-6 space-y-4 sm:space-y-6 m-0">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Legal & Terms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Governing Law</p>
                          <p className="text-sm sm:text-base font-medium">{contract?.governing_law || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Venue Location</p>
                          <p className="text-sm sm:text-base font-medium">{contract?.venue_location || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Termination Notice</p>
                          <p className="text-sm sm:text-base font-medium">
                            {contract?.termination_notice_days ? `${contract.termination_notice_days} days` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Renewal Notice</p>
                          <p className="text-sm sm:text-base font-medium">
                            {contract?.renewal_notice_days ? `${contract.renewal_notice_days} days` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="signatures" className="p-4 sm:p-6 space-y-4 sm:space-y-6 m-0">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Signatures
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Client Signature */}
                        <div className="border rounded-lg p-4">
                          <h3 className="text-sm font-semibold mb-3">Client Signature</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">Signer Name</p>
                              <p className="text-sm font-medium">{contract?.client_signer_name || "Not signed"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Title</p>
                              <p className="text-sm">{contract?.client_signer_title || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Signed Date</p>
                              <p className="text-sm">{formatDate(contract?.client_signed_date)}</p>
                            </div>
                            {contract?.client_signature_url && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Signature</p>
                                <img
                                  src={contract.client_signature_url}
                                  alt="Client Signature"
                                  className="max-h-16 border rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Company Signature */}
                        <div className="border rounded-lg p-4">
                          <h3 className="text-sm font-semibold mb-3">Company Signature</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">Signer Name</p>
                              <p className="text-sm font-medium">{contract?.company_signer_name || "Not signed"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Title</p>
                              <p className="text-sm">{contract?.company_signer_title || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Signed Date</p>
                              <p className="text-sm">{formatDate(contract?.company_signed_date)}</p>
                            </div>
                            {contract?.company_signature_url && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Signature</p>
                                <img
                                  src={contract.company_signature_url}
                                  alt="Company Signature"
                                  className="max-h-16 border rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <Badge
                          className={`
                            ${contract?.is_fully_signed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            border px-3 py-1
                          `}
                        >
                          {contract?.is_fully_signed ? "Fully Signed" : "Pending Signatures"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}