// components/clients/tabContents/site.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Building,
  MapPin,
  Users,
  AlertCircle,
  RefreshCw,
  Navigation,
  Clock,
  CheckCircle2,
  PauseCircle,
  Layers,
  Trash2,
  Plus,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchSites, deleteSite } from "@/store/slices/siteSlice";
import { 
  createSiteLocation, 
  deleteSiteLocation,
  updateSiteLocation,
  fetchSiteLocations 
} from "@/store/slices/siteLocationSlice";
import { Client } from "@/app/types/client";
import { SiteLocation } from "@/app/types/site";
import SweetAlertService from "@/lib/sweetAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Google Maps types are now available from @types/google.maps
/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    initMap?: () => void;
  }
}

interface SiteProps {
  client: Client;
}

interface LocationFormData {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

const defaultLocationForm: LocationFormData = {
  title: "",
  description: "",
  latitude: 0,
  longitude: 0,
  is_active: true,
};

// Status colors mapping
const siteStatusColors: Record<string, string> = {
  planned: "bg-blue-100 text-blue-800 border-blue-200",
  running: "bg-green-100 text-green-800 border-green-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

// Status icons
const getStatusIcon = (status: string = "planned") => {
  switch (status) {
    case "running":
      return <CheckCircle2 className="h-3 w-3" />;
    case "paused":
      return <PauseCircle className="h-3 w-3" />;
    case "completed":
      return <CheckCircle2 className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

// Status display text
const getStatusDisplay = (status: string = "planned") => {
  const statusMap: Record<string, string> = {
    planned: "Planned",
    running: "Running",
    paused: "Paused",
    completed: "Completed",
  };
  return statusMap[status] || status;
};

export function Site({ client }: SiteProps) {
  const dispatch = useAppDispatch();
  const { sites, isLoading, error } = useAppSelector((state) => state.site);
  
  // State for selected location
  const [selectedLocation, setSelectedLocation] = useState<SiteLocation | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<number | null>(null);
  const [locationDeleteInProgress, setLocationDeleteInProgress] = useState<number | null>(null);
  
  // Location form state
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SiteLocation | null>(null);
  const [locationForm, setLocationForm] = useState<LocationFormData>(defaultLocationForm);
  const [locationFormErrors, setLocationFormErrors] = useState<Record<string, string>>({});
  const [locationSubmitLoading, setLocationSubmitLoading] = useState(false);
  
  // Refs for Google Maps
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Fetch sites when client ID changes
  useEffect(() => {
    if (client?.id) {
      dispatch(fetchSites({ 
        client_id: client.id,
        per_page: 10,
        include_locations: true 
      }));
    }
  }, [dispatch, client?.id]);

  // Set first site as selected when sites load
  useEffect(() => {
    if (sites && sites.length > 0 && !selectedSiteId) {
      // Use setTimeout to break the sync update and avoid the warning
      const timer = setTimeout(() => {
        setSelectedSiteId(sites[0].id);
        if (sites[0].locations && sites[0].locations.length > 0) {
          setSelectedLocation(sites[0].locations[0]);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [sites, selectedSiteId]);

  // Load Google Maps script
  useEffect(() => {
    // Don't do anything if script is already loaded or loading
    if (window.google?.maps) {
      queueMicrotask(()=>{
        setMapLoaded(true)
      })
      return;
    }

    // Check if script is already being loaded
    if (scriptRef.current) return;

    // Create and load script
    const script = document.createElement('script');
    scriptRef.current = script;
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Use callback instead of direct setState in effect
    script.onload = () => {
      setMapLoaded(true);
      setMapError(null);
    };
    
    script.onerror = () => {
      setMapError('Failed to load Google Maps. Please check your API key.');
      scriptRef.current = null;
    };
    
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  // Initialize map when location changes and map is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !selectedLocation || !window.google?.maps) return;

    try {
      const location: google.maps.LatLngLiteral = {
        lat: Number(selectedLocation.latitude),
        lng: Number(selectedLocation.longitude),
      };

      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });
        
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: googleMapRef.current,
          title: selectedLocation.title,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        googleMapRef.current.setCenter(location);
        googleMapRef.current.setZoom(15);
        
        if (markerRef.current) {
          markerRef.current.setPosition(location);
          markerRef.current.setTitle(selectedLocation.title);
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: location,
            map: googleMapRef.current,
            title: selectedLocation.title,
            animation: window.google.maps.Animation.DROP,
          });
        }
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      queueMicrotask(()=>{
        setMapError("Failed to initialize map");
      })
    }
  }, [mapLoaded, selectedLocation]);

  // Handle location selection
  const handleLocationSelect = (location: SiteLocation, siteId: number) => {
    setSelectedLocation(location);
    setSelectedSiteId(siteId);
  };

  // Handle site delete
  const handleDeleteSite = async (siteId: number, siteName: string) => {
    try {
      const result = await SweetAlertService.confirm(
        'Delete Site',
        `Are you sure you want to delete "${siteName}"? This action cannot be undone.`,
        'Yes, delete',
        'Cancel'
      );

      if (result.isConfirmed) {
        setDeleteInProgress(siteId);
        
        await dispatch(deleteSite(siteId)).unwrap();
        
        // If the deleted site was selected, clear selection
        if (selectedSiteId === siteId) {
          setSelectedSiteId(null);
          setSelectedLocation(null);
        }
        
        SweetAlertService.success(
          'Site Deleted',
          `Site "${siteName}" has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        // Refresh sites list
        if (client?.id) {
          dispatch(fetchSites({ 
            client_id: client.id,
            per_page: 10,
            include_locations: true 
          }));
        }
      }
    } catch (error) {
      SweetAlertService.error(
        'Delete Failed',
        'Failed to delete site. Please try again.'
      );
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Handle location delete
  const handleDeleteLocation = async (locationId: number, locationTitle: string, siteId: number) => {
    try {
      const result = await SweetAlertService.confirm(
        'Delete Location',
        `Are you sure you want to delete "${locationTitle}"? This action cannot be undone.`,
        'Yes, delete',
        'Cancel'
      );

      if (result.isConfirmed) {
        setLocationDeleteInProgress(locationId);
        
        await dispatch(deleteSiteLocation(locationId)).unwrap();
        
        // If the deleted location was selected, clear selection
        if (selectedLocation?.id === locationId) {
          setSelectedLocation(null);
        }
        
        SweetAlertService.success(
          'Location Deleted',
          `Location "${locationTitle}" has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        // Refresh sites to get updated locations
        if (client?.id) {
          dispatch(fetchSites({ 
            client_id: client.id,
            per_page: 10,
            include_locations: true 
          }));
        }
      }
    } catch (error) {
      SweetAlertService.error(
        'Delete Failed',
        'Failed to delete location. Please try again.'
      );
    } finally {
      setLocationDeleteInProgress(null);
    }
  };

  // Handle add/edit location
  const handleOpenLocationDialog = (siteId: number, location?: SiteLocation) => {
    if (location) {
      // Edit mode
      setEditingLocation(location);
      setLocationForm({
        title: location.title,
        description: location.description || "",
        latitude: location.latitude,
        longitude: location.longitude,
        is_active: location.is_active,
      });
    } else {
      // Add mode
      setEditingLocation(null);
      setLocationForm(defaultLocationForm);
    }
    setSelectedSiteId(siteId);
    setIsLocationDialogOpen(true);
    setLocationFormErrors({});
  };

  const validateLocationForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!locationForm.title.trim()) {
      errors.title = "Title is required";
    }

    if (!locationForm.latitude) {
      errors.latitude = "Latitude is required";
    }

    if (!locationForm.longitude) {
      errors.longitude = "Longitude is required";
    }

    setLocationFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLocationSubmit = async () => {
    if (!validateLocationForm() || !selectedSiteId) return;

    setLocationSubmitLoading(true);

    try {
      if (editingLocation) {
        // Update existing location
        await dispatch(updateSiteLocation({
          id: editingLocation.id,
          data: locationForm,
        })).unwrap();

        SweetAlertService.success(
          'Location Updated',
          `Location "${locationForm.title}" has been updated successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
      } else {
        // Create new location
        await dispatch(createSiteLocation({
          site_id: selectedSiteId,
          ...locationForm,
        })).unwrap();

        SweetAlertService.success(
          'Location Created',
          `Location "${locationForm.title}" has been created successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
      }

      // Refresh sites to get updated locations
      if (client?.id) {
        dispatch(fetchSites({ 
          client_id: client.id,
          per_page: 10,
          include_locations: true 
        }));
      }

      setIsLocationDialogOpen(false);
      setLocationForm(defaultLocationForm);
      setEditingLocation(null);
    } catch (error) {
      SweetAlertService.error(
        editingLocation ? 'Update Failed' : 'Creation Failed',
        `Failed to ${editingLocation ? 'update' : 'create'} location. Please try again.`
      );
    } finally {
      setLocationSubmitLoading(false);
    }
  };

  // Refresh sites
  const handleRefresh = () => {
    if (client?.id) {
      dispatch(fetchSites({ 
        client_id: client.id,
        per_page: 10,
        include_locations: true 
      }));
    }
  };

  // Format address
  const formatAddress = (address: string) => {
    return address.length > 50 ? `${address.substring(0, 50)}...` : address;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load sites. Please try again.
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // No sites state
  if (!sites || sites.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sites found
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-md mb-4">
              This client does not have any sites yet. Create a new site to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={locationForm.title}
                onChange={(e) => setLocationForm({ ...locationForm, title: e.target.value })}
                placeholder="Enter location title"
                className={locationFormErrors.title ? "border-red-500" : ""}
              />
              {locationFormErrors.title && (
                <p className="text-xs text-red-500">{locationFormErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={locationForm.description}
                onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                placeholder="Enter location description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">
                  Latitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={locationForm.latitude || ""}
                  onChange={(e) => setLocationForm({ ...locationForm, latitude: parseFloat(e.target.value) || 0 })}
                  placeholder="40.7128"
                  className={locationFormErrors.latitude ? "border-red-500" : ""}
                />
                {locationFormErrors.latitude && (
                  <p className="text-xs text-red-500">{locationFormErrors.latitude}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">
                  Longitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={locationForm.longitude || ""}
                  onChange={(e) => setLocationForm({ ...locationForm, longitude: parseFloat(e.target.value) || 0 })}
                  placeholder="-74.0060"
                  className={locationFormErrors.longitude ? "border-red-500" : ""}
                />
                {locationFormErrors.longitude && (
                  <p className="text-xs text-red-500">{locationFormErrors.longitude}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch
                id="is_active"
                checked={locationForm.is_active}
                onCheckedChange={(checked) => setLocationForm({ ...locationForm, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active Location
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLocationDialogOpen(false)}
              disabled={locationSubmitLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLocationSubmit}
              disabled={locationSubmitLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {locationSubmitLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {editingLocation ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingLocation ? 'Update Location' : 'Create Location'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sites Grid */}
      {sites.map((site) => (
        <div key={site.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info Content Column */}
          <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-xl font-bold truncate">
                    {site.site_name}
                  </CardTitle>
                  {site.site_instruction && (
                    <CardDescription className="mt-1 line-clamp-2">
                      {site.site_instruction}
                    </CardDescription>
                  )}
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground break-words">
                      {formatAddress(site.address)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`
                      ${siteStatusColors[site.status || 'default']}
                      border px-2 py-1 flex items-center gap-1 shrink-0
                    `}
                  >
                    {getStatusIcon(site.status)}
                    {getStatusDisplay(site.status)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteSite(site.id, site.site_name)}
                    disabled={deleteInProgress === site.id}
                  >
                    {deleteInProgress === site.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Guards Required */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Guards Required:</span>
                </div>
                <Badge variant="outline" className="bg-white">
                  {site.guards_required}
                </Badge>
              </div>
              
              {/* Locations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    Site Locations
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenLocationDialog(site.id)}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Location
                  </Button>
                </div>
                
                {site.locations && site.locations.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {site.locations.map((location) => (
                      <div 
                        key={location.id} 
                        className={`
                          p-3 rounded-lg border transition-all cursor-pointer relative group
                          ${selectedLocation?.id === location.id && selectedSiteId === site.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }
                        `}
                        onClick={() => handleLocationSelect(location, site.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <MapPin className={`h-4 w-4 ${selectedLocation?.id === location.id && selectedSiteId === site.id ? 'text-blue-600' : 'text-gray-400'}`} />
                              <p className="text-sm font-medium truncate">
                                {location.title}
                              </p>
                            </div>
                            {location.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1 ml-6">
                                {location.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 ml-6">
                              <Badge variant="outline" className="text-xs">
                                Lat: {typeof location.latitude === 'number' ? location.latitude.toFixed(6) : location.latitude}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Long: {typeof location.longitude === 'number' ? location.longitude.toFixed(6) : location.longitude}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge 
                              className={location.is_active 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {location.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLocationDialog(site.id, location);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLocation(location.id, location.title, site.id);
                              }}
                              disabled={locationDeleteInProgress === location.id}
                            >
                              {locationDeleteInProgress === location.id ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed rounded-lg">
                    <MapPin className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">No locations added yet</p>
                  </div>
                )}
              </div>

              {/* Site-level Coordinates (fallback if no locations) */}
              {(!site.locations || site.locations.length === 0) && site.latitude && site.longitude && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <p className="text-xs text-gray-500">Latitude</p>
                      <p className="text-sm font-medium">{site.latitude}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Longitude</p>
                      <p className="text-sm font-medium">{site.longitude}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map Column */}
          <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  {selectedLocation && selectedSiteId === site.id 
                    ? selectedLocation.title 
                    : site.site_name}
                </CardTitle>
                {selectedLocation && selectedSiteId === site.id && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Selected Location
                  </Badge>
                )}
              </div>
              <CardDescription>
                {selectedLocation && selectedSiteId === site.id
                  ? selectedLocation.description || 'Location details'
                  : site.locations && site.locations.length > 0
                    ? 'Select a location from the list to view on map'
                    : site.latitude && site.longitude
                      ? 'Map view of the site location'
                      : 'Location coordinates not available'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={selectedSiteId === site.id ? mapRef : undefined}
                className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg relative overflow-hidden"
              >
                {mapError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                    <div className="text-center p-4">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-600">{mapError}</p>
                    </div>
                  </div>
                )}
                
                {selectedLocation && selectedSiteId === site.id && !mapError && (
                  // Google Maps will be rendered here
                  <div className="w-full h-full">
                    {!mapLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedSiteId === site.id && site.locations && site.locations.length > 0 && !selectedLocation && !mapError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-2">No location selected</p>
                      <p className="text-xs text-gray-400">
                        Click on a location from the list to view on map
                      </p>
                    </div>
                  </div>
                )}
                
                {(!site.locations || site.locations.length === 0) && site.latitude && site.longitude && selectedSiteId === site.id && !mapError && (
                  // Fallback to static view if no locations but site has coordinates
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="mb-3">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-sm font-medium mb-1">Location Coordinates</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {site.latitude}, {site.longitude}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps?q=${site.latitude},${site.longitude}`,
                            '_blank'
                          );
                        }}
                      >
                        <MapPin className="h-3 w-3 mr-2" />
                        View on Google Maps
                      </Button>
                      <p className="text-xs text-gray-400 mt-3">
                        {site.address}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedSiteId !== site.id && !mapError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground p-4">
                      <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select a site to view location</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            {/* Location Details Footer */}
            {selectedLocation && selectedSiteId === site.id && (
              <CardContent className="border-t p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Location ID</p>
                    <p className="text-sm font-medium">{selectedLocation.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge 
                      className={selectedLocation.is_active 
                        ? "bg-green-100 text-green-800 border-green-200 mt-1" 
                        : "bg-gray-100 text-gray-800 border-gray-200 mt-1"
                      }
                    >
                      {selectedLocation.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm">
                      {new Date(selectedLocation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm">
                      {new Date(selectedLocation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}