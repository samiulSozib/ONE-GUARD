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
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LucideIcon,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import { Calendar as CalendarComponent } from "../ui/calender";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchExpenseReviews,
  deleteExpenseReview,
  clearCurrentExpenseReview,
  changeExpenseReviewStatus,
} from "@/store/slices/expenseReviewSlice";
import { ExpenseReview, ExpenseReviewParams } from "@/app/types/expenseReview";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
// import { ViewExpenseReview } from "./view-expense-review";
// import { ExpenseReviewEditForm } from "./expense-review-edit-form";

// Decision colors mapping
const decisionColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const decisionIcons: Record<string, LucideIcon> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const decisionLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

interface ExpenseReviewDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (review: ExpenseReview) => void;
}

export function ExpenseReviewDataTable({ onAddClick, onViewClick }: ExpenseReviewDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { expenseReviews, pagination, isLoading, error } = useAppSelector((state) => state.expenseReview);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ExpenseReviewParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ExpenseReview | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ExpenseReview | null>(null);
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Fetch expense reviews on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
      created_at: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined,
    };
    
    dispatch(fetchExpenseReviews(fetchParams));
  }, [dispatch, filters, searchTerm, dateFilter]);
  
  // Handle search
  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1, search: searchTerm || undefined }));
  };
  
  // Handle filter changes
  const handleDecisionFilter = (decision: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      decision: decision === "all" ? undefined : decision 
    }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter(undefined);
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedReviews([]);
  };
  
  // Handle review selection
  const handleSelectReview = (reviewId: number) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedReviews.length === expenseReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(expenseReviews.map((review: ExpenseReview) => review.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (review: ExpenseReview) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (reviewToDelete) {
      try {
        await dispatch(deleteExpenseReview(reviewToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Review Deleted',
          `Expense review has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        
        // Refresh list with current filters
        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
          created_at: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined,
        };
        dispatch(fetchExpenseReviews(fetchParams));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the review. Please try again.'
        );
      }
    }
  };
  
  // Handle decision update
  const handleDecisionUpdate = async (review: ExpenseReview, decision: 'pending' | 'approved' | 'rejected') => {
    try {
      await dispatch(changeExpenseReviewStatus({
        id: review.id,
        decision,
      })).unwrap();
      
      SweetAlertService.success(
        'Decision Updated',
        `Expense review has been marked as ${decision}.`
      );
      
      // Refresh list to show updated decision
      const fetchParams = {
        ...filters,
        search: searchTerm || undefined,
        created_at: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined,
      };
      dispatch(fetchExpenseReviews(fetchParams));
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        `Failed to update review decision. Please try again.`
      );
    }
  };
  
  // Handle view details
  const handleViewDetails = (review: ExpenseReview) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
    if (onViewClick) onViewClick(review);
  };
  
  // Handle edit
  const handleEdit = (review: ExpenseReview) => {
    setSelectedReview(review);
    setEditDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • HH:mm');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get reviewer name
  const getReviewerName = (review: ExpenseReview) => {
    if (!review.reviewer) return "Unknown";
    const { first_name, last_name } = review.reviewer;
    return `${first_name || ''} ${last_name || ''}`.trim() || "Unknown";
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
  
  // Get available decision actions based on current decision
  const getAvailableDecisionActions = (currentDecision: string) => {
    const actions = [];
    
    switch(currentDecision) {
      case 'pending':
        actions.push(
          { decision: 'approved', label: 'Approve', icon: CheckCircle, color: 'text-green-600' },
          { decision: 'rejected', label: 'Reject', icon: XCircle, color: 'text-red-600' }
        );
        break;
      case 'approved':
        actions.push(
          { decision: 'pending', label: 'Reset to Pending', icon: Clock, color: 'text-yellow-600' },
          { decision: 'rejected', label: 'Reject', icon: XCircle, color: 'text-red-600' }
        );
        break;
      case 'rejected':
        actions.push(
          { decision: 'pending', label: 'Reset to Pending', icon: Clock, color: 'text-yellow-600' },
          { decision: 'approved', label: 'Approve', icon: CheckCircle, color: 'text-green-600' }
        );
        break;
    }
    
    return actions;
  };
  
  // Get decision icon component
  const getDecisionIcon = (decision: string) => {
    const IconComponent = decisionIcons[decision] || AlertCircle;
    return <IconComponent className="h-4 w-4" />;
  };
  
  // Loading skeleton
  if (isLoading && expenseReviews.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
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
              id="terms" 
              className="dark:bg-white dark:border-black"
              checked={selectedReviews.length === expenseReviews.length && expenseReviews.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Search by expense ID or reviewer..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Decision Filter */}
            <div className="sm:col-span-3">
              <Select 
                value={filters.decision || "all"} 
                onValueChange={handleDecisionFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>All Decisions</SelectLabel>
                    <SelectItem value="all">All Decisions</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="sm:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="Review Date"
                    value={dateFilter ? format(dateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters Button */}
            <div className="sm:col-span-2 flex items-end">
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
                      checked={selectedReviews.length === expenseReviews.length && expenseReviews.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Expense ID</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Reviewed At</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {expenseReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No expense reviews found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || filters.decision || dateFilter
                            ? "Try adjusting your search or filters"
                            : "No expense reviews available"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseReviews.map((review: ExpenseReview) => {
                    const DecisionIcon = decisionIcons[review.decision || 'pending'] || AlertCircle;
                    
                    return (
                      <TableRow
                        key={review.id}
                        className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                        onClick={() => handleViewDetails(review)}
                      >
                        {/* Select Checkbox */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedReviews.includes(review.id)}
                            onCheckedChange={() => handleSelectReview(review.id)}
                          />
                        </TableCell>

                        {/* ID */}
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          #{review.id}
                        </TableCell>

                        {/* Expense ID */}
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          <Badge variant="outline" className="bg-gray-100">
                            {review.expense_id}
                          </Badge>
                        </TableCell>

                        {/* Decision */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${decisionColors[review.decision || 'pending']} border-0 flex items-center gap-1 w-fit`}
                          >
                            <DecisionIcon className="h-3 w-3" />
                            {decisionLabels[review.decision || 'pending']}
                          </Badge>
                        </TableCell>

                        {/* Remark */}
                        <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {review.remark || "-"}
                        </TableCell>

                        {/* Reviewer */}
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{getReviewerName(review)}</span>
                          </div>
                        </TableCell>

                        {/* Reviewed At */}
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(review.created_at)}</span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(review)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(review)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit review
                              </DropdownMenuItem>
                              
                              {/* Decision Update Options */}
                              {getAvailableDecisionActions(review.decision || 'pending').map((action, index) => (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={() => handleDecisionUpdate(review, action.decision as 'pending' | 'approved' | 'rejected')}
                                  className={action.color}
                                >
                                  <action.icon className="mr-2 h-4 w-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(review)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete review
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {expenseReviews.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} reviews
                {selectedReviews.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedReviews.length} selected)
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
        title="Delete Expense Review"
        description="Are you sure you want to delete this expense review? This action cannot be undone."
      />

      {/* View Details Dialog */}
      {/* {selectedReview && (
        <ViewExpenseReview
          isOpen={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          review={selectedReview}
          trigger={<div />}
        />
      )} */}

      {/* Edit Form Dialog */}
      {/* {selectedReview && (
        <ExpenseReviewEditForm
          trigger={<div />}
          review={selectedReview}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
              created_at: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined,
            };
            dispatch(fetchExpenseReviews(fetchParams));
          }}
        />
      )} */}
    </>
  );
}