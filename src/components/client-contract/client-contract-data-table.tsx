"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  DownloadIcon,
  EllipsisVertical,
  File,
  ListFilter,
  Search,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  DollarSign,
  FileText,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Ban,
  Plus
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FloatingLabelInput } from "../ui/floating-input";
import { Calendar } from "../ui/calender";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchContracts,
  deleteContract,
  toggleContractStatus,
  activateContract,
  suspendContract,
  terminateContract,
  renewContract,
} from "@/store/slices/clientContractSlice";
import { ClientContract, ClientContractParams } from "@/app/types/clientContract";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import { ClientContractViewDialog } from "./client-contract-view-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { clientContractService } from "@/service/clientContract.service";

// Status colors mapping
const contractStatusColors: Record<string, string> = {
  "draft": "bg-gray-100 text-gray-800 border-gray-200",
  "pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "active": "bg-green-100 text-green-800 border-green-200",
  "suspended": "bg-orange-100 text-orange-800 border-orange-200",
  "terminated": "bg-red-100 text-red-800 border-red-200",
  "expired": "bg-gray-100 text-gray-800 border-gray-200",
  "renewed": "bg-blue-100 text-blue-800 border-blue-200",
  "default": "bg-gray-100 text-gray-800 border-gray-200",
};

// Type colors mapping
const contractTypeColors: Record<string, string> = {
  "ongoing": "bg-blue-50 text-blue-700 border-blue-200",
  "fixed_term": "bg-purple-50 text-purple-700 border-purple-200",
  "trial": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "one_time": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "default": "bg-gray-50 text-gray-700 border-gray-200",
};

interface ClientContractDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (contract: ClientContract) => void;
  onEditClick?: (contract: ClientContract) => void;
  clientId?: number;
}

