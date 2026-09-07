// components/incident/incident-data-table.tsx

"use client";

import { Incident, IncidentMedia, IncidentParams } from "@/app/types/incident";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import {
    AlertTriangle,
    Building,
    CalendarIcon,
    Camera,
    ChevronDown,
    ChevronUp,
    Clock,
    DownloadIcon,
    EllipsisVertical,
    Eye,
    EyeOff,
    File as FileIcon,
    Filter,
    Hash,
    ListFilter,
    Loader2,
    MapPin,
    Pencil,
    Phone,
    Search,
    Shield,
    Trash2,
    User,
    X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Checkbox } from "../ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Label } from "../ui/label";
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
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import SweetAlertService from "@/lib/sweetAlert";
import { cn } from "@/lib/utils";
import { deleteIncident, fetchIncidents, toggleClientVisibility, updateIncidentStatus } from "@/store/slices/incidentSlice";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { DeleteDialog } from "../shared/delete-dialog";
import { Badge } from "../ui/badge";
import { Calendar as CalendarComponent } from "../ui/calender";
import { FloatingLabelInput } from "../ui/floating-input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

// Status color mapping
export const incidentStatusColors: Record<string, string> = {
    "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "acknowledged": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "investigating": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "resolved": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "closed": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    "rejected": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

// Severity color mapping
export const severityColors: Record<string, string> = {
    "critical": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "high": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "low": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "minor": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
};

// View Incident Dialog Component
const ViewIncidentDialog = ({
    isOpen,
    onClose,
    incident
}: {
    isOpen: boolean;
    onClose: () => void;
    incident: Incident | null;
}) => {
    // Hooks must be called at the top level, before any conditional returns
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    // If no incident or dialog not open, return null after hooks are defined
    if (!isOpen || !incident) return null;

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status: string) => {
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${incidentStatusColors[status] || "bg-gray-100 text-gray-800"}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    const getSeverityBadge = (severity: string | undefined) => {
        const sev = severity || "unknown";
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[sev] || "bg-gray-100 text-gray-800"}`}>
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
            </span>
        );
    };

    const getClientVisibilityBadge = (visible: boolean) => {
        return visible ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                <Eye className="h-3 w-3 inline mr-1" />
                Visible
            </span>
        ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <EyeOff className="h-3 w-3 inline mr-1" />
                Hidden
            </span>
        );
    };

    const handleMediaClick = (index: number) => {
        setSelectedMediaIndex(index);
        setIsMediaModalOpen(true);
    };

    return (
        <>
            {/* Main View Dialog - Smaller size */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent showCloseButton={false} className="
          max-w-4xl w-[95vw]
          max-h-[90vh] h-auto
          p-0 overflow-hidden flex flex-col
          rounded-xl
          bg-white dark:bg-gray-950
          shadow-2xl
        ">
                    {/* Header */}
                    <div className="flex-shrink-0 border-b bg-white dark:bg-gray-950 px-4 sm:px-6 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-orange-500" />
                                <DialogTitle className="text-sm sm:text-base font-semibold truncate">
                                    Incident #{incident.id}
                                </DialogTitle>
                                <div className="flex items-center gap-1 ml-1 flex-wrap">
                                    {incident.severity && getSeverityBadge(incident.severity)}
                                    {getStatusBadge(incident.status)}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {getClientVisibilityBadge(incident.visible_to_client)}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {incident.tracking_code}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-[10px] sm:text-xs text-gray-500">
                                {formatDate(incident.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <ScrollArea className="flex-1 max-h-[70vh]">
                        <div className="p-4 sm:p-6 space-y-4">
                            {/* Title & Description */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{incident.title}</h4>
                                {incident.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                        {incident.description}
                                    </p>
                                )}
                                {incident.note && (
                                    <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            <strong>Note:</strong> {incident.note}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Site Details */}
                                    <div>
                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                            <Building className="h-3.5 w-3.5" />
                                            Site
                                        </h4>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {incident.site?.site_name || 'N/A'}
                                            </p>
                                            {incident.site_location && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {incident.site_location.title}
                                                </p>
                                            )}
                                            {incident.site?.address && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{incident.site.address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Client & Guard */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {incident.client && (
                                            <div>
                                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5" />
                                                    Client
                                                </h4>
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {incident.client.full_name}
                                                    </p>
                                                    {incident.client.phone && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {incident.client.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {incident.guard && (
                                            <div>
                                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                                    <Shield className="h-3.5 w-3.5" />
                                                    Guard
                                                </h4>
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {incident.guard.full_name}
                                                    </p>
                                                    {incident.guard.guard_code && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{incident.guard.guard_code}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Location */}
                                    {incident.latitude && incident.longitude && (
                                        <div>
                                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                Location
                                            </h4>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Lat</p>
                                                        <p className="text-xs font-mono font-medium">{Number(incident.latitude).toFixed(6)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Lng</p>
                                                        <p className="text-xs font-mono font-medium">{Number(incident.longitude).toFixed(6)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div>
                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            Timeline
                                        </h4>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Created</span>
                                                <span className="font-medium">{formatDate(incident.created_at)}</span>
                                            </div>
                                            {incident.updated_at && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Updated</span>
                                                    <span className="font-medium">{formatDate(incident.updated_at)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Media Section */}
                            {incident.media && incident.media.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                            <Camera className="h-3.5 w-3.5" />
                                            Media ({incident.media.length})
                                        </h4>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                            {incident.media.map((media: IncidentMedia, index: number) => (
                                                <div
                                                    key={media.id}
                                                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border hover:border-primary transition-all"
                                                    onClick={() => handleMediaClick(index)}
                                                >
                                                    {media.media_type === 'image' ? (
                                                        <Image
                                                            src={media.url}
                                                            alt={media.original_name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                            sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                            <FileIcon className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                                    <Badge className="absolute top-0.5 right-0.5 text-[6px] capitalize bg-black/60 text-white border-0 px-1 py-0">
                                                        {media.media_type === 'image' ? '📷' : media.media_type === 'video' ? '🎬' : '📄'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="flex-shrink-0 p-3 border-t bg-gray-50/50 dark:bg-gray-900/50">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full text-sm"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Media Modal - Smaller */}
            <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
                <DialogContent showCloseButton={false} className="
          max-w-3xl w-[95vw]
          max-h-[85vh] h-auto
          p-0 overflow-hidden flex flex-col
          rounded-xl
          bg-black/95 border-none
        ">
                    {/* Media Header */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-black/80 border-b border-white/10">
                        <h3 className="text-sm font-medium text-white">
                            Media {selectedMediaIndex + 1} of {incident?.media?.length || 0}
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMediaModalOpen(false)}
                            className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Media Content */}
                    <div className="flex-1 flex items-center justify-center p-4 min-h-[200px]">
                        {incident && incident.media && incident.media.length > 0 && (
                            <Carousel className="w-full max-w-2xl">
                                <CarouselContent>
                                    {incident.media.map((media: IncidentMedia, index: number) => (
                                        <CarouselItem key={media.id}>
                                            <div className="flex flex-col items-center justify-center">
                                                {media.media_type === 'image' ? (
                                                    <div className="relative w-full max-h-[50vh] aspect-auto">
                                                        <Image
                                                            src={media.url}
                                                            alt={media.original_name}
                                                            width={800}
                                                            height={600}
                                                            className="object-contain max-h-[50vh] w-auto mx-auto"
                                                        />
                                                    </div>
                                                ) : media.media_type === 'video' ? (
                                                    <video
                                                        src={media.url}
                                                        controls
                                                        className="max-h-[50vh] w-full"
                                                        playsInline
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg w-full max-w-sm">
                                                        <FileIcon className="h-12 w-12 text-gray-400" />
                                                        <p className="mt-2 text-sm text-white text-center break-all">{media.original_name}</p>
                                                        <Button
                                                            variant="outline"
                                                            className="mt-3 text-white border-white hover:bg-white/20 text-sm"
                                                            onClick={() => window.open(media.url, '_blank')}
                                                        >
                                                            <DownloadIcon className="h-4 w-4 mr-2" /> Download
                                                        </Button>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2 truncate max-w-full px-2">
                                                    {media.original_name}
                                                </p>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {incident.media.length > 1 && (
                                    <>
                                        <CarouselPrevious className="left-2 bg-white/10 text-white hover:bg-white/30 border-0 h-8 w-8 backdrop-blur-sm" />
                                        <CarouselNext className="right-2 bg-white/10 text-white hover:bg-white/30 border-0 h-8 w-8 backdrop-blur-sm" />
                                    </>
                                )}
                            </Carousel>
                        )}
                    </div>

                    {/* Media Footer */}
                    <div className="flex-shrink-0 px-4 py-1.5 bg-black/80 border-t border-white/10">
                        <p className="text-xs text-gray-400 truncate text-center">
                            {incident?.media?.[selectedMediaIndex]?.original_name || ''}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export function IncidentDataTable() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get incidents from Redux store
    const { incidents, pagination, isLoading, error } = useAppSelector((state) => state.incident);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [incidentToView, setIncidentToView] = useState<Incident | null>(null);

    // Search states - reduced to essential ones
    const [trackingSearch, setTrackingSearch] = useState("");
    const [titleSearch, setTitleSearch] = useState("");

    // Filter states - simplified
    const [severityFilter, setSeverityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

    // Mobile filter collapse state
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Selection state
    const [selectedIncidents, setSelectedIncidents] = useState<number[]>([]);

    // Fetch incidents on component mount and when filters change
    useEffect(() => {
        const params: IncidentParams = {
            page: pagination.current_page || 1,
            per_page: 10,
        };

        // Add search terms
        const searchTerms = [trackingSearch, titleSearch]
            .filter(Boolean)
            .join(" ");

        if (searchTerms) {
            params.search = searchTerms;
        }

        // Add filters
        if (severityFilter !== "all") {
            params.severity = severityFilter;
        }

        if (statusFilter !== "all") {
            params.status = statusFilter;
        }

        if (dateFilter) {
            params.incident_date = format(dateFilter, "yyyy-MM-dd");
        }

        dispatch(fetchIncidents(params));
    }, [
        dispatch,
        pagination.current_page,
        trackingSearch,
        titleSearch,
        severityFilter,
        statusFilter,
        dateFilter
    ]);

    const viewDetails = (e: React.MouseEvent, incident: Incident) => {
        e.stopPropagation();
        setIncidentToView(incident);
        setViewDialogOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, incident: Incident) => {
        e.stopPropagation();
        setIncidentToDelete(incident);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (incidentToDelete) {
            try {
                await dispatch(deleteIncident(incidentToDelete.id));

                await SweetAlertService.success(
                    'Incident Deleted',
                    `Incident ${incidentToDelete.tracking_code} has been deleted successfully.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    }
                );

                setDeleteDialogOpen(false);
                setIncidentToDelete(null);

                // Refresh the incident list
                dispatch(fetchIncidents({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                await SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the incident. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    const handleStatusUpdate = async (e: React.MouseEvent, incident: Incident, newStatus: string) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: `Update Incident Status`,
            text: `Are you sure you want to change status to "${newStatus}"? This confirmation will expire in 5 seconds.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update',
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                const resultAction = await dispatch(updateIncidentStatus({
                    id: incident.id,
                    status: newStatus
                }));

                if (updateIncidentStatus.fulfilled.match(resultAction)) {
                    await SweetAlertService.success(
                        'Status Updated',
                        `Incident ${incident.tracking_code} status has been updated to "${newStatus}".`,
                        {
                            timer: 2000,
                            showConfirmButton: false,
                            timerProgressBar: true,
                        }
                    );
                }
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating the incident status. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    const handleToggleVisibility = async (e: React.MouseEvent, incident: Incident) => {
        e.stopPropagation();

        const newVisibility = !incident.visible_to_client;
        const action = newVisibility ? 'show' : 'hide';

        const result = await Swal.fire({
            title: `${newVisibility ? 'Show' : 'Hide'} Incident to Client`,
            text: `Are you sure you want to ${action} this incident to the client? This confirmation will expire in 5 seconds.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newVisibility ? '#10b981' : '#6b0016',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${action}`,
            cancelButtonText: 'Cancel',
            timer: 5000,
            timerProgressBar: true,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                const resultAction = await dispatch(toggleClientVisibility({
                    id: incident.id,
                    visible_to_client: newVisibility
                }));

                if (toggleClientVisibility.fulfilled.match(resultAction)) {
                    await SweetAlertService.success(
                        'Visibility Updated',
                        `Incident is now ${newVisibility ? 'visible' : 'hidden'} to the client.`,
                        {
                            timer: 2000,
                            showConfirmButton: false,
                            timerProgressBar: true,
                        }
                    );
                }
            } catch (error) {
                await SweetAlertService.error(
                    'Update Failed',
                    'There was an error updating client visibility. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIncidents(incidents.map((incident: Incident) => incident.id));
        } else {
            setSelectedIncidents([]);
        }
    };

    const handleSelectIncident = (incidentId: number, checked: boolean) => {
        if (checked) {
            setSelectedIncidents(prev => [...prev, incidentId]);
        } else {
            setSelectedIncidents(prev => prev.filter(id => id !== incidentId));
        }
    };

    const handleExport = async () => {
        await SweetAlertService.success(
            'Export Started',
            'Your incident data export has been initiated.',
            {
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIncidents.length === 0) {
            await SweetAlertService.warning(
                'No Incidents Selected',
                'Please select at least one incident to delete.',
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
            text: `Are you sure you want to delete ${selectedIncidents.length} selected incident(s)? This action cannot be undone. This confirmation will expire in 5 seconds.`,
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
                await SweetAlertService.loading('Processing...', 'Please wait while we delete the incidents.');

                for (const incidentId of selectedIncidents) {
                    await dispatch(deleteIncident(incidentId));
                }

                SweetAlertService.close();

                await SweetAlertService.success(
                    'Incidents Deleted',
                    `${selectedIncidents.length} incident(s) have been deleted successfully.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    }
                );

                setSelectedIncidents([]);

                dispatch(fetchIncidents({
                    page: pagination.current_page,
                    per_page: 10,
                }));
            } catch (error) {
                SweetAlertService.close();

                await SweetAlertService.error(
                    'Delete Failed',
                    'There was an error deleting the incidents. Please try again.',
                    {
                        timer: 2000,
                        showConfirmButton: true,
                    }
                );
            }
        }
    };

    // Handle pagination
    const handlePreviousPage = () => {
        if (pagination.current_page > 1) {
            dispatch(fetchIncidents({
                page: pagination.current_page - 1,
                per_page: 10,
            }));
        }
    };

    const handleNextPage = () => {
        if (pagination.current_page < pagination.last_page) {
            dispatch(fetchIncidents({
                page: pagination.current_page + 1,
                per_page: 10,
            }));
        }
    };

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0;
        if (trackingSearch || titleSearch) count++;
        if (severityFilter !== "all") count++;
        if (statusFilter !== "all") count++;
        if (dateFilter) count++;
        return count;
    };

    // Edit dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [incidentToEdit, setIncidentToEdit] = useState<Incident | null>(null);

    const handleEditClick = (incident: Incident) => {
        setIncidentToEdit(incident);
        setEditDialogOpen(true);
    };

    const handleEditSuccess = () => {
        dispatch(fetchIncidents({
            page: pagination.current_page,
            per_page: 10,
        }));
    };

    // Format date and time
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <>
            <Card className="shadow-sm rounded-2xl border-0 overflow-hidden">
                {/* Header */}
                <div className="bg-[#F4F6F8] p-3 sm:p-5 -mt-6 rounded-t-md flex flex-wrap items-center gap-3 w-full justify-between md:justify-start">
                    <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                        <ListFilter size="14px" />
                        Filters
                    </CardTitle>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                        className="text-sm flex items-center gap-1 dark:text-black"
                    >
                        <DownloadIcon size="14px" />
                        Export
                    </Button>

                    <div className="text-sm flex items-center gap-1 dark:text-black">
                        <Checkbox
                            id="select-all"
                            checked={selectedIncidents.length === incidents.length && incidents.length > 0}
                            onCheckedChange={handleSelectAll}
                            className="dark:bg-white dark:border-black"
                        />
                        <Label htmlFor="select-all" className="text-xs sm:text-sm">Select All</Label>
                    </div>

                    {selectedIncidents.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="ml-auto text-xs sm:text-sm"
                        >
                            Delete Selected ({selectedIncidents.length})
                        </Button>
                    )}
                </div>

                <CardContent className="p-0">
                    {/* Mobile Filter Toggle */}
                    <div className="block sm:hidden border-b px-3 py-2 bg-gray-50/50 dark:bg-gray-800/20">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-full flex items-center justify-between h-8 text-xs"
                        >
                            <span className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5" />
                                Filters
                                {getActiveFilterCount() > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                                        {getActiveFilterCount()}
                                    </Badge>
                                )}
                            </span>
                            {isFilterOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className={cn(
                        "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-12 gap-3 sm:gap-4 border-b px-4 py-3 sm:py-4 transition-all duration-300 ease-in-out",
                        isFilterOpen ? "grid" : "hidden sm:grid"
                    )}>
                        {/* Search Inputs */}
                        <div className="col-span-1 xs:col-span-2 sm:col-span-4">
                            <InputGroup>
                                <InputGroupInput
                                    placeholder="Search by tracking code or title..."
                                    value={trackingSearch || titleSearch}
                                    onChange={(e) => {
                                        setTrackingSearch(e.target.value);
                                        setTitleSearch(e.target.value);
                                    }}
                                    className="h-9 sm:h-10 text-xs sm:text-sm"
                                />
                                <InputGroupAddon>
                                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </InputGroupAddon>
                            </InputGroup>
                        </div>

                        {/* Severity Filter */}
                        <div className="col-span-1 xs:col-span-1 sm:col-span-2">
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Severity</SelectLabel>
                                        <SelectItem value="all">All Severities</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="minor">Minor</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="col-span-1 xs:col-span-1 sm:col-span-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                        <SelectItem value="investigating">Investigating</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Filter */}
                        <div className="col-span-2 xs:col-span-2 sm:col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FloatingLabelInput
                                        className="text-start h-9 sm:h-10 text-xs sm:text-sm"
                                        label="Incident Date"
                                        value={dateFilter ? format(dateFilter, "MM/dd/yyyy") : ""}
                                        readOnly
                                        postfixIcon={<CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
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

                        <div className="col-span-1 xs:col-span-1 sm:col-span-1 flex items-center">
                            {dateFilter && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDateFilter(undefined)}
                                    className="text-red-600 h-9 sm:h-10 text-xs sm:text-sm"
                                >
                                    Clear Date
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-500">Loading incidents...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="p-4 text-center text-red-600">
                            Error loading incidents: {error}
                        </div>
                    )}

                    {/* Table */}
                    {!isLoading && !error && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
                                        <TableHead className="w-8 sm:w-12">
                                            <span className="sr-only">Select</span>
                                        </TableHead>
                                        <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Tracking Code</TableHead>
                                        <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Title</TableHead>
                                        <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Site</TableHead>
                                        <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Client</TableHead>
                                        <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Date</TableHead>
                                        <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Status</TableHead>
                                        <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Client Visibility</TableHead>
                                        <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {incidents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center">
                                                    <AlertTriangle className="h-12 w-12 text-gray-400 mb-3" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                                                    <p className="text-gray-500">Try adjusting your search or filters</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        incidents.map((incident: Incident, index: number) => {
                                            let rowBgColor = '';
                                            if (index % 2 === 0) {
                                                rowBgColor = 'bg-white dark:bg-gray-900/50';
                                            } else {
                                                rowBgColor = 'bg-gray-50/50 dark:bg-gray-800/30';
                                            }

                                            return (
                                                <TableRow
                                                    key={incident.id}
                                                    className={`${rowBgColor} hover:bg-blue-50/80 dark:hover:bg-blue-900/30 cursor-pointer transition-colors`}
                                                    onClick={() => {
                                                        setIncidentToView(incident);
                                                        setViewDialogOpen(true);
                                                    }}
                                                >
                                                    {/* Select Checkbox */}
                                                    <TableCell onClick={(e) => e.stopPropagation()} className="py-2 sm:py-3 px-2 sm:px-3">
                                                        <Checkbox
                                                            checked={selectedIncidents.includes(incident.id)}
                                                            onCheckedChange={(checked) =>
                                                                handleSelectIncident(incident.id, checked as boolean)
                                                            }
                                                            className="h-3 w-3 sm:h-4 sm:w-4"
                                                        />
                                                    </TableCell>

                                                    {/* Tracking Code */}
                                                    <TableCell className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                                        {incident.tracking_code}
                                                    </TableCell>

                                                    {/* Title */}
                                                    <TableCell className="py-2 sm:py-3 px-2 sm:px-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                        <span className="truncate max-w-[120px] block">{incident.title}</span>
                                                    </TableCell>

                                                    {/* Site */}
                                                    <TableCell className="py-2 sm:py-3 px-2 sm:px-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                        {incident.site?.site_name || "N/A"}
                                                    </TableCell>

                                                    {/* Client */}
                                                    <TableCell className="py-2 sm:py-3 px-2 sm:px-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                        {incident.client?.full_name || "N/A"}
                                                    </TableCell>

                                                    {/* Date */}
                                                    <TableCell className="py-2 sm:py-3 px-2 sm:px-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                        {formatDate(incident.incident_date || incident.created_at)}
                                                    </TableCell>

                                                    {/* Status with Dropdown */}
                                                    <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                                                        <div className="flex items-center gap-1 sm:gap-2">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${incidentStatusColors[incident.status] || "bg-gray-100 text-gray-800"}`}>
                                                                {incident.status?.charAt(0).toUpperCase() + incident.status?.slice(1)}
                                                            </span>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                        <EllipsisVertical className="h-3 w-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="start" className="w-48 shadow-lg rounded-xl">
                                                                    <DropdownMenuItem onClick={(e) => handleStatusUpdate(e, incident, "acknowledged")} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                                                        Acknowledge
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => handleStatusUpdate(e, incident, "investigating")} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                                                        Start Investigation
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => handleStatusUpdate(e, incident, "resolved")} className="hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                                                        Mark as Resolved
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => handleStatusUpdate(e, incident, "closed")} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer text-xs sm:text-sm">
                                                                        Close
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>

                                                    {/* Client Visibility Toggle */}
                                                    <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                                                            onClick={(e) => handleToggleVisibility(e, incident)}
                                                            title={incident.visible_to_client ? 'Hide from client' : 'Show to client'}
                                                        >
                                                            {incident.visible_to_client ? (
                                                                <Eye className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </Button>
                                                    </TableCell>

                                                    {/* Actions */}
                                                    <TableCell className="text-center py-2 sm:py-3 px-2 sm:px-3" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                                                    <EllipsisVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 sm:w-56 shadow-lg rounded-xl">
                                                                <DropdownMenuItem onClick={(e) => viewDetails(e, incident)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                                                    <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                                                    View details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleEditClick(incident)} className="hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                                                    <Pencil className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                                                                    Edit incident
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => handleDeleteClick(e, incident)}
                                                                    className="hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer text-red-600 hover:text-red-700 text-xs sm:text-sm"
                                                                >
                                                                    <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                                    Delete incident
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
                    )}

                    {/* Pagination */}
                    {!isLoading && !error && incidents.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t bg-gray-50/50 dark:bg-gray-900/20">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing <span className="font-medium text-gray-900 dark:text-white">{incidents.length}</span> of{' '}
                                <span className="font-medium text-gray-900 dark:text-white">{pagination.total}</span> incidents
                                {selectedIncidents.length > 0 && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        ({selectedIncidents.length} selected)
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={handlePreviousPage}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg font-medium text-blue-600 dark:text-blue-400">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={handleNextPage}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DeleteDialog
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Incident"
                description={`Are you sure you want to delete incident ${incidentToDelete?.tracking_code}? This action cannot be undone.`}
            />

            {/* View Incident Dialog */}
            <ViewIncidentDialog
                isOpen={viewDialogOpen}
                onClose={() => {
                    setViewDialogOpen(false);
                    setIncidentToView(null);
                }}
                incident={incidentToView}
            />
        </>
    );
}
