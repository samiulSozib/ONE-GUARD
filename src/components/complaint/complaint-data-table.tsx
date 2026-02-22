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
  AlertTriangle,
  Shield,
  Building,
  User,
  CheckCircle,
  XCircle,
  MessageSquare,
  Lock,
  Unlock,
  Filter,
  AlertCircle
} from "lucide-react";
import {
  Card,
  CardHeader,
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FloatingLabelInput } from "../ui/floating-input";
import { Calendar } from "../ui/calender";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchComplaints,
  deleteComplaint,
  toggleComplaintVisibility,
} from "@/store/slices/complaintSlice";
import { Complaint, ComplaintParams } from "@/app/types/complaint";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
// import { ComplaintEditForm } from "./complaint-edit-form"; // Import the edit form

// Status and Priority colors mapping
const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const reportedByColors: Record<string, string> = {
  client: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  guard: "bg-orange-100 text-orange-800",
};

const againstTypeColors: Record<string, string> = {
  guard: "bg-red-100 text-red-800",
  site: "bg-indigo-100 text-indigo-800",
};

interface ComplaintDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (complaint: Complaint) => void;
}

export function ComplaintDataTable({ onAddClick, onViewClick }: ComplaintDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { complaints, pagination, isLoading, error } = useAppSelector((state) => state.complaint);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [filters, setFilters] = useState<ComplaintParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedComplaints, setSelectedComplaints] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  // Fetch complaints on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
      include_site: true,
    };
    
    dispatch(fetchComplaints(fetchParams));
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
  const handleStatusFilter = (status: ComplaintParams['status']) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      status: status === prev.status ? undefined : status 
    }));
  };
  
  const handlePriorityFilter = (priority: ComplaintParams['priority']) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      priority: priority === prev.priority ? undefined : priority 
    }));
  };
  
  const handleReportedByFilter = (reportedByType: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      reported_by_type: reportedByType === prev.reported_by_type ? undefined : reportedByType 
    }));
  };
  
  const handleAgainstTypeFilter = (againstType: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      against_type: againstType === prev.against_type ? undefined : againstType 
    }));
  };
  
  // Handle date filter
  const handleDateChange = (date: Date | undefined) => {
    setDateFilter(date);
    
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      // Assuming API supports created_at filtering by date
      setFilters(prev => ({
        ...prev,
        page: 1,
        search: prev.search ? `${prev.search} ${formattedDate}` : formattedDate
      }));
    } else {
      setFilters(prev => ({ ...prev, page: 1 }));
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
    setSelectedComplaints([]);
  };
  
  // Handle complaint selection
  const handleSelectComplaint = (complaintId: number) => {
    setSelectedComplaints(prev =>
      prev.includes(complaintId)
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedComplaints.length === complaints.length) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(complaints.map((complaint: Complaint) => complaint.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (complaint: Complaint) => {
    setComplaintToDelete(complaint);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (complaintToDelete) {
      try {
        await dispatch(deleteComplaint(complaintToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Complaint Deleted',
          `Complaint #${complaintToDelete.id} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setComplaintToDelete(null);
        
        // Refresh list
        dispatch(fetchComplaints(filters));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the complaint. Please try again.'
        );
      }
    }
  };
  
  // Handle visibility toggle
  const handleToggleClientVisibility = async (complaint: Complaint) => {
    try {
      await dispatch(toggleComplaintVisibility({
        id: complaint.id,
        payload: {
          is_visible_to_client: !complaint.is_visible_to_client
        }
      })).unwrap();
      
      SweetAlertService.success(
        'Visibility Updated',
        `Complaint visibility to client has been ${!complaint.is_visible_to_client ? 'enabled' : 'disabled'}.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update complaint visibility. Please try again.'
      );
    }
  };
  
  const handleToggleGuardVisibility = async (complaint: Complaint) => {
    try {
      await dispatch(toggleComplaintVisibility({
        id: complaint.id,
        payload: {
          is_visible_to_guard: !complaint.is_visible_to_guard
        }
      })).unwrap();
      
      SweetAlertService.success(
        'Visibility Updated',
        `Complaint visibility to guard has been ${!complaint.is_visible_to_guard ? 'enabled' : 'disabled'}.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update complaint visibility. Please try again.'
      );
    }
  };
  
  // Handle view details
  const handleViewDetails = (complaint: Complaint) => {
    if (onViewClick) onViewClick(complaint);
  };
  
  // Handle edit complaint - similar to duty table
  const handleEdit = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
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
  
  // Format date with time
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status display text
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed',
    };
    return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Get priority display text
  const getPriorityDisplay = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
    };
    return priorityMap[priority] || priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  
  // Get reported by display text
  const getReportedByDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'client': 'Client',
      'admin': 'Admin',
      'guard': 'Guard',
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Get against type display text
  const getAgainstTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'guard': 'Guard',
      'site': 'Site',
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
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
  if (isLoading && complaints.length === 0) {
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
              checked={selectedComplaints.length === complaints.length && complaints.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Title Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Search by title or notes..." 
                  value={titleSearch}
                  onChange={handleTitleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleTitleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Status Filter Dropdown */}
            <div className="sm:col-span-4">
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Filter className="mr-2 h-4 w-4" />
                      {filters.status ? `Status: ${getStatusDisplay(filters.status)}` : "Filter by Status"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleStatusFilter('open')}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        Open
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusFilter('in_progress')}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        In Progress
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusFilter('resolved')}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Resolved
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusFilter('closed')}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        Closed
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Date Filter */}
            <div className="sm:col-span-4">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="Created Date"
                    value={dateFilter ? format(dateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={selectedComplaints.length === complaints.length && complaints.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Against</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No complaints found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || Object.keys(filters).length > 2
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new complaint"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Create Complaint
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((complaint: Complaint) => (
                    <TableRow
                      key={complaint.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Checkbox */}
                      <TableCell>
                        <Checkbox 
                          checked={selectedComplaints.includes(complaint.id)}
                          onCheckedChange={() => handleSelectComplaint(complaint.id)}
                        />
                      </TableCell>

                      {/* ID */}
                      <TableCell className="font-mono text-gray-600">
                        #{complaint.id}
                      </TableCell>

                      {/* Title */}
                      <TableCell className="font-medium text-gray-900 dark:text-white max-w-[200px]">
                        <div className="flex flex-col">
                          <span className="truncate">{complaint.title}</span>
                          {complaint.notes && (
                            <span className="text-xs text-gray-500 truncate" title={complaint.notes}>
                              <MessageSquare className="inline h-3 w-3 mr-1" />
                              {complaint.notes.substring(0, 50)}
                              {complaint.notes.length > 50 ? '...' : ''}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        <Badge
                          className={`${priorityColors[complaint.priority]} px-3 py-1 border-0`}
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {getPriorityDisplay(complaint.priority)}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          className={`${statusColors[complaint.status]} px-3 py-1 border-0`}
                        >
                          {getStatusDisplay(complaint.status)}
                        </Badge>
                      </TableCell>

                      {/* Reported By */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={`${reportedByColors[complaint.reported_by_type]} px-2 py-0.5 text-xs`}
                          >
                            {getReportedByDisplay(complaint.reported_by_type)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Name: {complaint.reporter?.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Against */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={`${againstTypeColors[complaint.against_type]} px-2 py-0.5 text-xs`}
                          >
                            {getAgainstTypeDisplay(complaint.against_type)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Name: {complaint.against?.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Site */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {complaint.site ? (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{complaint.site.site_name}</span>
                              <span className="text-xs text-gray-500">
                                ID: {complaint.site.id}
                              </span>
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Visibility */}
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="text-xs">Client:</span>
                            <Switch
                              checked={complaint.is_visible_to_client}
                              onCheckedChange={() => handleToggleClientVisibility(complaint)}
                            />
                            {complaint.is_visible_to_client ? (
                              <Unlock className="h-3 w-3 text-green-500" />
                            ) : (
                              <Lock className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-gray-500" />
                            <span className="text-xs">Guard:</span>
                            <Switch
                              checked={complaint.is_visible_to_guard}
                              onCheckedChange={() => handleToggleGuardVisibility(complaint)}
                            />
                            {complaint.is_visible_to_guard ? (
                              <Unlock className="h-3 w-3 text-green-500" />
                            ) : (
                              <Lock className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span>{formatDate(complaint.created_at)}</span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(complaint.created_at).split(' ')[3]}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions - Updated with Edit option like duty table */}
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(complaint)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            {/* Edit option like duty table */}
                            <DropdownMenuItem onClick={() => handleEdit(complaint)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit complaint
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleClientVisibility(complaint)}
                              className={complaint.is_visible_to_client ? "text-amber-600" : "text-green-600"}
                            >
                              {complaint.is_visible_to_client ? (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Hide from Client
                                </>
                              ) : (
                                <>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Show to Client
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleGuardVisibility(complaint)}
                              className={complaint.is_visible_to_guard ? "text-amber-600" : "text-green-600"}
                            >
                              {complaint.is_visible_to_guard ? (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Hide from Guard
                                </>
                              ) : (
                                <>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Show to Guard
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(complaint)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete complaint
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
          {complaints.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {complaints.length} of {pagination.total} complaints
                {selectedComplaints.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedComplaints.length} selected)
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
        title="Delete Complaint"
        description={`Are you sure you want to delete complaint #${complaintToDelete?.id}? This action cannot be undone.`}
      />

      {/* Edit Form Dialog - Similar to duty table */}
      {/* {selectedComplaint && (
        <ComplaintEditForm
          trigger={<div />} // Hidden trigger since we control via state
          complaint={selectedComplaint}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            dispatch(fetchComplaints({
              page: 1,
              per_page: 10,
              search: searchTerm
            }));
          }}
        />
      )} */}
    </>
  );
}