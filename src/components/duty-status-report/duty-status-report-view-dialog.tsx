"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Shield,
  Building2,
  MapPin,
  MessageSquare,
  Globe,
  EyeOff,
  AlertTriangle,
  Clock,
  Mail,
  PhoneCall,
  MapPin as MapPinIcon,
  Camera,
  X as CloseIcon,
  Pencil,
  FileWarning,
  File as FileIcon,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { DutyStatusReport } from "@/app/types/dutyStatusReport";

// Helper functions
const hasIncidents = (report: DutyStatusReport): boolean => {
  return report.had_incident ||
    report.suspicious_activity ||
    report.security_safety_concern ||
    report.unauthorized_access ||
    report.property_damage ||
    report.emergency_services_contacted ||
    report.requires_follow_up;
};

const getActiveIncidents = (report: DutyStatusReport): Array<{ key: string; label: string; icon: any; color: string }> => {
  const incidentMap: Record<string, { label: string; icon: any; color: string }> = {
    had_incident: { label: "Had Incident", icon: AlertTriangle, color: "text-red-500" },
    suspicious_activity: { label: "Suspicious Activity", icon: AlertTriangle, color: "text-yellow-500" },
    security_safety_concern: { label: "Security Concern", icon: AlertTriangle, color: "text-orange-500" },
    unauthorized_access: { label: "Unauthorized Access", icon: AlertTriangle, color: "text-red-600" },
    property_damage: { label: "Property Damage", icon: AlertTriangle, color: "text-red-400" },
    emergency_services_contacted: { label: "Emergency Services", icon: AlertTriangle, color: "text-blue-500" },
    requires_follow_up: { label: "Requires Follow-up", icon: AlertTriangle, color: "text-purple-500" },
  };
  const incidents: Array<{ key: string; label: string; icon: any; color: string }> = [];
  Object.keys(incidentMap).forEach(key => {
    if ((report as any)[key]) {
      incidents.push({ key, ...incidentMap[key] });
    }
  });
  return incidents;
};

const getIncidentCount = (report: DutyStatusReport): number => {
  let count = 0;
  if (report.had_incident) count++;
  if (report.suspicious_activity) count++;
  if (report.security_safety_concern) count++;
  if (report.unauthorized_access) count++;
  if (report.property_damage) count++;
  if (report.emergency_services_contacted) count++;
  if (report.requires_follow_up) count++;
  return count;
};

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
};

const formatDateTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateString;
  }
};

interface DutyStatusReportViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: DutyStatusReport | null;
  onEdit?: () => void;
}

