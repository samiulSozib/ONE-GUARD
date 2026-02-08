"use client";

import Image from "next/image";
import { EllipsisVertical, Search, Plus, Eye, Pencil, Trash2, Shield } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "../shared/delete-dialog";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { deleteExpenseCategory, fetchExpenseCategorys, toggleExpenseCategoryStatus } from "@/store/slices/expenseCategorySlice";
import SweetAlertService from "@/lib/sweetAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExpenseCategory } from "@/app/types/expenseCategory";
import { ExpenseCategoryEditForm } from "./expense-category-edit-form";

interface ExpenseCategoryDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (expenseCategory: ExpenseCategory) => void;
}

export function ExpenseCategoryDataTable({ 
  onAddClick, 
  onViewClick 
}: ExpenseCategoryDataTableProps) {
  const dispatch = useAppDispatch();
  const { 
    expenseCategories, 
    pagination, 
    isLoading, 
    error 
  } = useAppSelector((state) => state.expenseCategory);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseCategoryToDelete, setExpenseCategoryToDelete] = useState<ExpenseCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<ExpenseCategory | null>(null);

  // Fetch guard types on component mount and when filters change
  useEffect(() => {
    const params = {
      page: 1,
      per_page: 10,
      search: searchTerm,
      is_active: activeFilter !== null ? activeFilter : undefined,
    };
    dispatch(fetchExpenseCategorys(params));
  }, [dispatch, searchTerm, activeFilter]);

  const handleDeleteClick = (e: React.MouseEvent, expenseCategory: ExpenseCategory) => {
    e.stopPropagation();
    setExpenseCategoryToDelete(expenseCategory);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (expenseCategoryToDelete) {
      try {
        await dispatch(deleteExpenseCategory(expenseCategoryToDelete.id)).unwrap();

        SweetAlertService.success(
          'Guard Type Deleted',
          `${expenseCategoryToDelete.name || 'Guard Type'} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );

        setDeleteDialogOpen(false);
        setExpenseCategoryToDelete(null);

        // Refresh the list
        dispatch(fetchExpenseCategorys({
          page: 1,
          per_page: 10,
          search: searchTerm,
        }));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the guard type. Please try again.'
        );
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await dispatch(toggleExpenseCategoryStatus({ 
        id, 
        is_active: !currentStatus 
      })).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `Guard type status has been ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
        {
          timer: 1500,
          showConfirmButton: false,
        }
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'There was an error updating the guard type status. Please try again.'
      );
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchExpenseCategorys({
      page: 1,
      per_page: 10,
      search: searchTerm,
      is_active: activeFilter !== null ? activeFilter : undefined,
    }));
  };

  const handleFilterActive = () => {
    setActiveFilter(activeFilter === true ? null : true);
  };

  const handleFilterInactive = () => {
    setActiveFilter(activeFilter === false ? null : false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveFilter(null);
  };

  // Handle edit button click
  const handleEditClick = (expenseCategory: ExpenseCategory) => {
    setSelectedExpenseCategory(expenseCategory);
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return "N/A";
    }
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Loading skeleton
  if (isLoading && expenseCategories.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Filter buttons component
  const FilterButtons = () => (
    <div className="flex gap-2 mb-4">
      <Button
        variant={activeFilter === true ? "default" : "outline"}
        size="sm"
        onClick={handleFilterActive}
      >
        Active
      </Button>
      <Button
        variant={activeFilter === false ? "default" : "outline"}
        size="sm"
        onClick={handleFilterInactive}
      >
        Inactive
      </Button>
      {(searchTerm || activeFilter !== null) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Card className="shadow-sm rounded-2xl">
        {/* Header with Search and Add Button */}
       

        {/* Content */}
        <CardContent className="p-6">
          {/* Table/Grid View */}
          <div className="overflow-x-auto">
            {expenseCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No guard types found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || activeFilter !== null
                    ? "Try adjusting your search or filters"
                    : "Get started by creating a new guard type"}
                </p>
                {searchTerm || activeFilter !== null ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={onAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Guard Type
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {expenseCategories.map((type: ExpenseCategory) => (
                    <div
                      key={type.id}
                      className="border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                    >
                      {/* Header */}
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {type.name || "Untitled Guard Type"}
                              </h3>
                              <Badge 
                                variant={type.is_active ? "default" : "secondary"} 
                                className="mt-1"
                              >
                                {type.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onViewClick && (
                                <DropdownMenuItem onClick={() => onViewClick(type)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleEditClick(type)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteClick(e, type)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4">
                        <div className="space-y-3">
                          {type.description && (
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {type.description}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Status</span>
                              <Switch
                                checked={type.is_active}
                                onCheckedChange={() => handleToggleStatus(type.id, type.is_active)}
                              />
                            </div>
                            <span className="text-xs text-gray-400">
                              Created {formatDate(type.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {!isLoading && expenseCategories.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-700">
                      Showing {expenseCategories.length} of {pagination.total} guard types
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page === 1}
                        onClick={() => dispatch(fetchExpenseCategorys({
                          page: pagination.current_page - 1,
                          per_page: pagination.per_page,
                          search: searchTerm,
                          is_active: activeFilter !== null ? activeFilter : undefined,
                        }))}
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
                        onClick={() => dispatch(fetchExpenseCategorys({
                          page: pagination.current_page + 1,
                          per_page: pagination.per_page,
                          search: searchTerm,
                          is_active: activeFilter !== null ? activeFilter : undefined,
                        }))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Guard Type"
        description={`Are you sure you want to delete "${expenseCategoryToDelete?.name}"? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {selectedExpenseCategory && (
        <ExpenseCategoryEditForm
          trigger={<div />}
          expenseCategory={selectedExpenseCategory}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            dispatch(fetchExpenseCategorys({
              page: 1,
              per_page: 10,
              search: searchTerm,
              is_active: activeFilter !== null ? activeFilter : undefined,
            }));
          }}
        />
      )}
    </>
  );
}