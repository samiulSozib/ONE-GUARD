// components/company-service-component/company-service-component-data-table.tsx
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
  DollarSign,
  Link,
  Layers,
  CreditCard,
  AlertCircle,
  CheckSquare,
  Square,
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
  fetchCompanyServiceComponents,
  deleteCompanyServiceComponent,
  toggleCompanyServiceComponentStatus,
} from "@/store/slices/company-service-component.slice";
import { fetchCompanyServices } from "@/store/slices/company-service.slice";
import { CompanyServiceComponent, CompanyServiceComponentParams } from "@/app/types/company-service-component";
import { CompanyService } from "@/app/types/company-service";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { CompanyServiceComponentEditForm } from "./company-service-component-edit-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CompanyServiceComponentShow } from '@/components/company-service-component/company-service-component-show';

interface CompanyServiceComponentDataTableProps {
  onAddClick?: () => void;
  parentServiceId?: number;
}

export function CompanyServiceComponentDataTable({
  onAddClick,
  parentServiceId
}: CompanyServiceComponentDataTableProps) {
  const dispatch = useAppDispatch();

  // Redux state
  const { companyServiceComponents, pagination, isLoading } = useAppSelector(
    (state) => state.companyServiceComponent
  );
  const { companyServices } = useAppSelector((state) => state.companyService);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CompanyServiceComponentParams>({
    page: 1,
    per_page: 10,
    parent_company_service_id: parentServiceId,
  });
  const [selectedComponents, setSelectedComponents] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<CompanyServiceComponent | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<CompanyServiceComponent | null>(null);

  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [componentToShow, setComponentToShow] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCompanyServices({ page: 1, per_page: 100, is_active: true }));
  }, [dispatch]);

  // Fetch components on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    if (parentServiceId) {
      fetchParams.parent_company_service_id = parentServiceId;
    }
    dispatch(fetchCompanyServiceComponents(fetchParams));
  }, [dispatch, filters, searchTerm, parentServiceId]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleParentFilter = (parentId: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      parent_company_service_id: parentId === "all" ? undefined : parseInt(parentId)
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      is_active: status === "all" ? undefined : status === "active"
    }));
  };

  const handleView = (componentId: number) => {
    setComponentToShow(componentId);
    setShowDialogOpen(true);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      per_page: 10,
      parent_company_service_id: parentServiceId,
    });
    setSelectedComponents([]);
  };

  // Handle component selection
  const handleSelectComponent = (componentId: number) => {
    setSelectedComponents(prev =>
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComponents.length === companyServiceComponents.length) {
      setSelectedComponents([]);
    } else {
      setSelectedComponents(companyServiceComponents.map((comp: CompanyServiceComponent) => comp.id));
    }
  };

  // Handle delete
  const handleDeleteClick = (component: CompanyServiceComponent) => {
    setComponentToDelete(component);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (componentToDelete) {
      try {
        await dispatch(deleteCompanyServiceComponent(componentToDelete.id)).unwrap();

        SweetAlertService.success(
          'Component Removed',
          `Component has been removed from the package successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );

        setDeleteDialogOpen(false);
        setComponentToDelete(null);

        // Refresh list
        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        if (parentServiceId) {
          fetchParams.parent_company_service_id = parentServiceId;
        }
        dispatch(fetchCompanyServiceComponents(fetchParams));
      } catch (error: any) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error removing the component. Please try again.'
        );
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (component: CompanyServiceComponent) => {
    try {
      const newStatus = !component.is_active;
      await dispatch(toggleCompanyServiceComponentStatus({
        id: component.id,
        is_active: newStatus
      })).unwrap();

      SweetAlertService.success(
        'Status Updated',
        `Component has been ${newStatus ? 'activated' : 'deactivated'}.`
      );

      // Refresh list
      const fetchParams = {
        ...filters,
        search: searchTerm || undefined,
      };
      if (parentServiceId) {
        fetchParams.parent_company_service_id = parentServiceId;
      }
      dispatch(fetchCompanyServiceComponents(fetchParams));
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update component status. Please try again.'
      );
    }
  };

  // Handle edit
  const handleEdit = (component: CompanyServiceComponent) => {
    setSelectedComponent(component);
    setEditDialogOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Get parent service name
  const getParentName = (id: number) => {
    const service = companyServices.find(s => s.id === id);
    return service?.name || "N/A";
  };

  // Get component service name
  const getComponentName = (id: number) => {
    const service = companyServices.find(s => s.id === id);
    return service?.name || "N/A";
  };

  // Get component service code
  const getComponentCode = (id: number) => {
    const service = companyServices.find(s => s.id === id);
    return service?.code || "N/A";
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return `$${amount.toFixed(2)}`;
  };

  // Get flag badge
  const getFlagBadge = (value: boolean, trueLabel: string, falseLabel: string) => {
    if (value) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
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
  if (isLoading && companyServiceComponents.length === 0) {
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
              checked={selectedComponents.length === companyServiceComponents.length && companyServiceComponents.length > 0}
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
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            {!parentServiceId && (
              <div className="sm:col-span-3">
                <Select
                  value={filters.parent_company_service_id?.toString() || "all"}
                  onValueChange={handleParentFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Packages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Packages</SelectLabel>
                      <SelectItem value="all">All Packages</SelectItem>
                      {companyServices
                        .filter(s => s.is_package)
                        .map((service: CompanyService) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

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

            <div className="sm:col-span-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
              {onAddClick && (
                <Button
                  size="sm"
                  onClick={onAddClick}
                  className="bg-[#5F0015] hover:bg-blue-700 text-white"
                >
                  Add Component
                </Button>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedComponents.length === companyServiceComponents.length && companyServiceComponents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {!parentServiceId && <TableHead>Parent Package</TableHead>}
                  {/* <TableHead>Component Service</TableHead> */}
                  <TableHead>Default Qty</TableHead>
                  <TableHead>Included Qty</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Optional</TableHead>
                  <TableHead>Included in Price</TableHead>
                  <TableHead>Selling Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {companyServiceComponents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Layers className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No components found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || filters.parent_company_service_id
                            ? "Try adjusting your search or filters"
                            : "Get started by adding a component to a package"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick} className="bg-[#5F0015] hover:bg-blue-700 text-white">
                            Add Component
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  companyServiceComponents.map((component: CompanyServiceComponent) => (
                    <TableRow
                      key={component.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Select Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selectedComponents.includes(component.id)}
                          onCheckedChange={() => handleSelectComponent(component.id)}
                        />
                      </TableCell>

                      {/* Parent Package */}
                      {!parentServiceId && (
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span>{getParentName(component.parent_company_service_id)}</span>
                          </div>
                        </TableCell>
                      )}

                      {/* Component Service */}
                      {/* <TableCell>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {getComponentName(component.component_company_service_id)}
                            </div>
                            <div className="text-xs text-gray-500">
                              <code>{getComponentCode(component.component_company_service_id)}</code>
                            </div>
                          </div>
                        </div>
                      </TableCell> */}

                      {/* Default Quantity */}
                      <TableCell className="text-center">
                        {component.default_quantity || 1}
                      </TableCell>

                      {/* Included Quantity */}
                      <TableCell className="text-center">
                        {component.included_quantity || 1}
                      </TableCell>

                      {/* Required */}
                      <TableCell>
                        {getFlagBadge(component.is_required, "Yes", "No")}
                      </TableCell>

                      {/* Optional */}
                      <TableCell>
                        {getFlagBadge(component.is_optional, "Yes", "No")}
                      </TableCell>

                      {/* Included in Parent Price */}
                      <TableCell>
                        {getFlagBadge(component.is_included_in_parent_price, "Yes", "No")}
                      </TableCell>

                      {/* Selling Rate */}
                      <TableCell className="font-semibold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{formatCurrency(component.default_selling_rate)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {component.is_active ? (
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
                            <DropdownMenuItem onClick={() => handleView(component.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(component)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit component
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(component)}>
                              {component.is_active ? (
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
                              onClick={() => handleDeleteClick(component)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove component
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
          {companyServiceComponents.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} components
                {selectedComponents.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedComponents.length} selected)
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
        title="Remove Component"
        description={`Are you sure you want to remove this component from the package? This action cannot be undone.`}
      />

      {/* Show Dialog */}
      {componentToShow && (
        <CompanyServiceComponentShow
          trigger={<div />}
          componentId={componentToShow}
          isOpen={showDialogOpen}
          onOpenChange={setShowDialogOpen}
        />
      )}

      {/* Edit Form Dialog */}
      {selectedComponent && (
        <CompanyServiceComponentEditForm
          trigger={<div />}
          component={selectedComponent}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
            };
            if (parentServiceId) {
              fetchParams.parent_company_service_id = parentServiceId;
            }
            dispatch(fetchCompanyServiceComponents(fetchParams));
          }}
        />
      )}
    </>
  );
}
