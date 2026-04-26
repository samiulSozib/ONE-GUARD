// 'use client'
// import {
//     Dialog,
//     DialogContent,
//     DialogTrigger,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
// import Image from "next/image"
// import { FloatingLabelInput } from "../ui/floating-input"
// import { FloatingLabelSelect } from "../ui/floating-select"
// import { Textarea } from "../ui/textarea"
// import { Plus, UploadCloud, X, User, Briefcase, FileText, Copy, Loader2 } from "lucide-react"
// import { useForm, Controller } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useAppDispatch } from "@/hooks/useAppDispatch"
// import { useAppSelector } from "@/hooks/useAppSelector"
// import { updateGuard, fetchGuards, fetchGuard } from "@/store/slices/guardSlice"
// import { fetchGuardTypes } from "@/store/slices/guardTypeSlice"
// import SweetAlertService from "@/lib/sweetAlert"
// import { guardUpdateSchema, GuardUpdateFormData } from "@/lib/validation/guard.schema"
// import {
//     COUNTRIES,
//     BLOOD_GROUPS,
//     MARITAL_STATUS,
//     DOCUMENT_TYPES
// } from "@/lib/validation/guard.types"
// import { DialogTitle } from "@radix-ui/react-dialog"
// import { GuardProfileData } from "@/app/types/guard"

// interface GuardUpdateFormProps {
//     trigger: ReactNode
//     guardId: number
//     isOpen?: boolean
//     onOpenChange?: (open: boolean) => void
//     onSuccess?: () => void
// }

// export function GuardUpdateForm({
//     trigger,
//     guardId,
//     isOpen,
//     onOpenChange,
//     onSuccess
// }: GuardUpdateFormProps) {
//     const dispatch = useAppDispatch()
//     const [isSubmitting, setIsSubmitting] = useState(false)
//     const [isLoading, setIsLoading] = useState(false)
//     const [profileImage, setProfileImage] = useState<File | null>(null)
//     const [documents, setDocuments] = useState<File[]>([])
//     const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([])
//     const [languages, setLanguages] = useState<string[]>([])
//     const [currentLanguage, setCurrentLanguage] = useState("")
//     const [visaCountries, setVisaCountries] = useState<string[]>([])
//     const [currentVisaCountry, setCurrentVisaCountry] = useState("")
//     const [step, setStep] = useState(1)

//     // Get guard types from Redux store
//     const { guardTypes, isLoading: isLoadingGuardTypes } = useAppSelector((state) => state.guardTypes)

//     // Fetch guard types when dialog opens
//     useEffect(() => {
//         if (isOpen) {
//             dispatch(fetchGuardTypes({
//                 per_page: 100,
//             }))
//         }
//     }, [isOpen, dispatch])

//     const {
//         control,
//         register,
//         handleSubmit,
//         formState: { errors },
//         reset,
//         setValue,
//         trigger: triggerValidation,
//         clearErrors,
//         watch,
//     } = useForm<GuardUpdateFormData>({
//         resolver: zodResolver(guardUpdateSchema),
//         defaultValues: {
//             is_active: true,
//             gender: "male",
//             guard_code: "",
//             full_name: "",
//             phone: "",
//             email: "",
//             employee_company_card_number: "",
//             driver_license: "",
//             date_of_birth: "",
//             country: "",
//             city: "",
//             address: "",
//             zip_code: "",
//             joining_date: "",
//             license_expiry_date: "",
//             issuing_source: "",
//             password: "",
//             guard_type_id: undefined,
//             contract_id: undefined,
//             document_types: [],
//             // profile_data: {
//             //     marital_status: "single",
//             //     has_work_permit: false,
//             //     has_security_training: false,
//             //     languages: [],
//             //     place_of_birth: "",
//             //     country_of_origin: "",
//             //     current_country: "",
//             //     current_city: "",
//             //     current_address: "",
//             //     citizenship: "",
//             //     visa_countries: [],
//             //     visa_expiry_date: "",
//             //     father_name: "",
//             //     mother_name: "",
//             //     national_id_number: "",
//             //     height: "",
//             //     weight: "",
//             //     blood_group: "",
//             //     experience_years: 0,
//             //     skills: "",
//             //     highest_education_level: "",
//             //     education_field: "",
//             //     institution_name: "",
//             //     graduation_year: undefined,
//             //     emergency_contact_name: "",
//             //     emergency_contact_phone: "",
//             //     emergency_contact_relation: "",
//             //     notes: "",
//             // },
//             profile_data:{}
//         },
//         mode: "onChange",
//     })

//     // Handle dialog close
//     const handleDialogClose = useCallback((open: boolean) => {
//         if (!open && !isSubmitting) {
//             resetForm()
//         }
//         onOpenChange?.(open)
//     }, [onOpenChange, isSubmitting])

//     // Reset form function
//     const resetForm = useCallback(() => {
//         reset()
//         setProfileImage(null)
//         setDocuments([])
//         setSelectedDocumentTypes([])
//         setLanguages([])
//         setVisaCountries([])
//         setCurrentLanguage("")
//         setCurrentVisaCountry("")
//         setStep(1)
//         clearErrors()
//     }, [reset, clearErrors])

//     // Load guard data when dialog opens
//     useEffect(() => {
//         const loadGuardData = async () => {
//             if (isOpen && guardId) {
//                 setIsLoading(true)
//                 try {
//                     const result = await dispatch(fetchGuard({ id: guardId }))
//                     if (fetchGuard.fulfilled.match(result)) {
//                         const guardData = result.payload.item

//                         // Populate form with guard data
//                         setValue("guard_code", guardData.guard_code)
//                         setValue("full_name", guardData.full_name)
//                         setValue("phone", guardData.phone)
//                         setValue("email", guardData.email || "")
//                         setValue("employee_company_card_number", guardData.employee_company_card_number || '')
//                         setValue("driver_license", guardData.driver_license || "")
//                         setValue("date_of_birth", guardData.date_of_birth ? guardData.date_of_birth.split('T')[0] : "")
//                         setValue("gender", guardData.gender)
//                         setValue("country", guardData.country || '')
//                         setValue("city", guardData.city || "")
//                         setValue("address", guardData.address || "")
//                         setValue("zip_code", guardData.zip_code || "")
//                         setValue("joining_date", guardData.joining_date ? guardData.joining_date.split('T')[0] : "")
//                         setValue("license_expiry_date", guardData.license_expiry_date ? guardData.license_expiry_date.split('T')[0] : "")
//                         setValue("issuing_source", guardData.issuing_source || "")
//                         setValue("guard_type_id", guardData.guard_type_id || undefined)
//                         setValue("contract_id", guardData.contract_id || undefined)
//                         setValue("is_active", guardData.is_active)

//                         // Set document types if available
//                         if (guardData.document_types && guardData.document_types.length > 0) {
//                             setSelectedDocumentTypes(guardData.document_types)
//                             setValue("document_types", guardData.document_types)
//                         }

//                         // FIX: Check if profile exists in the response
//                         // The field might be 'profile' not 'profile_data'
//                         const profile = guardData.profile || guardData.profile_data || {}

//                         if (Object.keys(profile).length > 0) {
//                             setValue("profile_data.marital_status", profile.marital_status || "single")

//                             // FIX: Handle boolean fields properly
//                             setValue("profile_data.has_work_permit",  profile.has_work_permit === true)
//                             setValue("profile_data.has_security_training",  profile.has_security_training === true)

//                             // Set languages
//                             if (profile.languages && profile.languages.length > 0) {
//                                 setLanguages(profile.languages)
//                                 setValue("profile_data.languages", profile.languages)
//                             }

//                             setValue("profile_data.place_of_birth", profile.place_of_birth || "")
//                             setValue("profile_data.country_of_origin", profile.country_of_origin || "")
//                             setValue("profile_data.current_country", profile.current_country || "")
//                             setValue("profile_data.current_city", profile.current_city || "")
//                             setValue("profile_data.current_address", profile.current_address || "")
//                             setValue("profile_data.citizenship", profile.citizenship || "")

//                             // Set visa countries
//                             if (profile.visa_countries && profile.visa_countries.length > 0) {
//                                 setVisaCountries(profile.visa_countries)
//                                 setValue("profile_data.visa_countries", profile.visa_countries)
//                             }

//                             setValue("profile_data.visa_expiry_date", profile.visa_expiry_date ? profile.visa_expiry_date.split('T')[0] : "")
//                             setValue("profile_data.father_name", profile.father_name || "")
//                             setValue("profile_data.mother_name", profile.mother_name || "")
//                             setValue("profile_data.national_id_number", profile.national_id_number || "")
//                             setValue("profile_data.height", profile.height || "")
//                             setValue("profile_data.weight", profile.weight || "")
//                             setValue("profile_data.blood_group", profile.blood_group || "")

