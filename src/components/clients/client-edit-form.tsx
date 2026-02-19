'use client'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect, useRef } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelSelect } from "../ui/floating-select"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import {
    Plus,
    UploadCloud,
    X,
    Building,
    Contact,
    FileText,
    Copy,
    MapPin,
    RefreshCw
} from "lucide-react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateClient, fetchClient } from "@/store/slices/clientSlice"
import SweetAlertService from "@/lib/sweetAlert"
import {
    clientBasicSchema,
    ClientFormData,
    ClientUpdateFormData,
    clientUpdateSchema,
} from "@/lib/validation/client.schema"
import {
    COUNTRIES,
    BUSINESS_TYPES,
    INDUSTRIES,
    CLIENT_DOCUMENT_TYPES,
} from "@/lib/validation/client.types"
import { Textarea } from "../ui/textarea"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Client, ClientContact } from "@/app/types/client"
import { Site, SiteLocation } from "@/app/types/site"

interface ClientUpdateFormProps {
    trigger: ReactNode
    clientId: number
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
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
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null)
    const [documents, setDocuments] = useState<File[]>([])
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([])
    const [step, setStep] = useState(1)
    const clientCodeRef = useRef<HTMLInputElement>(null)

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        trigger: triggerValidation,
        clearErrors,
    } = useForm<ClientUpdateFormData>({
        resolver: zodResolver(clientUpdateSchema),
        defaultValues: {
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
            currency_id: undefined,
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
        },
        mode: "onChange",
    })

    // UseFieldArray for contacts and sites
    const {
        fields: contactFields,
        append: appendContact,
        remove: removeContact
    } = useFieldArray({
        control,
        name: "contacts"
    })

    const {
        fields: siteFields,
        append: appendSite,
        remove: removeSite
    } = useFieldArray({
        control,
        name: "sites"
    })

    // Generate unique client code for regeneration
    const generateUniqueClientCode = async (): Promise<string> => {
        try {
            const currentYear = new Date().getFullYear()
            
            // Get current timestamp in milliseconds
            const timestamp = new Date().getTime()
            
            // Take last 4 digits of timestamp
            const timePart = timestamp.toString().slice(-4)
            
            // Add random number between 100-999
            const randomPart = Math.floor(Math.random() * 900) + 100
            
            // Combine for guaranteed uniqueness
            return `CL-${currentYear}-${randomPart}${timePart}`
        } catch (error) {
            console.error("Error generating client code:", error)
            const currentYear = new Date().getFullYear()
            const randomNum = Math.floor(Math.random() * 9000) + 1000
            return `CL-${currentYear}-${randomNum}`
        }
    }

    // Fetch client data when dialog opens
    useEffect(() => {
        const loadClientData = async () => {
            if (isOpen && clientId) {
                setIsLoading(true)
                try {
                    const result = await dispatch(fetchClient({ 
                        id: clientId, 
                    }))
                    
                    if (fetchClient.fulfilled.match(result)) {
                        const client = result.payload
                        
                        // Map contacts with proper null checks
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
                        
                        // Map sites with proper null checks
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

                        // Reset form with client data
                        reset({
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
                            currency_id: client.currency_id,
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
                            client_document_types: [],
                            site_document_types: [],
                            media_categories: []
                        })

                        // Set existing profile image if available
                        if (client.profile_image) {
                            setExistingProfileImage(client.profile_image)
                        }
                    }
                } catch (error) {
                    console.error('Error loading client:', error)
                    SweetAlertService.error(
                        'Load Failed',
                        'Failed to load client data. Please try again.'
                    )
                } finally {
                    setIsLoading(false)
                }
            }
        }

        if (isOpen && clientId) {
            loadClientData()
        }
    }, [isOpen, clientId, dispatch, reset])

    // Copy client code to clipboard
    const copyClientCode = () => {
        if (clientCodeRef.current) {
            clientCodeRef.current.select()
            navigator.clipboard.writeText(clientCodeRef.current.value)
            SweetAlertService.success("Copied!", "Client code copied to clipboard.")
        }
    }

    // Regenerate client code
    const regenerateClientCode = async () => {
        const newCode = await generateUniqueClientCode()
        setValue("client_code", newCode)
        SweetAlertService.info("Code Regenerated", "New unique client code has been generated.")
    }

    const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setExistingProfileImage(null)
        }
    }

    const removeProfileImage = () => {
        setProfileImage(null)
        setExistingProfileImage(null)
    }

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const validFiles = files.filter(file => {
            const validTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
            return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
        })

        if (validFiles.length !== files.length) {
            SweetAlertService.warning("Some files were skipped", "Only PDF, JPG, PNG, and DOC files up to 10MB are allowed")
        }

        setDocuments(prev => [...prev, ...validFiles])
    }

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index))
    }

    const handleDocumentTypeChange = (docType: string) => {
        const newSelectedTypes = selectedDocumentTypes.includes(docType)
            ? selectedDocumentTypes.filter(type => type !== docType)
            : [...selectedDocumentTypes, docType]

        setSelectedDocumentTypes(newSelectedTypes)
        setValue("client_document_types", newSelectedTypes)
    }

    const addContact = () => {
        appendContact({
            name: "",
            phone: "",
            email: "",
            position: "",
            department: "",
            is_primary: contactFields.length === 0,
            notes: ""
        })
    }

    const addSite = () => {
        appendSite({
            site_name: "",
            site_instruction: "",
            address: "",
            guards_required: 1,
            latitude: 0,
            longitude: 0,
            status: "planned",
            locations: [],
            site_document_types: []
        })
    }

    const addLocationToSite = (siteIndex: number) => {
        const currentLocations = watch(`sites.${siteIndex}.locations`) || []
        setValue(`sites.${siteIndex}.locations`, [
            ...currentLocations,
            {
                title: "",
                description: "",
                latitude: 0,
                longitude: 0,
                is_active: true
            }
        ])
    }

    const removeLocationFromSite = (siteIndex: number, locationIndex: number) => {
        const currentLocations = watch(`sites.${siteIndex}.locations`) || []
        setValue(`sites.${siteIndex}.locations`,
            currentLocations.filter((_, i) => i !== locationIndex)
        )
    }

    const setPrimaryContact = (index: number) => {
        contactFields.forEach((_, i) => {
            setValue(`contacts.${i}.is_primary`, i === index)
        })
    }

    const onSubmit = async (data: ClientUpdateFormData) => {
    //console.log("Submitting update for client ID:", clientId)
    setIsSubmitting(true)

    try {
        const formData = new FormData()
        
        // Important: Laravel requires this for PUT requests with FormData
        formData.append('_method', 'PUT')

        // Log the data being sent
        //console.log('Form data to submit:', data)

        // Append all form fields
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'contacts' || key === 'sites') {
                    // Stringify arrays
                    const stringValue = JSON.stringify(value || [])
                    formData.append(key, stringValue)
                    //console.log(`Appending ${key}:`, stringValue)
                } else if (key === 'client_document_types' || key === 'media_categories') {
                    const stringValue = JSON.stringify(value || [])
                    formData.append(key, stringValue)
                    //console.log(`Appending ${key}:`, stringValue)
                } else if (key === 'password' && !value) {
                    // Skip empty password
                    //console.log('Skipping empty password')
                    return
                } else if (typeof value === 'boolean') {
                    formData.append(key, value ? '1' : '0')
                    //console.log(`Appending ${key}:`, value ? '1' : '0')
                } else if (typeof value === 'number') {
                    formData.append(key, value.toString())
                    //console.log(`Appending ${key}:`, value.toString())
                } else {
                    formData.append(key, value?.toString() || '')
                    //console.log(`Appending ${key}:`, value?.toString() || '')
                }
            }
        })

        // Append files
        if (profileImage) {
            formData.append('profile_image', profileImage)
            //console.log('Appending profile_image:', profileImage.name)
        }

        documents.forEach((doc, index) => {
            formData.append(`documents[${index}]`, doc)
            //console.log(`Appending documents[${index}]:`, doc.name)
        })

        // Log all FormData entries
        //console.log('Final FormData entries:')
        

        // Make sure clientId is valid
        if (!clientId) {
            throw new Error('Client ID is missing')
        }

        const result = await dispatch(updateClient({ id: clientId, data: formData }))
        //console.log('Update result:', result)

        if (updateClient.fulfilled.match(result)) {
            SweetAlertService.success(
                'Success!',
                `${data.company_name || data.full_name} has been updated successfully.`,
                { timer: 2000 }
            )

            // Reset form and close dialog
            reset()
            setProfileImage(null)
            setExistingProfileImage(null)
            setDocuments([])
            setSelectedDocumentTypes([])
            setStep(1)
            clearErrors()

            if (onSuccess) onSuccess()
            if (onOpenChange) onOpenChange(false)
        } else {
            const errorMessage = result.payload as string || 'Failed to update client'
            console.error('Update failed:', errorMessage)
            SweetAlertService.error('Update Failed', errorMessage)
        }
    } catch (error) {
        console.error('Update error:', error)
        SweetAlertService.error(
            'Update Failed',
            error instanceof Error ? error.message : 'There was an error updating the client.'
        )
    } finally {
        setIsSubmitting(false)
    }
}



        const validateStep = async (currentStep: number): Promise<boolean> => {
    if (currentStep === 1) {
        const requiredFields: (keyof ClientUpdateFormData)[] = [
            'full_name',
            'email',
            'phone'
        ]

        const result = await triggerValidation(requiredFields)
        return result
    }
    return true
}


    const nextStep = async () => {
        const isValid = await validateStep(step)
        if (isValid) {
            setStep(step + 1)
        } else {
            SweetAlertService.warning(
                'Required Fields Missing',
                'Please fill in all required fields (Full Name, Email, and Phone)'
            )
        }
    }

    const prevStep = () => setStep(step - 1)

    const handleCancel = () => {
        reset()
        setProfileImage(null)
        setExistingProfileImage(null)
        setDocuments([])
        setSelectedDocumentTypes([])
        setStep(1)
        clearErrors()
        if (onOpenChange) onOpenChange(false)
    }

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-[1200px] w-[95vw] max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <RefreshCw className="w-12 h-12 animate-spin text-blue-600" />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[1200px] w-[95vw] max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
                <DialogTitle>
                    <div className="flex items-center gap-2 text-lg font-semibold mb-6">
                        <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                        <span>Update Client</span>
                    </div>
                </DialogTitle>

                {/* Progress Steps */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <Building size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <Contact size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <MapPin size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <FileText size={20} />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Basic Information</h3>

                            {/* Client Code Display */}
                            <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Client Code</p>
                                        <p className="text-xl font-mono font-bold">{watch('client_code')}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" variant="outline" onClick={copyClientCode}>
                                            <Copy size={16} />
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={regenerateClientCode}>
                                            Regenerate
                                        </Button>
                                    </div>
                                </div>
                                <input type="hidden" {...register("client_code")} />
                            </div>

                            {/* All Basic Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Required Fields */}
                                <Controller
                                    name="full_name"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Full Name *"
                                            {...field}
                                            value={field.value || ''}
                                            error={errors.full_name?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Email *"
                                            type="email"
                                            {...field}
                                            value={field.value || ''}
                                            error={errors.email?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Phone *"
                                            type="tel"
                                            {...field}
                                            value={field.value || ''}
                                            error={errors.phone?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="New Password (optional)"
                                            type="password"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                {/* Company Information */}
                                <Controller
                                    name="company_name"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Company Name"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                <Controller
                                    name="tax_id"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Tax ID / TRN"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                <Controller
                                    name="license_number"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="License Number"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                {/* Location Fields */}
                                <Controller
                                    name="country"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelSelect
                                            label="Country"
                                            {...field}
                                            value={field.value || ''}
                                        >
                                            <option value="">Select Country</option>
                                            {COUNTRIES.map(c => (
                                                <option key={c.code} value={c.name}>{c.name}</option>
                                            ))}
                                        </FloatingLabelSelect>
                                    )}
                                />

                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="City"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Address"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                <Controller
                                    name="zip_code"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Zip/Postal Code"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                {/* Business Details */}
                                <Controller
                                    name="business_type"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelSelect
                                            label="Business Type"
                                            {...field}
                                            value={field.value || ''}
                                        >
                                            <option value="">Select Business Type</option>
                                            {BUSINESS_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </FloatingLabelSelect>
                                    )}
                                />

                                <Controller
                                    name="industry"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelSelect
                                            label="Industry"
                                            {...field}
                                            value={field.value || ''}
                                        >
                                            <option value="">Select Industry</option>
                                            {INDUSTRIES.map(industry => (
                                                <option key={industry} value={industry}>{industry}</option>
                                            ))}
                                        </FloatingLabelSelect>
                                    )}
                                />

                                <Controller
                                    name="registration_date"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Registration Date"
                                            type="date"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                <Controller
                                    name="website"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Website"
                                            type="url"
                                            {...field}
                                            value={field.value || ''}
                                            placeholder="https://example.com"
                                        />
                                    )}
                                />

                                <Controller
                                    name="currency_id"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Currency ID"
                                            type="number"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                    )}
                                />

                                {/* Contact Person Fields */}
                                <Controller
                                    name="contact_person"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Contact Person"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                <Controller
                                    name="contact_person_phone"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Contact Person Phone"
                                            type="tel"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    )}
                                />

                                {/* Notes - Full width on larger screens */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <Controller
                                        name="notes"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelTextarea
                                                label="Notes"
                                                {...field}
                                                value={field.value || ''}
                                                className="h-24"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mt-2">* Required fields</p>
                        </div>
                    )}

                    {/* Step 2: Contacts (All Optional) */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Contact Persons (Optional)</h3>
                                <Button type="button" onClick={addContact} variant="outline" size="sm">
                                    <Plus size={16} className="mr-1" /> Add Contact
                                </Button>
                            </div>

                            {contactFields.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No contacts added. Click Add Contact to add one.
                                </div>
                            ) : (
                                contactFields.map((contact, index) => (
                                    <div key={contact.id} className="border rounded-lg p-4 mb-4">
                                        <div className="flex justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Contact size={18} />
                                                <h4 className="font-semibold">Contact {index + 1}</h4>
                                                {watch(`contacts.${index}.is_primary`) && (
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Primary</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {!watch(`contacts.${index}.is_primary`) && contactFields.length > 0 && (
                                                    <Button type="button" onClick={() => setPrimaryContact(index)} variant="outline" size="sm">
                                                        Set as Primary
                                                    </Button>
                                                )}
                                                <Button type="button" onClick={() => removeContact(index)} variant="ghost" size="sm" className="text-red-500">
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Controller name={`contacts.${index}.name`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Name" {...field} value={field.value || ''} />
                                            )} />
                                            <Controller name={`contacts.${index}.phone`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Phone" type="tel" {...field} value={field.value || ''} />
                                            )} />
                                            <Controller name={`contacts.${index}.email`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Email" type="email" {...field} value={field.value || ''} />
                                            )} />
                                            <Controller name={`contacts.${index}.position`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Position" {...field} value={field.value || ''} />
                                            )} />
                                            <Controller name={`contacts.${index}.department`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Department" {...field} value={field.value || ''} />
                                            )} />
                                            <Controller name={`contacts.${index}.notes`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Notes" {...field} value={field.value || ''} />
                                            )} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Step 3: Sites (All Optional) */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Sites (Optional)</h3>
                                <Button type="button" onClick={addSite} variant="outline" size="sm">
                                    <Plus size={16} className="mr-1" /> Add Site
                                </Button>
                            </div>

                            {siteFields.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No sites added. Click Add Site to add one.
                                </div>
                            ) : (
                                siteFields.map((site, siteIndex) => (
                                    <div key={site.id} className="border rounded-lg p-4 mb-6">
                                        <div className="flex justify-between mb-4">
                                            <h4 className="font-semibold">Site {siteIndex + 1}</h4>
                                            <Button type="button" onClick={() => removeSite(siteIndex)} variant="ghost" size="sm" className="text-red-500">
                                                <X size={16} />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <Controller name={`sites.${siteIndex}.site_name`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Site Name" {...field} value={field.value || ''} />
                                            )} />
                                            <Controller name={`sites.${siteIndex}.address`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Address" {...field} value={field.value || ''} />
                                            )} />
                                            <Controller name={`sites.${siteIndex}.guards_required`} control={control} render={({ field }) => (
                                                <FloatingLabelInput label="Guards Required" type="number" {...field} value={field.value || 1} />
                                            )} />
                                            <Controller name={`sites.${siteIndex}.status`} control={control} render={({ field }) => (
                                                <FloatingLabelSelect label="Status" {...field} value={field.value || 'planned'}>
                                                    <option value="planned">Planned</option>
                                                    <option value="running">Running</option>
                                                    <option value="paused">Paused</option>
                                                    <option value="completed">Completed</option>
                                                </FloatingLabelSelect>
                                            )} />
                                            <Controller name={`sites.${siteIndex}.site_instruction`} control={control} render={({ field }) => (
                                                <FloatingLabelTextarea label="Instructions" {...field} value={field.value || ''} className="md:col-span-3" />
                                            )} />
                                        </div>

                                        {/* Locations */}
                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="font-medium">Locations</h5>
                                                <Button type="button" onClick={() => addLocationToSite(siteIndex)} variant="outline" size="sm">
                                                    <Plus size={14} className="mr-1" /> Add Location
                                                </Button>
                                            </div>

                                            {watch(`sites.${siteIndex}.locations`)?.map((location, locationIndex: number) => (
                                                <div key={locationIndex} className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-2">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-medium">Location {locationIndex + 1}</span>
                                                        <Button type="button" onClick={() => removeLocationFromSite(siteIndex, locationIndex)} variant="ghost" size="sm" className="text-red-500 h-6 w-6 p-0">
                                                            <X size={14} />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                        <Controller name={`sites.${siteIndex}.locations.${locationIndex}.title`} control={control} render={({ field }) => (
                                                            <input type="text" placeholder="Title" className="px-2 py-1 border rounded text-sm" {...field} value={field.value || ''} />
                                                        )} />
                                                        <Controller name={`sites.${siteIndex}.locations.${locationIndex}.description`} control={control} render={({ field }) => (
                                                            <input type="text" placeholder="Description" className="px-2 py-1 border rounded text-sm" {...field} value={field.value || ''} />
                                                        )} />
                                                        <Controller name={`sites.${siteIndex}.locations.${locationIndex}.latitude`} control={control} render={({ field }) => (
                                                            <input type="number" step="any" placeholder="Lat" className="px-2 py-1 border rounded text-sm" {...field} value={field.value || 0} />
                                                        )} />
                                                        <Controller name={`sites.${siteIndex}.locations.${locationIndex}.longitude`} control={control} render={({ field }) => (
                                                            <input type="number" step="any" placeholder="Lng" className="px-2 py-1 border rounded text-sm" {...field} value={field.value || 0} />
                                                        )} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Step 4: Documents & Final */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Documents & Final Details (Optional)</h3>

                            {/* Document Types */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Document Types</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {CLIENT_DOCUMENT_TYPES.map((docType) => (
                                        <label key={docType.id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocumentTypes.includes(docType.id)}
                                                onChange={() => handleDocumentTypeChange(docType.id)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{docType.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Media Categories */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Media Categories</label>
                                <Controller
                                    name="media_categories"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            placeholder="Enter categories separated by commas (e.g., logo, photos)"
                                            className="w-full h-20"
                                            value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    .split(',')
                                                    .map(item => item.trim())
                                                    .filter(item => item.length > 0)
                                                field.onChange(value)
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            {/* File Uploads */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Profile Image */}
                                <div className="border-2 border-dashed rounded-xl p-6">
                                    <div className="flex flex-col items-center">
                                        <input type="file" id="profileImage" onChange={handleProfileImageUpload} className="hidden" accept="image/*" />
                                        <label htmlFor="profileImage" className="cursor-pointer">
                                            <div className="relative w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center">
                                                {profileImage ? (
                                                    <>
                                                        <Image src={URL.createObjectURL(profileImage)} alt="Preview" width={128} height={128} className="rounded-full object-cover" />
                                                        <button type="button" onClick={(e) => { e.preventDefault(); removeProfileImage(); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : existingProfileImage ? (
                                                    <>
                                                        <Image src={existingProfileImage} alt="Current" width={128} height={128} className="rounded-full object-cover" />
                                                        <button type="button" onClick={(e) => { e.preventDefault(); removeProfileImage(); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-600">Company Logo</p>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {existingProfileImage ? 'Current logo. Click to replace.' : 'Upload company logo'}
                                        </p>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="border-2 border-dashed rounded-xl p-6">
                                    <div className="flex flex-col items-center">
                                        <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="font-medium mb-3">Upload Documents</p>
                                        <input type="file" id="documents" multiple onChange={handleDocumentUpload} className="hidden" />
                                        <label htmlFor="documents" className="cursor-pointer">
                                            <Button type="button" variant="outline">Select Files</Button>
                                        </label>

                                        {documents.length > 0 && (
                                            <div className="mt-4 w-full">
                                                <p className="text-sm font-medium mb-2">New files to upload:</p>
                                                {documents.map((doc, index) => (
                                                    <div key={index} className="flex justify-between bg-gray-50 p-2 rounded mb-2">
                                                        <span className="text-sm truncate">{doc.name}</span>
                                                        <button type="button" onClick={() => removeDocument(index)} className="text-red-500">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="is_active"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className="rounded"
                                        />
                                    )}
                                />
                                <label>Active Client</label>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-6 border-t mt-6">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={prevStep}>← Back</Button>
                        ) : (
                            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                        )}

                        {step < 4 ? (
                            <Button type="button" onClick={nextStep}>Next Step →</Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600">
                                    {isSubmitting ? 'Updating...' : 'Update Client'}
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}