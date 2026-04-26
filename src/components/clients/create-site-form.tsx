'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableDropdownWithIcon } from "../ui/searchable-dropdown-with-icon"
import {
  Building,
  MapPin,
  Map,
  Plus,
  Trash2,
  Check,
  FileText,
  Loader2,
  X,
  Crosshair,
} from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { fetchContracts } from "@/store/slices/clientContractSlice"
import { createSite } from "@/store/slices/siteSlice"
import SweetAlertService from "@/lib/sweetAlert"
import { ClientContract } from "@/app/types/clientContract"

interface Location {
  title: string
  description?: string
  latitude: number
  longitude: number
  is_active: boolean
  useCurrentLocation?: boolean
}

interface CreateSiteFormData {
  client_contract_id?: number
  site_name: string
  address: string
  guards_required: number
  latitude?: number
  longitude?: number
  status: 'planned' | 'active' | 'paused' | 'completed'
  site_instruction?: string
  locations: Location[]
  useCurrentLocation?: boolean
}

interface CreateSiteFormProps {
  trigger: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  clientId: number
}

interface SubmitSiteData {
  client_id: number
  client_contract_id?: number
  site_name: string
  address: string
  guards_required: number
  status: 'planned' | 'active' | 'paused' | 'completed'
  site_instruction?: string
  latitude?: number
  longitude?: number
  is_active?: boolean
  locations: {
    title: string
    description: string
    latitude: number
    longitude: number
    is_active: boolean
  }[]
}

const defaultLocation: Location = {
  title: "",
  description: "",
  latitude: 0,
  longitude: 0,
  is_active: true,
  useCurrentLocation: false,
}