//                             // FIX: Handle number fields properly
//                             setValue("profile_data.experience_years", profile.experience_years || 0)
//                             setValue("profile_data.skills", profile.skills || "")
//                             setValue("profile_data.highest_education_level", profile.highest_education_level || "")
//                             setValue("profile_data.education_field", profile.education_field || "")
//                             setValue("profile_data.institution_name", profile.institution_name || "")
//                             setValue("profile_data.graduation_year", profile.graduation_year || undefined)
//                             setValue("profile_data.emergency_contact_name", profile.emergency_contact_name || "")
//                             setValue("profile_data.emergency_contact_phone", profile.emergency_contact_phone || "")
//                             setValue("profile_data.emergency_contact_relation", profile.emergency_contact_relation || "")
//                             setValue("profile_data.notes", profile.notes || "")
//                         }
//                     } else {
//                         SweetAlertService.error("Error", "Failed to load guard data")
//                     }
//                 } catch (error) {
//                     console.error("Error loading guard data:", error)
//                     SweetAlertService.error("Error", "Failed to load guard data")
//                 } finally {
//                     setIsLoading(false)
//                 }
//             }
//         }

//         loadGuardData()
//     }, [isOpen, guardId, dispatch, setValue])

//     // File upload handlers
//     const handleProfileImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0]
//         if (file) {
//             if (!file.type.startsWith('image/')) {
//                 SweetAlertService.error("Invalid file type", "Please upload an image file")
//                 return
//             }
//             if (file.size > 5 * 1024 * 1024) {
//                 SweetAlertService.error("File too large", "Please upload an image smaller than 5MB")
//                 return
//             }
//             setProfileImage(file)
//         }
//     }, [])

//     const handleDocumentUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//         const files = Array.from(e.target.files || [])
//         const validFiles = files.filter(file => {
//             const validTypes = [
//                 'application/pdf',
//                 'image/jpeg',
//                 'image/png',
//                 'application/msword',
//                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//             ]
//             return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
//         })

//         if (validFiles.length !== files.length) {
//             SweetAlertService.warning("Some files were skipped", "Only PDF, JPG, PNG, and DOC files up to 10MB are allowed")
//         }

//         setDocuments(prev => [...prev, ...validFiles])
//     }, [])

//     const removeDocument = useCallback((index: number) => {
//         setDocuments(prev => prev.filter((_, i) => i !== index))
//     }, [])

//     // Handle document type selection
//     const handleDocumentTypeChange = useCallback((docType: string) => {
//         const newSelectedTypes = selectedDocumentTypes.includes(docType)
//             ? selectedDocumentTypes.filter(type => type !== docType)
//             : [...selectedDocumentTypes, docType]

//         setSelectedDocumentTypes(newSelectedTypes)
//         setValue("document_types", newSelectedTypes, { shouldValidate: true })
//     }, [selectedDocumentTypes, setValue])

//     // Language handlers
//     const addLanguage = useCallback(() => {
//         if (currentLanguage.trim() && !languages.includes(currentLanguage.trim())) {
//             const updatedLanguages = [...languages, currentLanguage.trim()]
//             setLanguages(updatedLanguages)
//             setValue("profile_data.languages", updatedLanguages, { shouldValidate: true })
//             setCurrentLanguage("")
//         }
//     }, [currentLanguage, languages, setValue])

//     const removeLanguage = useCallback((language: string) => {
//         const updatedLanguages = languages.filter(l => l !== language)
//         setLanguages(updatedLanguages)
//         setValue("profile_data.languages", updatedLanguages, { shouldValidate: true })
//     }, [languages, setValue])

//     // Visa country handlers
//     const addVisaCountry = useCallback(() => {
//         if (currentVisaCountry.trim() && !visaCountries.includes(currentVisaCountry.trim())) {
//             const updatedVisaCountries = [...visaCountries, currentVisaCountry.trim()]
//             setVisaCountries(updatedVisaCountries)
//             setValue("profile_data.visa_countries", updatedVisaCountries, { shouldValidate: true })
//             setCurrentVisaCountry("")
//         }
//     }, [currentVisaCountry, visaCountries, setValue])

//     const removeVisaCountry = useCallback((country: string) => {
//         const updatedVisaCountries = visaCountries.filter(c => c !== country)
//         setVisaCountries(updatedVisaCountries)
//         setValue("profile_data.visa_countries", updatedVisaCountries, { shouldValidate: true })
//     }, [visaCountries, setValue])

//     const handleKeyDown = useCallback((e: React.KeyboardEvent, type: 'language' | 'visaCountry') => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             if (type === 'language') {
//                 addLanguage()
//             } else {
//                 addVisaCountry()
//             }
//         }
//     }, [addLanguage, addVisaCountry])

//     // Helper function to prepare profile data
//     const prepareProfileData = (data: GuardUpdateFormData['profile_data']): Partial<GuardProfileData> => {
//         if (!data) return {}

//         const profileData: Partial<GuardProfileData> = {}

//         // Add only non-empty values
//         if (data.place_of_birth?.trim()) profileData.place_of_birth = data.place_of_birth
//         if (data.country_of_origin?.trim()) profileData.country_of_origin = data.country_of_origin
//         if (data.current_country?.trim()) profileData.current_country = data.current_country
//         if (data.current_city?.trim()) profileData.current_city = data.current_city
//         if (data.current_address?.trim()) profileData.current_address = data.current_address
//         if (data.citizenship?.trim()) profileData.citizenship = data.citizenship

//         if (data.visa_countries?.length) profileData.visa_countries = data.visa_countries
//         if (data.visa_expiry_date?.trim()) profileData.visa_expiry_date = data.visa_expiry_date

//         if (data.father_name?.trim()) profileData.father_name = data.father_name
//         if (data.mother_name?.trim()) profileData.mother_name = data.mother_name
//         if (data.national_id_number?.trim()) profileData.national_id_number = data.national_id_number

//         if (data.marital_status) profileData.marital_status = data.marital_status
//         if (data.height?.trim()) profileData.height = data.height
//         if (data.weight?.trim()) profileData.weight = data.weight
//         if (data.blood_group?.trim()) profileData.blood_group = data.blood_group

//         if (data.experience_years && data.experience_years > 0) profileData.experience_years = data.experience_years
//         if (data.skills?.trim()) profileData.skills = data.skills

//         if (data.languages?.length) profileData.languages = data.languages

//         if (data.highest_education_level?.trim()) profileData.highest_education_level = data.highest_education_level
//         if (data.education_field?.trim()) profileData.education_field = data.education_field
//         if (data.institution_name?.trim()) profileData.institution_name = data.institution_name
//         if (data.graduation_year) profileData.graduation_year = data.graduation_year

//         // Boolean fields
//         if (data.has_work_permit !== undefined) profileData.has_work_permit = data.has_work_permit ? 1 : 0
//         if (data.has_security_training !== undefined) profileData.has_security_training = data.has_security_training ? 1 : 0

//         if (data.emergency_contact_name?.trim()) profileData.emergency_contact_name = data.emergency_contact_name
//         if (data.emergency_contact_phone?.trim()) profileData.emergency_contact_phone = data.emergency_contact_phone
//         if (data.emergency_contact_relation?.trim()) profileData.emergency_contact_relation = data.emergency_contact_relation

//         if (data.notes?.trim()) profileData.notes = data.notes

//         return profileData
//     }

//     // Submit handler
//     const onSubmit = async (data: GuardUpdateFormData) => {
//         setIsSubmitting(true)

//         try {
//             const formData = new FormData()

//             // Important: Add method override for Laravel
//             formData.append('_method', 'PUT')

//             // Always include required fields
//             const requiredFields: Record<string, string> = {
//                 guard_code: data.guard_code || '',
//                 full_name: data.full_name || '',
//                 phone: data.phone || '',
//                 employee_company_card_number: data.employee_company_card_number || '',
//                 gender: data.gender || 'male',
//                 country: data.country || '',
//                 city: data.city || '',
//                 joining_date: data.joining_date || '',
//                 is_active: data.is_active ? '1' : '0'
//             }

//             Object.entries(requiredFields).forEach(([key, value]) => {
//                 if (value) formData.append(key, value)
//             })

//             // Optional fields
//             const optionalFields: Record<string, string | number | undefined> = {
//                 email: data.email,
//                 // FIX: Only include password if it's provided (not empty)
//                 ...(data.password && data.password.trim() !== '' ? { password: data.password } : {}),
//                 driver_license: data.driver_license,
//                 date_of_birth: data.date_of_birth,
//                 address: data.address,
//                 zip_code: data.zip_code,
//                 license_expiry_date: data.license_expiry_date,
//                 issuing_source: data.issuing_source
//             }

