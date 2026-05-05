// components/job-category/job-category-data-table.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  ListFilter,
  Search,
  File,
  Tag,
  Hash,
  Calendar,
  EllipsisVertical,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchJobCategories,
  deleteJobCategory,
  toggleJobCategoryStatus,
} from "@/store/slices/jobCategoriesSlice";
import { JobCategory, JobCategoryParams } from "@/app/types/jobCategories";

// Components
import SweetAlertService from "@/lib/sweetAlert";
import { JobCategoryEditForm } from "./job-category-edit-form";
import { InputGroup ,InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DeleteDialog } from "@/components/shared/delete-dialog";

// Status colors mapping
const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface JobCategoryDataTableProps {
  onAddClick?: () => void;
}

export function JobCategoryDataTable({ onAddClick }: JobCategoryDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { items: categories, pagination, isLoading } = useAppSelector((state) => state.jobCategories);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [filters, setFilters] = useState<JobCategoryParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<JobCategory | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null);

  // Fetch categories on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    
    dispatch(fetchJobCategories(fetchParams));
  }, [dispatch, filters, searchTerm]);
  
  // Handle search
  const handleNameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameSearch(e.target.value);
  };
  
  const handleNameSearchSubmit = () => {
    setSearchTerm(nameSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setNameSearch("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedCategories([]);
  };
  
  // Handle category selection
  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((category: JobCategory) => category.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (category: JobCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await dispatch(deleteJobCategory(categoryToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Category Deleted',
          `${categoryToDelete.name} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        
        // Refresh list with current filters
        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        dispatch(fetchJobCategories(fetchParams));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the category. Please try again.'
        );
      }
    }
  };
  
  // Handle toggle status
  const handleToggleStatus = async (category: JobCategory) => {
    try {
      const newStatus = !category.is_active;
      await dispatch(toggleJobCategoryStatus({
        id: category.id,
        isActive: newStatus
      })).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `${category.name} has been ${newStatus ? 'activated' : 'deactivated'}.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update category status. Please try again.'
      );
    }
  };
  
  // Handle edit
  const handleEdit = (category: JobCategory) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  // Loading skeleton
  if (isLoading && categories.length === 0) {
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

          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox 
              id="terms" 
              className="dark:bg-white dark:border-black"
              checked={selectedCategories.length === categories.length && categories.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Name Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Category name..." 
                  value={nameSearch}
                  onChange={handleNameSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSearchSubmit()}
                />
                <InputGroupAddon onClick={handleNameSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            <div className="sm:col-span-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
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
                      checked={selectedCategories.length === categories.length && categories.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No job categories found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm
                            ? "Try adjusting your search"
                            : "Get started by creating a new job category"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Category
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category: JobCategory) => (
                    <TableRow
                      key={category.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Select Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleSelectCategory(category.id)}
                        />
                      </TableCell>

                      {/* Name */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span>{category.name}</span>
                        </div>
                      </TableCell>

                      {/* Slug */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>

                      {/* Sort Order */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span>{category.sort_order || '-'}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusColors[category.is_active ? 'active' : 'inactive']} border-0`}
                        >
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(category.created_at)}</span>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit category
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(category)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {category.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(category)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete category
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
          {categories.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} categories
                {selectedCategories.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedCategories.length} selected)
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
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {selectedCategory && (
        <JobCategoryEditForm
          trigger={<div />}
          category={selectedCategory}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
            };
            dispatch(fetchJobCategories(fetchParams));
          }}
        />
      )}
    </>
  );
}