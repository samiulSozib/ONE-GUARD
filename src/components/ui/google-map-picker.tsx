/* eslint-disable */
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, MapPin, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface GoogleMapPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
}



export default function GoogleMapPicker({
  isOpen,
  onClose,
  onSelect,
  initialLat = 23.6850,
  initialLng = 90.3563
}: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [searchInput, setSearchInput] = useState("")
  const [selectedAddress, setSelectedAddress] = useState("")
  const [selectedLat, setSelectedLat] = useState(initialLat)
  const [selectedLng, setSelectedLng] = useState(initialLng)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const scriptLoadedRef = useRef(false)

  // Helper: get address from lat/lng
  function getAddressFromLatLng(lat: number, lng: number) {
    if (!window.google) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          setSelectedAddress(results[0].formatted_address)
        } else {
          setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        }
      }
    )
  }

  // Helper: update marker position and map center
  function updateLocation(lat: number, lng: number, mapInstance: any, markerInstance: any) {
    const position = { lat, lng }
    markerInstance.setPosition(position)
    mapInstance.panTo(position)
    setSelectedLat(lat)
    setSelectedLng(lng)
    getAddressFromLatLng(lat, lng)
  }

  // Helper: search address string and update map
  const searchLocation = () => {
    if (!searchInput.trim() || !window.google) {
      alert('Please enter a location to search.')
      return
    }

    if (!map || !marker) {
      alert('Map is not ready yet. Please wait a moment and try again.')
      return
    }

    setIsSearching(true)
    const geocoder = new window.google.maps.Geocoder()

    // Get current map bounds for bias
    const bounds = map.getBounds()
    const geocodeOptions: any = {
      address: searchInput,
    }

    // If bounds exist, use them to bias results
    if (bounds) {
      geocodeOptions.bounds = bounds
    } else {
      // Fallback: bias to initial region (Bangladesh)
      geocodeOptions.bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(20.5, 88.0),  // SW corner
        new window.google.maps.LatLng(26.5, 92.5)   // NE corner
      )
    }

    geocoder.geocode(geocodeOptions, (results: any, status: any) => {
      setIsSearching(false)

      if (status === 'OK' && results && results.length > 0) {
        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()
        setSelectedAddress(results[0].formatted_address)
        updateLocation(lat, lng, map, marker)
      } else {
        console.error('Geocoding error:', status)

        if (status === 'ZERO_RESULTS') {
          alert('No location found. Try a more specific address.')
        } else if (status === 'OVER_QUERY_LIMIT') {
          alert('Too many searches. Please wait a moment and try again.')
        } else if (status === 'REQUEST_DENIED') {
          alert('Geocoding service error. Check your API key.')
        } else if (status === 'INVALID_REQUEST') {
          alert('Invalid search request. Please check your input.')
        } else {
          alert('Location not found. Please try a different search.')
        }
      }
    })
  }

  // Load Google Maps script
  useEffect(() => {
    if (!isOpen) return

    const loadGoogleMaps = () => {
      // If we already successfully loaded the script before, just initialize
      if (scriptLoadedRef.current && window.google && window.google.maps) {
        setTimeout(() => initializeMap(), 100)
        return
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]') as HTMLScriptElement | null
      if (existingScript && window.google && window.google.maps) {
        // Script exists and Google is already loaded
        scriptLoadedRef.current = true
        setTimeout(() => initializeMap(), 100)
        return
      }

      // Set the callback that Google Maps script will call
      (window as any).initMap = () => {
        scriptLoadedRef.current = true
        setTimeout(() => initializeMap(), 0)
      }

      // If script already exists, it will eventually call our callback
      if (existingScript) {
        return
      }

      // Create and load the script
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key is missing')
        setIsLoading(false)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`
      script.async = true
      script.defer = true
      script.onerror = () => {
        console.error('Failed to load Google Maps')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()

    return () => {
      if (map) {
        // Cleanup if needed in future (listeners, markers)
      }
    }
  }, [isOpen])

  function initializeMap() {
    if (!mapRef.current || !window.google) return

    setIsLoading(true)

    const mapOptions = {
      center: { lat: initialLat, lng: initialLng },
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    }

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions)
    setMap(newMap)

    // Create marker
    const newMarker = new window.google.maps.Marker({
      position: { lat: initialLat, lng: initialLng },
      map: newMap,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    })
    setMarker(newMarker)

    // Get address for initial position
    getAddressFromLatLng(initialLat, initialLng)

    // Click on map to set location
    newMap.addListener('click', (e: any) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      updateLocation(lat, lng, newMap, newMarker)
    })

    // Marker drag end
    newMarker.addListener('dragend', (e: any) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      updateLocation(lat, lng, newMap, newMarker)
    })

    setMapLoaded(true)
    setIsLoading(false)
  }

  // When dialog opens again, ensure map is resized and recentered (fixes blank/hidden map on reopen)
  useEffect(() => {
    if (!isOpen) return
    if (!window.google) return

    // If map already exists, trigger resize and recenter
    if (map) {
      // wait a tick for dialog animation/layout
      setTimeout(() => {
        try {
          window.google.maps.event.trigger(map, 'resize')
          map.setCenter({ lat: selectedLat, lng: selectedLng })
        } catch (e) {
          // ignore
        }
      }, 200)
    }
  }, [isOpen, map, selectedLat, selectedLng])

  // Reset loading state and search when picker opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setMapLoaded(false)
      setSearchInput("")
      setIsSearching(false)
    } else {
      setSearchInput("")
      setIsSearching(false)
    }
  }, [isOpen])

  function handleConfirm() {
    onSelect(selectedLat, selectedLng, selectedAddress)
    onClose()
  }

  if (!isOpen) return null

  const dialogContentClass = ['sm:max-w-[800px]', 'w-[95vw]', 'max-h-[90vh]', 'p-0', 'overflow-hidden'].join(' ')
  const mapContainerClass = ['relative', 'w-full', 'h-[400px]', 'sm:h-[500px]', 'rounded-lg', 'overflow-hidden', 'border'].join(' ')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={dialogContentClass}>
        <DialogHeader className="px-4 sm:px-6 py-3 border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Pick Location on Map
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                placeholder="Search for a location..."
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                disabled={!mapLoaded}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Button
              onClick={searchLocation}
              disabled={isSearching || !mapLoaded}
              className="shrink-0"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {/* Map Container */}
          <div className={mapContainerClass}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* Selected Location Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Selected Location:</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedAddress || 'Click on map to select a location'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Lat: {selectedLat.toFixed(6)}</span>
              <span>Lng: {selectedLng.toFixed(6)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
