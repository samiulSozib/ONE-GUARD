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
  Building,
  Tag,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
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
  fetchExpenses,
  deleteExpense,
  clearCurrentExpense,
} from "@/store/slices/expenseSlice";
import { Expense, ExpenseParams } from "@/app/types/expense";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
// import { ViewExpense } from "./view-expense";
import { ExpenseEditForm } from "./expense-edit-form";
// import { ExpenseEditForm } from "./expense-edit-form";

// Status colors mapping
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  paid: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AFN: "؋",
  INR: "₹",
  PKR: "₨",
};

interface ExpenseDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (expense: Expense) => void;
}

export function ExpenseDataTable({ onAddClick, onViewClick }: ExpenseDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { expenses, pagination, isLoading, error } = useAppSelector((state) => state.expense);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [filters, setFilters] = useState<ExpenseParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Fetch expenses on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
      include_site: true,
      include_category: true,
    };
    
    dispatch(fetchExpenses(fetchParams));
  }, [dispatch, filters, searchTerm]);
  
  // Handle search
  const handleTitleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleSearch(e.target.value);
  };
  
  const handleTitleSearchSubmit = () => {
    setSearchTerm(titleSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle filter changes
  const handleStatusFilter = (status: ExpenseParams['status']) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      status: status === prev.status ? undefined : status 
    }));
  };
  
  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      category_id: categoryId === "all" ? undefined : parseInt(categoryId)
    }));
  };
  
  const handleSiteFilter = (siteId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      site_id: siteId === "all" ? undefined : parseInt(siteId)
    }));
  };
  
  // Handle date filter
  const handleDateChange = (date: Date | undefined) => {
    setDateFilter(date);
    
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFilters(prev => ({
        ...prev,
        page: 1,
        expense_date: formattedDate,
      }));
    } else {
      setFilters(prev => {
        const {  ...rest } = prev;
        return { ...rest, page: 1 };
      });
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTitleSearch("");
    setDateFilter(undefined);
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedExpenses([]);
  };
  
  // Handle expense selection
  const handleSelectExpense = (expenseId: number) => {
    setSelectedExpenses(prev =>
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map((expense: Expense) => expense.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      try {
        await dispatch(deleteExpense(expenseToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Expense Deleted',
          `${expenseToDelete.title} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
        
        // Refresh list
        dispatch(fetchExpenses(filters));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the expense. Please try again.'
        );
      }
    }
  };
  
  // Handle view details
  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setViewDialogOpen(true);
    if (onViewClick) onViewClick(expense);
  };
  
  // Handle edit
  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status display text
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'approved': 'Approved',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'paid': 'Paid',
    };
    return statusMap[status] || status;
  };
  
  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    return currencySymbols[currency] || currency;
  };
  
  // Format amount
  const formatAmount = (amount: string | number, currency: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const symbol = getCurrencySymbol(currency);
    return `${symbol} ${numAmount.toFixed(2)}`;
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
  if (isLoading && expenses.length === 0) {
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
        {/* Top Header Section - Exact match to original */}
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
              checked={selectedExpenses.length === expenses.length && expenses.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section - 4 columns grid matching original */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Title Search Input */}
            <div className="sm:col-span-3">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Expense title..." 
                  value={titleSearch}
                  onChange={handleTitleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleTitleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Category Filter */}
            <div className="sm:col-span-3">
              <Select onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>All Categories</SelectLabel>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="1">Fuel</SelectItem>
                    <SelectItem value="2">Equipment</SelectItem>
                    <SelectItem value="3">Maintenance</SelectItem>
                    <SelectItem value="4">Travel</SelectItem>
                    <SelectItem value="5">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Site Filter */}
            <div className="sm:col-span-3">
              <Select onValueChange={handleSiteFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>All Sites</SelectLabel>
                    <SelectItem value="all">All Sites</SelectItem>
                    <SelectItem value="1">Main Office</SelectItem>
                    <SelectItem value="2">Branch A</SelectItem>
                    <SelectItem value="3">Branch B</SelectItem>
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
                    label="Expense Date"
                    value={dateFilter ? format(dateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Second row of filters - Status */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-4 py-3 border-b">
            <div className="sm:col-span-12 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Status:</span>
              <Button
                variant={!filters.status ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(undefined)}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant={filters.status === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("pending")}
                className="text-xs"
              >
                Pending
              </Button>
              <Button
                variant={filters.status === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("approved")}
                className="text-xs"
              >
                Approved
              </Button>
              <Button
                variant={filters.status === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("completed")}
                className="text-xs"
              >
                Completed
              </Button>
              {/* <Button
                variant={filters.status === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("rejected")}
                className="text-xs"
              >
                Rejected
              </Button> */}
            </div>
          </div>

          {/* Table Section - Updated with expense data */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No expenses found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || filters.category_id || filters.site_id || filters.status
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new expense"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Expense
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense: Expense) => (
                    <TableRow
                      key={expense.id}
                      className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                      onClick={() => handleViewDetails(expense)}
                    >
                      {/* Select Checkbox */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedExpenses.includes(expense.id)}
                          onCheckedChange={(checked) => 
                            handleSelectExpense(expense.id)
                          }
                        />
                      </TableCell>

                      {/* Title */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {expense.title}
                      </TableCell>

                      {/* Category */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {expense.category ? (
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <span>{expense.category.name}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Site */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {expense.site ? (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span>{expense.site.site_name}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(expense.expense_date)}</span>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-gray-900 dark:text-white font-semibold">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{formatAmount(expense.amount, expense.currency)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusColors[expense.status] || "bg-gray-100 text-gray-800"} border-0`}
                        >
                          {getStatusDisplay(expense.status)}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(expense)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit expense
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(expense)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete expense
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
          {expenses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {expenses.length} of {pagination.total} expenses
                {selectedExpenses.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedExpenses.length} selected)
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
        title="Delete Expense"
        description={`Are you sure you want to delete "${expenseToDelete?.title}"? This action cannot be undone.`}
      />

      {/* View Details Dialog */}
      {/* {selectedExpense && (
        <ViewExpense
          isOpen={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          expense={selectedExpense}
          trigger={<div />}
        />
      )} */}

      {/* Edit Form Dialog */}
      {selectedExpense && (
        <ExpenseEditForm
          trigger={<div />}
          expense={selectedExpense}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            dispatch(fetchExpenses({
              page: 1,
              per_page: 10,
              search: searchTerm
            }));
          }}
        />
      )}
    </>
  );
}