//             Object.entries(optionalFields).forEach(([key, value]) => {
//                 if (value && value.toString().trim() !== '') {
//                     formData.append(key, value.toString())
//                 }
//             })

//             // Numeric fields
//             if (data.guard_type_id) {
//                 formData.append('guard_type_id', data.guard_type_id.toString())
//             }
//             if (data.contract_id) {
//                 formData.append('contract_id', data.contract_id.toString())
//             }

//             // Profile data - always send, even if empty
//             const profileData = prepareProfileData(data.profile_data || {})
//             if (Object.keys(profileData).length > 0) {
//                 formData.append('profile_data', JSON.stringify(profileData))
//             }

//             // Document types
//             if (selectedDocumentTypes.length > 0) {
//                 formData.append('document_types', JSON.stringify(selectedDocumentTypes))
//             }

//             // Files
//             if (profileImage) {
//                 formData.append('profile_image', profileImage)
//             }

//             if (documents.length > 0) {
//                 documents.forEach((doc) => {
//                     formData.append('documents[]', doc)
//                 })
//             }

//             // Dispatch update action
//             const result = await dispatch(updateGuard({ id: guardId, data: formData }))

//             if (updateGuard.fulfilled.match(result)) {
//                 await SweetAlertService.success(
//                     'Guard Updated Successfully',
//                     `${data.full_name} has been updated.`,
//                     { timer: 2000, showConfirmButton: false }
//                 )

//                 resetForm()

//                 await dispatch(fetchGuards({
//                     page: 1,
//                     per_page: 10,
//                     sort_by: 'updated_at',
//                     sort_order: 'desc'
//                 }))

//                 onSuccess?.()
//                 handleDialogClose(false)
//             } else {
//                 const errorMessage = (result.payload as string) || 'Failed to update guard'
//                 throw new Error(errorMessage)
//             }
//         } catch (error) {
//             await SweetAlertService.error(
//                 'Update Failed',
//                 error instanceof Error ? error.message : 'There was an error updating the guard. Please try again.'
//             )
//             console.error('Error updating guard:', error)
//         } finally {
//             setIsSubmitting(false)
//         }
//     }

//     // Step validation
//     const validateStep = useCallback(async (currentStep: number): Promise<boolean> => {
//         let fieldsToValidate: (keyof GuardUpdateFormData)[] = []

//         if (currentStep === 1) {
//             fieldsToValidate = [
//                 'full_name', 'phone', 'gender',
//                 'employee_company_card_number', 'country', 'city'
//             ]
//         } else if (currentStep === 2) {
//             fieldsToValidate = ['joining_date']
//         }

//         const result = await triggerValidation(fieldsToValidate, { shouldFocus: true })
//         return result
//     }, [triggerValidation])

//     const nextStep = useCallback(async () => {
//         const isValid = await validateStep(step)
//         if (isValid) {
//             setStep(step + 1)
//         } else {
//             await SweetAlertService.warning(
//                 'Incomplete Information',
//                 'Please fill in all required fields correctly before proceeding.',
//                 {
//                     timer: 3000,
//                     showConfirmButton: true,
//                     confirmButtonText: 'OK'
//                 }
//             )
//         }
//     }, [step, validateStep])

//     const prevStep = useCallback(() => {
//         setStep(step - 1)
//     }, [step])

//     const getCurrentDate = useCallback((): string => {
//         return new Date().toISOString().split('T')[0]
//     }, [])

//     const getMinDate = useCallback((): string => {
//         const minDate = new Date()
//         minDate.setFullYear(minDate.getFullYear() - 100)
//         return minDate.toISOString().split('T')[0]
//     }, [])

//     const copyGuardCode = useCallback(() => {
//         navigator.clipboard.writeText(watch("guard_code") || '')
//         SweetAlertService.success(
//             "Copied!",
//             "Guard code copied to clipboard.",
//             { timer: 1500, showConfirmButton: false }
//         )
//     }, [watch])

//     if (isLoading) {
//         return (
//             <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//                 <DialogTrigger asChild>
//                     {trigger}
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
//                     <div className="flex items-center justify-center h-64">
//                         <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         )
//     }

//     return (
//         <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//             <DialogTrigger asChild>
//                 {trigger}
//             </DialogTrigger>

//             <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
//                 <DialogTitle className="sr-only">Update Guard</DialogTitle>

//                 {/* Header */}
//                 <div className="flex items-center gap-2 text-lg font-semibold mb-6">
//                     <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
//                     <span className="whitespace-nowrap">Update Guard</span>
//                 </div>

//                 {/* Progress Steps */}
//                 <div className="flex items-center justify-center mb-6">
//                     <div className="flex items-center space-x-2">
//                         <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
//                             step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
//                         }`}>
//                             <User size={20} />
//                         </div>
//                         <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
//                         <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
//                             step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
//                         }`}>
//                             <Briefcase size={20} />
//                         </div>
//                         <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
//                         <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
//                             step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
//                         }`}>
//                             <FileText size={20} />
//                         </div>
//                     </div>
//                 </div>

//                 <form onSubmit={handleSubmit(onSubmit)}>
//                     {/* Step 1: Basic Information */}
//                     {step === 1 && (
//                         <div className="space-y-6">
//                             <h3 className="text-lg font-semibold flex items-center gap-2">
//                                 <User size={20} />
//                                 Basic Information
//                             </h3>

//                             {/* Guard Code Section */}
//                             <div className="mb-6 bg-blue-50 dark:bg-gray-800 rounded-lg p-4">
//                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                                     <div>
//                                         <h4 className="font-semibold text-gray-700 dark:text-gray-300">
//                                             Guard Code
//                                         </h4>
//                                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                                             Guard code cannot be changed
//                                         </p>
//                                     </div>

//                                     <div className="flex items-center gap-2">
//                                         <input
//                                             type="text"
//                                             value={watch("guard_code") || ''}
//                                             readOnly
//                                             className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-lg font-bold text-center"
//                                         />
//                                         <Button
//                                             type="button"
//                                             size="sm"
//                                             variant="outline"
//                                             onClick={copyGuardCode}
//                                             className="h-9"
//                                         >
//                                             <Copy size={16} />
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* First Row */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                                 <Controller
//                                     name="full_name"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Full Name *"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             error={errors.full_name?.message}
//                                         />
//                                     )}
//                                 />

//                                 <Controller
//                                     name="phone"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Phone Number *"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             type="tel"
//                                             error={errors.phone?.message}
//                                         />
//                                     )}
//                                 />

//                                 <Controller
//                                     name="email"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Email"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             type="email"
//                                             error={errors.email?.message}
//                                         />
//                                     )}
//                                 />

//                                 <Controller
//                                     name="gender"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelSelect
//                                             label="Gender *"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             error={errors.gender?.message}
//                                         >
//                                             <option value="">Select...</option>
//                                             <option value="male">Male</option>
//                                             <option value="female">Female</option>
//                                             <option value="other">Other</option>
//                                         </FloatingLabelSelect>
//                                     )}
//                                 />
//                             </div>

//                             {/* Second Row */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                                 <Controller
//                                     name="employee_company_card_number"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Employee Card Number *"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             error={errors.employee_company_card_number?.message}
//                                         />
//                                     )}
//                                 />

//                                 <Controller
//                                     name="driver_license"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Driver License"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                         />
//                                     )}
//                                 />

//                                 <Controller
//                                     name="date_of_birth"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Date of Birth"
//                                             type="date"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             max={getCurrentDate()}
//                                             min={getMinDate()}
//                                         />
//                                     )}
//                                 />

//                                 <Controller
//                                     name="country"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelSelect
//                                             label="Country *"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             error={errors.country?.message}
//                                         >
//                                             <option value="">Select...</option>
//                                             {COUNTRIES.map(country => (
//                                                 <option key={country.code} value={country.name}>
//                                                     {country.name}
//                                                 </option>
//                                             ))}
//                                         </FloatingLabelSelect>
//                                     )}
//                                 />
//                             </div>

//                             {/* Third Row */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                                 <Controller
//                                     name="city"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="City *"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             error={errors.city?.message}
//                                         />
//                                     )}
//                                 />

//                                 <div className="md:col-span-2">
//                                     <Controller
//                                         name="address"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Address"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />
//                                 </div>

//                                 <Controller
//                                     name="zip_code"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Zip Code"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                         />
//                                     )}
//                                 />
//                             </div>

//                             {/* Contract ID */}
//                             <div className="mb-6">
//                                 <Controller
//                                     name="contract_id"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Contract ID"
//                                             type="number"
//                                             value={field.value?.toString() || ''}
//                                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
//                                             error={errors.contract_id?.message}
//                                         />
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                     )}

