"use client";

import Image from "next/image";
import { EllipsisVertical, Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
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

import { DutyTimeType } from "@/app/types/dutyTimeType";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { deleteDutyTimeType, fetchDutyTimeTypes, toggleDutyTimeTypeStatus } from "@/store/slices/dutyTimeTypesSlice";
import SweetAlertService from "@/lib/sweetAlert";

// Import the edit form component
import { DutyTimeTypeEditForm } from "./duty-time-type-edit-form";

interface DutyTimeTypeDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (dutyTimeType: DutyTimeType) => void;
}

export function DutyTimeTypeDataTable({ 
  onAddClick, 
  onViewClick 
}: DutyTimeTypeDataTableProps) {
  const dispatch  = useAppDispatch()
  const { 
    dutyTimeTypes, 
    pagination, 
    isLoading, 
    error 
  } = useAppSelector((state) => state.dutyTimeTypes);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dutyTimeTypeToDelete, setDutyTimeTypeToDelete] = useState<DutyTimeType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDutyTimeType, setSelectedDutyTimeType] = useState<DutyTimeType | null>(null);

  // Fetch duty time types on component mount and when filters change
  useEffect(() => {
    const params = {
      page: 1,
      per_page: 10,
      search: searchTerm,
      is_active: activeFilter !== null ? activeFilter : undefined,
    };
    dispatch(fetchDutyTimeTypes(params));
  }, [dispatch, searchTerm, activeFilter]);

  const handleDeleteClick = (e: React.MouseEvent, dutyTimeType: DutyTimeType) => {
    e.stopPropagation();
    setDutyTimeTypeToDelete(dutyTimeType);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (dutyTimeTypeToDelete) {
        try {
            await dispatch(deleteDutyTimeType(dutyTimeTypeToDelete.id))

            SweetAlertService.success(
                'Duty Time Type Deleted',
                `${dutyTimeTypeToDelete.title} has been deleted successfully.`,
                {
                    timer: 1500,
                    showConfirmButton: false,
                }
            );

            setDeleteDialogOpen(false);
            setDutyTimeTypeToDelete(null);

            // Refresh the list
            dispatch(fetchDutyTimeTypes({
                page: 1,
                per_page: 10,
                search: searchTerm,
            }));
        } catch (error) {
            SweetAlertService.error(
                'Delete Failed',
                'There was an error deleting the duty time type. Please try again.'
            );
        }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await dispatch(toggleDutyTimeTypeStatus({ 
        id, 
        is_active: !currentStatus 
      })).unwrap();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchDutyTimeTypes({
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
  const handleEditClick = (dutyTimeType: DutyTimeType) => {
    setSelectedDutyTimeType(dutyTimeType);
    setEditDialogOpen(true);
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) {
      return "N/A";
    }
    
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    return timeString;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Loading skeleton
  if (isLoading && dutyTimeTypes.length === 0) {
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

  return (
    <>
      <Card className="shadow-sm rounded-2xl">
        {/* Content */}
        <CardContent className="p-0">
          {/* Table/Grid View */}
          <div className="overflow-x-auto p-6">
            {dutyTimeTypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No duty time types found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || activeFilter !== null
                    ? "Try adjusting your search or filters"
                    : "Get started by creating a new duty time type"}
                </p>
                {searchTerm || activeFilter !== null ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={onAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Duty Time Type
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {dutyTimeTypes.map((type:DutyTimeType) => (
                    <div
                      key={type.id}
                      className="border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                    >
                      {/* Header */}
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold">
                              {type.id}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {type.title || "Untitled"}
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
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Time Slot</span>
                            <span className="font-medium">
                              {formatTime(type.start_time)} - {formatTime(type.end_time)}
                            </span>
                          </div>
                          
                          {type.description && (
                            <div className="pt-3 border-t">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {type.description}
                              </p>
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
                              Created {formatDate(type.created_at??'N/A')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {!isLoading && dutyTimeTypes.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
                    <div className="text-sm text-gray-700">
                      Showing {dutyTimeTypes.length} of {pagination.total} duty time types
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page === 1}
                        onClick={() => dispatch(fetchDutyTimeTypes({
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
                        onClick={() => dispatch(fetchDutyTimeTypes({
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

        {/* Delete Dialog */}
        <DeleteDialog
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Delete Duty Time Type"
          description={`Are you sure you want to delete "${dutyTimeTypeToDelete?.title}"? This action cannot be undone.`}
        />
      </Card>

      {/* Edit Form Dialog */}
      {selectedDutyTimeType && (
        <DutyTimeTypeEditForm
          trigger={<div />} // Hidden trigger since we control via state
          dutyTimeType={selectedDutyTimeType}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            dispatch(fetchDutyTimeTypes({
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