// components/job-application/job-application-data-table.tsx
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
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Download,
  UserCheck,
  UserX,
  Star,
  EllipsisVertical,
  CheckCircle,
  XCircle,
  Award,
  Info,
  Shield,
  GraduationCap,
  Users,
  Briefcase,
  Calendar as CalendarIcon,
  MessageSquare,
  FileText,
  DollarSign,
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchJobApplications,
  deleteJobApplication,
  updateApplicationStatus,
  downloadResume,
  addNote,
  scheduleInterview,
  convertToGuard,
  fetchJobApplicationStats,
} from "@/store/slices/jobApplicationSlice";
import { fetchJobs } from "@/store/slices/jobSlice";
import { JobApplication, JobApplicationParams } from "@/app/types/job-applications";
import { Job } from "@/app/types/job";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { Input } from "../ui/input";

// Status colors mapping
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shortlisted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  interviewed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  hired: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewed", label: "Interviewed" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "No Considered" },
];

interface JobApplicationDataTableProps {
  onViewClick?: (application: JobApplication) => void;
}

export function JobApplicationDataTable({ onViewClick }: JobApplicationDataTableProps) {
  const dispatch = useAppDispatch();

  // Redux state
  const { items: applications, pagination, isLoading, statistics } = useAppSelector((state) => state.jobApplications);
  const { items: jobs } = useAppSelector((state) => state.jobs);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [filters, setFilters] = useState<JobApplicationParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<JobApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  // Fetch jobs for filter
  useEffect(() => {
    dispatch(fetchJobs({ page: 1, per_page: 100 }));
  }, [dispatch]);

  // Fetch applications on mount and filter changes
  useEffect(() => {
    const fetchParams: JobApplicationParams = {
      ...filters,
      search: searchTerm || undefined,
    };

    dispatch(fetchJobApplications(fetchParams));
    dispatch(fetchJobApplicationStats());
  }, [dispatch, filters, searchTerm]);

  // Handle search
  const handleNameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameSearch(e.target.value);
  };

  const handleNameSearchSubmit = () => {
    setSearchTerm(nameSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      status: status === "all" ? undefined : status
    }));
  };

  const handleJobFilter = (jobId: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      career_job_id: jobId === "all" ? undefined : parseInt(jobId)
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setNameSearch("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedApplications([]);
  };

  // Handle selection
  const handleSelectApplication = (applicationId: number) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map((app: JobApplication) => app.id));
    }
  };

  // Handle delete
  const handleDeleteClick = (application: JobApplication) => {
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (applicationToDelete) {
      try {
        await dispatch(deleteJobApplication(applicationToDelete.id)).unwrap();

        SweetAlertService.success(
          'Application Deleted',
          `${applicationToDelete.full_name}'s application has been deleted.`,
          { timer: 1500, showConfirmButton: false }
        );

        setDeleteDialogOpen(false);
        setApplicationToDelete(null);

        // Refresh
        const fetchParams = { ...filters, search: searchTerm || undefined };
        dispatch(fetchJobApplications(fetchParams));
        dispatch(fetchJobApplicationStats());
      } catch (error) {
        SweetAlertService.error('Delete Failed', 'There was an error deleting the application.');
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (application: JobApplication, status: string) => {
   
    // try {

      await dispatch(updateApplicationStatus({
        id: application.id,
        data: { status, note: `Status changed to ${status}` }
      }));

      SweetAlertService.success('Status Updated', `Application status changed to ${status}`);

      // Refresh
      const fetchParams = { ...filters, search: searchTerm || undefined };
      dispatch(fetchJobApplications(fetchParams));
      dispatch(fetchJobApplicationStats());
    // } catch (error) {
    //   console.log(error)
    //   SweetAlertService.error('Update Failed', error);
    // }
  };

  // Handle download resume
  const handleDownloadResume = async (id: number) => {
    try {
      await dispatch(downloadResume(id)).unwrap();
      SweetAlertService.success('Download Started', 'Your download should begin shortly.', {
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      SweetAlertService.error('Download Failed', 'Failed to download resume. Please try again.');
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!selectedApplication || !noteText.trim()) return;

    try {
      await dispatch(addNote({
        id: selectedApplication.id,
        data: { note: noteText.trim() }
      })).unwrap();

      SweetAlertService.success('Note Added', 'Note has been added successfully.');
      setNoteDialogOpen(false);
      setNoteText("");

      // Refresh to show updated notes
      const fetchParams = { ...filters, search: searchTerm || undefined };
      dispatch(fetchJobApplications(fetchParams));
    } catch (error) {
      SweetAlertService.error('Failed', 'Failed to add note.');
    }
  };

  // Handle schedule interview
  const handleScheduleInterview = async () => {
    if (!selectedApplication || !interviewDate) return;

    try {
      await dispatch(scheduleInterview({
        id: selectedApplication.id,
        data: { interview_date: interviewDate, notes: interviewNotes }
      })).unwrap();

      SweetAlertService.success('Interview Scheduled', 'Interview has been scheduled successfully.');
      setInterviewDialogOpen(false);
      setInterviewDate("");
      setInterviewNotes("");

      // Refresh
      const fetchParams = { ...filters, search: searchTerm || undefined };
      dispatch(fetchJobApplications(fetchParams));
    } catch (error) {
      SweetAlertService.error('Failed', 'Failed to schedule interview.');
    }
  };

  // Handle convert to guard
  const handleConvertToGuard = async (application: JobApplication) => {
    SweetAlertService.confirm(
      'Convert to Guard',
      `Are you sure you want to convert ${application.full_name} to a guard employee?`,
      'Yes, convert',
      'Cancel'
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(convertToGuard({ id: application.id })).unwrap();
          SweetAlertService.success('Converted', `${application.full_name} has been converted to a guard.`);

          // Refresh
          const fetchParams = { ...filters, search: searchTerm || undefined };
          dispatch(fetchJobApplications(fetchParams));
          dispatch(fetchJobApplicationStats());
        } catch (error) {
          SweetAlertService.error('Failed', 'Failed to convert to guard.');
        }
      }
    });
  };

  // Handle view details
  const handleViewDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
    if (onViewClick) onViewClick(application);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Loading skeleton
  if (isLoading && applications.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
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
        {/* Statistics Section */}
        {statistics && (
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-3 p-4 border-b bg-gray-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{statistics.reviewed}</p>
              <p className="text-xs text-gray-500">Reviewed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{statistics.shortlisted}</p>
              <p className="text-xs text-gray-500">Shortlisted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{statistics.interviewed}</p>
              <p className="text-xs text-gray-500">Interviwed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statistics.hired}</p>
              <p className="text-xs text-gray-500">Hired</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
              <p className="text-xs text-gray-500">Not Considered</p>
            </div>
          </div>
        )}

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
              checked={selectedApplications.length === applications.length && applications.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3 pt-4">
            {/* Name Search */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search by name or email..."
                  value={nameSearch}
                  onChange={handleNameSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSearchSubmit()}
                />
                <InputGroupAddon onClick={handleNameSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Job Filter */}
            <div className="sm:col-span-3">
              <Select
                value={filters.career_job_id?.toString() || "all"}
                onValueChange={handleJobFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Jobs</SelectLabel>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="sm:col-span-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full text-xs"
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
                      checked={selectedApplications.length === applications.length && applications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No applications found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm || filters.status || filters.career_job_id
                            ? "Try adjusting your search or filters"
                            : "No job applications yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((application: JobApplication) => (
                    <TableRow
                      key={application.id}
                      className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                      onClick={() => handleViewDetails(application)}
                    >
                      {/* Select Checkbox */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedApplications.includes(application.id)}
                          onCheckedChange={() => handleSelectApplication(application.id)}
                        />
                      </TableCell>

                      {/* Applicant Info */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {application.full_name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="h-3 w-3" />
                              {application.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Job */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {application.job_title || `Job #${application.career_job_id}`}
                      </TableCell>

                      {/* Experience */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{application.years_experience} years</span>
                        </div>
                      </TableCell>

                      {/* Applied Date */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(application.created_at)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusColors[application.status]} border-0`}
                        >
                          {application.status_text}
                        </Badge>
                      </TableCell>

                      {/* Resume */}
                      <TableCell>
                        {application.has_resume && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadResume(application.id);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
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
                            <DropdownMenuItem onClick={() => handleViewDetails(application)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Star className="mr-2 h-4 w-4" />
                                Change Status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {statusOptions.map((option) => (
                                  <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => handleStatusUpdate(application, option.value)}
                                  >
                                    {option.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuItem onClick={() => {
                              setSelectedApplication(application);
                              setNoteDialogOpen(true);
                            }}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add note
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => {
                              setSelectedApplication(application);
                              setInterviewDialogOpen(true);
                            }}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              Schedule interview
                            </DropdownMenuItem>

                            {application.status === 'hired' && (
                              <DropdownMenuItem onClick={() => handleConvertToGuard(application)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Convert to Guard
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(application)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete application
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
          {applications.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} applications
                {selectedApplications.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedApplications.length} selected)
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
        title="Delete Application"
        description={`Are you sure you want to delete ${applicationToDelete?.full_name}'s application? This action cannot be undone.`}
      />


      {/* View Details Dialog - Enhanced Version with Fancy Styling */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0 gap-0">
          {/* Hero Header Section */}
          <div className="bg-gradient-to-r from-[#5F0015] to-[#8B0020] text-white p-6 rounded-t-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <User className="h-6 w-6" />
                Application Details
              </DialogTitle>
              <DialogDescription className="text-white/80">
                <div className="flex flex-wrap justify-between items-center mt-2">
                  <div>
                    <span className="font-semibold">Tracking Code:</span> {selectedApplication?.tracking_code}
                  </div>
                  <div>
                    <span className="font-semibold">Applied on:</span> {selectedApplication && formatDate(selectedApplication.created_at)}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedApplication && (
            <div className="space-y-6 p-6">
              {/* Status Banner with Animation */}
              <div className={`p-4 rounded-xl ${statusColors[selectedApplication.status]} border-0 shadow-sm transition-all duration-300 hover:shadow-md`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-75">Current Status</p>
                      <p className="text-xl font-bold">{selectedApplication.status_text}</p>
                    </div>
                  </div>
                  {selectedApplication.reviewed_at && (
                    <div className="text-right">
                      <p className="text-xs opacity-75">Last Reviewed</p>
                      <p className="text-sm font-semibold">{formatDate(selectedApplication.reviewed_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                  <User className="h-5 w-5 text-gold" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-sm transition-shadow">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.full_name}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-sm transition-shadow">
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.email}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-sm transition-shadow">
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.phone || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-sm transition-shadow">
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.date_of_birth ? formatDate(selectedApplication.date_of_birth) : 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-sm transition-shadow md:col-span-2">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedApplication.address ? `${selectedApplication.address}, ${selectedApplication.city}, ${selectedApplication.state} ${selectedApplication.zip_code}, ${selectedApplication.country}` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-sm transition-shadow">
                    <p className="text-xs text-gray-500">Referral Code</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.referral_code || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Work Authorization */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                  <Shield className="h-5 w-5 text-gold" />
                  Work Authorization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {selectedApplication.is_legally_authorized ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Legally Authorized to Work</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {selectedApplication.requires_sponsorship ? (
                      <CheckCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span className="text-sm font-medium">Requires Visa Sponsorship</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {selectedApplication.work_authorization_confirmed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">Work Authorization Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                  <Briefcase className="h-5 w-5 text-gold" />
                  Job Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 rounded-xl">
                    <p className="text-xs text-gray-500">Position Applied For</p>
                    <p className="font-semibold text-blue-700 dark:text-blue-300">{selectedApplication.job_title || `Job #${selectedApplication.career_job_id}`}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Job Reference Number</p>
                    <p className="font-medium">{selectedApplication.job_reference_number || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Desired Pay Range</p>
                    <p className="font-medium">{selectedApplication.desired_pay_range || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Preferred Location</p>
                    <p className="font-medium">{selectedApplication.location || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Shift Preference</p>
                    <p className="font-medium">{selectedApplication.shift_preference_label || selectedApplication.shift_preference || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Days Available</p>
                    <p className="font-medium">{selectedApplication.days_available_formatted || selectedApplication.days_available?.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Available Start Date</p>
                    <p className="font-medium">{selectedApplication.available_start_date ? formatDate(selectedApplication.available_start_date) : 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Available for Overtime</p>
                    <p className="font-medium">{selectedApplication.available_for_overtime ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Experience & Education */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                  <GraduationCap className="h-5 w-5 text-gold" />
                  Experience & Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20 rounded-xl">
                    <p className="text-xs text-gray-500">Years of Experience</p>
                    <p className="font-semibold text-green-700 dark:text-green-300">{selectedApplication.years_experience} years</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Current Employer</p>
                    <p className="font-medium">{selectedApplication.current_employer || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Current Position</p>
                    <p className="font-medium">{selectedApplication.current_position || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Highest Education</p>
                    <p className="font-medium">{selectedApplication.highest_education_label || selectedApplication.highest_education || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">School Name</p>
                    <p className="font-medium">{selectedApplication.school_name || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Degree/Certification</p>
                    <p className="font-medium">{selectedApplication.degree_certification || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Certifications & Licenses */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                  <Award className="h-5 w-5 text-gold" />
                  Certifications & Licenses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {selectedApplication.has_guard_card ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <span className="text-sm font-medium">Guard Card</span>
                      {selectedApplication.guard_card_number && (
                        <p className="text-xs text-gray-500">#{selectedApplication.guard_card_number} • Exp: {selectedApplication.guard_card_expiry ? formatDate(selectedApplication.guard_card_expiry) : 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {selectedApplication.has_firearms_permit ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <span className="text-sm font-medium">Firearms Permit</span>
                      {selectedApplication.firearms_permit_number && (
                        <p className="text-xs text-gray-500">#{selectedApplication.firearms_permit_number} • Exp: {selectedApplication.firearms_permit_expiry ? formatDate(selectedApplication.firearms_permit_expiry) : 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {selectedApplication.has_cpr_certification ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <span className="text-sm font-medium">CPR Certification</span>
                      {selectedApplication.cpr_expiry && (
                        <p className="text-xs text-gray-500">Exp: {formatDate(selectedApplication.cpr_expiry)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {selectedApplication.has_drivers_license ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <span className="text-sm font-medium">Driver's License</span>
                      {selectedApplication.drivers_license_number && (
                        <p className="text-xs text-gray-500">#{selectedApplication.drivers_license_number} • {selectedApplication.driver_license_state}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Qualifications */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                  <Shield className="h-5 w-5 text-gold" />
                  Skills & Qualifications
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedApplication.security_skills && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">Security Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {typeof selectedApplication.security_skills === 'string' ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">{selectedApplication.security_skills}</Badge>
                        ) : Array.isArray(selectedApplication.security_skills) ? (
                          selectedApplication.security_skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">{skill}</Badge>
                          ))
                        ) : (
                          <p className="text-sm">{selectedApplication.security_skills}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedApplication.physical_capabilities && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">Physical Capabilities</p>
                      <div className="flex flex-wrap gap-2">
                        {typeof selectedApplication.physical_capabilities === 'string' ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">{selectedApplication.physical_capabilities}</Badge>
                        ) : Array.isArray(selectedApplication.physical_capabilities) ? (
                          selectedApplication.physical_capabilities.map((cap, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-green-100 text-green-700">{cap}</Badge>
                          ))
                        ) : (
                          <p className="text-sm">{selectedApplication.physical_capabilities}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedApplication.professional_traits && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">Professional Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {typeof selectedApplication.professional_traits === 'string' ? (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">{selectedApplication.professional_traits}</Badge>
                        ) : Array.isArray(selectedApplication.professional_traits) ? (
                          selectedApplication.professional_traits.map((trait, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700">{trait}</Badge>
                          ))
                        ) : (
                          <p className="text-sm">{selectedApplication.professional_traits}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {selectedApplication.reliable_transportation ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">Has Reliable Transportation</span>
                  </div>
                </div>
              </div>

              {/* Cover Letter & Additional Info */}
              {selectedApplication.cover_letter && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                    <FileText className="h-5 w-5 text-gold" />
                    Cover Letter
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl max-h-[250px] overflow-y-auto border border-gray-200 dark:border-gray-700">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedApplication.cover_letter}</p>
                  </div>
                </div>
              )}

              {/* Expected Salary */}
              {(selectedApplication.expected_hourly_rate || selectedApplication.expected_monthly_salary) && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                    <DollarSign className="h-5 w-5 text-gold" />
                    Expected Compensation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedApplication.expected_hourly_rate && (
                      <div className="p-3 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20 rounded-xl">
                        <p className="text-xs text-gray-500">Expected Hourly Rate</p>
                        <p className="font-semibold text-yellow-700 dark:text-yellow-300">${selectedApplication.expected_hourly_rate}/hour</p>
                      </div>
                    )}
                    {selectedApplication.expected_monthly_salary && (
                      <div className="p-3 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20 rounded-xl">
                        <p className="text-xs text-gray-500">Expected Monthly Salary</p>
                        <p className="font-semibold text-yellow-700 dark:text-yellow-300">${selectedApplication.expected_monthly_salary}/month</p>
                      </div>
                    )}
                    {selectedApplication.notice_period_days > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-xs text-gray-500">Notice Period</p>
                        <p className="font-medium">{selectedApplication.notice_period_days} days</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interview Information */}
              {selectedApplication.interview_date && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-l-4 border-gold pl-3">
                    <CalendarIcon className="h-5 w-5 text-gold" />
                    Interview Information
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-purple-600" />
                      <p className="text-sm font-semibold">Interview Date: {formatDate(selectedApplication.interview_date)}</p>
                    </div>
                    {selectedApplication.interview_notes && (
                      <p className="text-sm text-gray-600 mt-2 ml-8">{selectedApplication.interview_notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Download - Fancy Button */}
              {selectedApplication.has_resume && (
                <div className="flex justify-center pt-6 border-t">
                  <Button
                    onClick={() => handleDownloadResume(selectedApplication.id)}
                    className="group relative overflow-hidden bg-gradient-to-r from-[#5F0015] to-[#8B0020] hover:from-[#8B0020] hover:to-[#5F0015] text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Download className="h-5 w-5 group-hover:animate-bounce" />
                      Download Resume
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add internal note about this applicant</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your note here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} className="bg-[#5F0015] hover:bg-[#5F0015]/90">
              Add Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>Schedule an interview with this applicant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Interview Date & Time *</Label>
              <Input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Interview notes, location, virtual meeting link, etc."
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleInterview} className="bg-[#5F0015] hover:bg-[#5F0015]/90">
              Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}