// components/company-service/company-service-data-table.tsx
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
  Hash,
  Building,
  DollarSign,
  Ruler,
  CreditCard,
  Tag,
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
  fetchCompanyServices,
  deleteCompanyService,
  toggleCompanyServiceStatus,
} from "@/store/slices/company-service.slice";
import { fetchCompanyServiceCategories } from "@/store/slices/company-service-category.slice";
import { fetchCompanyServiceUnitTypes } from "@/store/slices/company-service-unit-type.slice";
import { fetchCompanyServiceBillingMethods } from "@/store/slices/company-service-billing-method.slice";
import { CompanyService, CompanyServiceParams } from "@/app/types/company-service";
import { CompanyServiceCategory } from "@/app/types/company-service-category";
import { CompanyServiceUnitType } from "@/app/types/company-service-unit-type";
import { CompanyServiceBillingMethod } from "@/app/types/company-service-billing-method";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { CompanyServiceEditForm } from "./company-service-edit-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CompanyServiceDataTableProps {
  onAddClick?: () => void;
}

export function CompanyServiceDataTable({ onAddClick }: CompanyServiceDataTableProps) {
  const dispatch = useAppDispatch();

  // Redux state
  const { companyServices, pagination, isLoading } = useAppSelector(
    (state) => state.companyService
  );
  const { companyServiceCategories } = useAppSelector((state) => state.companyServiceCategory);
  const { companyServiceUnitTypes } = useAppSelector((state) => state.companyServiceUnitType);
  const { companyServiceBillingMethods } = useAppSelector((state) => state.companyServiceBillingMethod);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CompanyServiceParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<CompanyService | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<CompanyService | null>(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCompanyServiceCategories({ page: 1, per_page: 100, is_active: true }));
    dispatch(fetchCompanyServiceUnitTypes({ page: 1, per_page: 100, is_active: true }));
    dispatch(fetchCompanyServiceBillingMethods({ page: 1, per_page: 100, is_active: true }));
  }, [dispatch]);

  // Fetch services on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    dispatch(fetchCompanyServices(fetchParams));
  }, [dispatch, filters, searchTerm]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      company_service_category_id: categoryId === "all" ? undefined : parseInt(categoryId)
    }));
  };

  const handleServiceTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      service_type: type === "all" ? undefined : type as 'standalone' | 'package' | 'component'
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      is_active: status === "all" ? undefined : status === "active"
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedServices([]);
  };

  // Handle service selection
  const handleSelectService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === companyServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(companyServices.map((service: CompanyService) => service.id));
    }
  };

  // Handle delete
  const handleDeleteClick = (service: CompanyService) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      try {
        await dispatch(deleteCompanyService(serviceToDelete.id)).unwrap();

        SweetAlertService.success(
          'Service Deleted',
          `${serviceToDelete.name} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );

        setDeleteDialogOpen(false);
        setServiceToDelete(null);

        // Refresh list
        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        dispatch(fetchCompanyServices(fetchParams));
      } catch (error: any) {
        const errorMessage = error?.message || 'There was an error deleting the service.';

        SweetAlertService.error(
          'Delete Failed',
          errorMessage.includes('used as a component')
            ? 'This service is currently being used as a component in a package and cannot be deleted.'
            : 'There was an error deleting the service. Please try again.'
        );
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (service: CompanyService) => {
    try {
      const newStatus = !service.is_active;
      await dispatch(toggleCompanyServiceStatus({
        id: service.id,
        is_active: newStatus
      })).unwrap();

      SweetAlertService.success(
        'Status Updated',
        `${service.name} has been ${newStatus ? 'activated' : 'deactivated'}.`
      );

      // Refresh list
      const fetchParams = {
        ...filters,
        search: searchTerm || undefined,
      };
      dispatch(fetchCompanyServices(fetchParams));
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update service status. Please try again.'
      );
    }
  };

  // Handle edit
  const handleEdit = (service: CompanyService) => {
    setSelectedService(service);
    setEditDialogOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Get category name by ID
  const getCategoryName = (id: number) => {
    const category = companyServiceCategories.find(c => c.id === id);
    return category?.name || "N/A";
  };

  // Get unit type name by ID
  const getUnitTypeName = (id: number) => {
    const unitType = companyServiceUnitTypes.find(u => u.id === id);
    return unitType?.name || "N/A";
  };

  // Get billing method name by ID
  const getBillingMethodName = (id: number) => {
    const method = companyServiceBillingMethods.find(m => m.id === id);
    return method?.name || "N/A";
  };

  // Get service type badge
  const getServiceTypeBadge = (type: string, isPackage: boolean) => {
    if (isPackage) {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-0">
          <Package className="h-3 w-3 mr-1" />
          Package
        </Badge>
      );
    }
    if (type === 'component') {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-0">
          <Hash className="h-3 w-3 mr-1" />
          Component
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-0">
        Standalone
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return `$${amount.toFixed(2)}`;
  };

  // Loading skeleton
  if (isLoading && companyServices.length === 0) {
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
              checked={selectedServices.length === companyServices.length && companyServices.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 py-3">
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search services by name or code..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="sm:col-span-3">
              <Select
                value={filters.company_service_category_id?.toString() || "all"}
                onValueChange={handleCategoryFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="all">All Categories</SelectItem>
                    {companyServiceCategories.map((cat: CompanyServiceCategory) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Select
                value={filters.service_type || "all"}
                onValueChange={handleServiceTypeFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Service Types</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="standalone">Standalone</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Select
                value={filters.is_active === undefined ? "all" : filters.is_active ? "active" : "inactive"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-1 flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear
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
                      checked={selectedServices.length === companyServices.length && companyServices.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name / Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit Type</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Selling Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {companyServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No services found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || filters.company_service_category_id || filters.service_type
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new service"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Service
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  companyServices.map((service: CompanyService) => (
                    <TableRow
                      key={service.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Select Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => handleSelectService(service.id)}
                        />
                      </TableCell>

                      {/* Name and Code */}
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          <code>{service.code}</code>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span>{getCategoryName(service.company_service_category_id)}</span>
                        </div>
                      </TableCell>

                      {/* Unit Type */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-gray-500" />
                          <span>{getUnitTypeName(service.company_service_unit_type_id)}</span>
                        </div>
                      </TableCell>

                      {/* Billing Method */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span>{getBillingMethodName(service.company_service_billing_method_id)}</span>
                        </div>
                      </TableCell>

                      {/* Service Type */}
                      <TableCell>
                        {getServiceTypeBadge(service.service_type, service.is_package)}
                      </TableCell>

                      {/* Selling Rate */}
                      <TableCell className="font-semibold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{formatCurrency(service.default_selling_rate)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {service.is_active ? (
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
                            <DropdownMenuItem onClick={() => handleEdit(service)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit service
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(service)}>
                              {service.is_active ? (
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
                              onClick={() => handleDeleteClick(service)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete service
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
          {companyServices.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} services
                {selectedServices.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedServices.length} selected)
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
        title="Delete Service"
        description={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {selectedService && (
        <CompanyServiceEditForm
          trigger={<div />}
          service={selectedService}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
            };
            dispatch(fetchCompanyServices(fetchParams));
          }}
        />
      )}
    </>
  );
}
