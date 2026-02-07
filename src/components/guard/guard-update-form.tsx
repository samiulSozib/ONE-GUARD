'use client'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect, useRef } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelSelect } from "../ui/floating-select"
import { Textarea } from "../ui/textarea"
import { Plus, UploadCloud, X, User, Briefcase, FileText, Copy, Edit } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { updateGuard, fetchGuards, fetchGuard } from "@/store/slices/guardSlice"
import SweetAlertService from "@/lib/sweetAlert"
import { guardBasicSchema, GuardFormData } from "@/lib/validation/guard.schema"
import {
    COUNTRIES,
    BLOOD_GROUPS,
    MARITAL_STATUS,
    DOCUMENT_TYPES
} from "@/lib/validation/guard.types"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Guard, GuardProfileData } from "@/app/types/guard"

interface GuardUpdateFormProps {
    trigger: ReactNode
    guardId: number
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
    guardTypes?: Array<{ id: number; name: string }>
}


export function GuardUpdateForm({
    trigger,
    guardId,
    isOpen,
    onOpenChange,
    onSuccess,
    guardTypes = []
}: GuardUpdateFormProps) {
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [existingProfileImage, setExistingProfileImage] = useState<string>("")
    const [documents, setDocuments] = useState<File[]>([])
    const [existingDocuments, setExistingDocuments] = useState<Array<{ id: number; name: string; url: string; type: string }>>([])
    const [documentsToRemove, setDocumentsToRemove] = useState<number[]>([])
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([])
    const [languages, setLanguages] = useState<string[]>([])
    const [currentLanguage, setCurrentLanguage] = useState("")
    const [visaCountries, setVisaCountries] = useState<string[]>([])
    const [currentVisaCountry, setCurrentVisaCountry] = useState("")
    const [step, setStep] = useState(1)
    const guardCodeRef = useRef<HTMLInputElement>(null)

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        trigger: triggerValidation,
        clearErrors,
        watch,
    } = useForm<GuardFormData>({
        resolver: zodResolver(guardBasicSchema),
        defaultValues: {
            is_active: true,
            gender: "male",
            guard_code: "",
            full_name: "",
            phone: "",
            email: "",
            employee_company_card_number: "",
            driver_license: "",
            date_of_birth: "",
            country: "",
            city: "",
            address: "",
            zip_code: "",
            joining_date: "",
            license_expiry_date: "",
            issuing_source: "",
            password: "",
            guard_type_id: undefined,
            contract_id: undefined,
            document_types: [],
            profile_data: {
                marital_status: "single",
                has_work_permit: false,
                has_security_training: false,
                languages: [],
                place_of_birth: "",
                country_of_origin: "",
                current_country: "",
                current_city: "",
                current_address: "",
                citizenship: "",
                visa_countries: [],
                visa_expiry_date: "",
                father_name: "",
                mother_name: "",
                national_id_number: "",
                height: "",
                weight: "",
                blood_group: "",
                experience_years: 0,
                skills: "",
                highest_education_level: "",
                education_field: "",
                institution_name: "",
                graduation_year: undefined,
                emergency_contact_name: "",
                emergency_contact_phone: "",
                emergency_contact_relation: "",
                notes: "",
            },
        },
        mode: "onChange",
    })

    // Load guard data when dialog opens
    useEffect(() => {
        const loadGuardData = async () => {
            if (isOpen && guardId) {
                setIsLoading(true)
                try {
                    const result = await dispatch(fetchGuard({id:guardId}))
                    if (fetchGuard.fulfilled.match(result)) {
                        const guardData = result.payload as Guard
                        
                        // Populate form with guard data
                        setValue("guard_code", guardData.guard_code)
                        setValue("full_name", guardData.full_name)
                        setValue("phone", guardData.phone)
                        setValue("email", guardData.email || "")
                        setValue("employee_company_card_number", guardData.employee_company_card_number||'')
                        setValue("driver_license", guardData.driver_license || "")
                        setValue("date_of_birth", guardData.date_of_birth || "")
                        setValue("gender", guardData.gender)
                        setValue("country", guardData.country||'')
                        setValue("city", guardData.city||"")
                        setValue("address", guardData.address || "")
                        setValue("zip_code", guardData.zip_code || "")
                        setValue("joining_date", guardData.joining_date)
                        setValue("license_expiry_date", guardData.license_expiry_date || "")
                        setValue("issuing_source", guardData.issuing_source || "")
                        setValue("guard_type_id", guardData.guard_type_id || undefined)
                        setValue("contract_id", guardData.contract_id || undefined)
                        setValue("is_active", guardData.is_active)

                        // Set profile image if exists
                        if (guardData.profile_image) {
                            setExistingProfileImage(guardData.profile_image)
                        }

                        // Set existing documents
                        if (guardData.profile_data?.documents) {
                            setExistingDocuments(guardData.profile_data.documents)
                        }

                        // Set document types
                        if (guardData.document_types) {
                            setSelectedDocumentTypes(guardData.document_types)
                            setValue("document_types", guardData.document_types)
                        }

                        // Populate profile data
                        if (guardData.profile_data) {
                            const profile = guardData.profile_data
                            
                            setValue("profile_data.marital_status", profile.marital_status || "single")
                            setValue("profile_data.has_work_permit", profile.has_work_permit || false)
                            setValue("profile_data.has_security_training", profile.has_security_training || false)
                            
                            // Set languages
                            if (profile.languages) {
                                setLanguages(profile.languages)
                                setValue("profile_data.languages", profile.languages)
                            }
                            
                            setValue("profile_data.place_of_birth", profile.place_of_birth || "")
                            setValue("profile_data.country_of_origin", profile.country_of_origin || "")
                            setValue("profile_data.current_country", profile.current_country || "")
                            setValue("profile_data.current_city", profile.current_city || "")
                            setValue("profile_data.current_address", profile.current_address || "")
                            setValue("profile_data.citizenship", profile.citizenship || "")
                            
                            // Set visa countries
                            if (profile.visa_countries) {
                                setVisaCountries(profile.visa_countries)
                                setValue("profile_data.visa_countries", profile.visa_countries)
                            }
                            
                            setValue("profile_data.visa_expiry_date", profile.visa_expiry_date || "")
                            setValue("profile_data.father_name", profile.father_name || "")
                            setValue("profile_data.mother_name", profile.mother_name || "")
                            setValue("profile_data.national_id_number", profile.national_id_number || "")
                            setValue("profile_data.height", profile.height || "")
                            setValue("profile_data.weight", profile.weight || "")
                            setValue("profile_data.blood_group", profile.blood_group || "")
                            setValue("profile_data.experience_years", profile.experience_years || 0)
                            setValue("profile_data.skills", profile.skills || "")
                            setValue("profile_data.highest_education_level", profile.highest_education_level || "")
                            setValue("profile_data.education_field", profile.education_field || "")
                            setValue("profile_data.institution_name", profile.institution_name || "")
                            setValue("profile_data.graduation_year", profile.graduation_year || undefined)
                            setValue("profile_data.emergency_contact_name", profile.emergency_contact_name || "")
                            setValue("profile_data.emergency_contact_phone", profile.emergency_contact_phone || "")
                            setValue("profile_data.emergency_contact_relation", profile.emergency_contact_relation || "")
                            setValue("profile_data.notes", profile.notes || "")
                        }
                    } else {
                        SweetAlertService.error("Error", "Failed to load guard data")
                    }
                } catch (error) {
                    console.error("Error loading guard data:", error)
                    SweetAlertService.error("Error", "Failed to load guard data")
                } finally {
                    setIsLoading(false)
                }
            }
        }

        loadGuardData()
    }, [isOpen, guardId, dispatch, setValue])

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
            // Clear existing profile image when new one is uploaded
            setExistingProfileImage("")
        }
    }

    const removeProfileImage = () => {
        setProfileImage(null)
        setExistingProfileImage("")
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

    const removeExistingDocument = (id: number) => {
        setDocumentsToRemove(prev => [...prev, id])
        setExistingDocuments(prev => prev.filter(doc => doc.id !== id))
    }

    const handleDocumentTypeChange = (docType: string) => {
        const newSelectedTypes = selectedDocumentTypes.includes(docType)
            ? selectedDocumentTypes.filter(type => type !== docType)
            : [...selectedDocumentTypes, docType]

        setSelectedDocumentTypes(newSelectedTypes)
        setValue("document_types", newSelectedTypes, { shouldValidate: true })
    }

    const addLanguage = () => {
        if (currentLanguage.trim() && !languages.includes(currentLanguage.trim())) {
            const updatedLanguages = [...languages, currentLanguage.trim()]
            setLanguages(updatedLanguages)
            setValue("profile_data.languages", updatedLanguages, { shouldValidate: true })
            setCurrentLanguage("")
        }
    }

    const removeLanguage = (language: string) => {
        const updatedLanguages = languages.filter(l => l !== language)
        setLanguages(updatedLanguages)
        setValue("profile_data.languages", updatedLanguages, { shouldValidate: true })
    }

    const addVisaCountry = () => {
        if (currentVisaCountry.trim() && !visaCountries.includes(currentVisaCountry.trim())) {
            const updatedVisaCountries = [...visaCountries, currentVisaCountry.trim()]
            setVisaCountries(updatedVisaCountries)
            setValue("profile_data.visa_countries", updatedVisaCountries, { shouldValidate: true })
            setCurrentVisaCountry("")
        }
    }

    const removeVisaCountry = (country: string) => {
        const updatedVisaCountries = visaCountries.filter(c => c !== country)
        setVisaCountries(updatedVisaCountries)
        setValue("profile_data.visa_countries", updatedVisaCountries, { shouldValidate: true })
    }

    const handleKeyDown = (e: React.KeyboardEvent, type: 'language' | 'visaCountry') => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (type === 'language') {
                addLanguage()
            } else {
                addVisaCountry()
            }
        }
    }

    const onSubmit = async (data: GuardFormData) => {
        setIsSubmitting(true);

        try {
            // Create FormData
            const formData = new FormData();

            // Append guard ID for update
            formData.append('id', guardId.toString());

            // Append all fields
            if (data.guard_code) formData.append('guard_code', data.guard_code);
            if (data.full_name) formData.append('full_name', data.full_name);
            if (data.phone) formData.append('phone', data.phone);
            if (data.email) formData.append('email', data.email);
            if (data.employee_company_card_number) formData.append('employee_company_card_number', data.employee_company_card_number);
            if (data.driver_license) formData.append('driver_license', data.driver_license);
            if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
            if (data.gender) formData.append('gender', data.gender);
            if (data.country) formData.append('country', data.country);
            if (data.city) formData.append('city', data.city);
            if (data.address) formData.append('address', data.address);
            if (data.zip_code) formData.append('zip_code', data.zip_code);
            if (data.joining_date) formData.append('joining_date', data.joining_date);
            if (data.license_expiry_date) formData.append('license_expiry_date', data.license_expiry_date);
            if (data.issuing_source) formData.append('issuing_source', data.issuing_source);
            if (data.password) formData.append('password', data.password);
            if (data.guard_type_id) formData.append('guard_type_id', data.guard_type_id.toString());
            if (data.contract_id) formData.append('contract_id', data.contract_id.toString());

            // Append status
            formData.append('is_active', data.is_active ? '1' : '0');

            // Prepare profile data object with all values (including empty ones for update)
            const profileData: GuardProfileData = {};

            // Add all profile fields
            if (data.profile_data) {
                // Personal Information
                profileData.place_of_birth = data.profile_data.place_of_birth || "";
                profileData.country_of_origin = data.profile_data.country_of_origin || "";
                profileData.current_country = data.profile_data.current_country || "";
                profileData.current_city = data.profile_data.current_city || "";
                profileData.current_address = data.profile_data.current_address || "";
                profileData.citizenship = data.profile_data.citizenship || "";
                
                // Visa Information
                profileData.visa_countries = data.profile_data.visa_countries || [];
                profileData.visa_expiry_date = data.profile_data.visa_expiry_date || "";
                
                // Family Information
                profileData.father_name = data.profile_data.father_name || "";
                profileData.mother_name = data.profile_data.mother_name || "";
                profileData.national_id_number = data.profile_data.national_id_number || "";
                
                // Personal Details
                profileData.marital_status = data.profile_data.marital_status || "single";
                profileData.height = data.profile_data.height || "";
                profileData.weight = data.profile_data.weight || "";
                profileData.blood_group = data.profile_data.blood_group || "";
                
                // Professional Information
                profileData.experience_years = data.profile_data.experience_years || 0;
                profileData.skills = data.profile_data.skills || "";
                
                // Languages
                profileData.languages = data.profile_data.languages || [];
                
                // Education
                profileData.highest_education_level = data.profile_data.highest_education_level || "";
                profileData.education_field = data.profile_data.education_field || "";
                profileData.institution_name = data.profile_data.institution_name || "";
                profileData.graduation_year = data.profile_data.graduation_year || null;
                
                // Training & Permits
                profileData.has_work_permit = data.profile_data.has_work_permit ? 1 : 0;
                profileData.has_security_training = data.profile_data.has_security_training ? 1 : 0;
                
                // Emergency Contact
                profileData.emergency_contact_name = data.profile_data.emergency_contact_name || "";
                profileData.emergency_contact_phone = data.profile_data.emergency_contact_phone || "";
                profileData.emergency_contact_relation = data.profile_data.emergency_contact_relation || "";
                
                // Notes
                profileData.notes = data.profile_data.notes || "";
            }

            // Append profile_data
            formData.append('profile_data', JSON.stringify(profileData));

            // Append document types
            if (data.document_types) {
                formData.append('document_types', JSON.stringify(data.document_types));
            }

            // Append documents to remove
            if (documentsToRemove.length > 0) {
                formData.append('documents_to_remove', JSON.stringify(documentsToRemove));
            }

            // Append files
            if (profileImage) {
                formData.append('profile_image', profileImage);
            } else if (!existingProfileImage) {
                // If no profile image and existing one was removed, indicate to remove it
                formData.append('remove_profile_image', 'true');
            }

            if (documents.length > 0) {
                documents.forEach((doc, index) => {
                    formData.append(`documents[${index}]`, doc);
                });
            }

            // Dispatch update guard action
            const result = await dispatch(updateGuard(formData));

            if (updateGuard.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Guard Updated Successfully',
                    `${data.full_name} has been updated.`,
                    {
                        timer: 2000,
                        showConfirmButton: false,
                    }
                );

                // Reset form states
                setProfileImage(null);
                setDocuments([]);
                setDocumentsToRemove([]);
                setStep(1);
                clearErrors();

                // Refresh guards list
                dispatch(fetchGuards({
                    page: 1,
                    per_page: 10,
                    sort_by: 'updated_at',
                    sort_order: 'desc'
                }));

                // Call success callback
                if (onSuccess) onSuccess();
                if (onOpenChange) onOpenChange(false);
            } else {
                throw new Error(result.payload as string || 'Failed to update guard');
            }
        } catch (error) {
            SweetAlertService.error(
                'Update Failed',
                error instanceof Error ? error.message : 'There was an error updating the guard. Please try again.'
            );
            console.error('Error updating guard:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateStep = async (currentStep: number): Promise<boolean> => {
        let fieldsToValidate: (keyof GuardFormData)[] = []

        if (currentStep === 1) {
            fieldsToValidate = [
                'full_name', 'phone', 'gender',
                'employee_company_card_number', 'country', 'city'
            ] as (keyof GuardFormData)[]
        } else if (currentStep === 2) {
            fieldsToValidate = ['joining_date'] as (keyof GuardFormData)[]
        }

        const result = await triggerValidation(fieldsToValidate, { shouldFocus: true })
        return result
    }

    const nextStep = async () => {
        const isValid = await validateStep(step)
        if (isValid) {
            setStep(step + 1)
        } else {
            const alertPromise = SweetAlertService.warning(
                'Incomplete Information',
                'Please fill in all required fields correctly before proceeding.',
                {
                    timer: 3000,
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    didClose: () => {
                        const firstErrorKey = Object.keys(errors)[0]
                        if (firstErrorKey) {
                            const element = document.querySelector(`[name="${firstErrorKey}"]`)
                            if (element) {
                                (element as HTMLElement).focus()
                            }
                        }
                    }
                }
            )
            await alertPromise;
        }
    }

    const prevStep = () => {
        setStep(step - 1)
    }

    const getCurrentDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    const getMinDate = () => {
        const minDate = new Date()
        minDate.setFullYear(minDate.getFullYear() - 100)
        return minDate.toISOString().split('T')[0]
    }

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                <DialogTitle></DialogTitle>

                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6">
                    <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                    <span className="whitespace-nowrap">Update Guard</span>
                </div>

                {/* Validation Errors Debug */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm font-medium text-red-800">Validation Errors:</p>
                        <ul className="mt-1 text-sm text-red-600">
                            {Object.entries(errors).map(([key, error]) => (
                                <li key={key}>
                                    {key}: {error?.message || 'Invalid'}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <User size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Briefcase size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <FileText size={20} />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <User size={20} />
                                Basic Information
                            </h3>

                            {/* Guard Code Section */}
                            <div className="mb-6 bg-blue-50 dark:bg-gray-800 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                                            Guard Code
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Guard code cannot be changed
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input
                                                ref={guardCodeRef}
                                                type="text"
                                                value={watch("guard_code")}
                                                readOnly
                                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-lg font-bold text-center"
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                navigator.clipboard.writeText(watch("guard_code"))
                                                SweetAlertService.success(
                                                    "Copied!",
                                                    "Guard code copied to clipboard.",
                                                    { timer: 1500, showConfirmButton: false }
                                                )
                                            }}
                                            className="h-9"
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* First Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Full Name */}
                                <div>
                                    <Controller
                                        name="full_name"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Full Name *"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                error={errors.full_name?.message}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Phone Number *"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                type="tel"
                                                error={errors.phone?.message}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Email"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                type="email"
                                                error={errors.email?.message}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelSelect
                                                label="Gender *"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                error={errors.gender?.message}
                                            >
                                                <option value="">Select...</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </FloatingLabelSelect>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Second Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Employee Card Number */}
                                <div>
                                    <Controller
                                        name="employee_company_card_number"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Employee Card Number *"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                error={errors.employee_company_card_number?.message}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Driver License */}
                                <div>
                                    <Controller
                                        name="driver_license"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Driver License"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <Controller
                                        name="date_of_birth"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Date of Birth"
                                                type="date"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                max={getCurrentDate()}
                                                min={getMinDate()}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <Controller
                                        name="country"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelSelect
                                                label="Country *"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                error={errors.country?.message}
                                            >
                                                <option value="">Select...</option>
                                                {COUNTRIES.map(country => (
                                                    <option key={country.code} value={country.name}>
                                                        {country.name}
                                                    </option>
                                                ))}
                                            </FloatingLabelSelect>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Third Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* City */}
                                <div>
                                    <Controller
                                        name="city"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="City *"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                error={errors.city?.message}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <Controller
                                        name="address"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Address"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Zip Code */}
                                <div>
                                    <Controller
                                        name="zip_code"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Zip Code"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Contract ID */}
                            <div className="mb-6">
                                <Controller
                                    name="contract_id"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Contract ID"
                                            type="number"
                                            value={field.value?.toString() || ''}
                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                            error={errors.contract_id?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Briefcase size={20} />
                                Guard Information
                            </h3>

                            {/* First Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Joining Date */}
                                <div>
                                    <Controller
                                        name="joining_date"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Joining Date *"
                                                type="date"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                max={getCurrentDate()}
                                                error={errors.joining_date?.message}
                                            />
                                        )}
                                    />
                                </div>

                                {/* License Expiry Date */}
                                <div>
                                    <Controller
                                        name="license_expiry_date"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="License Expiry Date"
                                                type="date"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                min={getCurrentDate()}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Issuing Source */}
                                <div>
                                    <Controller
                                        name="issuing_source"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelSelect
                                                label="Issuing Source"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            >
                                                <option value="">Select...</option>
                                                <option value="state">State</option>
                                                <option value="federal">Federal</option>
                                                <option value="private">Private</option>
                                                <option value="dubai_police">Dubai Police</option>
                                            </FloatingLabelSelect>
                                        )}
                                    />
                                </div>

                                {/* Guard Type */}
                                <div>
                                    <Controller
                                        name="guard_type_id"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelSelect
                                                label="Guard Type"
                                                value={field.value?.toString() || ''}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                                error={errors.guard_type_id?.message}
                                            >
                                                <option value="">Select...</option>
                                                {guardTypes.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </FloatingLabelSelect>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingLabelInput
                                            label="Password (leave empty to keep current)"
                                            type="password"
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            placeholder="Min. 6 characters"
                                            error={errors.password?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Profile Data Section */}
                            <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                                <h4 className="font-semibold mb-4">Profile Details</h4>

                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Place of Birth */}
                                    <div>
                                        <Controller
                                            name="profile_data.place_of_birth"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Place of Birth"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Country of Origin */}
                                    <div>
                                        <Controller
                                            name="profile_data.country_of_origin"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelSelect
                                                    label="Country of Origin"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                >
                                                    <option value="">Select...</option>
                                                    {COUNTRIES.map(country => (
                                                        <option key={country.code} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                                </FloatingLabelSelect>
                                            )}
                                        />
                                    </div>

                                    {/* Citizenship */}
                                    <div>
                                        <Controller
                                            name="profile_data.citizenship"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Citizenship"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* National ID Number */}
                                    <div>
                                        <Controller
                                            name="profile_data.national_id_number"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="National ID Number"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Current Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {/* Current Country */}
                                    <div>
                                        <Controller
                                            name="profile_data.current_country"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelSelect
                                                    label="Current Country"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                >
                                                    <option value="">Select...</option>
                                                    {COUNTRIES.map(country => (
                                                        <option key={country.code} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                                </FloatingLabelSelect>
                                            )}
                                        />
                                    </div>

                                    {/* Current City */}
                                    <div>
                                        <Controller
                                            name="profile_data.current_city"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Current City"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Current Address */}
                                    <div>
                                        <Controller
                                            name="profile_data.current_address"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Current Address"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Family Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* Father's Name */}
                                    <div>
                                        <Controller
                                            name="profile_data.father_name"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Father's Name"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Mother's Name */}
                                    <div>
                                        <Controller
                                            name="profile_data.mother_name"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Mother's Name"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Physical Attributes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Height */}
                                    <div>
                                        <Controller
                                            name="profile_data.height"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Height (cm or ft/in)"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., 5'10"
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Weight */}
                                    <div>
                                        <Controller
                                            name="profile_data.weight"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Weight (kg or lbs)"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., 75 kg"
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Blood Group */}
                                    <div>
                                        <Controller
                                            name="profile_data.blood_group"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelSelect
                                                    label="Blood Group"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                >
                                                    <option value="">Select...</option>
                                                    {BLOOD_GROUPS.map(group => (
                                                        <option key={group} value={group}>{group}</option>
                                                    ))}
                                                </FloatingLabelSelect>
                                            )}
                                        />
                                    </div>

                                    {/* Marital Status */}
                                    <div>
                                        <Controller
                                            name="profile_data.marital_status"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelSelect
                                                    label="Marital Status"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                >
                                                    <option value="">Select...</option>
                                                    {MARITAL_STATUS.map(status => (
                                                        <option key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </option>
                                                    ))}
                                                </FloatingLabelSelect>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Languages */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Languages</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={currentLanguage}
                                            onChange={(e) => setCurrentLanguage(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, 'language')}
                                            placeholder="Type language and press Enter"
                                            className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <Button
                                            type="button"
                                            onClick={addLanguage}
                                            variant="outline"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>

                                    {languages.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {languages.map((language, index) => (
                                                <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                    {language}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLanguage(language)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Visa Information */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Visa Countries</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={currentVisaCountry}
                                            onChange={(e) => setCurrentVisaCountry(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, 'visaCountry')}
                                            placeholder="Type country and press Enter"
                                            className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <Button
                                            type="button"
                                            onClick={addVisaCountry}
                                            variant="outline"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>

                                    {visaCountries.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {visaCountries.map((country, index) => (
                                                <div key={index} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                                    {country}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVisaCountry(country)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Visa Expiry Date */}
                                    <div className="mt-4">
                                        <Controller
                                            name="profile_data.visa_expiry_date"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Visa Expiry Date"
                                                    type="date"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    min={getCurrentDate()}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Education Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Highest Education Level */}
                                    <div>
                                        <Controller
                                            name="profile_data.highest_education_level"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelSelect
                                                    label="Highest Education"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="high_school">High School</option>
                                                    <option value="diploma">Diploma</option>
                                                    <option value="associate">Associate Degree</option>
                                                    <option value="bachelor">Bachelor Degree</option>
                                                    <option value="master">Master Degree</option>
                                                    <option value="phd">PhD</option>
                                                </FloatingLabelSelect>
                                            )}
                                        />
                                    </div>

                                    {/* Education Field */}
                                    <div>
                                        <Controller
                                            name="profile_data.education_field"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Education Field"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., Criminal Justice"
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Institution Name */}
                                    <div>
                                        <Controller
                                            name="profile_data.institution_name"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Institution Name"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., University Name"
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Graduation Year */}
                                    <div>
                                        <Controller
                                            name="profile_data.graduation_year"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Graduation Year"
                                                    type="number"
                                                    value={field.value?.toString() || ''}
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                                    min="1900"
                                                    max={new Date().getFullYear()}
                                                    placeholder="YYYY"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Experience and Skills */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* Experience Years */}
                                    <div>
                                        <Controller
                                            name="profile_data.experience_years"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Experience (years)"
                                                    type="number"
                                                    min="0"
                                                    value={field.value?.toString() || ''}
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <Controller
                                            name="profile_data.skills"
                                            control={control}
                                            render={({ field }) => (
                                                <FloatingLabelInput
                                                    label="Skills"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., First Aid, Surveillance, Combat"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="flex gap-6 mb-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            {...register("profile_data.has_work_permit")}
                                            className="rounded"
                                        />
                                        <span>Has Work Permit</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            {...register("profile_data.has_security_training")}
                                            className="rounded"
                                        />
                                        <span>Has Security Training</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText size={20} />
                                Documents & Final Details
                            </h3>

                            {/* Document Types */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-3">Required Documents</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {DOCUMENT_TYPES.map((docType) => (
                                        <label key={docType.id} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocumentTypes.includes(docType.id)}
                                                onChange={() => handleDocumentTypeChange(docType.id)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">
                                                {docType.name}
                                                {docType.required && <span className="text-red-500 ml-1">*</span>}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Profile Photo */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-4">
                                            <input
                                                type="file"
                                                id="profileImage"
                                                onChange={handleProfileImageUpload}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                            <label htmlFor="profileImage" className="cursor-pointer">
                                                <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white hover:border-gray-400 transition dark:bg-gray-800 dark:border-gray-600">
                                                    {profileImage ? (
                                                        <>
                                                            <Image
                                                                src={URL.createObjectURL(profileImage)}
                                                                alt="Profile preview"
                                                                width={128}
                                                                height={128}
                                                                className="rounded-full object-cover w-full h-full"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                <Plus className="w-8 h-8 text-white" />
                                                            </div>
                                                        </>
                                                    ) : existingProfileImage ? (
                                                        <>
                                                            <Image
                                                                src={existingProfileImage}
                                                                alt="Profile"
                                                                width={128}
                                                                height={128}
                                                                className="rounded-full object-cover w-full h-full"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                <Edit className="w-8 h-8 text-white" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                                                Profile Photo
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </label>
                                            {(profileImage || existingProfileImage) && (
                                                <button
                                                    type="button"
                                                    onClick={removeProfileImage}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                            {existingProfileImage ? "Click to change profile photo" : "Upload a clear profile photo"}
                                        </p>
                                    </div>
                                </div>

                                {/* Documents Upload */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 dark:border-gray-600">
                                    <div className="flex flex-col items-center">
                                        <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="text-gray-600 dark:text-gray-300 font-medium text-center mb-3">
                                            Upload New Documents
                                        </p>
                                        <input
                                            type="file"
                                            id="documents"
                                            multiple
                                            onChange={handleDocumentUpload}
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        />
                                        <label htmlFor="documents" className="cursor-pointer">
                                            <Button type="button" variant="outline">
                                                Select Files
                                            </Button>
                                        </label>

                                        {/* Existing Documents */}
                                        {existingDocuments.length > 0 && (
                                            <div className="mt-4 w-full">
                                                <p className="text-sm font-medium mb-2">Existing documents:</p>
                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                    {existingDocuments.map((doc) => (
                                                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                            <div className="flex items-center gap-2">
                                                                <FileText size={14} className="text-gray-500" />
                                                                <span className="text-sm truncate max-w-[200px] dark:text-gray-300">
                                                                    {doc.name}
                                                                </span>
                                                                <a
                                                                    href={doc.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 hover:text-blue-700 text-xs"
                                                                >
                                                                    View
                                                                </a>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExistingDocument(doc.id)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* New Documents */}
                                        {documents.length > 0 && (
                                            <div className="mt-4 w-full">
                                                <p className="text-sm font-medium mb-2">New files to upload:</p>
                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                    {documents.map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-2 rounded">
                                                            <div className="flex items-center gap-2">
                                                                <FileText size={14} className="text-blue-500" />
                                                                <span className="text-sm truncate max-w-[200px] dark:text-gray-300">
                                                                    {doc.name}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDocument(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="bg-yellow-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                                <h4 className="font-semibold mb-4">Emergency Contact</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Controller
                                        name="profile_data.emergency_contact_name"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Contact Name"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="profile_data.emergency_contact_phone"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Contact Phone"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                type="tel"
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="profile_data.emergency_contact_relation"
                                        control={control}
                                        render={({ field }) => (
                                            <FloatingLabelInput
                                                label="Relationship"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                placeholder="e.g., Spouse, Parent"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                                <Controller
                                    name="profile_data.notes"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            placeholder="Any additional information..."
                                            className="w-full h-32 resize-none dark:bg-gray-700 dark:border-gray-600"
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {/* Status */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        {...register("is_active")}
                                        className="rounded"
                                    />
                                    <span>Set as Active Guard</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
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
                                onClick={() => onOpenChange && onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                            >
                                Next Step →
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange && onOpenChange(false)}
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
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Guard'
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