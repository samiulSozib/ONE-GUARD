// components/duty-instruction/duty-instruction-data-table.tsx
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
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CheckCheck,
  Flag,
  Image as ImageIcon,
  Signature,
  AlertTriangle
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchInstructions,
  deleteInstruction,
  clearCurrentInstruction,
  toggleInstructionStatus,
} from "@/store/slices/shiftInstruction";
import { DutyInstruction, DutyInstructionParams } from "@/app/types/shiftInstruction";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
// import { DutyInstructionEditForm } from "./duty-instruction-edit-form";
import Swal from 'sweetalert2';

// Priority colors mapping
const priorityColors: Record<string, string> = {
  "low": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "medium": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "high": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "urgent": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const instructionTypeColors: Record<string, string> = {
  patrol: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  inspection: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  report: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

interface DutyInstructionDataTableProps {
  instructionableType?: string;
  instructionableId?: number;
  onAddClick?: () => void;
  onViewClick?: (instruction: DutyInstruction) => void;
}

export function ShiftInstructionDataTable({ 
  instructionableType, 
  instructionableId,
  onAddClick, 
  onViewClick 
}: DutyInstructionDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { instructions, pagination, isLoading, error } = useAppSelector((state) => state.shiftInstruction);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [filters, setFilters] = useState<DutyInstructionParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedInstructions, setSelectedInstructions] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instructionToDelete, setInstructionToDelete] = useState<DutyInstruction | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<DutyInstruction | null>(null);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mandatoryFilter, setMandatoryFilter] = useState("all");

  // Fetch instructions on mount and filter changes
  useEffect(() => {
    const fetchParams: DutyInstructionParams = {
      page: filters.page || 1,
      per_page: filters.per_page || 10,
      search: searchTerm || undefined,
    };



    // Add instructionable filter if provided
    if (instructionableType && instructionableId) {
      fetchParams.instructionable_type = instructionableType;
      fetchParams.instructionable_id = instructionableId;
    }

    // Add type filter
    if (typeFilter !== "all") {
      fetchParams.instruction_type = typeFilter;
    }

    // Add priority filter
    if (priorityFilter !== "all") {
      fetchParams.priority = priorityFilter as DutyInstructionParams['priority'];
    }

    // Add status filter
    if (statusFilter !== "all") {
      fetchParams.status = statusFilter;
    }
    
    dispatch(fetchInstructions(fetchParams));
  }, [dispatch, filters.page, searchTerm, typeFilter, priorityFilter, statusFilter, instructionableType, instructionableId]);

      useEffect(()=>{
        console.log(instructions)
    },[dispatch,instructions])
  
  // Handle search
  const handleTitleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleSearch(e.target.value);
  };
  
  const handleTitleSearchSubmit = () => {
    setSearchTerm(titleSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTitleSearch("");
    setTypeFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
    setMandatoryFilter("all");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedInstructions([]);
  };
  
  // Handle instruction selection
  const handleSelectInstruction = (instructionId: number, checked: boolean) => {
    if (checked) {
      setSelectedInstructions(prev => [...prev, instructionId]);
    } else {
      setSelectedInstructions(prev => prev.filter(id => id !== instructionId));
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInstructions(instructions.map((instruction: DutyInstruction) => instruction.id));
    } else {
      setSelectedInstructions([]);
    }
  };
  
  // Handle delete
  const handleDeleteClick = (e: React.MouseEvent, instruction: DutyInstruction) => {
    e.stopPropagation();
    setInstructionToDelete(instruction);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (instructionToDelete) {
      try {
        await dispatch(deleteInstruction(instructionToDelete.id)).unwrap();
        
        await SweetAlertService.success(
          'Instruction Deleted',
          `${instructionToDelete.title} has been deleted successfully.`,
          {
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          }
        );
        
        setDeleteDialogOpen(false);
        setInstructionToDelete(null);
        
        // Refresh list
        const fetchParams: DutyInstructionParams = {
          page: filters.page || 1,
          per_page: filters.per_page || 10,
          search: searchTerm || undefined,
        };
        dispatch(fetchInstructions(fetchParams));
      } catch (error) {
        await SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the instruction. Please try again.',
          {
            timer: 2000,
            showConfirmButton: true,
          }
        );
      }
    }
  };
  
  // Handle instruction status update
  const handleInstructionStatusUpdate = async (e: React.MouseEvent, instruction: DutyInstruction, newStatus: 'active' | 'inactive' | 'completed') => {
    e.stopPropagation();

    const statusDisplay = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    const result = await Swal.fire({
      title: `Mark Instruction as ${statusDisplay}`,
      text: `Are you sure you want to mark "${instruction.title}" as ${statusDisplay}? This confirmation will expire in 5 seconds.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'active' ? '#10b981' : newStatus === 'completed' ? '#3b82f6' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, mark as ${statusDisplay}`,
      cancelButtonText: 'Cancel',
      timer: 5000,
      timerProgressBar: true,
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const resultAction = await dispatch(toggleInstructionStatus({ 
          id: instruction.id, 
          status: newStatus 
        }));

        if (toggleInstructionStatus.fulfilled.match(resultAction)) {
          await SweetAlertService.success(
            'Status Updated',
            `"${instruction.title}" has been marked as ${statusDisplay} successfully.`,
            {
              timer: 2000,
              showConfirmButton: false,
              timerProgressBar: true,
            }
          );
        } else {
          await SweetAlertService.error(
            'Update Failed',
            'There was an error updating the instruction status. Please try again.',
            {
              timer: 2000,
              showConfirmButton: true,
            }
          );
        }
      } catch (error) {
        await SweetAlertService.error(
          'Update Failed',
          'There was an error updating the instruction status. Please try again.',
          {
            timer: 2000,
            showConfirmButton: true,
          }
        );
      }
    } else if (result.dismiss === Swal.DismissReason.timer) {
      await SweetAlertService.info(
        'Confirmation Expired',
        'The confirmation dialog timed out. Please try again.',
        {
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }
      );
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedInstructions.length === 0) {
      await SweetAlertService.warning(
        'No Instructions Selected',
        'Please select at least one instruction to delete.',
        {
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }
      );
      return;
    }

    const result = await Swal.fire({
      title: 'Bulk Delete Confirmation',
      text: `Are you sure you want to delete ${selectedInstructions.length} selected instruction(s)? This action cannot be undone. This confirmation will expire in 5 seconds.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6b0016',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      timer: 5000,
      timerProgressBar: true,
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await SweetAlertService.loading('Processing...', 'Please wait while we delete the instructions.');

        for (const instructionId of selectedInstructions) {
          await dispatch(deleteInstruction(instructionId)).unwrap();
        }

        SweetAlertService.close();

        await SweetAlertService.success(
          'Instructions Deleted',
          `${selectedInstructions.length} instruction(s) have been deleted successfully.`,
          {
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          }
        );

        setSelectedInstructions([]);

        const fetchParams: DutyInstructionParams = {
          page: filters.page || 1,
          per_page: filters.per_page || 10,
          search: searchTerm || undefined,
        };
        dispatch(fetchInstructions(fetchParams));
      } catch (error) {
        SweetAlertService.close();
        await SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the instructions. Please try again.',
          {
            timer: 2000,
            showConfirmButton: true,
          }
        );
      }
    } else if (result.dismiss === Swal.DismissReason.timer) {
      await SweetAlertService.info(
        'Confirmation Expired',
        'The confirmation dialog timed out. Please try again.',
        {
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }
      );
    }
  };
  
  // Handle view details
  const handleViewDetails = (instruction: DutyInstruction) => {
    setSelectedInstruction(instruction);
    setViewDialogOpen(true);
    if (onViewClick) onViewClick(instruction);
  };
  
  // Handle edit
  const handleEdit = (instruction: DutyInstruction) => {
    setSelectedInstruction(instruction);
    setEditDialogOpen(true);
  };
  
  // Get priority display text
  const getPriorityDisplay = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  
  // Get status display text
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Active',
      'inactive': 'Inactive',
      'completed': 'Completed',
    };
    return statusMap[status] || status;
  };
  
  // Check if status can be changed
  const canChangeTo = (currentStatus: string, targetStatus: string) => {
    if (currentStatus === targetStatus) return false;
    
    const validTransitions: Record<string, string[]> = {
      'active': ['inactive', 'completed'],
      'inactive': ['active'],
      'completed': [], // Cannot change from completed
    };
    
    return validTransitions[currentStatus]?.includes(targetStatus) || false;
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  // Export functionality
  const handleExport = async () => {
    await SweetAlertService.success(
      'Export Started',
      'Your instruction data export has been initiated.',
      {
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      }
    );
  };
  
  // Loading skeleton
  if (isLoading && instructions.length === 0) {
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

          <div className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox
              id="select-all"
              checked={selectedInstructions.length === instructions.length && instructions.length > 0}
              onCheckedChange={handleSelectAll}
              className="dark:bg-white dark:border-black"
            />
            <Label htmlFor="select-all">Select All</Label>
          </div>

          {selectedInstructions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="ml-auto"
            >
              Delete Selected ({selectedInstructions.length})
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Title Search Input */}
            <div className="sm:col-span-3">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Instruction Title..." 
                  value={titleSearch}
                  onChange={handleTitleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleTitleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Instruction Type Filter */}
            <div className="sm:col-span-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Instruction Types</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="patrol">Patrol</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="sm:col-span-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Priority</SelectLabel>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Mandatory Filter */}
            <div className="sm:col-span-2">
              <Select value={mandatoryFilter} onValueChange={setMandatoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Mandatory</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="mandatory">Mandatory Only</SelectItem>
                    <SelectItem value="optional">Optional Only</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="sm:col-span-12 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 text-center text-red-600">
              Error loading instructions: {error}
            </div>
          )}

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {instructions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No instructions found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || typeFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new instruction"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Instruction
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  instructions.map((instruction: DutyInstruction) => (
                    <TableRow
                      key={instruction.id}
                      className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                      onClick={() => handleViewDetails(instruction)}
                    >
                      {/* Select Checkbox */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedInstructions.includes(instruction.id)}
                          onCheckedChange={(checked) =>
                            handleSelectInstruction(instruction.id, checked as boolean)
                          }
                        />
                      </TableCell>

                      {/* Title */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {instruction.title}
                      </TableCell>

                      {/* Instruction Type */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${instructionTypeColors[instruction.instruction_type] || instructionTypeColors.default} border-0`}
                        >
                          {instruction.instruction_type.charAt(0).toUpperCase() + instruction.instruction_type.slice(1)}
                        </Badge>
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Flag className={`h-4 w-4 ${
                            instruction.priority === 'urgent' ? 'text-red-500' :
                            instruction.priority === 'high' ? 'text-orange-500' :
                            instruction.priority === 'medium' ? 'text-blue-500' :
                            'text-gray-500'
                          }`} />
                          <Badge
                            variant="outline"
                            className={`${priorityColors[instruction.priority]} border-0`}
                          >
                            {getPriorityDisplay(instruction.priority)}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="text-gray-700 dark:text-gray-300 max-w-md">
                        <p className="truncate">{instruction.description}</p>
                      </TableCell>

                      {/* Requirements */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {instruction.is_mandatory && (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-0 w-fit">
                              Mandatory
                            </Badge>
                          )}
                          {instruction.requires_photo && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-0 w-fit">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Photo Required
                            </Badge>
                          )}
                          {instruction.requires_signature && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-0 w-fit">
                              <Signature className="h-3 w-3 mr-1" />
                              Signature Required
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Order */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          #{instruction.order}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`
                            inline-block
                            w-24
                            text-center
                            px-2 py-1 
                            rounded-full 
                            text-xs 
                            font-medium
                            ${statusColors[instruction.status] || "bg-gray-100 text-gray-800"}
                          `}
                        >
                          {getStatusDisplay(instruction.status)}
                        </span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(instruction)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(instruction)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit instruction
                            </DropdownMenuItem>
                            
                            {/* Status Update Options */}
                            {canChangeTo(instruction.status, 'active') && (
                              <DropdownMenuItem
                                onClick={(e) => handleInstructionStatusUpdate(e, instruction, 'active')}
                                className="text-green-600 focus:text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            
                            {canChangeTo(instruction.status, 'inactive') && (
                              <DropdownMenuItem
                                onClick={(e) => handleInstructionStatusUpdate(e, instruction, 'inactive')}
                                className="text-yellow-600 focus:text-yellow-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            
                            {canChangeTo(instruction.status, 'completed') && (
                              <DropdownMenuItem
                                onClick={(e) => handleInstructionStatusUpdate(e, instruction, 'completed')}
                                className="text-blue-600 focus:text-blue-600"
                              >
                                <CheckCheck className="mr-2 h-4 w-4" />
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            
                            {instruction.status === 'completed' && (
                              <DropdownMenuItem disabled className="text-gray-400">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Cannot change completed instruction
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteClick(e, instruction)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete instruction
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
          {instructions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {instructions.length} of {pagination.total} instructions
                {selectedInstructions.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedInstructions.length} selected)
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
        title="Delete Instruction"
        description={`Are you sure you want to delete "${instructionToDelete?.title}"? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {/* {selectedInstruction && (
        <DutyInstructionEditForm
          trigger={<div />}
          instruction={selectedInstruction}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            const fetchParams: DutyInstructionParams = {
              page: filters.page || 1,
              per_page: filters.per_page || 10,
              search: searchTerm || undefined,
            };
            dispatch(fetchInstructions(fetchParams));
          }}
        />
      )} */}
    </>
  );
}