export function DutyStatusReportViewDialog({
  open,
  onOpenChange,
  report,
  onEdit
}: DutyStatusReportViewDialogProps) {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  if (!report) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <FileWarning className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Report not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const incidentCount = getIncidentCount(report);
  const hasIncident = hasIncidents(report);

  return (
    <>
      {/* Main View Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="
          w-full max-w-full
          sm:w-[96vw] sm:max-w-[96vw]
          md:max-w-[92vw]
          lg:max-w-7xl
          xl:max-w-[90vw]
          2xl:max-w-[85vw]
          h-[100dvh] max-h-[100dvh]
          sm:h-[96vh] sm:max-h-[96vh]
          md:h-[94vh] md:max-h-[94vh]
          p-0 overflow-hidden flex flex-col
          rounded-none sm:rounded-xl md:rounded-2xl
          bg-white dark:bg-gray-950
          shadow-2xl
        ">
          {/* Header - Compact */}
          <div className="flex-shrink-0 border-b bg-white dark:bg-gray-950 px-3 sm:px-5 md:px-7 py-2 sm:py-3 md:py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-primary" />
                <DialogTitle className="text-sm sm:text-base md:text-lg font-semibold truncate">
                  Report #{report.id}
                </DialogTitle>
                <div className="flex items-center gap-1.5 ml-1">
                  <Badge className={`${report.is_ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-0 text-[10px] sm:text-xs px-1.5 sm:px-2`}>
                    {report.is_ok ? '✓ OK' : '⚠ Issue'}
                  </Badge>
                  <Badge className={`${report.visible_to_client ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 hidden sm:inline-flex`}>
                    {report.visible_to_client ? '👁 Visible' : '👁 Hidden'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {onEdit && (
                  <Button
                    size="sm"
                    onClick={onEdit}
                    className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 text-xs bg-primary hover:bg-primary/90"
                  >
                    <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="hidden xs:inline">Edit</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <CloseIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
              <Badge className={`${report.visible_to_client ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} border-0 text-[10px] sm:hidden px-1.5`}>
                {report.visible_to_client ? '👁 Visible' : '👁 Hidden'}
              </Badge>
              {hasIncident && (
                <Badge className="bg-red-100 text-red-700 border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 flex items-center gap-0.5">
                  <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {incidentCount} {incidentCount === 1 ? 'Incident' : 'Incidents'}
                </Badge>
              )}
              <span className="text-[10px] sm:text-xs text-gray-500">{formatDateTime(report.created_at)}</span>
              {report.time_ago && (
                <span className="text-[10px] sm:text-xs text-gray-400 hidden xs:inline">• {report.time_ago}</span>
              )}
            </div>
          </div>

          {/* Content - Two Column Grid with better spacing */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30">
            <div className="
              grid grid-cols-1
              lg:grid-cols-5
              gap-3 sm:gap-4 md:gap-5
              p-3 sm:p-4 md:p-5 lg:p-6
              max-w-full
              h-full
            ">
              {/* Left Column - Main Content (3/5) */}
              <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                {/* Message Card */}
                <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-3 sm:p-4 md:p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Report Message
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4">
                    <p className={`text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${!showFullMessage ? 'line-clamp-3 sm:line-clamp-4' : ''}`}>
                      {report.message || 'No message provided'}
                    </p>
                    {report.message && report.message.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullMessage(!showFullMessage)}
                        className="mt-2 h-7 text-xs text-primary hover:text-primary/80"
                      >
                        {showFullMessage ? (
                          <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                        ) : (
                          <>Show More <ChevronDown className="ml-1 h-3 w-3" /></>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Guard Info Card */}
                <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-3 sm:p-4 md:p-5">
                  <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Guard Information
                  </h3>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ring-2 ring-primary/10">
                      {report.guard?.profile_image ? (
                        <AvatarImage src={report.guard.profile_image} alt={report.guard.full_name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm sm:text-base">
                          {getInitials(report.guard?.full_name || '')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{report.guard?.full_name || 'Unknown'}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {report.guard?.guard_code && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs font-mono">{report.guard.guard_code}</Badge>
                        )}
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        {report.guard?.email && (
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                            <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                            <span className="truncate">{report.guard.email}</span>
                          </p>
                        )}
                        {report.guard?.phone && (
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <PhoneCall className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                            {report.guard.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incidents Card */}
                {hasIncident && (
                  <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-3 sm:p-4 md:p-5">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                      Incident Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {getActiveIncidents(report).map((incident) => {
                        const Icon = incident.icon;
                        return (
                          <div key={incident.key} className="flex items-center gap-2 p-2 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/30">
                            <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${incident.color}`} />
                            <span className="text-[10px] sm:text-xs font-medium truncate">{incident.label}</span>
                            <Badge className="ml-auto text-[8px] sm:text-[10px] bg-red-100 text-red-700 border-red-200 flex-shrink-0 px-1.5 py-0">
                              ✓
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Media Card */}
                {report.media && report.media.length > 0 && (
                  <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-3 sm:p-4 md:p-5">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Media ({report.media.length})
                    </h3>
                    <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-2">
                      {report.media.map((media, index) => (
                        <div
                          key={media.id}
                          className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 hover:border-primary/50 transition-all"
                          onClick={() => {
                            setSelectedMediaIndex(index);
                            setIsMediaModalOpen(true);
                          }}
                        >
                          {media.media_type === 'image' ? (
                            <img src={media.url} alt={media.original_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <FileIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                          <Badge className="absolute top-0.5 right-0.5 text-[6px] sm:text-[8px] capitalize bg-black/60 text-white border-0 px-1 py-0">
                            {media.media_type === 'image' ? '📷' : media.media_type === 'video' ? '🎬' : '📄'}
                          </Badge>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[6px] sm:text-[8px] text-white truncate">{media.original_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Details (2/5) */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                {/* Duty Details */}
                <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-3 sm:p-4 md:p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Duty Details
                  </h3>
                  <div className="space-y-1.5 text-[10px] sm:text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">ID</span>
                      <span className="font-mono font-medium">#{report.duty_id}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Title</span>
                      <span className="font-medium truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px]">
                        {report.duty_details?.title || report.duty?.title || 'N/A'}
                      </span>
                    </div>
                    {report.duty_details?.service_mode && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">Mode</span>
                        <Badge variant="outline" className="text-[8px] sm:text-[10px]">
                          {report.duty_details.service_mode.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    )}
                    {report.duty_details?.start_datetime && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">Start</span>
                        <span className="text-[10px]">{formatDateTime(report.duty_details.start_datetime)}</span>
                      </div>
                    )}
                    {report.duty_details?.end_datetime && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500">End</span>
                        <span className="text-[10px]">{formatDateTime(report.duty_details.end_datetime)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Site Details */}
                <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-3 sm:p-4 md:p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Site Details
                  </h3>
                  <div className="space-y-1.5 text-[10px] sm:text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px]">
                        {report.duty_details?.site_name || report.duty?.site?.site_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Location</span>
                      <span className="truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px]">
                        {report.duty_details?.site_location || report.duty?.site_location?.title || 'N/A'}
                      </span>
                    </div>
                    {report.duty_details?.site_address && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500">Address</span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px]">
                          {report.duty_details.site_address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {report.latitude && report.longitude && (
                  <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-3 sm:p-4 md:p-5">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Location
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-xs">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                        <span className="text-gray-500 block text-[8px] sm:text-[9px] uppercase tracking-wider">Lat</span>
                        <p className="font-mono font-medium">{Number(report.latitude).toFixed(6)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                        <span className="text-gray-500 block text-[8px] sm:text-[9px] uppercase tracking-wider">Lng</span>
                        <p className="font-mono font-medium">{Number(report.longitude).toFixed(6)}</p>
                      </div>
                      {report.has_location && (
                        <div className="col-span-2 mt-0.5">
                          <Badge className="bg-green-100 text-green-700 border-0 text-[8px] sm:text-[10px] w-full justify-center py-1">
                            <MapPinIcon className="h-2.5 w-2.5 mr-1" /> Live Location Available
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-3 sm:p-4 md:p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Timeline
                  </h3>
                  <div className="space-y-1.5 text-[10px] sm:text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Created</span>
                      <span className="font-medium">{formatDateTime(report.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Updated</span>
                      <span className="font-medium">{formatDateTime(report.updated_at)}</span>
                    </div>
                    {report.time_ago && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500">Age</span>
                        <Badge variant="outline" className="text-[8px] sm:text-[10px]">{report.time_ago}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Modal - Fullscreen on mobile, clean on desktop */}
      <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
        <DialogContent className="
          w-full max-w-full
          sm:w-[96vw] sm:max-w-[96vw]
          md:max-w-[92vw]
          lg:max-w-6xl
          h-[100dvh] max-h-[100dvh]
          sm:h-[96vh] sm:max-h-[96vh]
          md:h-[94vh] md:max-h-[94vh]
          p-0 overflow-hidden
          rounded-none sm:rounded-xl md:rounded-2xl
          bg-black/95 border-none
          flex flex-col
        ">
          {/* Media Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-5 md:px-6 py-2 sm:py-3 bg-black/80 border-b border-white/10">
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-white truncate">
              Media {selectedMediaIndex + 1} of {report.media?.length || 0}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMediaModalOpen(false)}
              className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 rounded-full"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Media Content */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
            <Carousel className="w-full max-w-5xl">
              <CarouselContent>
                {report.media?.map((media, index) => (
                  <CarouselItem key={media.id}>
                    <div className="flex flex-col items-center justify-center">
                      {media.media_type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.original_name}
                          className="max-h-[50vh] sm:max-h-[65vh] md:max-h-[70vh] w-auto object-contain"
                        />
                      ) : media.media_type === 'video' ? (
                        <video
                          src={media.url}
                          controls
                          className="max-h-[50vh] sm:max-h-[65vh] md:max-h-[70vh] w-full"
                          playsInline
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gray-800 rounded-lg w-full max-w-sm sm:max-w-md">
                          <FileIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                          <p className="mt-2 text-xs sm:text-sm text-white text-center break-all">{media.original_name}</p>
                          <Button
                            variant="outline"
                            className="mt-3 sm:mt-4 text-white border-white hover:bg-white/20 text-xs sm:text-sm"
                            onClick={() => window.open(media.url, '_blank')}
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Download
                          </Button>
                        </div>
                      )}
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-2 truncate max-w-full px-2">
                        {media.original_name}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {report.media && report.media.length > 1 && (
                <>
                  <CarouselPrevious className="left-1 sm:left-2 md:left-4 bg-white/10 text-white hover:bg-white/30 border-0 h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 backdrop-blur-sm" />
                  <CarouselNext className="right-1 sm:right-2 md:right-4 bg-white/10 text-white hover:bg-white/30 border-0 h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 backdrop-blur-sm" />
                </>
              )}
            </Carousel>
          </div>

          {/* Media Footer */}
          <div className="flex-shrink-0 px-3 sm:px-5 md:px-6 py-1.5 sm:py-2 bg-black/80 border-t border-white/10">
            <p className="text-[10px] sm:text-xs text-gray-400 truncate text-center">
              {report.media?.[selectedMediaIndex]?.original_name || ''}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
