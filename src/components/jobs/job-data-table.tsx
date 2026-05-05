// components/job/job-data-table.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Eye,
  Pencil,
  Trash2,
  ListFilter,
  Search,
  File,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Clock,
  Copy,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchJobs,
  deleteJob,
  toggleJobStatus,
  duplicateJob,
} from "@/store/slices/jobSlice";
import { fetchJobCategories } from "@/store/slices/jobCategoriesSlice";
import { Job, JobParams } from "@/app/types/job";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { JobEditForm } from "./edit-job-form";
// Status colors mapping
const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// Employment type labels
const employmentTypeLabels: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
};

// Payment type labels
const paymentTypeLabels: Record<string, string> = {
  hourly: "Hourly",
  salary: "Salary",
  fixed: "Fixed",
};

interface JobDataTableProps {
  onAddClick?: () => void;
}

export function JobDataTable({ onAddClick }: JobDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { items: jobs, pagination, isLoading } = useAppSelector((state) => state.jobs);
  const { items: categories } = useAppSelector((state) => state.jobCategories);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [filters, setFilters] = useState<JobParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch categories for filters
  useEffect(() => {
    dispatch(fetchJobCategories({ page: 1, per_page: 100 }));
  }, [dispatch]);

  // Fetch jobs on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    
    dispatch(fetchJobs(fetchParams));
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
  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      is_active: status === "all" ? undefined : status === "active"
    }));
  };
  
  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      category_id: categoryId === "all" ? undefined : parseInt(categoryId)
    }));
  };
  
  const handleEmploymentFilter = (type: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      employment_type: type === "all" ? undefined : type
    }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTitleSearch("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedJobs([]);
  };
  
  // Handle job selection
  const handleSelectJob = (jobId: number) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map((job: Job) => job.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (jobToDelete) {
      try {
        await dispatch(deleteJob(jobToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Job Deleted',
          `${jobToDelete.title} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setJobToDelete(null);
        
        // Refresh list with current filters
        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        dispatch(fetchJobs(fetchParams));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the job. Please try again.'
        );
      }
    }
  };
  
  // Handle toggle status
  const handleToggleStatus = async (job: Job) => {
    try {
      const newStatus = !job.is_active;
      await dispatch(toggleJobStatus({
        id: job.id,
        isActive: newStatus
      })).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `${job.title} has been ${newStatus ? 'activated' : 'deactivated'}.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update job status. Please try again.'
      );
    }
  };
  
  // Handle duplicate
  const handleDuplicate = async (job: Job) => {
    try {
      const result = await dispatch(duplicateJob(job.id)).unwrap();
      
      SweetAlertService.success(
        'Job Duplicated',
        `${result.item.title} has been created as a copy.`
      );
      
      // Refresh list
      const fetchParams = {
        ...filters,
        search: searchTerm || undefined,
      };
      dispatch(fetchJobs(fetchParams));
    } catch (error) {
      SweetAlertService.error(
        'Duplicate Failed',
        'Failed to duplicate job. Please try again.'
      );
    }
  };
  
  // Handle edit
  const handleEdit = (job: Job) => {
    setSelectedJob(job);
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
  
  // Format currency
  const formatCurrency = (amount: string, currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", AFN: "؋", INR: "₹", PKR: "₨"
    };
    const symbol = symbols[currency] || currency;
    return `${symbol} ${parseFloat(amount).toFixed(2)}`;
  };
  
  // Get pay range display
  const getPayRange = (job: Job) => {
    const min = formatCurrency(job.min_pay_rate, job.currency);
    const max = formatCurrency(job.max_pay_rate, job.currency);
    return `${min} - ${max} ${paymentTypeLabels[job.payment_type]}`;
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  // Loading skeleton
  if (isLoading && jobs.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
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
              id="select-all" 
              className="dark:bg-white dark:border-black"
              checked={selectedJobs.length === jobs.length && jobs.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3 pt-4">
            {/* Title Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Job title..." 
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
              <Select 
                value={filters.category_id?.toString() || "all"} 
                onValueChange={handleCategoryFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Employment Type Filter */}
            <div className="sm:col-span-2">
              <Select 
                value={filters.employment_type || "all"} 
                onValueChange={handleEmploymentFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Employment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Employment Type</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <Select 
                value={filters.is_active === undefined ? "all" : filters.is_active ? "active" : "inactive"} 
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="sm:col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full text-xs"
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
                      checked={selectedJobs.length === jobs.length && jobs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Title & Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Pay Range</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vacancies</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No jobs found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || filters.category_id || filters.employment_type
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new job"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Job
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job: Job) => (
                    <TableRow
                      key={job.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Select Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={() => handleSelectJob(job.id)}
                        />
                      </TableCell>

                      {/* Title & Category */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {job.title}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Briefcase className="h-3 w-3" />
                            <span>{job.category?.name || "Uncategorized"}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{job.location}</span>
                        </div>
                        {job.is_remote && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Remote
                          </Badge>
                        )}
                      </TableCell>

                      {/* Pay Range */}
                      <TableCell className="text-gray-900 dark:text-white font-medium">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{getPayRange(job)}</span>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {employmentTypeLabels[job.employment_type] || job.employment_type}
                        </Badge>
                      </TableCell>

                      {/* Vacancies */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{job.vacancies}</span>
                        </div>
                      </TableCell>

                      {/* Deadline */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className={new Date(job.deadline) < new Date() ? "text-red-500" : ""}>
                            {formatDate(job.deadline)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusColors[job.is_active ? 'active' : 'inactive']} border-0`}
                        >
                          {job.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {job.is_featured && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 ml-1">
                            Featured
                          </Badge>
                        )}
                        {job.is_urgent && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 ml-1">
                            Urgent
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
                            <DropdownMenuItem onClick={() => handleEdit(job)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(job)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(job)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {job.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(job)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete job
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
          {jobs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} jobs
                {selectedJobs.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedJobs.length} selected)
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
        title="Delete Job"
        description={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {selectedJob && (
        <JobEditForm
          trigger={<div />}
          job={selectedJob}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
            };
            dispatch(fetchJobs(fetchParams));
          }}
        />
      )}
    </>
  );
}