export function CreateSiteForm({
  trigger,
  isOpen,
  onOpenChange,
  onSuccess,
  clientId,
}: CreateSiteFormProps) {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [internalOpen, setInternalOpen] = useState(false)

  // Use internal state if isOpen is not provided (uncontrolled mode)
  const open = isOpen !== undefined ? isOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (isOpen !== undefined) {
      onOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }

  // Form state
  const [formData, setFormData] = useState<CreateSiteFormData>({
    client_contract_id: undefined,
    site_name: "",
    address: "",
    guards_required: 1,
    latitude: undefined,
    longitude: undefined,
    status: "planned",
    site_instruction: "",
    locations: [],
    useCurrentLocation: false,
  })

  const [locations, setLocations] = useState<Location[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Redux state
  const { contracts, isLoading: contractsLoading } = useAppSelector((state) => state.clientContract)

  // Search states
  const [contractSearch, setContractSearch] = useState("")

  // Load contracts for this client
  useEffect(() => {
    if (clientId && open) {
      dispatch(fetchContracts({
        page: 1,
        per_page: 10,
        client_id: clientId,
        search: contractSearch
      }))
    }
  }, [dispatch, clientId, contractSearch, open])

  // Handle contract search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientId && open) {
        dispatch(fetchContracts({
          page: 1,
          per_page: 10,
          client_id: clientId,
          search: contractSearch.trim() || undefined
        }))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [contractSearch, dispatch, clientId, open])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setFormData({
      client_contract_id: undefined,
      site_name: "",
      address: "",
      guards_required: 1,
      latitude: undefined,
      longitude: undefined,
      status: "planned",
      site_instruction: "",
      locations: [],
      useCurrentLocation: false,
    })
    setLocations([])
    setValidationErrors({})
    setActiveTab("basic")
    setContractSearch("")
  }

  // Get current location using browser geolocation
  const getCurrentLocation = useCallback((callback: (lat: number, lng: number) => void) => {
    if (!navigator.geolocation) {
      SweetAlertService.error('Not Supported', 'Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        callback(lat, lng)
        SweetAlertService.success(
          'Location Found',
          `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
          { timer: 2000, showConfirmButton: false }
        )
        setIsGettingLocation(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Unable to get your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Please allow location access to use this feature'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        SweetAlertService.error('Location Error', errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [])

  // Handle use current location checkbox for main site
  const handleUseCurrentLocationChange = useCallback(async (checked: boolean) => {
    setFormData(prev => ({ ...prev, useCurrentLocation: checked }))

    if (checked) {
      getCurrentLocation((lat, lng) => {
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          useCurrentLocation: true
        }))
      })
    } else {
      setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }))
    }
  }, [getCurrentLocation])

  // Handle use current location checkbox for a specific location
  const handleLocationUseCurrentLocation = useCallback(async (index: number, checked: boolean) => {
    const updatedLocations = [...locations]
    updatedLocations[index] = { ...updatedLocations[index], useCurrentLocation: checked }

    if (checked) {
      getCurrentLocation((lat, lng) => {
        updatedLocations[index] = {
          ...updatedLocations[index],
          latitude: lat,
          longitude: lng,
          useCurrentLocation: true
        }
        setLocations(updatedLocations)

        // Clear validation errors for coordinates
        if (validationErrors[`location_${index}_latitude`]) {
          const newErrors = { ...validationErrors }
          delete newErrors[`location_${index}_latitude`]
          delete newErrors[`location_${index}_longitude`]
          setValidationErrors(newErrors)
        }
      })
    } else {
      updatedLocations[index] = {
        ...updatedLocations[index],
        latitude: 0,
        longitude: 0,
        useCurrentLocation: false
      }
      setLocations(updatedLocations)
    }
  }, [locations, getCurrentLocation, validationErrors])

  // Handle cancel/close
  const handleCancel = () => {
    if (isLoading) return

    // Check if form has data
    const hasData = formData.site_name ||
                   formData.address ||
                   formData.guards_required !== 1 ||
                   formData.latitude ||
                   formData.longitude ||
                   formData.site_instruction ||
                   locations.length > 0 ||
                   formData.client_contract_id
                   setOpen(false)

    
  }

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.site_name || formData.site_name.trim() === "") {
      errors.site_name = "Site name is required"
    }

    if (!formData.address || formData.address.trim() === "") {
      errors.address = "Address is required"
    }

    if (!formData.guards_required || formData.guards_required < 1) {
      errors.guards_required = "At least 1 guard is required"
    }

    // Validate locations if any
    locations.forEach((location, index) => {
      if (!location.title || location.title.trim() === "") {
        errors[`location_${index}_title`] = `Location ${index + 1} title is required`
      }
      if (!location.latitude && !location.useCurrentLocation) {
        errors[`location_${index}_latitude`] = `Location ${index + 1} latitude is required`
      }
      if (!location.longitude && !location.useCurrentLocation) {
        errors[`location_${index}_longitude`] = `Location ${index + 1} longitude is required`
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveTab("basic")
      return
    }

    setIsLoading(true)

    try {
      const submitData: SubmitSiteData = {
        client_id: clientId,
        site_name: formData.site_name,
        address: formData.address,
        guards_required: formData.guards_required,
        status: formData.status,
        site_instruction: formData.site_instruction || "",
        is_active: true,
        locations: locations.map(({ title, description, latitude, longitude, is_active }) => ({
          title,
          description: description || "",
          latitude,
          longitude,
          is_active,
        })),
      }

      // Add optional fields
      if (formData.client_contract_id) {
        submitData.client_contract_id = formData.client_contract_id
      }

      if (formData.latitude) {
        submitData.latitude = formData.latitude
      }

      if (formData.longitude) {
        submitData.longitude = formData.longitude
      }

      const result = await dispatch(createSite(submitData))

      if (createSite.fulfilled.match(result)) {
        await SweetAlertService.success(
          'Site Created Successfully',
          `Site "${formData.site_name}" has been created successfully.`
        )
        resetForm()
        onSuccess?.()
        setOpen(false) // Close the dialog on success
      } else {
        throw result.payload
      }
    } catch (error) {
      await SweetAlertService.error(
        'Site Creation Failed',
        'Failed to create site. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Location management
  const addLocation = () => {
    setLocations([...locations, { ...defaultLocation }])
  }

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index))
    // Clear validation errors for this location
    const newErrors = { ...validationErrors }
    delete newErrors[`location_${index}_title`]
    delete newErrors[`location_${index}_latitude`]
    delete newErrors[`location_${index}_longitude`]
    setValidationErrors(newErrors)
  }

  const updateLocation = (index: number, field: keyof Location, value: string | number | boolean) => {
    const updatedLocations = [...locations]
    updatedLocations[index] = { ...updatedLocations[index], [field]: value }
    setLocations(updatedLocations)

    // Clear validation error for this field
    if (validationErrors[`location_${index}_${field}`]) {
      const newErrors = { ...validationErrors }
      delete newErrors[`location_${index}_${field}`]
      setValidationErrors(newErrors)
    }
  }

  // Handle form field changes
  const handleFieldChange = <K extends keyof CreateSiteFormData>(
    field: K,
    value: CreateSiteFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value })

    // Clear validation error for this field
    if (validationErrors[field as string]) {
      const newErrors = { ...validationErrors }
      delete newErrors[field as string]
      setValidationErrors(newErrors)
    }
  }

  // Handle dialog open/close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel()
    } else {
      setOpen(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[1000px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] p-0 overflow-hidden"
        onEscapeKeyDown={handleCancel}
        onInteractOutside={(e) => {
          e.preventDefault()
          handleCancel()
        }}
      >
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-semibold truncate">
                  Create New Site
                </DialogTitle>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Add a new site with optional contract assignment
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b px-4 sm:px-6 overflow-x-auto">
            <TabsList className="w-full sm:w-auto inline-flex h-auto p-0 bg-transparent">
              <TabsTrigger
                value="basic"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none whitespace-nowrap"
              >
                Basic Information
              </TabsTrigger>
              <TabsTrigger
                value="locations"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none whitespace-nowrap"
              >
                Locations ({locations.length})
              </TabsTrigger>
              <TabsTrigger
                value="contract"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none whitespace-nowrap"
              >
                Contract (Optional)
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(90vh-200px)] sm:h-[calc(90vh-180px)]">
            <TabsContent value="basic" className="p-4 sm:p-6 space-y-4 m-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">Site Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Site Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Site Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.site_name}
                      onChange={(e) => handleFieldChange('site_name', e.target.value)}
                      placeholder="Enter site name"
                      className={validationErrors.site_name ? "border-red-500" : ""}
                      disabled={isLoading}
                    />
                    {validationErrors.site_name && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.site_name}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      placeholder="Enter site address"
                      className={validationErrors.address ? "border-red-500" : ""}
                      disabled={isLoading}
                    />
                    {validationErrors.address && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.address}</p>
                    )}
                  </div>

                  {/* Use Current Location Checkbox */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <input
                      type="checkbox"
                      id="useCurrentLocation"
                      checked={formData.useCurrentLocation || false}
                      onChange={(e) => handleUseCurrentLocationChange(e.target.checked)}
                      className="rounded w-4 h-4 text-blue-600"
                      disabled={isLoading || isGettingLocation}
                    />
                    <label htmlFor="useCurrentLocation" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <Crosshair className="h-4 w-4" />
                      {isGettingLocation ? 'Getting location...' : 'Use my current location for this site'}
                    </label>
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.latitude || ""}
                        onChange={(e) => handleFieldChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="e.g., 40.7128"
                        disabled={isLoading || formData.useCurrentLocation}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.longitude || ""}
                        onChange={(e) => handleFieldChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="e.g., -74.0060"
                        disabled={isLoading || formData.useCurrentLocation}
                      />
                    </div>
                  </div>

                  {/* Guards Required */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Guards Required <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.guards_required}
                      onChange={(e) => handleFieldChange('guards_required', parseInt(e.target.value) || 1)}
                      className={validationErrors.guards_required ? "border-red-500" : ""}
                      disabled={isLoading}
                    />
                    {validationErrors.guards_required && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.guards_required}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'planned' | 'active' | 'paused' | 'completed') => handleFieldChange('status', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Site Instructions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Site Instructions</Label>
                    <FloatingLabelTextarea
                      label="Enter special instructions..."
                      value={formData.site_instruction}
                      onChange={(e) => handleFieldChange('site_instruction', e.target.value)}
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="p-4 sm:p-6 space-y-4 m-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>Site Locations</span>
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLocation}
                      disabled={isLoading}
                      className="text-xs w-full sm:w-auto"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Location
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {locations.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No locations added yet</p>
                      <Button
                        variant="link"
                        onClick={addLocation}
                        className="mt-2"
                      >
                        Add your first location
                      </Button>
                    </div>
                  ) : (
                    locations.map((location, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <Map className="h-4 w-4 text-blue-600 shrink-0" />
                              <span className="truncate">Location #{index + 1}</span>
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLocation(index)}
                              disabled={isLoading}
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Location Title */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">
                              Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={location.title}
                              onChange={(e) => updateLocation(index, 'title', e.target.value)}
                              placeholder="e.g., Main Entrance"
                              className={validationErrors[`location_${index}_title`] ? "border-red-500" : ""}
                              disabled={isLoading}
                            />
                            {validationErrors[`location_${index}_title`] && (
                              <p className="text-xs text-red-500">{validationErrors[`location_${index}_title`]}</p>
                            )}
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Description</Label>
                            <Input
                              value={location.description || ""}
                              onChange={(e) => updateLocation(index, 'description', e.target.value)}
                              placeholder="Enter description"
                              disabled={isLoading}
                            />
                          </div>

                          {/* Use Current Location Checkbox for Location */}
                          <div className="flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                            <input
                              type="checkbox"
                              id={`location-${index}-useCurrent`}
                              checked={location.useCurrentLocation || false}
                              onChange={(e) => handleLocationUseCurrentLocation(index, e.target.checked)}
                              className="rounded w-3 h-3 text-blue-600"
                              disabled={isLoading || isGettingLocation}
                            />
                            <label htmlFor={`location-${index}-useCurrent`} className="text-xs font-medium cursor-pointer flex items-center gap-1">
                              <Crosshair className="h-3 w-3" />
                              Use current location for this location
                            </label>
                          </div>

                          {/* Coordinates */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Latitude <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="number"
                                step="any"
                                value={location.latitude || ""}
                                onChange={(e) => updateLocation(index, 'latitude', parseFloat(e.target.value) || 0)}
                                placeholder="40.7128"
                                className={validationErrors[`location_${index}_latitude`] ? "border-red-500" : ""}
                                disabled={isLoading || location.useCurrentLocation}
                              />
                              {validationErrors[`location_${index}_latitude`] && (
                                <p className="text-xs text-red-500">{validationErrors[`location_${index}_latitude`]}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Longitude <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="number"
                                step="any"
                                value={location.longitude || ""}
                                onChange={(e) => updateLocation(index, 'longitude', parseFloat(e.target.value) || 0)}
                                placeholder="-74.0060"
                                className={validationErrors[`location_${index}_longitude`] ? "border-red-500" : ""}
                                disabled={isLoading || location.useCurrentLocation}
                              />
                              {validationErrors[`location_${index}_longitude`] && (
                                <p className="text-xs text-red-500">{validationErrors[`location_${index}_longitude`]}</p>
                              )}
                            </div>
                          </div>

                          {/* Active Status */}
                          <div className="flex items-center gap-2 pt-2">
                            <Switch
                              id={`location-${index}-active`}
                              checked={location.is_active}
                              onCheckedChange={(checked) => updateLocation(index, 'is_active', checked)}
                              disabled={isLoading}
                            />
                            <Label htmlFor={`location-${index}-active`} className="text-xs cursor-pointer">
                              Active Location
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contract" className="p-4 sm:p-6 space-y-4 m-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">Contract Assignment (Optional)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Contract (Optional)</Label>
                    <SearchableDropdownWithIcon
                      value={formData.client_contract_id?.toString() || ""}
                      onValueChange={(value) => handleFieldChange('client_contract_id', Number(value))}
                      options={contracts?.map((contract: ClientContract) => ({
                        value: contract.id,
                        label: `${contract.contract_number} - ${contract.name} (${contract.status})`
                      })) || []}
                      onSearch={setContractSearch}
                      placeholder="Select contract (optional)"
                      disabled={isLoading || contractsLoading}
                      isLoading={contractsLoading}
                      emptyMessage={contractSearch ? "No contracts found" : "No contracts available for this client"}
                      searchPlaceholder="Search contracts..."
                      icon={FileText}
                      iconPosition="left"
                    />
                  </div>

                  {formData.client_contract_id && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="text-sm font-medium text-blue-700">Site will be assigned to contract</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        The site will be linked to the selected contract with the following default settings:
                      </p>
                      <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                        <li>Guards required: {formData.guards_required}</li>
                        <li>Status: {formData.status}</li>
                        <li>Locations: {locations.length}</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer - Fixed to be visible */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 z-10">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Site
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
