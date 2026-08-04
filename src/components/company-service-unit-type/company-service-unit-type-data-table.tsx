// components/company-service-unit-type/company-service-unit-type-data-table.tsx
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
  Ruler,
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
  fetchCompanyServiceUnitTypes,
  deleteCompanyServiceUnitType,
  toggleCompanyServiceUnitTypeStatus,
} from "@/store/slices/company-service-unit-type.slice";
import { CompanyServiceUnitType, CompanyServiceUnitTypeParams } from "@/app/types/company-service-unit-type";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { CompanyServiceUnitTypeEditForm } from "./company-service-unit-type-edit-form";

interface CompanyServiceUnitTypeDataTableProps {
  onAddClick?: () => void;
}

export function CompanyServiceUnitTypeDataTable({ onAddClick }: CompanyServiceUnitTypeDataTableProps) {
  const dispatch = useAppDispatch();

  // Redux state
  const { companyServiceUnitTypes, pagination, isLoading } = useAppSelector(
    (state) => state.companyServiceUnitType
  );

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CompanyServiceUnitTypeParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedUnitTypes, setSelectedUnitTypes] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitTypeToDelete, setUnitTypeToDelete] = useState<CompanyServiceUnitType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUnitType, setSelectedUnitType] = useState<CompanyServiceUnitType | null>(null);

  // Fetch unit types on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    dispatch(fetchCompanyServiceUnitTypes(fetchParams));
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
    setSelectedUnitTypes([]);
  };

  // Handle unit type selection
  const handleSelectUnitType = (unitTypeId: number) => {
    setSelectedUnitTypes(prev =>
      prev.includes(unitTypeId)
        ? prev.filter(id => id !== unitTypeId)
        : [...prev, unitTypeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUnitTypes.length === companyServiceUnitTypes.length) {
      setSelectedUnitTypes([]);
    } else {
      setSelectedUnitTypes(companyServiceUnitTypes.map((unitType: CompanyServiceUnitType) => unitType.id));
    }
  };

  // Handle delete
  const handleDeleteClick = (unitType: CompanyServiceUnitType) => {
    setUnitTypeToDelete(unitType);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (unitTypeToDelete) {
      try {
        await dispatch(deleteCompanyServiceUnitType(unitTypeToDelete.id)).unwrap();

        SweetAlertService.success(
          'Unit Type Deleted',
          `${unitTypeToDelete.name} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );

        setDeleteDialogOpen(false);
        setUnitTypeToDelete(null);

        // Refresh list
        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        dispatch(fetchCompanyServiceUnitTypes(fetchParams));
      } catch (error: any) {
        // Check if error is about being used by services
        const errorMessage = error?.message || 'There was an error deleting the unit type.';

        SweetAlertService.error(
          'Delete Failed',
          errorMessage.includes('used by')
            ? 'This unit type is currently being used by one or more services and cannot be deleted.'
            : 'There was an error deleting the unit type. Please try again.'
        );
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (unitType: CompanyServiceUnitType) => {
    try {
      const newStatus = !unitType.is_active;
      await dispatch(toggleCompanyServiceUnitTypeStatus({
        id: unitType.id,
        is_active: newStatus
      })).unwrap();

      SweetAlertService.success(
        'Status Updated',
        `${unitType.name} has been ${newStatus ? 'activated' : 'deactivated'}.`
      );

      // Refresh list
      const fetchParams = {
        ...filters,
        search: searchTerm || undefined,
      };
      dispatch(fetchCompanyServiceUnitTypes(fetchParams));
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update unit type status. Please try again.'
      );
    }
  };

  // Handle edit
  const handleEdit = (unitType: CompanyServiceUnitType) => {
    setSelectedUnitType(unitType);
    setEditDialogOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Loading skeleton
  if (isLoading && companyServiceUnitTypes.length === 0) {
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
              checked={selectedUnitTypes.length === companyServiceUnitTypes.length && companyServiceUnitTypes.length > 0}
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
                  placeholder="Search unit types by name or code..."
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
                      checked={selectedUnitTypes.length === companyServiceUnitTypes.length && companyServiceUnitTypes.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {companyServiceUnitTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Ruler className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No unit types found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm
                            ? "Try adjusting your search"
                            : "Get started by creating a new unit type"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Unit Type
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  companyServiceUnitTypes.map((unitType: CompanyServiceUnitType) => (
                    <TableRow
                      key={unitType.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Select Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selectedUnitTypes.includes(unitType.id)}
                          onCheckedChange={() => handleSelectUnitType(unitType.id)}
                        />
                      </TableCell>

                      {/* Name */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {unitType.name}
                      </TableCell>

                      {/* Code */}
                      <TableCell>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          {unitType.code}
                        </code>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {unitType.description || "-"}
                      </TableCell>

                      {/* Sort Order */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {unitType.sort_order ?? "-"}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {unitType.is_active ? (
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
                            <DropdownMenuItem onClick={() => handleEdit(unitType)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit unit type
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(unitType)}>
                              {unitType.is_active ? (
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
                              onClick={() => handleDeleteClick(unitType)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete unit type
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
          {companyServiceUnitTypes.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} unit types
                {selectedUnitTypes.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedUnitTypes.length} selected)
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
        title="Delete Unit Type"
        description={`Are you sure you want to delete "${unitTypeToDelete?.name}"? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {selectedUnitType && (
        <CompanyServiceUnitTypeEditForm
          trigger={<div />}
          unitType={selectedUnitType}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
            };
            dispatch(fetchCompanyServiceUnitTypes(fetchParams));
          }}
        />
      )}
    </>
  );
}
