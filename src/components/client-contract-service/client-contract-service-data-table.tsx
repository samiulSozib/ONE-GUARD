// components/client-contract-service/client-contract-service-data-table.tsx
"use client";

import { useState, useEffect } from "react";
import {
  EllipsisVertical,
  Search,
  Pencil,
  Trash2,
  ListFilter,
  File,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  Building,
  CreditCard,
  Calendar,
  Eye,
} from "lucide-react";
import {
  Card,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchClientContractServices,
  deleteClientContractService,
  toggleClientContractServiceStatus,
} from "@/store/slices/client-contract-service.slice";
import { fetchCompanyServices } from "@/store/slices/company-service.slice";
import { fetchSites } from "@/store/slices/siteSlice";
import { fetchCompanyServiceBillingMethods } from "@/store/slices/company-service-billing-method.slice";
import { ClientContractService, ClientContractServiceParams } from "@/app/types/client-contract-service";
import { CompanyService } from "@/app/types/company-service";
import { Site } from "@/app/types/site";
import { CompanyServiceBillingMethod } from "@/app/types/company-service-billing-method";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { ClientContractServiceShow } from '@/components/client-contract-service/client-contract-service-show';
import { ClientContractServiceEditForm } from '@/components/client-contract-service/client-contract-service-edit-form';


interface ClientContractServiceDataTableProps {
  onAddClick?: () => void;
}

export function ClientContractServiceDataTable({ onAddClick }: ClientContractServiceDataTableProps) {
  const dispatch = useAppDispatch();

  // Redux state
  const { items, pagination, isLoading } = useAppSelector(
    (state) => state.clientContractService
  );
  const { companyServices } = useAppSelector((state) => state.companyService);
  const { sites } = useAppSelector((state) => state.site);
  const { companyServiceBillingMethods } = useAppSelector((state) => state.companyServiceBillingMethod);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ClientContractServiceParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ClientContractService | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClientContractService | null>(null);
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [itemToShow, setItemToShow] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCompanyServices({ page: 1, per_page: 100, is_active: true }));
    dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }));
    dispatch(fetchCompanyServiceBillingMethods({ page: 1, per_page: 100, is_active: true }));
  }, [dispatch]);

  // Fetch items on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    dispatch(fetchClientContractServices(fetchParams));
  }, [dispatch, filters, searchTerm]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedItems([]);
  };

  // Handle selection
  const handleSelectItem = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item: ClientContractService) => item.id));
    }
  };

  // Handle view
  const handleView = (id: number) => {
    setItemToShow(id);
    setShowDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (item: ClientContractService) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDeleteClick = (item: ClientContractService) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await dispatch(deleteClientContractService(itemToDelete.id)).unwrap();

        SweetAlertService.success(
          'Contract Service Deleted',
          `Contract service has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );

        setDeleteDialogOpen(false);
        setItemToDelete(null);

        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        dispatch(fetchClientContractServices(fetchParams));
      } catch (error: any) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the contract service. Please try again.'
        );
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (item: ClientContractService) => {
    try {
      const newStatus = !item.is_active;
      await dispatch(toggleClientContractServiceStatus({
        id: item.id,
        isActive: newStatus
      })).unwrap();

      SweetAlertService.success(
        'Status Updated',
        `Contract service has been ${newStatus ? 'activated' : 'deactivated'}.`
      );

      const fetchParams = {
        ...filters,
        search: searchTerm || undefined,
      };
      dispatch(fetchClientContractServices(fetchParams));
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update contract service status. Please try again.'
      );
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Get service name by ID
  const getServiceName = (id: number) => {
    const service = companyServices.find(s => s.id === id);
    return service?.name || "N/A";
  };

  // Get site name by ID
  const getSiteName = (id: number) => {
    const site = sites.find(s => s.id === id);
    return site?.site_name || site?.title || "N/A";
  };

  // Get billing method name by ID
  const getBillingMethodName = (id: number) => {
    const method = companyServiceBillingMethods.find(m => m.id === id);
    return method?.name || "N/A";
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return `$${amount.toFixed(2)}`;
  };

  // Get pricing type badge
  const getPricingTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      hourly: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      quantity_rate: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      fixed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return (
      <Badge variant="outline" className={`${colors[type] || "bg-gray-100"} border-0`}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Loading skeleton
  if (isLoading && items.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
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

          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox
              id="terms"
              className="dark:bg-white dark:border-black"
              checked={selectedItems.length === items.length && items.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 py-3">
            <div className="sm:col-span-10">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search contract services..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="sm:col-span-2 flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === items.length && items.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Billing Method</TableHead>
                  <TableHead>Pricing Type</TableHead>
                  <TableHead className="text-right">Selling Rate</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No contract services found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm
                            ? "Try adjusting your search"
                            : "Get started by creating a new contract service"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Contract Service
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item: ClientContractService) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Select Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      </TableCell>

                      {/* Service */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span>{getServiceName(item.company_service_id)}</span>
                        </div>
                      </TableCell>

                      {/* Site */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{getSiteName(item.client_contract_site_id)}</span>
                        </div>
                      </TableCell>

                      {/* Billing Method */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span>{getBillingMethodName(item.company_service_billing_method_id)}</span>
                        </div>
                      </TableCell>

                      {/* Pricing Type */}
                      <TableCell>
                        {getPricingTypeBadge(item.pricing_type)}
                      </TableCell>

                      {/* Selling Rate */}
                      <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{formatCurrency(item.selling_rate)}</span>
                        </div>
                      </TableCell>

                      {/* Start Date */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(item.start_date)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {item.is_active ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(item.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                              {item.is_active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(item)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} contract services
                {selectedItems.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedItems.length} selected)
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
        title="Delete Contract Service"
        description={`Are you sure you want to delete this contract service? This action cannot be undone.`}
      />

      {/* Show Dialog */}
      {itemToShow && (
        <ClientContractServiceShow
          trigger={<div />}
          id={itemToShow}
          isOpen={showDialogOpen}
          onOpenChange={setShowDialogOpen}
        />
      )}

      {/* Edit Form Dialog */}
      {selectedItem && (
        <ClientContractServiceEditForm
          trigger={<div />}
          item={selectedItem}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
            };
            dispatch(fetchClientContractServices(fetchParams));
          }}
        />
      )}
    </>
  );
}