export function ClientContractDataTable({ 
  onAddClick, 
  onViewClick, 
  onEditClick,
  clientId 
}: ClientContractDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { contracts, pagination, isLoading, error } = useAppSelector((state) => state.clientContract);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [contractSearch, setContractSearch] = useState("");
  const [filters, setFilters] = useState<ClientContractParams>({
    page: 1,
    per_page: 10,
    client_id: clientId,
  });
  const [selectedContracts, setSelectedContracts] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<ClientContract | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  
  // Date filter state
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);
  
  // Fetch contracts on mount and filter changes
  useEffect(() => {
    const fetchParams: ClientContractParams = {
      ...filters,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      start_date: startDateFilter ? format(startDateFilter, 'yyyy-MM-dd') : undefined,
      end_date: endDateFilter ? format(endDateFilter, 'yyyy-MM-dd') : undefined,
    };
    
    // Remove undefined values
    Object.keys(fetchParams).forEach(key => 
      fetchParams[key as keyof ClientContractParams] === undefined && delete fetchParams[key as keyof ClientContractParams]
    );
    
    dispatch(fetchContracts(fetchParams));
  }, [dispatch, filters, searchTerm, statusFilter, typeFilter, startDateFilter, endDateFilter, clientId]);
  
  // Handle search
  const handleContractSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractSearch(e.target.value);
  };
  
  const handleContractSearchSubmit = () => {
    setSearchTerm(contractSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle filter changes
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle date filters
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDateFilter(date);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDateFilter(date);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setContractSearch("");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setStatusFilter("all");
    setTypeFilter("all");
    setFilters({
      page: 1,
      per_page: 10,
      client_id: clientId,
    });
    setSelectedContracts([]);
  };
  
  // Handle contract selection
  const handleSelectContract = (contractId: number) => {
    setSelectedContracts(prev =>
      prev.includes(contractId)
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedContracts.length === contracts.length) {
      setSelectedContracts([]);
    } else {
      setSelectedContracts(contracts.map((contract: ClientContract) => contract.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (contract: ClientContract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (contractToDelete) {
      try {
        await dispatch(deleteContract(contractToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Contract Deleted',
          `Contract ${contractToDelete.contract_number || contractToDelete.name} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setContractToDelete(null);
        
        // Refresh list
        dispatch(fetchContracts(filters));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the contract. Please try again.'
        );
      }
    }
  };
  
  // Handle view details
  const handleViewDetails = (contract: ClientContract) => {
    setSelectedContractId(contract.id);
    setViewDialogOpen(true);
    if (onViewClick) onViewClick(contract);
  };
  
  // Handle edit from view dialog
  const handleEditFromView = (contract: ClientContract) => {
    setViewDialogOpen(false);
    if (onEditClick) onEditClick(contract);
  };
  
  // Handle download
  const handleDownload = async (contractId: number) => {
    try {
      // const response = await clientContractService.downloadContract(contractId);
      // if (response.success && response.data) {
      //   // Create blob link to download
      //   const url = window.URL.createObjectURL(new Blob([response.data]));
      //   const link = document.createElement('a');
      //   link.href = url;
      //   link.setAttribute('download', `contract-${contractId}.pdf`);
      //   document.body.appendChild(link);
      //   link.click();
      //   link.remove();
      // }
    } catch (error) {
      SweetAlertService.error('Download Failed', 'Failed to download contract document.');
    }
  };
  
  // Handle contract actions
  const handleActivate = async (contract: ClientContract) => {
    try {
      const result = await SweetAlertService.confirm(
        `Are you sure you want to activate contract ${contract.contract_number || contract.name}?`
      );
      
      if (result.isConfirmed) {
        await dispatch(activateContract(contract.id)).unwrap();
        
        SweetAlertService.success(
          'Contract Activated',
          'The contract has been activated successfully.'
        );
      }
    } catch (error) {
      SweetAlertService.error(
        'Activation Failed',
        'Failed to activate contract. Please try again.'
      );
    }
  };

  const handleSuspend = async (contract: ClientContract) => {
    try {
      const result = await SweetAlertService.confirm(
        `Are you sure you want to suspend contract ${contract.contract_number || contract.name}?`
      );
      
      if (result.isConfirmed) {
        await dispatch(suspendContract({ 
          id: contract.id, 
          data: { reason: 'Suspended by user' } 
        })).unwrap();
        
        SweetAlertService.success(
          'Contract Suspended',
          'The contract has been suspended successfully.'
        );
      }
    } catch (error) {
      SweetAlertService.error(
        'Suspension Failed',
        'Failed to suspend contract. Please try again.'
      );
    }
  };

  const handleTerminate = async (contract: ClientContract) => {
    try {
      const result = await SweetAlertService.confirm(
        `Are you sure you want to terminate contract ${contract.contract_number || contract.name}?`
      );
      
      if (result.isConfirmed) {
        await dispatch(terminateContract({ 
          id: contract.id, 
          data: { 
            reason: 'Terminated by user',
            effective_date: format(new Date(), 'yyyy-MM-dd')
          } 
        })).unwrap();
        
        SweetAlertService.success(
          'Contract Terminated',
          'The contract has been terminated successfully.'
        );
      }
    } catch (error) {
      SweetAlertService.error(
        'Termination Failed',
        'Failed to terminate contract. Please try again.'
      );
    }
  };

  const handleRenew = async (contract: ClientContract) => {
    try {
      const result = await SweetAlertService.confirm(
        `Are you sure you want to renew contract ${contract.contract_number || contract.name}?`
      );
      
      if (result.isConfirmed) {
        await dispatch(renewContract({ 
          id: contract.id, 
          data: { 
            end_date: contract.end_date,
            notes: 'Contract renewed' 
          } 
        })).unwrap();
        
        SweetAlertService.success(
          'Contract Renewed',
          'The contract has been renewed successfully.'
        );
      }
    } catch (error) {
      SweetAlertService.error(
        'Renewal Failed',
        'Failed to renew contract. Please try again.'
      );
    }
  };
  
  // Handle status toggle
  const handleToggleStatus = async (contract: ClientContract) => {
    try {
      const newStatus = contract.is_active ? 'inactive' : 'active';
      await dispatch(toggleContractStatus({
        id: contract.id,
        status: newStatus
      })).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `Contract status has been updated successfully.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update contract status. Please try again.'
      );
    }
  };
  
  // Handle edit
  const handleEdit = (contract: ClientContract) => {
    if (onEditClick) {
      onEditClick(contract);
    }
  };
  
  // Format currency
  const formatCurrency = (value?: string | number, currency: string = 'USD') => {
    if (!value) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status display
  const getStatusDisplay = (status: string = 'draft') => {
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'pending': 'Pending',
      'active': 'Active',
      'suspended': 'Suspended',
      'terminated': 'Terminated',
      'expired': 'Expired',
      'renewed': 'Renewed',
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Get type display
  const getTypeDisplay = (type: string = 'ongoing') => {
    const typeMap: Record<string, string> = {
      'ongoing': 'Ongoing',
      'fixed_term': 'Fixed Term',
      'trial': 'Trial',
      'one_time': 'One Time',
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Get contract duration
  const getContractDuration = (contract: ClientContract) => {
    if (!contract.start_date) return 'N/A';
    if (!contract.end_date) return `${formatDate(contract.start_date)} - Ongoing`;
    return `${formatDate(contract.start_date)} - ${formatDate(contract.end_date)}`;
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  // Export functionality
  const handleExport = () => {
    SweetAlertService.info(
      'Export Feature',
      'Export functionality will be implemented soon.'
    );
  };
  
  // Loading skeleton
  if (isLoading && contracts.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="shadow-sm rounded-2xl">
        {/* Top Header Section */}
        <div className="bg-[#F4F6F8] p-5 -mt-6 rounded-t-md flex flex-row items-center gap-4 w-full justify-between md:justify-start">
          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <ListFilter size="14px" />
            Filters
          </CardTitle>

          <CardTitle 
            className="text-sm flex items-center gap-1 dark:text-black cursor-pointer hover:opacity-80"
            onClick={handleExport}
          >
            <DownloadIcon size="14px" />
            Export
          </CardTitle>

          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox 
              id="select-all" 
              className="dark:bg-white dark:border-black"
              checked={selectedContracts.length === contracts.length && contracts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select</Label>
          </CardTitle>

          {onAddClick && (
            <Button 
              size="sm" 
              onClick={onAddClick}
              className="ml-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Contract
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 py-3">
            {/* Contract Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Search by contract # or name..." 
                  value={contractSearch}
                  onChange={handleContractSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleContractSearchSubmit()}
                />
                <InputGroupAddon onClick={handleContractSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Type Filter */}
            <div className="sm:col-span-2">
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="ongoing">Ongoing</option>
                <option value="fixed_term">Fixed Term</option>
                <option value="trial">Trial</option>
                <option value="one_time">One Time</option>
              </select>
            </div>

            {/* Start Date Filter */}
            <div className="sm:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="Start Date"
                    value={startDateFilter ? format(startDateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDateFilter}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date Filter */}
            <div className="sm:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="End Date"
                    value={endDateFilter ? format(endDateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDateFilter}
                    onSelect={handleEndDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Sites</TableHead>
                  <TableHead>Auto Renew</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No contracts found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || statusFilter !== "all" || typeFilter !== "all" || startDateFilter || endDateFilter
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new client contract"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Contract
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract: ClientContract) => (
                    <TableRow
                      key={contract.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Selection */}
                      <TableCell>
                        <Checkbox
                          checked={selectedContracts.includes(contract.id)}
                          onCheckedChange={() => handleSelectContract(contract.id)}
                        />
                      </TableCell>

                      {/* Contract Number */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-mono text-xs">
                            {contract.contract_number || 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Name */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[150px]" title={contract.name}>
                            {contract.name}
                          </span>
                          {contract.reference_number && (
                            <span className="text-xs text-gray-500">
                              Ref: {contract.reference_number}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Client */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {contract.client?.company_name || contract.client?.full_name || `Client #${contract.client?.id}`}
                            </span>
                            {contract.client?.client_code && (
                              <span className="text-xs text-gray-500">
                                {contract.client.client_code}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${contractTypeColors[contract.type || 'default']}
                            border
                          `}
                        >
                          {getTypeDisplay(contract.type)}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          className={`
                            ${contractStatusColors[contract.status || 'default']}
                            border
                          `}
                        >
                          <span className="flex items-center gap-1">
                            {contract.status === 'active' && <CheckCircle className="h-3 w-3" />}
                            {contract.status === 'suspended' && <Pause className="h-3 w-3" />}
                            {contract.status === 'terminated' && <Ban className="h-3 w-3" />}
                            {contract.status === 'draft' && <FileText className="h-3 w-3" />}
                            {contract.status === 'expired' && <Clock className="h-3 w-3" />}
                            {getStatusDisplay(contract.status)}
                          </span>
                        </Badge>
                      </TableCell>

                      {/* Duration */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs">
                            {getContractDuration(contract)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Value */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {formatCurrency(contract.contract_value, contract.currency)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Hourly Rate */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatCurrency(contract.hourly_rate, contract.currency)}
                          </span>
                          {contract.admin_fee_percentage && (
                            <span className="text-xs text-gray-500">
                              Admin: {contract.admin_fee_percentage}%
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Sites */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Building className="h-3 w-3 mr-1" />
                          {contract.total_sites_count || 0} Sites
                        </Badge>
                      </TableCell>

                      {/* Auto Renew */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {contract.auto_renew ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            No
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(contract)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(contract)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit contract
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Status-based actions */}
                            {contract.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleActivate(contract)}>
                                <Play className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-green-600">Activate</span>
                              </DropdownMenuItem>
                            )}
                            
                            {contract.status === 'active' && (
                              <>
                                <DropdownMenuItem onClick={() => handleSuspend(contract)}>
                                  <Pause className="mr-2 h-4 w-4 text-orange-600" />
                                  <span className="text-orange-600">Suspend</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRenew(contract)}>
                                  <RefreshCw className="mr-2 h-4 w-4 text-blue-600" />
                                  <span className="text-blue-600">Renew</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {(contract.status === 'active' || contract.status === 'suspended') && (
                              <DropdownMenuItem onClick={() => handleTerminate(contract)}>
                                <Ban className="mr-2 h-4 w-4 text-red-600" />
                                <span className="text-red-600">Terminate</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(contract)}
                              className="text-amber-600"
                            >
                              {contract.is_active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark as Inactive
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Active
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(contract)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete contract
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {contracts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {contracts.length} of {pagination.total} contracts
                {selectedContracts.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedContracts.length} selected)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === 1}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm px-3">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Contract"
        description={`Are you sure you want to delete contract ${contractToDelete?.contract_number || contractToDelete?.name}? This action cannot be undone.`}
      />

      {/* View Dialog */}
      <ClientContractViewDialog
        isOpen={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        contractId={selectedContractId}
        onEdit={handleEditFromView}
        onDownload={handleDownload}
      />
    </>
  );
}