//                     {/* Step 2: Guard Information */}
//                     {step === 2 && (
//                         <div className="space-y-6">
//                             <h3 className="text-lg font-semibold flex items-center gap-2">
//                                 <Briefcase size={20} />
//                                 Guard Information
//                             </h3>

//                             {/* First Row */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                                 <Controller
//                                     name="joining_date"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Joining Date *"
//                                             type="date"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             max={getCurrentDate()}
//                                             error={errors.joining_date?.message}
//                                         />
//                                     )}
//                                 />

//                                 <Controller
//                                     name="license_expiry_date"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="License Expiry Date"
//                                             type="date"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             min={getCurrentDate()}
//                                         />
//                                     )}
//                                 />

//                                 <Controller
//                                     name="issuing_source"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelSelect
//                                             label="Issuing Source"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                         >
//                                             <option value="">Select...</option>
//                                             <option value="state">State</option>
//                                             <option value="federal">Federal</option>
//                                             <option value="private">Private</option>
//                                             <option value="dubai_police">Dubai Police</option>
//                                         </FloatingLabelSelect>
//                                     )}
//                                 />

//                                 <Controller
//                                     name="guard_type_id"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelSelect
//                                             label="Guard Type"
//                                             value={field.value?.toString() || ''}
//                                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
//                                             error={errors.guard_type_id?.message}
//                                         >
//                                             <option value="">Select Guard Type</option>
//                                             {isLoadingGuardTypes ? (
//                                                 <option value="" disabled>Loading guard types...</option>
//                                             ) : guardTypes.length > 0 ? (
//                                                 guardTypes.map((type) => (
//                                                     <option key={type.id} value={type.id}>
//                                                         {type.name}
//                                                     </option>
//                                                 ))
//                                             ) : (
//                                                 <option value="" disabled>No guard types available</option>
//                                             )}
//                                         </FloatingLabelSelect>
//                                     )}
//                                 />
//                             </div>

//                             {/* Password */}
//                             <div className="mb-6">
//                                 <Controller
//                                     name="password"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <FloatingLabelInput
//                                             label="Password (leave empty to keep current)"
//                                             type="password"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                             placeholder="Min. 6 characters"
//                                             error={errors.password?.message}
//                                         />
//                                     )}
//                                 />
//                             </div>

//                             {/* Profile Data Section */}
//                             <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
//                                 <h4 className="font-semibold mb-4">Profile Details</h4>

//                                 {/* Personal Information */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                                     <Controller
//                                         name="profile_data.place_of_birth"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Place of Birth"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.country_of_origin"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelSelect
//                                                 label="Country of Origin"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             >
//                                                 <option value="">Select...</option>
//                                                 {COUNTRIES.map(country => (
//                                                     <option key={country.code} value={country.name}>
//                                                         {country.name}
//                                                     </option>
//                                                 ))}
//                                             </FloatingLabelSelect>
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.citizenship"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Citizenship"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.national_id_number"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="National ID Number"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />
//                                 </div>

//                                 {/* Current Location */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//                                     <Controller
//                                         name="profile_data.current_country"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelSelect
//                                                 label="Current Country"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             >
//                                                 <option value="">Select...</option>
//                                                 {COUNTRIES.map(country => (
//                                                     <option key={country.code} value={country.name}>
//                                                         {country.name}
//                                                     </option>
//                                                 ))}
//                                             </FloatingLabelSelect>
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.current_city"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Current City"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.current_address"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Current Address"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />
//                                 </div>

//                                 {/* Family Information */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                                     <Controller
//                                         name="profile_data.father_name"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Father's Name"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.mother_name"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Mother's Name"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />
//                                 </div>

//                                 {/* Physical Attributes */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                                     <Controller
//                                         name="profile_data.height"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Height (cm or ft/in)"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                                 placeholder="e.g., 5'10"
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.weight"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Weight (kg or lbs)"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                                 placeholder="e.g., 75 kg"
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.blood_group"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelSelect
//                                                 label="Blood Group"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             >
//                                                 <option value="">Select...</option>
//                                                 {BLOOD_GROUPS.map(group => (
//                                                     <option key={group} value={group}>{group}</option>
//                                                 ))}
//                                             </FloatingLabelSelect>
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.marital_status"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelSelect
//                                                 label="Marital Status"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             >
//                                                 <option value="">Select...</option>
//                                                 {MARITAL_STATUS.map(status => (
//                                                     <option key={status} value={status}>
//                                                         {status.charAt(0).toUpperCase() + status.slice(1)}
//                                                     </option>
//                                                 ))}
//                                             </FloatingLabelSelect>
//                                         )}
//                                     />
//                                 </div>

//                                 {/* Languages */}
//                                 <div className="mb-6">
//                                     <label className="block text-sm font-medium mb-2">Languages</label>
//                                     <div className="flex gap-2 mb-2">
//                                         <input
//                                             type="text"
//                                             value={currentLanguage}
//                                             onChange={(e) => setCurrentLanguage(e.target.value)}
//                                             onKeyDown={(e) => handleKeyDown(e, 'language')}
//                                             placeholder="Type language and press Enter"
//                                             className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
//                                         />
//                                         <Button
//                                             type="button"
//                                             onClick={addLanguage}
//                                             variant="outline"
//                                         >
//                                             <Plus size={16} />
//                                         </Button>
//                                     </div>

//                                     {languages.length > 0 && (
//                                         <div className="flex flex-wrap gap-2">
//                                             {languages.map((language, index) => (
//                                                 <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
//                                                     {language}
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => removeLanguage(language)}
//                                                         className="text-blue-600 hover:text-blue-800"
//                                                     >
//                                                         <X size={14} />
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Visa Information */}
//                                 <div className="mb-6">
//                                     <label className="block text-sm font-medium mb-2">Visa Countries</label>
//                                     <div className="flex gap-2 mb-2">
//                                         <input
//                                             type="text"
//                                             value={currentVisaCountry}
//                                             onChange={(e) => setCurrentVisaCountry(e.target.value)}
//                                             onKeyDown={(e) => handleKeyDown(e, 'visaCountry')}
//                                             placeholder="Type country and press Enter"
//                                             className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
//                                         />
//                                         <Button
//                                             type="button"
//                                             onClick={addVisaCountry}
//                                             variant="outline"
//                                         >
//                                             <Plus size={16} />
//                                         </Button>
//                                     </div>

//                                     {visaCountries.length > 0 && (
//                                         <div className="flex flex-wrap gap-2">
//                                             {visaCountries.map((country, index) => (
//                                                 <div key={index} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
//                                                     {country}
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => removeVisaCountry(country)}
//                                                         className="text-green-600 hover:text-green-800"
//                                                     >
//                                                         <X size={14} />
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}

//                                     <div className="mt-4">
//                                         <Controller
//                                             name="profile_data.visa_expiry_date"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <FloatingLabelInput
//                                                     label="Visa Expiry Date"
//                                                     type="date"
//                                                     value={field.value || ''}
//                                                     onChange={field.onChange}
//                                                     min={getCurrentDate()}
//                                                 />
//                                             )}
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Education Information */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                                     <Controller
//                                         name="profile_data.highest_education_level"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelSelect
//                                                 label="Highest Education"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             >
//                                                 <option value="">Select...</option>
//                                                 <option value="high_school">High School</option>
//                                                 <option value="diploma">Diploma</option>
//                                                 <option value="associate">Associate Degree</option>
//                                                 <option value="bachelor">Bachelor Degree</option>
//                                                 <option value="master">Master Degree</option>
//                                                 <option value="phd">PhD</option>
//                                             </FloatingLabelSelect>
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.education_field"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Education Field"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                                 placeholder="e.g., Criminal Justice"
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.institution_name"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Institution Name"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                                 placeholder="e.g., University Name"
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.graduation_year"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Graduation Year"
//                                                 type="number"
//                                                 value={field.value?.toString() || ''}
//                                                 onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
//                                                 min="1900"
//                                                 max={new Date().getFullYear()}
//                                                 placeholder="YYYY"
//                                             />
//                                         )}
//                                     />
//                                 </div>

//                                 {/* Experience and Skills */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                                     <Controller
//                                         name="profile_data.experience_years"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Experience (years)"
//                                                 type="number"
//                                                 min="0"
//                                                 value={field.value?.toString() || ''}
//                                                 onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.skills"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Skills"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                                 placeholder="e.g., First Aid, Surveillance, Combat"
//                                             />
//                                         )}
//                                     />
//                                 </div>

//                                 {/* Checkboxes */}
//                                 <div className="flex gap-6 mb-6">
//                                     <label className="flex items-center gap-2">
//                                         <input
//                                             type="checkbox"
//                                             {...register("profile_data.has_work_permit")}
//                                             className="rounded"
//                                         />
//                                         <span>Has Work Permit</span>
//                                     </label>

