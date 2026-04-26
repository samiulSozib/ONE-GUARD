'use client'

import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelSelect } from "../ui/floating-select"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { Textarea } from "../ui/textarea"
import {
    Plus,
    UploadCloud,
    X,
    Building,
    Contact,
    FileText,
    Copy,
    MapPin,
    Loader2,
    ChevronRight,
    ChevronDown,
    Briefcase,
    MapPinned,
    Crosshair
} from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateClient, fetchClient } from "@/store/slices/clientSlice"
import SweetAlertService from "@/lib/sweetAlert"
import {
    COUNTRIES,
    BUSINESS_TYPES,
    INDUSTRIES,
    CLIENT_DOCUMENT_TYPES,
} from "@/lib/validation/client.types"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Client, ClientContact } from "@/app/types/client"
import { Site, SiteLocation } from "@/app/types/site"

// Validation error interface
interface ValidationErrors {
    [key: string]: string
}

interface ClientUpdateFormProps {
    trigger: ReactNode
    clientId: number
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Form data interface matching create form
interface FormDataType {
    is_active: boolean
    full_name: string
    email: string
    phone: string
    password: string
    client_code: string
    company_name: string
    tax_id: string
    country: string
    city: string
    address: string
    zip_code: string
    currency_id: number | null
    registration_date: string
    business_type: string
    industry: string
    website: string
    contact_person: string
    contact_person_phone: string
    license_number: string
    notes: string
    contacts: ContactType[]
    sites: SiteType[]
    client_document_types: string[]
    site_document_types: string[]
    media_categories: string[]
}

interface ContactType {
    name: string
    phone: string
    email: string
    position: string
    department: string
    is_primary: boolean
    notes: string
}

interface LocationType {
    title: string
    description: string
    latitude: number
    longitude: number
    is_active: boolean
}

interface SiteType {
    site_name: string
    site_instruction: string
    address: string
    guards_required: number
    latitude: number
    longitude: number
    status: string
    locations: LocationType[]
    site_document_types: string[]
}

export function ClientUpdateForm({
    trigger,
    clientId,
    isOpen,
    onOpenChange,
    onSuccess
}: ClientUpdateFormProps) {
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [existingProfileImage, setExistingProfileImage] = useState<string>("")
    const [documents, setDocuments] = useState<File[]>([])
    const [existingDocuments, setExistingDocuments] = useState<Array<{id: number, name: string, url: string}>>([])
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([])
    const [step, setStep] = useState(1)
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        contacts: false,
        sites: false
    })
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [touched, setTouched] = useState<Set<string>>(new Set())
    const [showAllErrors, setShowAllErrors] = useState(false)
    const [hasLoadedData, setHasLoadedData] = useState(false)
    const clientCodeRef = useRef<HTMLInputElement>(null)

    // Form state
    const [formData, setFormData] = useState<FormDataType>({
        is_active: true,
        full_name: "",
        email: "",
        phone: "",
        password: "",
        client_code: "",
        company_name: "",
        tax_id: "",
        country: "",
        city: "",
        address: "",
        zip_code: "",
        currency_id: null,
        registration_date: "",
        business_type: "",
        industry: "",
        website: "",
        contact_person: "",
        contact_person_phone: "",
        license_number: "",
        notes: "",
        contacts: [],
        sites: [],
        client_document_types: [],
        site_document_types: [],
        media_categories: []
    })

    // Generate unique client code for regeneration
    const generateUniqueClientCode = useCallback(async (): Promise<string> => {
        try {
            const currentYear = new Date().getFullYear()
            const timestamp = new Date().getTime().toString().slice(-4)
            const randomPart = Math.floor(Math.random() * 900) + 100
            return `CL-${currentYear}-${randomPart}${timestamp}`
        } catch (error) {
            console.error("Error generating client code:", error)
            const currentYear = new Date().getFullYear()
            const randomNum = Math.floor(Math.random() * 9000) + 1000
            return `CL-${currentYear}-${randomNum}`
        }
    }, [])

    // Get current location
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

    // Handle field change
    const handleFieldChange = useCallback((field: string, value: any) => {
        setFormData(prev => {
            const fieldPath = field.split('.')
            if (fieldPath.length === 1) {
                return { ...prev, [field]: value }
            } else if (fieldPath.length >= 2) {
                const newState = { ...prev }
                let current: any = newState
                for (let i = 0; i < fieldPath.length - 1; i++) {
                    if (!current[fieldPath[i]]) {
                        current[fieldPath[i]] = {}
                    }
                    current = current[fieldPath[i]]
                }
                current[fieldPath[fieldPath.length - 1]] = value
                return newState
            }
            return prev
        })

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }

        setTouched(prev => new Set(prev).add(field))
    }, [errors])

    // Load client data when dialog opens
    useEffect(() => {
        const loadClientData = async () => {
            if (isOpen && clientId && !hasLoadedData) {
                setIsLoading(true)
                try {
                    const result = await dispatch(fetchClient({ id: clientId }))

                    if (fetchClient.fulfilled.match(result)) {
                        const client = result.payload

                        // Map contacts
                        const contacts = (client?.contacts && Array.isArray(client.contacts))
                            ? client.contacts.map((contact: ClientContact) => ({
                                name: contact?.name || '',
                                phone: contact?.phone || '',
                                email: contact?.email || '',
                                position: contact?.designation || contact?.position || '',
                                department: contact?.department || '',
                                is_primary: contact?.is_primary === 1 || contact?.is_primary === true,
                                notes: contact?.notes || ''
                            }))
                            : []

                        // Map sites
                        const sites = (client?.sites && Array.isArray(client.sites))
                            ? client.sites.map((site: Site) => ({
                                site_name: site?.site_name || '',
                                site_instruction: site?.site_instruction || '',
                                address: site?.address || '',
                                guards_required: site?.guards_required || 1,
                                latitude: site?.latitude ? parseFloat(site.latitude.toString()) : 0,
                                longitude: site?.longitude ? parseFloat(site.longitude.toString()) : 0,
                                status: site?.status || 'planned',
                                locations: (site?.locations && Array.isArray(site.locations))
                                    ? site.locations.map((loc: SiteLocation) => ({
                                        title: loc?.title || '',
                                        description: loc?.description || '',
                                        latitude: loc?.latitude ? parseFloat(loc.latitude.toString()) : 0,
                                        longitude: loc?.longitude ? parseFloat(loc.longitude.toString()) : 0,
                                        is_active: loc?.is_active ?? true
                                    }))
                                    : [],
                                site_document_types: []
                            }))
                            : []

                        // Set document types if available
                        if (client.client_document_types && client.client_document_types.length > 0) {
                            setSelectedDocumentTypes(client.client_document_types)
                        }

                        // Set media categories
                        let mediaCategories: string[] = []
                        if (client.media_categories) {
                            if (Array.isArray(client.media_categories)) {
                                mediaCategories = client.media_categories
                            } else if (typeof client.media_categories === 'string') {
                                try {
                                    const parsed = JSON.parse(client.media_categories)
                                    mediaCategories = Array.isArray(parsed) ? parsed : []
                                } catch {
                                    //mediaCategories = client.media_categories.split(',').map(c => c.trim())
                                }
                            }
                        }

                        // Set existing profile image
                        if (client.profile_image) {
                            const imageUrl = client.profile_image.startsWith('http')
                                ? client.profile_image
                                : `${process.env.NEXT_PUBLIC_API_URL || ''}${client.profile_image}`
                            setExistingProfileImage(imageUrl)
                        }

                        // Set existing documents from client.documents
                        if (client.documents && client.documents.length > 0) {
                            setExistingDocuments(client.documents.map((doc: any) => ({
                                id: doc.id,
                                name: doc.file_name || doc.name,
                                url: doc.file_path
                            })))
                        }

                        // Update form data
                        setFormData({
                            full_name: client.full_name || '',
                            email: client.email || '',
                            phone: client.phone || '',
                            password: '',
                            client_code: client.client_code || '',
                            company_name: client.company_name || '',
                            tax_id: client.tax_id || '',
                            country: client.country || '',
                            city: client.city || '',
                            address: client.address || '',
                            zip_code: client.zip_code || '',
                            currency_id: client.currency_id || null,
                            registration_date: client.registration_date || '',
                            business_type: client.business_type || '',
                            industry: client.industry || '',
                            website: client.website || '',
                            contact_person: client.contact_person || '',
                            contact_person_phone: client.contact_person_phone || '',
                            license_number: client.license_number || '',
                            notes: client.notes || '',
                            is_active: client.is_active === undefined ? true : client.is_active,
                            contacts: contacts,
                            sites: sites,
                            client_document_types: selectedDocumentTypes,
                            site_document_types: [],
                            media_categories: mediaCategories
                        })

                        setHasLoadedData(true)
                    } else {
                        SweetAlertService.error('Load Failed', 'Failed to load client data. Please try again.')
                    }
                } catch (error) {
                    console.error('Error loading client:', error)
                    SweetAlertService.error('Load Failed', 'Failed to load client data. Please try again.')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        loadClientData()
    }, [isOpen, clientId, dispatch, hasLoadedData, selectedDocumentTypes])

    // Reset form when dialog closes
    const handleDialogClose = useCallback((open: boolean) => {
        if (!open && !isSubmitting) {
            resetForm()
        }
        onOpenChange?.(open)
    }, [onOpenChange, isSubmitting])

    // Reset form function
    const resetForm = useCallback(() => {
        setFormData({
            is_active: true,
            full_name: "",
            email: "",
            phone: "",
            password: "",
            client_code: "",
            company_name: "",
            tax_id: "",
            country: "",
            city: "",
            address: "",
            zip_code: "",
            currency_id: null,
            registration_date: "",
            business_type: "",
            industry: "",
            website: "",
            contact_person: "",
            contact_person_phone: "",
            license_number: "",
            notes: "",
            contacts: [],
            sites: [],
            client_document_types: [],
            site_document_types: [],
            media_categories: []
        })
        setProfileImage(null)
        setExistingProfileImage("")
        setDocuments([])
        setExistingDocuments([])
        setSelectedDocumentTypes([])
        setStep(1)
        setErrors({})
        setTouched(new Set())
        setShowAllErrors(false)
        setHasLoadedData(false)
        setExpandedSections({ contacts: false, sites: false })
    }, [])

    // Copy client code
    const copyClientCode = useCallback(() => {
        if (clientCodeRef.current) {
            clientCodeRef.current.select()
            navigator.clipboard.writeText(formData.client_code)
            SweetAlertService.success("Copied!", "Client code copied to clipboard.")
        }
    }, [formData.client_code])

    // Regenerate client code
    const regenerateClientCode = useCallback(async () => {
        const newCode = await generateUniqueClientCode()
        handleFieldChange("client_code", newCode)
        SweetAlertService.info("Code Regenerated", "New unique client code has been generated.")
    }, [generateUniqueClientCode, handleFieldChange])

    // Contact management
    const addContact = useCallback(() => {
        const newContact: ContactType = {
            name: "",
            phone: "",
            email: "",
            position: "",
            department: "",
            is_primary: formData.contacts.length === 0,
            notes: ""
        }
        handleFieldChange("contacts", [...formData.contacts, newContact])
        setExpandedSections(prev => ({ ...prev, contacts: true }))
    }, [formData.contacts, handleFieldChange])

    const removeContact = useCallback((index: number) => {
        const updatedContacts = formData.contacts.filter((_, i) => i !== index)
        if (formData.contacts[index].is_primary && updatedContacts.length > 0) {
            updatedContacts[0].is_primary = true
        }
        handleFieldChange("contacts", updatedContacts)
    }, [formData.contacts, handleFieldChange])

    const setPrimaryContact = useCallback((index: number) => {
        const updatedContacts = formData.contacts.map((contact, i) => ({
            ...contact,
            is_primary: i === index
        }))
        handleFieldChange("contacts", updatedContacts)
    }, [formData.contacts, handleFieldChange])

    // Site management
    const addSite = useCallback(() => {
        const newSite: SiteType = {
            site_name: "",
            site_instruction: "",
            address: "",
            guards_required: 1,
            latitude: 0,
            longitude: 0,
            status: "planned",
            locations: [],
            site_document_types: []
        }
        handleFieldChange("sites", [...formData.sites, newSite])
        setExpandedSections(prev => ({ ...prev, sites: true }))
    }, [formData.sites, handleFieldChange])

    const removeSite = useCallback((index: number) => {
        const updatedSites = formData.sites.filter((_, i) => i !== index)
        handleFieldChange("sites", updatedSites)
    }, [formData.sites, handleFieldChange])

    const updateSiteLocation = useCallback((siteIndex: number, useCurrent: boolean) => {
        if (useCurrent) {
            getCurrentLocation((lat, lng) => {
                handleFieldChange(`sites.${siteIndex}.latitude`, lat)
                handleFieldChange(`sites.${siteIndex}.longitude`, lng)
            })
        }
    }, [getCurrentLocation, handleFieldChange])

    // Location management within site
    const addLocationToSite = useCallback((siteIndex: number) => {
        const newLocation: LocationType = {
            title: "",
            description: "",
            latitude: 0,
            longitude: 0,
            is_active: true
        }
        const updatedSites = [...formData.sites]
        updatedSites[siteIndex].locations = [...updatedSites[siteIndex].locations, newLocation]
        handleFieldChange("sites", updatedSites)
    }, [formData.sites, handleFieldChange])

    const removeLocationFromSite = useCallback((siteIndex: number, locationIndex: number) => {
        const updatedSites = [...formData.sites]
        updatedSites[siteIndex].locations = updatedSites[siteIndex].locations.filter((_, i) => i !== locationIndex)
        handleFieldChange("sites", updatedSites)
    }, [formData.sites, handleFieldChange])

    const updateLocationCoordinates = useCallback((siteIndex: number, locationIndex: number, useCurrent: boolean) => {
        if (useCurrent) {
            getCurrentLocation((lat, lng) => {
                handleFieldChange(`sites.${siteIndex}.locations.${locationIndex}.latitude`, lat)
                handleFieldChange(`sites.${siteIndex}.locations.${locationIndex}.longitude`, lng)
            })
        }
    }, [getCurrentLocation, handleFieldChange])

    // File upload handlers
    const handleProfileImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                SweetAlertService.error("Invalid file type", "Please upload an image file")
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                SweetAlertService.error("File too large", "Please upload an image smaller than 5MB")
                return
            }
            setProfileImage(file)
            setExistingProfileImage("")
        }
    }, [])

    const handleDocumentUpload = useCallback((docTypeId: string, file: File) => {
        const validTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]

        if (!validTypes.includes(file.type)) {
            SweetAlertService.error('Invalid File Type', 'Please upload PDF, JPG, PNG, or DOC files only')
            return false
        }

        if (file.size > 10 * 1024 * 1024) {
            SweetAlertService.error('File Too Large', 'Please upload a file smaller than 10MB')
            return false
        }

        const documentWithType = new File([file], `${docTypeId}-${file.name}`, { type: file.type })
        setDocuments(prev => [...prev, documentWithType])
        return true
    }, [])

    const removeDocument = useCallback((index: number, isExisting: boolean = false, existingId?: number) => {
        if (isExisting && existingId) {
            setExistingDocuments(prev => prev.filter(doc => doc.id !== existingId))
        } else {
            setDocuments(prev => prev.filter((_, i) => i !== index))
        }
    }, [])

    const handleDocumentTypeChange = useCallback((docType: string) => {
        const newSelectedTypes = selectedDocumentTypes.includes(docType)
            ? selectedDocumentTypes.filter(type => type !== docType)
            : [...selectedDocumentTypes, docType]

        setSelectedDocumentTypes(newSelectedTypes)
        handleFieldChange("client_document_types", newSelectedTypes)
    }, [selectedDocumentTypes, handleFieldChange])

    const handleMediaCategoriesChange = useCallback((value: string) => {
        const categories = value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
        handleFieldChange("media_categories", categories)
    }, [handleFieldChange])

    // Validation
    const validateStep = useCallback(async (stepNumber: number, markAllTouched: boolean = true): Promise<boolean> => {
        const newErrors: ValidationErrors = {}

        if (stepNumber === 1) {
            if (!formData.full_name) newErrors.full_name = 'Full name is required'
            if (!formData.email) newErrors.email = 'Email is required'
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address'
            if (!formData.phone) newErrors.phone = 'Phone number is required'
        }

        setErrors(newErrors)

        if (markAllTouched) {
            const allFields = new Set<string>()
            if (stepNumber === 1) {
                allFields.add('full_name')
                allFields.add('email')
                allFields.add('phone')
            }
            setTouched(prev => {
                const newSet = new Set(prev)
                allFields.forEach(field => newSet.add(field))
                return newSet
            })
        }

        return Object.keys(newErrors).length === 0
    }, [formData])

    // Submit handler
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setShowAllErrors(true)

        const isStep1Valid = await validateStep(1, true)

        if (!isStep1Valid) {
            setStep(1)
            SweetAlertService.warning(
                'Required Fields Missing',
                'Please fill in all required fields (Full Name, Email, and Phone)'
            )
            return
        }

        setIsSubmitting(true)

        try {
            const submitFormData = new FormData()
            submitFormData.append('_method', 'PUT')

            // Required fields
            const requiredFields: Record<string, string> = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                client_code: formData.client_code,
                is_active: formData.is_active ? '1' : '0'
            }

            Object.entries(requiredFields).forEach(([key, value]) => {
                if (value) submitFormData.append(key, value)
            })

            // Optional fields
            const optionalFields: Record<string, any> = {
                company_name: formData.company_name,
                tax_id: formData.tax_id,
                country: formData.country,
                city: formData.city,
                address: formData.address,
                zip_code: formData.zip_code,
                currency_id: formData.currency_id,
                registration_date: formData.registration_date,
                business_type: formData.business_type,
                industry: formData.industry,
                website: formData.website,
                contact_person: formData.contact_person,
                contact_person_phone: formData.contact_person_phone,
                license_number: formData.license_number,
                notes: formData.notes
            }

            Object.entries(optionalFields).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    submitFormData.append(key, value.toString())
                }
            })

            // Password (only if provided)
            if (formData.password && formData.password.trim() !== '') {
                submitFormData.append('password', formData.password)
            }

            // Contacts
            if (formData.contacts.length > 0) {
                submitFormData.append('contacts', JSON.stringify(formData.contacts))
            }

            // Sites
            if (formData.sites.length > 0) {
                submitFormData.append('sites', JSON.stringify(formData.sites))
            }

            // Document types
            if (selectedDocumentTypes.length > 0) {
                submitFormData.append('client_document_types', JSON.stringify(selectedDocumentTypes))
            }

            // Media categories
            if (formData.media_categories.length > 0) {
                submitFormData.append('media_categories', JSON.stringify(formData.media_categories))
            }

            // Files
            if (profileImage) {
                submitFormData.append('profile_image', profileImage)
            } else if (existingProfileImage && !profileImage) {
                submitFormData.append('keep_profile_image', '1')
            }

            if (documents.length > 0) {
                documents.forEach((doc) => {
                    submitFormData.append('documents[]', doc)
                })
            }

            const result = await dispatch(updateClient({ id: clientId, data: submitFormData }))

            if (updateClient.fulfilled.match(result)) {
                await SweetAlertService.success(
                    'Client Updated Successfully',
                    `${formData.company_name || formData.full_name} has been updated successfully.`,
                    { timer: 2000, showConfirmButton: false }
                )

                resetForm()
                onSuccess?.()
                handleDialogClose(false)
            } else {
                const errorMessage = (result.payload as string) || 'Failed to update client'
                throw new Error(errorMessage)
            }
        } catch (error) {
            await SweetAlertService.error(
                'Update Failed',
                error instanceof Error ? error.message : 'There was an error updating the client. Please try again.'
            )
            console.error('Error updating client:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = useCallback(async () => {
        const isValid = await validateStep(step, true)
        if (isValid) {
            setStep(step + 1)
        } else {
            await SweetAlertService.warning(
                'Incomplete Information',
                'Please fill in all required fields correctly before proceeding.'
            )
        }
    }, [step, validateStep])

    const prevStep = useCallback(() => {
        setStep(step - 1)
    }, [step])

    const getCurrentDate = useCallback((): string => {
        return new Date().toISOString().split('T')[0]
    }, [])

    const shouldShowError = useCallback((fieldName: string): boolean => {
        return showAllErrors || touched.has(fieldName)
    }, [showAllErrors, touched])

    const toggleSection = useCallback((section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }, [])

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-[1200px] w-[95vw] max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                <DialogTitle>
                    <div className="flex items-center gap-2 text-lg font-semibold mb-6">
                        <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                        <span>Update Client</span>
                    </div>
                </DialogTitle>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Building size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Contact size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <MapPin size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <FileText size={20} />
                        </div>
                    </div>
                </div>

                <form onSubmit={onSubmit}>
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Building size={20} />
                                Basic Information
                            </h3>

                            {/* Client Code Section */}
                            <div className="mb-6 bg-blue-50 dark:bg-gray-800 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                                            Client ID
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Client code cannot be changed
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input
                                                ref={clientCodeRef}
                                                type="text"
                                                value={formData.client_code}
                                                readOnly
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-lg font-bold text-center"
                                            />
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={copyClientCode}
                                                className="h-9"
                                            >
                                                <Copy size={16} />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={regenerateClientCode}
                                                className="h-9"
                                            >
                                                Regenerate
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Contact Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <FloatingLabelInput
                                        label="Full Name *"
                                        value={formData.full_name}
                                        onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                        error={shouldShowError('full_name') ? errors.full_name : undefined}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Email *"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        error={shouldShowError('email') ? errors.email : undefined}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Phone *"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        error={shouldShowError('phone') ? errors.phone : undefined}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="New Password (leave empty to keep current)"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleFieldChange('password', e.target.value)}
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                            </div>

                            {/* Company Information */}
                            <div className="border-t dark:border-gray-700 pt-6 mt-2">
                                <h4 className="font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Briefcase size={18} />
                                    Company Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <FloatingLabelInput
                                            label="Company Name"
                                            value={formData.company_name}
                                            onChange={(e) => handleFieldChange('company_name', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Tax ID / TRN"
                                            value={formData.tax_id}
                                            onChange={(e) => handleFieldChange('tax_id', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="License Number"
                                            value={formData.license_number}
                                            onChange={(e) => handleFieldChange('license_number', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Registration Date"
                                            type="date"
                                            value={formData.registration_date}
                                            onChange={(e) => handleFieldChange('registration_date', e.target.value)}
                                            max={getCurrentDate()}
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelSelect
                                            label="Business Type"
                                            value={formData.business_type}
                                            onChange={(e) => handleFieldChange('business_type', e.target.value)}
                                        >
                                            <option value="">Select Business Type</option>
                                            {BUSINESS_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </FloatingLabelSelect>
                                    </div>

                                    <div>
                                        <FloatingLabelSelect
                                            label="Industry"
                                            value={formData.industry}
                                            onChange={(e) => handleFieldChange('industry', e.target.value)}
                                        >
                                            <option value="">Select Industry</option>
                                            {INDUSTRIES.map(industry => (
                                                <option key={industry} value={industry}>{industry}</option>
                                            ))}
                                        </FloatingLabelSelect>
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Website"
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => handleFieldChange('website', e.target.value)}
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Currency ID"
                                            type="number"
                                            value={formData.currency_id?.toString() || ''}
                                            onChange={(e) => handleFieldChange('currency_id', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="border-t dark:border-gray-700 pt-6 mt-2">
                                <h4 className="font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <MapPinned size={18} />
                                    Address Information
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                    <div className="lg:col-span-4">
                                        <FloatingLabelInput
                                            label="Address"
                                            value={formData.address}
                                            onChange={(e) => handleFieldChange('address', e.target.value)}
                                        />
                                    </div>

                                    <div className="lg:col-span-2">
                                        <FloatingLabelInput
                                            label="City"
                                            value={formData.city}
                                            onChange={(e) => handleFieldChange('city', e.target.value)}
                                        />
                                    </div>

                                    <div className="lg:col-span-2">
                                        <FloatingLabelSelect
                                            label="Country"
                                            value={formData.country}
                                            onChange={(e) => handleFieldChange('country', e.target.value)}
                                        >
                                            <option value="">Select Country</option>
                                            {COUNTRIES.map(country => (
                                                <option key={country.code} value={country.name}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </FloatingLabelSelect>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <FloatingLabelInput
                                            label="ZIP / Postal Code"
                                            value={formData.zip_code}
                                            onChange={(e) => handleFieldChange('zip_code', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Person & Notes */}
                            <div className="border-t dark:border-gray-700 pt-6 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FloatingLabelInput
                                            label="Primary Contact Person"
                                            value={formData.contact_person}
                                            onChange={(e) => handleFieldChange('contact_person', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Contact Person Phone"
                                            type="tel"
                                            value={formData.contact_person_phone}
                                            onChange={(e) => handleFieldChange('contact_person_phone', e.target.value)}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <FloatingLabelTextarea
                                            label="Notes"
                                            value={formData.notes}
                                            onChange={(e) => handleFieldChange('notes', e.target.value)}
                                            className="h-24"
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mt-2">* Required fields</p>
                        </div>
                    )}

                    {/* Step 2: Contacts */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Contact size={20} />
                                    Contact Persons
                                </h3>
                                <Button type="button" onClick={addContact} variant="outline" size="sm">
                                    <Plus size={16} className="mr-1" /> Add Contact
                                </Button>
                            </div>

                            {formData.contacts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                    <Contact size={48} className="mx-auto text-gray-400 mb-3" />
                                    <p>No contacts added yet.</p>
                                    <p className="text-sm mt-1">Click &quot;Add Contact&quot; to add contact persons.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleSection('contacts')}
                                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            {expandedSections.contacts ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            {expandedSections.contacts ? 'Hide Details' : 'Show Details'}
                                        </button>
                                    </div>

                                    {formData.contacts.map((contact, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                        <span className="text-blue-600 dark:text-blue-300 font-semibold">{index + 1}</span>
                                                    </div>
                                                    <h4 className="font-semibold">Contact {index + 1}</h4>
                                                    {contact.is_primary && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Primary</span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    {!contact.is_primary && formData.contacts.length > 1 && (
                                                        <Button type="button" onClick={() => setPrimaryContact(index)} variant="outline" size="sm">
                                                            Set as Primary
                                                        </Button>
                                                    )}
                                                    <Button type="button" onClick={() => removeContact(index)} variant="ghost" size="sm" className="text-red-500">
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            </div>

                                            {expandedSections.contacts && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div>
                                                        <FloatingLabelInput
                                                            label="Name"
                                                            value={contact.name}
                                                            onChange={(e) => handleFieldChange(`contacts.${index}.name`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FloatingLabelInput
                                                            label="Phone"
                                                            type="tel"
                                                            value={contact.phone}
                                                            onChange={(e) => handleFieldChange(`contacts.${index}.phone`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FloatingLabelInput
                                                            label="Email"
                                                            type="email"
                                                            value={contact.email}
                                                            onChange={(e) => handleFieldChange(`contacts.${index}.email`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FloatingLabelInput
                                                            label="Position"
                                                            value={contact.position}
                                                            onChange={(e) => handleFieldChange(`contacts.${index}.position`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FloatingLabelInput
                                                            label="Department"
                                                            value={contact.department}
                                                            onChange={(e) => handleFieldChange(`contacts.${index}.department`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FloatingLabelInput
                                                            label="Notes"
                                                            value={contact.notes}
                                                            onChange={(e) => handleFieldChange(`contacts.${index}.notes`, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {!expandedSections.contacts && (
                                                <div className="flex gap-4 text-sm text-gray-500">
                                                    {contact.name && <span><span className="font-medium">Name:</span> {contact.name}</span>}
                                                    {contact.phone && <span><span className="font-medium">Phone:</span> {contact.phone}</span>}
                                                    {contact.email && <span><span className="font-medium">Email:</span> {contact.email}</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Sites & Locations */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <MapPin size={20} />
                                    Sites & Locations
                                </h3>
                                <Button type="button" onClick={addSite} variant="outline" size="sm">
                                    <Plus size={16} className="mr-1" /> Add Site
                                </Button>
                            </div>

                            {formData.sites.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                    <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
                                    <p>No sites added yet.</p>
                                    <p className="text-sm mt-1">Click &quot;Add Site&quot; to add client sites.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {formData.sites.map((site, siteIndex) => (
                                        <div key={siteIndex} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                        <span className="text-purple-600 dark:text-purple-300 font-semibold">{siteIndex + 1}</span>
                                                    </div>
                                                    <h4 className="font-semibold">Site {siteIndex + 1}: {site.site_name || 'New Site'}</h4>
                                                </div>
                                                <Button type="button" onClick={() => removeSite(siteIndex)} variant="ghost" size="sm" className="text-red-500">
                                                    <X size={16} />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <FloatingLabelInput
                                                        label="Site Name"
                                                        value={site.site_name}
                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.site_name`, e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <FloatingLabelInput
                                                        label="Address"
                                                        value={site.address}
                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.address`, e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <FloatingLabelInput
                                                        label="Guards Required"
                                                        type="number"
                                                        min="1"
                                                        value={site.guards_required}
                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.guards_required`, parseInt(e.target.value) || 1)}
                                                    />
                                                </div>

                                                <div>
                                                    <FloatingLabelSelect
                                                        label="Status"
                                                        value={site.status}
                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.status`, e.target.value)}
                                                    >
                                                        <option value="planned">Planned</option>
                                                        <option value="running">Running</option>
                                                        <option value="paused">Paused</option>
                                                        <option value="completed">Completed</option>
                                                    </FloatingLabelSelect>
                                                </div>

                                                <div className="md:col-span-2 lg:col-span-3">
                                                    <FloatingLabelTextarea
                                                        label="Instructions"
                                                        value={site.site_instruction}
                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.site_instruction`, e.target.value)}
                                                        className="h-20"
                                                    />
                                                </div>
                                            </div>

                                            {/* Site Coordinates */}
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateSiteLocation(siteIndex, true)}
                                                        disabled={isGettingLocation}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Crosshair size={14} />
                                                        {isGettingLocation ? 'Getting location...' : 'Get Current Location'}
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <FloatingLabelInput
                                                            label="Latitude"
                                                            type="number"
                                                            step="any"
                                                            value={site.latitude || ''}
                                                            onChange={(e) => handleFieldChange(`sites.${siteIndex}.latitude`, parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FloatingLabelInput
                                                            label="Longitude"
                                                            type="number"
                                                            step="any"
                                                            value={site.longitude || ''}
                                                            onChange={(e) => handleFieldChange(`sites.${siteIndex}.longitude`, parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sub-Locations */}
                                            <div className="mt-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="font-medium text-sm">Sub-Locations</h5>
                                                    <Button type="button" onClick={() => addLocationToSite(siteIndex)} variant="outline" size="sm">
                                                        <Plus size={14} className="mr-1" /> Add Location
                                                    </Button>
                                                </div>

                                                {site.locations.length === 0 ? (
                                                    <p className="text-sm text-gray-500 italic">No sub-locations added.</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {site.locations.map((location, locationIndex) => (
                                                            <div key={locationIndex} className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="font-medium text-sm">Location {locationIndex + 1}</span>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => removeLocationFromSite(siteIndex, locationIndex)}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-red-500 h-6 w-6 p-0"
                                                                    >
                                                                        <X size={14} />
                                                                    </Button>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                                    <FloatingLabelInput
                                                                        label="Title"
                                                                        value={location.title}
                                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.locations.${locationIndex}.title`, e.target.value)}
                                                                    />
                                                                    <FloatingLabelInput
                                                                        label="Description"
                                                                        value={location.description}
                                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.locations.${locationIndex}.description`, e.target.value)}
                                                                    />
                                                                </div>

                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => updateLocationCoordinates(siteIndex, locationIndex, true)}
                                                                        disabled={isGettingLocation}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Crosshair size={12} />
                                                                        Use current location
                                                                    </Button>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <FloatingLabelInput
                                                                        label="Latitude"
                                                                        type="number"
                                                                        step="any"
                                                                        value={location.latitude || ''}
                                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.locations.${locationIndex}.latitude`, parseFloat(e.target.value) || 0)}
                                                                    />
                                                                    <FloatingLabelInput
                                                                        label="Longitude"
                                                                        type="number"
                                                                        step="any"
                                                                        value={location.longitude || ''}
                                                                        onChange={(e) => handleFieldChange(`sites.${siteIndex}.locations.${locationIndex}.longitude`, parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Documents & Final Details */}
                    {step === 4 && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText size={20} />
                                Documents & Final Details
                            </h3>

                            {/* Document Types with File Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-4">Required Documents</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {CLIENT_DOCUMENT_TYPES.map((docType) => {
                                        const isSelected = selectedDocumentTypes.includes(docType.id);
                                        const hasExistingDoc = existingDocuments.some(doc =>
                                            doc.name.includes(docType.id) || doc.name.includes(docType.name)
                                        );
                                        const newDocumentIndex = documents.findIndex(doc =>
                                            doc.name.includes(docType.id) || doc.name.includes(docType.name)
                                        );

                                        return (
                                            <div
                                                key={docType.id}
                                                className={`border rounded-xl p-4 transition-all ${isSelected
                                                    ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10'
                                                    : 'hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`doc-${docType.id}`}
                                                        checked={isSelected}
                                                        onChange={() => handleDocumentTypeChange(docType.id)}
                                                        className="rounded w-4 h-4 text-blue-600 mt-1 flex-shrink-0"
                                                    />
                                                    <label
                                                        htmlFor={`doc-${docType.id}`}
                                                        className="text-sm font-medium cursor-pointer flex-1 flex items-center gap-1"
                                                    >
                                                        {docType.name}
                                                        {docType.required && (
                                                            <span className="text-red-500 text-xs">*</span>
                                                        )}
                                                    </label>
                                                </div>

                                                {isSelected && (
                                                    <div className="mt-4 ml-7">
                                                        {hasExistingDoc && newDocumentIndex === -1 && (
                                                            <div className="mb-3">
                                                                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200">
                                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                        <FileText size={16} className="text-green-500 flex-shrink-0" />
                                                                        <span className="text-sm text-green-700 dark:text-green-300 truncate">
                                                                            Existing document uploaded
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {newDocumentIndex === -1 ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="file"
                                                                    id={`file-${docType.id}`}
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            handleDocumentUpload(docType.id, file);
                                                                            e.target.value = '';
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                />
                                                                <label
                                                                    htmlFor={`file-${docType.id}`}
                                                                    className="block w-full cursor-pointer"
                                                                >
                                                                    <div className="border-2 border-dashed rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center">
                                                                        <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                                        <span className="text-sm text-gray-600 block mb-1">
                                                                            {hasExistingDoc ? 'Replace existing document' : 'Upload document'}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">PDF, JPG, PNG, DOC (max 10MB)</span>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border">
                                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                    <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                                                    <span className="text-sm truncate max-w-[150px] sm:max-w-[180px]" title={documents[newDocumentIndex].name}>
                                                                        {documents[newDocumentIndex].name}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeDocument(newDocumentIndex, false)}
                                                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-all flex-shrink-0"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Media Categories */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Media Categories</label>
                                <Textarea
                                    placeholder="Enter categories separated by commas (e.g., logo, photos, brochures)"
                                    className="w-full h-24 resize-none dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.media_categories.join(', ')}
                                    onChange={(e) => handleMediaCategoriesChange(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate multiple categories with commas</p>
                            </div>

                            {/* Company Logo */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Company Logo</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <div className="relative w-32 h-32 mx-auto">
                                            <input
                                                type="file"
                                                id="profileImage"
                                                onChange={handleProfileImageUpload}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                            <label htmlFor="profileImage" className="cursor-pointer">
                                                <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all dark:bg-gray-800 dark:border-gray-600 overflow-hidden">
                                                    {(profileImage || existingProfileImage) ? (
                                                        <>
                                                            <Image
                                                                src={profileImage ? URL.createObjectURL(profileImage) : existingProfileImage}
                                                                alt="Profile preview"
                                                                width={128}
                                                                height={128}
                                                                className="rounded-full object-cover w-full h-full"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                <Plus className="w-8 h-8 text-white" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-2">
                                                                Upload Logo
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                        {(profileImage || existingProfileImage) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProfileImage(null);
                                                    setExistingProfileImage("");
                                                }}
                                                className="mt-3 text-red-500 hover:text-red-700 text-sm flex items-center gap-1 justify-center w-full px-3 py-1 rounded-full hover:bg-red-50 transition-all"
                                            >
                                                <X size={14} /> Remove Logo
                                            </button>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 h-full flex items-center">
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm">Logo Guidelines:</h4>
                                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                    <li>Accepted formats: JPG, PNG, GIF</li>
                                                    <li>Maximum file size: 5MB</li>
                                                    <li>Recommended size: 500x500px</li>
                                                    <li>Square image works best</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Status */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">{/* Empty for spacing */}</div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium mb-2">Client Status</label>
                                    <div className="border rounded-xl p-6 h-32 flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                                                className="rounded w-5 h-5 text-blue-600"
                                            />
                                            <span className="text-base text-gray-700 dark:text-gray-300">
                                                Active Client
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Documents Summary */}
                            {(documents.length > 0 || existingDocuments.length > 0) && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <FileText size={18} className="text-blue-500" />
                                            Documents ({existingDocuments.length + documents.length})
                                        </h4>
                                        {documents.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDocuments([])}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Clear New
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {existingDocuments.map((doc) => (
                                            <div
                                                key={`existing-${doc.id}`}
                                                className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center justify-between border border-green-200"
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <FileText size={16} className="text-green-500 flex-shrink-0" />
                                                    <span className="text-sm truncate text-green-700 dark:text-green-300" title={doc.name}>
                                                        {doc.name.length > 30 ? doc.name.substring(0, 30) + '...' : doc.name}
                                                    </span>
                                                    <span className="text-xs text-green-600 dark:text-green-400 ml-1">(existing)</span>
                                                </div>
                                            </div>
                                        ))}
                                        {documents.map((doc, index) => (
                                            <div
                                                key={`new-${index}`}
                                                className="bg-white dark:bg-gray-900 rounded-lg p-3 flex items-center justify-between group hover:shadow-md transition-all border"
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                                    <span className="text-sm truncate" title={doc.name}>
                                                        {doc.name.length > 30 ? doc.name.substring(0, 30) + '...' : doc.name}
                                                    </span>
                                                    <span className="text-xs text-blue-500 ml-1">(new)</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index, false)}
                                                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700 mt-6">
                        {step > 1 ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                            >
                                ← Back
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDialogClose(false)}
                            >
                                Cancel
                            </Button>
                        )}

                        {step < 4 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                            >
                                Continue →
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleDialogClose(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Client'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