//                                     <label className="flex items-center gap-2">
//                                         <input
//                                             type="checkbox"
//                                             {...register("profile_data.has_security_training")}
//                                             className="rounded"
//                                         />
//                                         <span>Has Security Training</span>
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Step 3: Documents & Final Details */}
//                     {step === 3 && (
//                         <div className="space-y-6">
//                             <h3 className="text-lg font-semibold flex items-center gap-2">
//                                 <FileText size={20} />
//                                 Documents & Final Details
//                             </h3>

//                             {/* Document Types */}
//                             <div className="mb-6">
//                                 <label className="block text-sm font-medium mb-3">Required Documents</label>
//                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                                     {DOCUMENT_TYPES.map((docType) => (
//                                         <label key={docType.id} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedDocumentTypes.includes(docType.id)}
//                                                 onChange={() => handleDocumentTypeChange(docType.id)}
//                                                 className="rounded"
//                                             />
//                                             <span className="text-sm">
//                                                 {docType.name}
//                                                 {docType.required && <span className="text-red-500 ml-1">*</span>}
//                                             </span>
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* File Upload Section */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                                 {/* Profile Photo */}
//                                 <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
//                                     <div className="flex flex-col items-center">
//                                         <div className="relative mb-4">
//                                             <input
//                                                 type="file"
//                                                 id="profileImage"
//                                                 onChange={handleProfileImageUpload}
//                                                 className="hidden"
//                                                 accept="image/*"
//                                             />
//                                             <label htmlFor="profileImage" className="cursor-pointer">
//                                                 <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white hover:border-gray-400 transition dark:bg-gray-800 dark:border-gray-600">
//                                                     {profileImage ? (
//                                                         <>
//                                                             <Image
//                                                                 src={URL.createObjectURL(profileImage)}
//                                                                 alt="Profile preview"
//                                                                 width={128}
//                                                                 height={128}
//                                                                 className="rounded-full object-cover w-full h-full"
//                                                             />
//                                                             <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
//                                                                 <Plus className="w-8 h-8 text-white" />
//                                                             </div>
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <Plus className="w-8 h-8 text-gray-400 mb-2" />
//                                                             <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
//                                                                 Profile Photo
//                                                             </p>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                             </label>
//                                             {profileImage && (
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setProfileImage(null)}
//                                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                                                 >
//                                                     <X size={16} />
//                                                 </button>
//                                             )}
//                                         </div>
//                                         <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
//                                             Upload a new profile photo (optional)
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Documents Upload */}
//                                 <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 dark:border-gray-600">
//                                     <div className="flex flex-col items-center">
//                                         <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
//                                         <p className="text-gray-600 dark:text-gray-300 font-medium text-center mb-3">
//                                             Upload Additional Documents
//                                         </p>
//                                         <input
//                                             type="file"
//                                             id="documents"
//                                             multiple
//                                             onChange={handleDocumentUpload}
//                                             className="hidden"
//                                             accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                                         />
//                                         <label htmlFor="documents" className="cursor-pointer">
//                                             <Button type="button" variant="outline">
//                                                 Select Files
//                                             </Button>
//                                         </label>

//                                         {documents.length > 0 && (
//                                             <div className="mt-4 w-full">
//                                                 <p className="text-sm font-medium mb-2">New files:</p>
//                                                 <div className="space-y-2 max-h-40 overflow-y-auto">
//                                                     {documents.map((doc, index) => (
//                                                         <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
//                                                             <div className="flex items-center gap-2">
//                                                                 <FileText size={14} className="text-gray-500" />
//                                                                 <span className="text-sm truncate max-w-[200px] dark:text-gray-300">
//                                                                     {doc.name}
//                                                                 </span>
//                                                             </div>
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={() => removeDocument(index)}
//                                                                 className="text-red-500 hover:text-red-700"
//                                                             >
//                                                                 <X size={16} />
//                                                             </button>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Emergency Contact */}
//                             <div className="bg-yellow-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
//                                 <h4 className="font-semibold mb-4">Emergency Contact</h4>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                     <Controller
//                                         name="profile_data.emergency_contact_name"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Contact Name"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.emergency_contact_phone"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Contact Phone"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                                 type="tel"
//                                             />
//                                         )}
//                                     />

//                                     <Controller
//                                         name="profile_data.emergency_contact_relation"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <FloatingLabelInput
//                                                 label="Relationship"
//                                                 value={field.value || ''}
//                                                 onChange={field.onChange}
//                                                 placeholder="e.g., Spouse, Parent"
//                                             />
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Notes */}
//                             <div className="mb-6">
//                                 <label className="block text-sm font-medium mb-2">Additional Notes</label>
//                                 <Controller
//                                     name="profile_data.notes"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <Textarea
//                                             {...field}
//                                             placeholder="Any additional information..."
//                                             className="w-full h-32 resize-none dark:bg-gray-700 dark:border-gray-600"
//                                             value={field.value || ''}
//                                             onChange={field.onChange}
//                                         />
//                                     )}
//                                 />
//                             </div>

//                             {/* Status */}
//                             <div className="mb-6">
//                                 <label className="flex items-center gap-2">
//                                     <input
//                                         type="checkbox"
//                                         {...register("is_active")}
//                                         className="rounded"
//                                     />
//                                     <span>Set as Active Guard</span>
//                                 </label>
//                             </div>
//                         </div>
//                     )}

//                     {/* Navigation Buttons */}
//                     <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
//                         {step > 1 ? (
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={prevStep}
//                             >
//                                 ← Back
//                             </Button>
//                         ) : (
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={() => handleDialogClose(false)}
//                             >
//                                 Cancel
//                             </Button>
//                         )}

//                         {step < 3 ? (
//                             <Button
//                                 type="button"
//                                 onClick={nextStep}
//                             >
//                                 Next Step →
//                             </Button>
//                         ) : (
//                             <div className="flex gap-2">
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     onClick={() => handleDialogClose(false)}
//                                 >
//                                     Cancel
//                                 </Button>
//                                 <Button
//                                     type="submit"
//                                     disabled={isSubmitting}
//                                     className="bg-green-600 hover:bg-green-700"
//                                 >
//                                     {isSubmitting ? (
//                                         <>
//                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                                             Updating...
//                                         </>
//                                     ) : (
//                                         'Update Guard'
//                                     )}
//                                 </Button>
//                             </div>
//                         )}
//                     </div>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     )
// }
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
import { Textarea } from "../ui/textarea"
import { Plus, UploadCloud, X, User, Briefcase, FileText, Copy, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { updateGuard, fetchGuards, fetchGuard } from "@/store/slices/guardSlice"
import { fetchGuardTypes } from "@/store/slices/guardTypeSlice"
import SweetAlertService from "@/lib/sweetAlert"
import {
    COUNTRIES,
    BLOOD_GROUPS,
    MARITAL_STATUS,
    DOCUMENT_TYPES,
    US_STATES
} from "@/lib/validation/guard.types"
import { DialogTitle } from "@radix-ui/react-dialog"
import { GuardProfileData } from "@/app/types/guard"

interface GuardUpdateFormProps {
    trigger: ReactNode
    guardId: number
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

interface FormDataType {
    guard_code: string
    full_name: string
    phone: string
    employee_company_card_number: string
    gender: "male" | "female" | "other"
    country: string
    city: string
    state: string
    address: string
    zip_code: string
    joining_date: string
    email: string
    password: string
    driver_license: string
    date_of_birth: string
    license_expiry_date: string
    issuing_source: string
    guard_type_id: number | undefined
    contract_id: number | undefined
    is_active: boolean
    profile_data: ProfileDataInterface
}

interface ProfileDataInterface {
    marital_status: "single" | "married" | "divorced" | "widowed" | undefined
    has_work_permit: boolean
    has_security_training: boolean
    languages: string[]
    place_of_birth: string
    country_of_origin: string
    current_country: string
    current_city: string
    current_address: string
    current_state: string
    current_zip_code: string
    citizenship: string
    visa_countries: string[]
    visa_expiry_date: string
    father_name: string
    mother_name: string
    national_id_number: string
    height: string
    weight: string
    blood_group: string
    experience_years: number
    skills: string
    highest_education_level: string
    education_field: string
    institution_name: string
    graduation_year: number | undefined
    emergency_contact_name: string
    emergency_contact_phone: string
    emergency_contact_relation: string
    notes: string
}

export function GuardUpdateForm({
    trigger,
    guardId,
    isOpen,
    onOpenChange,
    onSuccess
}: GuardUpdateFormProps) {
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [existingProfileImage, setExistingProfileImage] = useState<string>("")
    const [documents, setDocuments] = useState<File[]>([])
    const [existingDocuments, setExistingDocuments] = useState<Array<{id: number, name: string, url: string}>>([])
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([])
    const [languages, setLanguages] = useState<string[]>([])
    const [currentLanguage, setCurrentLanguage] = useState("")
    const [visaCountries, setVisaCountries] = useState<string[]>([])
    const [currentVisaCountry, setCurrentVisaCountry] = useState("")
    const [step, setStep] = useState(1)
    const [hasLoadedData, setHasLoadedData] = useState(false)

    // Get guard types from Redux store
    const { guardTypes, isLoading: isLoadingGuardTypes } = useAppSelector((state) => state.guardTypes)

    // Fetch guard types when dialog opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchGuardTypes({
                per_page: 100,
            }))
        }
    }, [isOpen, dispatch])

    // Form state
    const [formData, setFormData] = useState<FormDataType>({
        guard_code: "",
        full_name: "",
        phone: "",
        employee_company_card_number: "",
        gender: "male",
        country: "United States",
        city: "",
        state: "",
        address: "",
        zip_code: "",
        joining_date: "",
        email: "",
        password: "",
        driver_license: "",
        date_of_birth: "",
        license_expiry_date: "",
        issuing_source: "",
        guard_type_id: undefined,
        contract_id: undefined,
        is_active: true,
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
            current_state: "",
            current_zip_code: "",
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
        }
    })

    // Handle field change
    const handleFieldChange = useCallback((field: string, value: string | number | boolean | string[] | undefined) => {
        setFormData(prev => {
            const fieldPath = field.split('.')
            if (fieldPath.length === 1) {
                return { ...prev, [field]: value }
            } else if (fieldPath.length === 2 && fieldPath[0] === 'profile_data') {
                return {
                    ...prev,
                    profile_data: {
                        ...prev.profile_data,
                        [fieldPath[1]]: value
                    }
                }
            }
            return prev
        })
    }, [])

    // Load guard data when dialog opens
    useEffect(() => {
        const loadGuardData = async () => {
            if (isOpen && guardId && !hasLoadedData) {
                setIsLoading(true)
                try {
                    const result = await dispatch(fetchGuard({ id: guardId }))
                    if (fetchGuard.fulfilled.match(result)) {
                        const guardData = result.payload

                        // Get profile (either from 'profile' or 'profile_data')
                        const profile = guardData.profile || guardData.profile_data || {}

                        // Populate form data
                        setFormData({
                            guard_code: guardData.guard_code || "",
                            full_name: guardData.full_name || "",
                            phone: guardData.phone || "",
                            employee_company_card_number: guardData.employee_company_card_number || "",
                            gender: guardData.gender || "male",
                            country: guardData.country || "United States",
                            city: guardData.city || "",
                            state: guardData.state || "",
                            address: guardData.address || "",
                            zip_code: guardData.zip_code || "",
                            joining_date: guardData.joining_date ? guardData.joining_date.split('T')[0] : "",
                            email: guardData.email || "",
                            password: "", // Password is never sent back from API
                            driver_license: guardData.driver_license || "",
                            date_of_birth: guardData.date_of_birth ? guardData.date_of_birth.split('T')[0] : "",
                            license_expiry_date: guardData.license_expiry_date ? guardData.license_expiry_date.split('T')[0] : "",
                            issuing_source: guardData.issuing_source || "",
                            guard_type_id: guardData.guard_type_id || undefined,
                            contract_id: guardData.contract_id || undefined,
                            is_active: guardData.is_active ?? true,
                            profile_data: {
                                marital_status: profile.marital_status || "single",
                                has_work_permit: profile.has_work_permit === true ,
                                has_security_training: profile.has_security_training === true ,
                                languages: profile.languages || [],
                                place_of_birth: profile.place_of_birth || "",
                                country_of_origin: profile.country_of_origin || "",
                                current_country: profile.current_country || "",
                                current_city: profile.current_city || "",
                                current_address: profile.current_address || "",
                                current_state: profile.current_state || "",
                                current_zip_code: profile.current_zip_code || "",
                                citizenship: profile.citizenship || "",
                                visa_countries: profile.visa_countries || [],
                                visa_expiry_date: profile.visa_expiry_date ? profile.visa_expiry_date.split('T')[0] : "",
                                father_name: profile.father_name || "",
                                mother_name: profile.mother_name || "",
                                national_id_number: profile.national_id_number || "",
                                height: profile.height || "",
                                weight: profile.weight || "",
                                blood_group: profile.blood_group || "",
                                experience_years: profile.experience_years || 0,
                                skills: profile.skills || "",
                                highest_education_level: profile.highest_education_level || "",
                                education_field: profile.education_field || "",
                                institution_name: profile.institution_name || "",
                                graduation_year: profile.graduation_year || undefined,
                                emergency_contact_name: profile.emergency_contact_name || "",
                                emergency_contact_phone: profile.emergency_contact_phone || "",
                                emergency_contact_relation: profile.emergency_contact_relation || "",
                                notes: profile.notes || "",
                            }
                        })

                        // Set languages state
                        if (profile.languages && profile.languages.length > 0) {
                            setLanguages(profile.languages)
                        }

                        // Set visa countries state
                        if (profile.visa_countries && profile.visa_countries.length > 0) {
                            setVisaCountries(profile.visa_countries)
                        }

                        // Set document types
                        if (guardData.document_types && guardData.document_types.length > 0) {
                            setSelectedDocumentTypes(guardData.document_types)
                        }

                        // Set existing profile image
                        // if (guardData.profile_image) {
                        //     const imageUrl = guardData.profile_image.startsWith('http')
                        //         ? guardData.profile_image
                        //         : `${process.env.NEXT_PUBLIC_API_URL || ''}${guardData.profile_image}`
                        //     setExistingProfileImage(imageUrl)
                        // }

                        // Set existing documents from profile.documents
                        if (profile.documents && profile.documents.length > 0) {
                            setExistingDocuments(profile.documents.map((doc: any) => ({
                                id: doc.id,
                                name: doc.file_name || doc.name,
                                url: doc.file_path
                            })))
                        }

                        setHasLoadedData(true)
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
    }, [isOpen, guardId, dispatch, hasLoadedData])

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
            guard_code: "",
            full_name: "",
            phone: "",
            employee_company_card_number: "",
            gender: "male",
            country: "United States",
            city: "",
            state: "",
            address: "",
            zip_code: "",
            joining_date: "",
            email: "",
            password: "",
            driver_license: "",
            date_of_birth: "",
            license_expiry_date: "",
            issuing_source: "",
            guard_type_id: undefined,
            contract_id: undefined,
            is_active: true,
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
                current_state: "",
                current_zip_code: "",
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
            }
        })
        setProfileImage(null)
        setExistingProfileImage("")
        setDocuments([])
        setExistingDocuments([])
        setSelectedDocumentTypes([])
        setLanguages([])
        setVisaCountries([])
        setCurrentLanguage("")
        setCurrentVisaCountry("")
        setStep(1)
        setHasLoadedData(false)
    }, [])

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
            // Clear existing image when new one is uploaded
            setExistingProfileImage("")
        }
    }, [])

    const handleDocumentUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const validFiles = files.filter(file => {
            const validTypes = [
                'application/pdf',
                'image/jpeg',
                'image/jpg',
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
    }, [])

    const removeDocument = useCallback((index: number, isExisting: boolean = false, existingId?: number) => {
        if (isExisting && existingId) {
            setExistingDocuments(prev => prev.filter(doc => doc.id !== existingId))
        } else {
            setDocuments(prev => prev.filter((_, i) => i !== index))
        }
    }, [])

    // Handle document type selection
    const handleDocumentTypeChange = useCallback((docType: string) => {
        const newSelectedTypes = selectedDocumentTypes.includes(docType)
            ? selectedDocumentTypes.filter(type => type !== docType)
            : [...selectedDocumentTypes, docType]

        setSelectedDocumentTypes(newSelectedTypes)
    }, [selectedDocumentTypes])

    // Language handlers
    const addLanguage = useCallback(() => {
        if (currentLanguage.trim() && !languages.includes(currentLanguage.trim())) {
            const updatedLanguages = [...languages, currentLanguage.trim()]
            setLanguages(updatedLanguages)
            handleFieldChange('profile_data.languages', updatedLanguages)
            setCurrentLanguage("")
        }
    }, [currentLanguage, languages, handleFieldChange])

    const removeLanguage = useCallback((language: string) => {
        const updatedLanguages = languages.filter(l => l !== language)
        setLanguages(updatedLanguages)
        handleFieldChange('profile_data.languages', updatedLanguages)
    }, [languages, handleFieldChange])

    // Visa country handlers
    const addVisaCountry = useCallback(() => {
        if (currentVisaCountry.trim() && !visaCountries.includes(currentVisaCountry.trim())) {
            const updatedVisaCountries = [...visaCountries, currentVisaCountry.trim()]
            setVisaCountries(updatedVisaCountries)
            handleFieldChange('profile_data.visa_countries', updatedVisaCountries)
            setCurrentVisaCountry("")
        }
    }, [currentVisaCountry, visaCountries, handleFieldChange])

    const removeVisaCountry = useCallback((country: string) => {
        const updatedVisaCountries = visaCountries.filter(c => c !== country)
        setVisaCountries(updatedVisaCountries)
        handleFieldChange('profile_data.visa_countries', updatedVisaCountries)
    }, [visaCountries, handleFieldChange])

    const handleKeyDown = useCallback((e: React.KeyboardEvent, type: 'language' | 'visaCountry') => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (type === 'language') {
                addLanguage()
            } else {
                addVisaCountry()
            }
        }
    }, [addLanguage, addVisaCountry])

    // Prepare profile data for submission
    const prepareProfileData = (data: ProfileDataInterface): Partial<GuardProfileData> => {
        const profileData: Partial<GuardProfileData> = {}

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' &&
                !(Array.isArray(value) && value.length === 0)) {
                if (key === 'has_work_permit' || key === 'has_security_training') {
                     (profileData as any)[key] = value ? 1 : 0
                } else {
                    (profileData as any)[key] = value
                }
            }
        })

        return profileData
    }

    // Submit handler
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const submitFormData = new FormData()

            // Add method override for Laravel
            submitFormData.append('_method', 'PUT')

            // Required fields
            const requiredFields: Record<string, string> = {
                guard_code: formData.guard_code,
                full_name: formData.full_name,
                phone: formData.phone,
                employee_company_card_number: formData.employee_company_card_number,
                gender: formData.gender,
                country: formData.country,
                city: formData.city,
                state: formData.state,
                address: formData.address,
                zip_code: formData.zip_code,
                joining_date: formData.joining_date,
                is_active: formData.is_active ? '1' : '0'
            }

            Object.entries(requiredFields).forEach(([key, value]) => {
                if (value) submitFormData.append(key, value)
            })

            // Optional fields (only include if changed or provided)
            if (formData.email) submitFormData.append('email', formData.email)
            if (formData.password && formData.password.trim() !== '') submitFormData.append('password', formData.password)
            if (formData.driver_license) submitFormData.append('driver_license', formData.driver_license)
            if (formData.date_of_birth) submitFormData.append('date_of_birth', formData.date_of_birth)
            if (formData.license_expiry_date) submitFormData.append('license_expiry_date', formData.license_expiry_date)
            if (formData.issuing_source) submitFormData.append('issuing_source', formData.issuing_source)

            // Numeric fields
            if (formData.guard_type_id) {
                submitFormData.append('guard_type_id', formData.guard_type_id.toString())
            }
            if (formData.contract_id) {
                submitFormData.append('contract_id', formData.contract_id.toString())
            }

            // Profile data
            const profileData = prepareProfileData(formData.profile_data)
            if (Object.keys(profileData).length > 0) {
                submitFormData.append('profile_data', JSON.stringify(profileData))
            }

            // Document types
            if (selectedDocumentTypes.length > 0) {
                submitFormData.append('document_types', JSON.stringify(selectedDocumentTypes))
            }

            // Files
            if (profileImage) {
                submitFormData.append('profile_image', profileImage)
            } else if (existingProfileImage && !profileImage) {
                // Keep existing image - don't send anything
                submitFormData.append('keep_profile_image', '1')
            }

            // New documents
            if (documents.length > 0) {
                documents.forEach((doc) => {
                    submitFormData.append('documents[]', doc)
                })
            }

            // Dispatch update action
            const result = await dispatch(updateGuard({ id: guardId, data: submitFormData }))

            if (updateGuard.fulfilled.match(result)) {
                await SweetAlertService.success(
                    'Guard Updated Successfully',
                    `${formData.full_name} has been updated.`,
                    { timer: 2000, showConfirmButton: false }
                )

                resetForm()
                onSuccess?.()
                handleDialogClose(false)

                await dispatch(fetchGuards({
                    page: 1,
                    per_page: 10,
                    sort_by: 'updated_at',
                    sort_order: 'desc'
                }))
            } else {
                const errorMessage = (result.payload as string) || 'Failed to update guard'
                throw new Error(errorMessage)
            }
        } catch (error) {
            await SweetAlertService.error(
                'Update Failed',
                error instanceof Error ? error.message : 'There was an error updating the guard. Please try again.'
            )
            console.error('Error updating guard:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = useCallback(() => {
        setStep(step + 1)
    }, [step])

    const prevStep = useCallback(() => {
        setStep(step - 1)
    }, [step])

    const getCurrentDate = useCallback((): string => {
        return new Date().toISOString().split('T')[0]
    }, [])

    const getMinDate = useCallback((): string => {
        const minDate = new Date()
        minDate.setFullYear(minDate.getFullYear() - 100)
        return minDate.toISOString().split('T')[0]
    }, [])

    const copyGuardCode = useCallback(() => {
        navigator.clipboard.writeText(formData.guard_code)
        SweetAlertService.success(
            "Copied!",
            "Guard code copied to clipboard.",
            { timer: 1500, showConfirmButton: false }
        )
    }, [formData.guard_code])

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                <DialogTitle className="sr-only">Update Guard</DialogTitle>

                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6">
                    <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                    <span className="whitespace-nowrap">Update Security Officer</span>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            <User size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            <Briefcase size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            <FileText size={20} />
                        </div>
                    </div>
                </div>

                <form onSubmit={onSubmit}>
                    {/* Step 1: Basic Information */}
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
                                            Officer ID
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Officer code cannot be changed
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={formData.guard_code}
                                            readOnly
                                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-lg font-bold text-center"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={copyGuardCode}
                                            className="h-9"
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* First Row - Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <FloatingLabelInput
                                        label="Full Name"
                                        value={formData.full_name}
                                        onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        type="tel"
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Email"
                                        value={formData.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        type="email"
                                    />
                                </div>

                                <div>
                                    <FloatingLabelSelect
                                        label="Gender"
                                        value={formData.gender}
                                        onChange={(e) => handleFieldChange('gender', e.target.value as "male" | "female" | "other")}
                                    >
                                        <option value="">Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </FloatingLabelSelect>
                                </div>
                            </div>

                            {/* Second Row - Card & License Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <FloatingLabelInput
                                        label="Security Officer Card Number"
                                        value={formData.employee_company_card_number}
                                        onChange={(e) => handleFieldChange('employee_company_card_number', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Driver's License"
                                        value={formData.driver_license}
                                        onChange={(e) => handleFieldChange('driver_license', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Date of Birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
                                        max={getCurrentDate()}
                                        min={getMinDate()}
                                    />
                                </div>
                            </div>

                            {/* Third Row - Address Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
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
                                        label="State"
                                        value={formData.state}
                                        onChange={(e) => handleFieldChange('state', e.target.value)}
                                    >
                                        <option value="">Select State</option>
                                        {US_STATES.map(state => (
                                            <option key={state} value={state}>
                                                {state}
                                            </option>
                                        ))}
                                    </FloatingLabelSelect>
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
                                        label="ZIP Code"
                                        value={formData.zip_code}
                                        onChange={(e) => handleFieldChange('zip_code', e.target.value)}
                                        placeholder="12345 or 12345-6789"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Officer Information */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Briefcase size={20} />
                                Officer Information
                            </h3>

                            {/* First Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <FloatingLabelInput
                                        label="Start Date"
                                        type="date"
                                        value={formData.joining_date}
                                        onChange={(e) => handleFieldChange('joining_date', e.target.value)}
                                        max={getCurrentDate()}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="License Expiration Date"
                                        type="date"
                                        value={formData.license_expiry_date}
                                        onChange={(e) => handleFieldChange('license_expiry_date', e.target.value)}
                                        min={getCurrentDate()}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelSelect
                                        label="Issuing Authority"
                                        value={formData.issuing_source}
                                        onChange={(e) => handleFieldChange('issuing_source', e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        <optgroup label="USA States">
                                            {US_STATES.map(state => (
                                                <option key={state} value={state.toLowerCase().replace(/\s+/g, "_")}>
                                                    {state}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </FloatingLabelSelect>
                                </div>

                                <div>
                                    <FloatingLabelSelect
                                        label="Officer Classification"
                                        value={formData.guard_type_id?.toString() || ''}
                                        onChange={(e) => handleFieldChange('guard_type_id', e.target.value ? parseInt(e.target.value) : undefined)}
                                    >
                                        <option value="">Select Security Officer Type</option>
                                        {isLoadingGuardTypes ? (
                                            <option value="" disabled>Loading officer types...</option>
                                        ) : guardTypes.length > 0 ? (
                                            guardTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No officer types available</option>
                                        )}
                                    </FloatingLabelSelect>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <FloatingLabelInput
                                    label="System Access Password (leave empty to keep current)"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleFieldChange('password', e.target.value)}
                                    placeholder="Min. 6 characters"
                                />
                            </div>

                            {/* Profile Data Section */}
                            <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                                <h4 className="font-semibold mb-4">Profile Details</h4>

                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <FloatingLabelSelect
                                            label="Country of Citizenship"
                                            value={formData.profile_data.country_of_origin}
                                            onChange={(e) => handleFieldChange('profile_data.country_of_origin', e.target.value)}
                                        >
                                            <option value="">Select...</option>
                                            {COUNTRIES.map(country => (
                                                <option key={country.code} value={country.name}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </FloatingLabelSelect>
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Social Security Number"
                                            value={formData.profile_data.national_id_number}
                                            onChange={(e) => handleFieldChange('profile_data.national_id_number', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Current Location */}
                                <div className="mb-6">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Address</h5>
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                        <div className="lg:col-span-4">
                                            <FloatingLabelInput
                                                label="Current Address"
                                                value={formData.profile_data.current_address}
                                                onChange={(e) => handleFieldChange('profile_data.current_address', e.target.value)}
                                            />
                                        </div>

                                        <div className="lg:col-span-2">
                                            <FloatingLabelInput
                                                label="Current City"
                                                value={formData.profile_data.current_city}
                                                onChange={(e) => handleFieldChange('profile_data.current_city', e.target.value)}
                                            />
                                        </div>

                                        <div className="lg:col-span-2">
                                            <FloatingLabelSelect
                                                label="Current State"
                                                value={formData.profile_data.current_state}
                                                onChange={(e) => handleFieldChange('profile_data.current_state', e.target.value)}
                                            >
                                                <option value="">Select State</option>
                                                {US_STATES.map(state => (
                                                    <option key={state} value={state}>
                                                        {state}
                                                    </option>
                                                ))}
                                            </FloatingLabelSelect>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <FloatingLabelSelect
                                                label="Current Country"
                                                value={formData.profile_data.current_country}
                                                onChange={(e) => handleFieldChange('profile_data.current_country', e.target.value)}
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
                                                label="Current ZIP Code"
                                                value={formData.profile_data.current_zip_code}
                                                onChange={(e) => handleFieldChange('profile_data.current_zip_code', e.target.value)}
                                                placeholder="12345 or 12345-6789"
                                            />
                                        </div>
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
                                    <label className="block text-sm font-medium mb-2">Work Authorization Countries</label>
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

                                    <div className="mt-4">
                                        <FloatingLabelInput
                                            label="Visa Expiry Date"
                                            type="date"
                                            value={formData.profile_data.visa_expiry_date}
                                            onChange={(e) => handleFieldChange('profile_data.visa_expiry_date', e.target.value)}
                                            min={getCurrentDate()}
                                        />
                                    </div>
                                </div>

                                {/* Education Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <FloatingLabelSelect
                                            label="Highest Education"
                                            value={formData.profile_data.highest_education_level}
                                            onChange={(e) => handleFieldChange('profile_data.highest_education_level', e.target.value)}
                                        >
                                            <option value="">Select...</option>
                                            <option value="high_school">High School</option>
                                            <option value="diploma">Diploma</option>
                                            <option value="associate">Associate Degree</option>
                                            <option value="bachelor">Bachelor Degree</option>
                                            <option value="master">Master Degree</option>
                                            <option value="phd">PhD</option>
                                        </FloatingLabelSelect>
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Education Field"
                                            value={formData.profile_data.education_field}
                                            onChange={(e) => handleFieldChange('profile_data.education_field', e.target.value)}
                                            placeholder="e.g., Criminal Justice"
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Institution Name"
                                            value={formData.profile_data.institution_name}
                                            onChange={(e) => handleFieldChange('profile_data.institution_name', e.target.value)}
                                            placeholder="e.g., University Name"
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Graduation Year"
                                            type="number"
                                            value={formData.profile_data.graduation_year?.toString() || ''}
                                            onChange={(e) => handleFieldChange('profile_data.graduation_year', e.target.value ? parseInt(e.target.value) : undefined)}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            placeholder="YYYY"
                                        />
                                    </div>
                                </div>

                                {/* Experience and Skills */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <FloatingLabelInput
                                            label="Experience (years)"
                                            type="number"
                                            min="0"
                                            value={formData.profile_data.experience_years?.toString() || ''}
                                            onChange={(e) => handleFieldChange('profile_data.experience_years', e.target.value ? parseInt(e.target.value) : 0)}
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            label="Skills"
                                            value={formData.profile_data.skills}
                                            onChange={(e) => handleFieldChange('profile_data.skills', e.target.value)}
                                            placeholder="e.g., First Aid, Surveillance, Combat"
                                        />
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="flex gap-6 mb-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.profile_data.has_work_permit}
                                            onChange={(e) => handleFieldChange('profile_data.has_work_permit', e.target.checked)}
                                            className="rounded"
                                        />
                                        <span>Has Work Permit</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.profile_data.has_security_training}
                                            onChange={(e) => handleFieldChange('profile_data.has_security_training', e.target.checked)}
                                            className="rounded"
                                        />
                                        <span>Security Certification</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Documents & Final Details */}
                    {step === 3 && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText size={20} />
                                Documents & Final Details
                            </h3>

                            {/* Required Documents */}
                            <div>
                                <label className="block text-sm font-medium mb-4">Required Documents</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {DOCUMENT_TYPES.map((docType) => {
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
                                                        {/* Existing Document */}
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

                                                        {/* New Document Upload */}
                                                        {newDocumentIndex === -1 ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="file"
                                                                    id={`file-${docType.id}`}
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            // Create a new File with document type in name
                                                                            const documentWithType = new File(
                                                                                [file],
                                                                                `${docType.id}-${file.name}`,
                                                                                { type: file.type }
                                                                            );
                                                                            setDocuments(prev => [...prev, documentWithType]);
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

                            {/* Profile Photo and Emergency Contact */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Profile Photo */}
                                <div className="border-2 border-dashed rounded-xl p-6">
                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                        <User size={18} className="text-blue-500" />
                                        Profile Photo
                                    </h4>
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
                                                <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all dark:bg-gray-800 dark:border-gray-600">
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
                                                                Upload Photo
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
                                                className="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center gap-1 px-3 py-1 rounded-full hover:bg-red-50 transition-all"
                                            >
                                                <X size={14} /> Remove Photo
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-500 mt-3 text-center">
                                            JPG, PNG, GIF. Max 5MB. Square image recommended.
                                        </p>
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="bg-yellow-50 dark:bg-gray-800 rounded-xl p-6">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Briefcase size={18} className="text-yellow-600" />
                                        Emergency Contact
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <FloatingLabelInput
                                                label="Contact Name"
                                                value={formData.profile_data.emergency_contact_name}
                                                onChange={(e) => handleFieldChange('profile_data.emergency_contact_name', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <FloatingLabelInput
                                                label="Contact Phone"
                                                value={formData.profile_data.emergency_contact_phone}
                                                onChange={(e) => handleFieldChange('profile_data.emergency_contact_phone', e.target.value)}
                                                type="tel"
                                            />
                                        </div>

                                        <div>
                                            <FloatingLabelInput
                                                label="Relationship"
                                                value={formData.profile_data.emergency_contact_relation}
                                                onChange={(e) => handleFieldChange('profile_data.emergency_contact_relation', e.target.value)}
                                                placeholder="e.g., Spouse, Parent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes and Status */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Additional Notes</label>
                                    <Textarea
                                        value={formData.profile_data.notes}
                                        onChange={(e) => handleFieldChange('profile_data.notes', e.target.value)}
                                        placeholder="Any additional information about the guard..."
                                        className="w-full h-32 resize-none dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>

                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium mb-2">Security Officer Status</label>
                                    <div className="border rounded-xl p-6 h-32 flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                                                className="rounded w-5 h-5 text-blue-600"
                                            />
                                            <span className="text-base text-gray-700 dark:text-gray-300">
                                                Active Officer
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
                                        {(documents.length > 0) && (
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
                                        {/* Existing Documents */}
                                        {existingDocuments.map((doc, index) => (
                                            <div
                                                key={`existing-${doc.id}`}
                                                className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center justify-between group hover:shadow-md transition-all border border-green-200"
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

                                        {/* New Documents */}
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

                        {step < 3 ? (
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
                                        'Update Security Officer'
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
