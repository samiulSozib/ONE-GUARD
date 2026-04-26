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
import { createGuard, fetchGuards } from "@/store/slices/guardSlice"
import { fetchGuardTypes } from "@/store/slices/guardTypeSlice"
import SweetAlertService from "@/lib/sweetAlert"
import {
    COUNTRIES,
    BLOOD_GROUPS,
    MARITAL_STATUS,
    DOCUMENT_TYPES,
    US_STATES
} from "@/lib/validation/guard.types"
import { GuardProfileData } from "@/app/types/guard"

// US ZIP code validation regex
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/

// Validation error interface
interface ValidationErrors {
    [key: string]: string
}

interface GuardCreateFormProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

// Define form data interface without 'any'
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

export function GuardCreateForm({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess,
}: GuardCreateFormProps) {
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [documents, setDocuments] = useState<File[]>([])
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([])
    const [languages, setLanguages] = useState<string[]>([])
    const [currentLanguage, setCurrentLanguage] = useState("")
    const [visaCountries, setVisaCountries] = useState<string[]>([])
    const [currentVisaCountry, setCurrentVisaCountry] = useState("")
    const [step, setStep] = useState(1)
    const [guardCode, setGuardCode] = useState<string>("")
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [touched, setTouched] = useState<Set<string>>(new Set())
    const [showAllErrors, setShowAllErrors] = useState(false)
    const [hasFetchedTypes, setHasFetchedTypes] = useState(false)
    const guardCodeRef = useRef<HTMLInputElement>(null)

        // Get officer types from Redux store
    const { guardTypes, isLoading: isLoadingGuardTypes } = useAppSelector((state) => state.guardTypes)

    // Fetch officer types when dialog opens
    useEffect(() => {
        dispatch(fetchGuardTypes({
            per_page: 100,
        }))
    }, [dispatch])

    // Form state
    const [formData, setFormData] = useState<FormDataType>({
        // Required fields
        guard_code: "",
        full_name: "",
        phone: "",
        employee_company_card_number: "",
        gender: "male",
        country: "United States", // Default to USA
        city: "",
        state: "",
        address: "",
        zip_code: "",
        joining_date: "",

        // Optional fields
        email: "",
        password: "",
        driver_license: "",
        date_of_birth: "",
        license_expiry_date: "",
        issuing_source: "",

        // Numbers
        guard_type_id: undefined,
        contract_id: undefined, // Commented out - kept but unused

        // Status
        is_active: true,

        // Profile data
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






    // Generate random guard code
    const generateRandomGuardCode = useCallback((): string => {
        const year = new Date().getFullYear()
        const randomNum = Math.floor(Math.random() * 9000) + 1000 // 4-digit random number
        return `GD-${year}-${randomNum}`
    }, [])

    // Initialize guard code when dialog opens
    useEffect(() => {
        if (isOpen) {
            const newCode = generateRandomGuardCode()
            setGuardCode(newCode)
            setFormData(prev => ({ ...prev, guard_code: newCode, country: "United States" }))
            // Reset errors when dialog opens
            setErrors({})
            setTouched(new Set())
            setShowAllErrors(false)
            setStep(1)
        }
    }, [isOpen, generateRandomGuardCode])

    // Reset form after successful submission
    const resetFormAfterSubmit = useCallback(() => {
        const newCode = generateRandomGuardCode()
        setGuardCode(newCode)
        setFormData({
            guard_code: newCode,
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
        setDocuments([])
        setSelectedDocumentTypes([])
        setLanguages([])
        setVisaCountries([])
        setCurrentLanguage("")
        setCurrentVisaCountry("")
        setStep(1)
        setErrors({})
        setTouched(new Set())
        setShowAllErrors(false)
    }, [generateRandomGuardCode])

    // Validation functions
    const validateRequired = (value: string | undefined, fieldName: string): string => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return `${fieldName} is required`
        }
        return ''
    }

    const validateEmail = (email: string): string => {
        if (!email) return ''
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return 'Invalid email address'
        }
        return ''
    }

    const validatePassword = (password: string): string => {
        if (!password) return ''
        if (password.length < 6) {
            return 'Password must be at least 6 characters'
        }
        return ''
    }

    const validatePhone = (phone: string): string => {
        if (!phone) return 'Phone number is required'
        const phoneRegex = /^\+?[\d\s-]{10,}$/
        if (!phoneRegex.test(phone)) {
            return 'Phone number must be at least 10 digits'
        }
        return ''
    }

    const validateFullName = (name: string): string => {
        if (!name) return 'Full name is required'
        if (name.length < 2) return 'Full name must be at least 2 characters'
        if (name.length > 100) return 'Full name must not exceed 100 characters'
        return ''
    }

    const validateZipCode = (zipCode: string, isRequired: boolean = false): string => {
        if (!zipCode) {
            return isRequired ? 'ZIP code is required' : ''
        }
        if (!US_ZIP_REGEX.test(zipCode)) {
            return 'Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)'
        }
        return ''
    }

    const validateDate = (date: string, fieldName: string): string => {
        if (!date) return `${fieldName} is required`
        if (isNaN(Date.parse(date))) {
            return `Invalid ${fieldName.toLowerCase()}`
        }
        return ''
    }

    const validateNumber = (value: number | undefined, fieldName: string, min?: number, max?: number): string => {
        if (value === undefined || value === null) return ''
        if (min !== undefined && value < min) return `${fieldName} must be at least ${min}`
        if (max !== undefined && value > max) return `${fieldName} must not exceed ${max}`
        return ''
    }

    // Validate current step and mark all fields as touched
    const validateStep = useCallback(async (stepNumber: number, markAllTouched: boolean = true): Promise<boolean> => {
        const newErrors: ValidationErrors = {}

        if (stepNumber === 1) {
            // Basic Information validation
            const fullNameError = validateFullName(formData.full_name)
            if (fullNameError) newErrors.full_name = fullNameError

            const phoneError = validatePhone(formData.phone)
            if (phoneError) newErrors.phone = phoneError

            const emailError = validateEmail(formData.email)
            if (emailError) newErrors.email = emailError

            const employeeCardError = validateRequired(formData.employee_company_card_number, 'Security Officer Card Number')
            if (employeeCardError) newErrors.employee_company_card_number = employeeCardError

            const addressError = validateRequired(formData.address, 'Address')
            if (addressError) newErrors.address = addressError

            const cityError = validateRequired(formData.city, 'City')
            if (cityError) newErrors.city = cityError

            const stateError = validateRequired(formData.state, 'State')
            if (stateError) newErrors.state = stateError

            const countryError = validateRequired(formData.country, 'Country')
            if (countryError) newErrors.country = countryError

            const zipCodeError = validateZipCode(formData.zip_code, true)
            if (zipCodeError) newErrors.zip_code = zipCodeError

            if (!formData.gender) {
                newErrors.gender = 'Gender is required'
            }
        } else if (stepNumber === 2) {
            // Officer Information validation
            const joiningDateError = validateDate(formData.joining_date, 'Start Date')
            if (joiningDateError) newErrors.joining_date = joiningDateError

            // Validate current address ZIP code if any current address field is filled
            const hasCurrentAddress = formData.profile_data.current_address ||
                formData.profile_data.current_city ||
                formData.profile_data.current_state ||
                formData.profile_data.current_country

            if (hasCurrentAddress && formData.profile_data.current_zip_code) {
                const currentZipError = validateZipCode(formData.profile_data.current_zip_code, false)
                if (currentZipError) newErrors.current_zip_code = currentZipError
            }

            // Validate password if provided
            const passwordError = validatePassword(formData.password)
            if (passwordError) newErrors.password = passwordError

            // Validate graduation year if provided
            if (formData.profile_data.graduation_year) {
                const gradYearError = validateNumber(formData.profile_data.graduation_year, 'Graduation Year', 1900, new Date().getFullYear())
                if (gradYearError) newErrors.graduation_year = gradYearError
            }

            // Validate experience years if provided
            if (formData.profile_data.experience_years && formData.profile_data.experience_years < 0) {
                newErrors.experience_years = 'Experience years cannot be negative'
            }
        } else if (stepNumber === 3) {
            // Documents validation - check if selected document types have files
            const missingDocuments = selectedDocumentTypes.filter(docType => {
                const hasFile = documents.some(doc => doc.name.includes(docType))
                return !hasFile
            })

            if (missingDocuments.length > 0) {
                newErrors.documents = `Please upload the following required documents: ${missingDocuments.join(', ')}`
            }

            // Validate emergency contact phone if name is provided
            if (formData.profile_data.emergency_contact_name && !formData.profile_data.emergency_contact_phone) {
                newErrors.emergency_contact_phone = 'Emergency contact phone is required when contact name is provided'
            }

            if (formData.profile_data.emergency_contact_phone && !formData.profile_data.emergency_contact_name) {
                newErrors.emergency_contact_name = 'Emergency contact name is required when phone is provided'
            }
        }

        setErrors(newErrors)

        // Mark all fields as touched to show errors
        if (markAllTouched) {
            const allFields = new Set<string>()

            if (stepNumber === 1) {
                allFields.add('full_name')
                allFields.add('phone')
                allFields.add('email')
                allFields.add('employee_company_card_number')
                allFields.add('address')
                allFields.add('city')
                allFields.add('state')
                allFields.add('country')
                allFields.add('zip_code')
                allFields.add('gender')
            } else if (stepNumber === 2) {
                allFields.add('joining_date')
                allFields.add('password')
                allFields.add('graduation_year')
                allFields.add('experience_years')
                allFields.add('current_zip_code')
            } else if (stepNumber === 3) {
                allFields.add('documents')
                allFields.add('emergency_contact_name')
                allFields.add('emergency_contact_phone')
            }

            setTouched(prev => {
                const newSet = new Set(prev)
                allFields.forEach(field => newSet.add(field))
                return newSet
            })
        }

        return Object.keys(newErrors).length === 0
    }, [formData, selectedDocumentTypes, documents])

    // Handle field change with proper typing
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

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }

        // Mark field as touched
        setTouched(prev => new Set(prev).add(field))
    }, [errors])

    // Handle dialog close
    const handleDialogClose = useCallback((open: boolean) => {
        if (!open && !isSubmitting) {
            resetFormAfterSubmit()
        }
        onOpenChange?.(open)
    }, [onOpenChange, isSubmitting, resetFormAfterSubmit])

    // Copy guard code
    const copyGuardCode = useCallback(() => {
        if (guardCodeRef.current) {
            guardCodeRef.current.select()
            navigator.clipboard.writeText(guardCode)
            SweetAlertService.success(
                "Copied!",
                "Officer code copied to clipboard.",
                { timer: 1500, showConfirmButton: false }
            )
        }
    }, [guardCode])

    // Regenerate guard code
    const regenerateGuardCode = useCallback(() => {
        const newCode = generateRandomGuardCode()
        setGuardCode(newCode)
        handleFieldChange('guard_code', newCode)
        SweetAlertService.info(
            "Code Regenerated",
            "New officer code has been generated.",
            { timer: 1500, showConfirmButton: false }
        )
    }, [generateRandomGuardCode, handleFieldChange])

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
            SweetAlertService.error(
                'Invalid File Type',
                'Please upload PDF, JPG, PNG, or DOC files only'
            )
            return false
        }

        if (file.size > 10 * 1024 * 1024) {
            SweetAlertService.error(
                'File Too Large',
                'Please upload a file smaller than 10MB'
            )
            return false
        }

        const documentWithType = new File(
            [file],
            `${docTypeId}-${file.name}`,
            { type: file.type }
        )
        setDocuments(prev => [...prev, documentWithType])

        // Clear document error if all selected types now have files
        const missingDocuments = selectedDocumentTypes.filter(docType => {
            const hasFile = [...documents, documentWithType].some(doc => doc.name.includes(docType))
            return !hasFile
        })

        if (missingDocuments.length === 0 && errors.documents) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.documents
                return newErrors
            })
        }

        return true
    }, [selectedDocumentTypes, documents, errors])

    const removeDocument = useCallback((index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index))

        // Re-check document errors after removal
        setTimeout(() => {
            const missingDocuments = selectedDocumentTypes.filter(docType => {
                const hasFile = documents.some((doc, i) => i !== index && doc.name.includes(docType))
                return !hasFile
            })

            if (missingDocuments.length > 0) {
                setErrors(prev => ({
                    ...prev,
                    documents: `Please upload the following required documents: ${missingDocuments.join(', ')}`
                }))
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.documents
                    return newErrors
                })
            }
        }, 0)
    }, [selectedDocumentTypes, documents])

    // Handle document type selection
    const handleDocumentTypeChange = useCallback((docType: string) => {
        const newSelectedTypes = selectedDocumentTypes.includes(docType)
            ? selectedDocumentTypes.filter(type => type !== docType)
            : [...selectedDocumentTypes, docType]

        setSelectedDocumentTypes(newSelectedTypes)

        // Clear document error if all selected types have files
        const missingDocuments = newSelectedTypes.filter(docType => {
            const hasFile = documents.some(doc => doc.name.includes(docType))
            return !hasFile
        })

        if (missingDocuments.length === 0 && errors.documents) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.documents
                return newErrors
            })
        }
    }, [selectedDocumentTypes, documents, errors])

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
                if (
                    value !== undefined &&
                    value !== null &&
                    value !== '' &&
                    !(Array.isArray(value) && value.length === 0)
                ) {
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

        // Show all errors by marking all fields as touched
        setShowAllErrors(true)

        // Validate all steps before submission with marking all fields as touched
        const isStep1Valid = await validateStep(1, true)
        const isStep2Valid = await validateStep(2, true)
        const isStep3Valid = await validateStep(3, true)

        if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
            // Find first step with errors and navigate to it
            if (!isStep1Valid) setStep(1)
            else if (!isStep2Valid) setStep(2)
            else if (!isStep3Valid) setStep(3)

            SweetAlertService.warning(
                'Incomplete Information',
                'Please fill in all required fields correctly before submitting.'
            )
            return
        }

        setIsSubmitting(true)

        try {
            const submitFormData = new FormData()

            // Append required fields (contract_id is commented out)
            const requiredFields: Record<string, string> = {
                guard_code: guardCode,
                full_name: formData.full_name,
                phone: formData.phone,
                employee_company_card_number: formData.employee_company_card_number,
                gender: formData.gender,
                country: formData.country,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code,
                joining_date: formData.joining_date,
                is_active: formData.is_active ? '1' : '0'
            }

            Object.entries(requiredFields).forEach(([key, value]) => {
                if (value) submitFormData.append(key, value)
            })

            // Append optional fields
            const optionalFields: Record<string, string | undefined> = {
                email: formData.email,
                password: formData.password,
                driver_license: formData.driver_license,
                date_of_birth: formData.date_of_birth,
                license_expiry_date: formData.license_expiry_date,
                issuing_source: formData.issuing_source
            }

            Object.entries(optionalFields).forEach(([key, value]) => {
                if (value && value.toString().trim() !== '') {
                    submitFormData.append(key, value)
                }
            })

            // Append numeric fields (contract_id is commented out)
            if (formData.guard_type_id) {
                submitFormData.append('guard_type_id', formData.guard_type_id.toString())
            }
            // contract_id is commented out - not sent to backend
            // if (formData.contract_id) {
            //     submitFormData.append('contract_id', formData.contract_id.toString())
            // }

            // Append profile data
            const profileData = prepareProfileData(formData.profile_data)
            if (Object.keys(profileData).length > 0) {
                submitFormData.append('profile_data', JSON.stringify(profileData))
            }

            // Append document types
            if (selectedDocumentTypes.length > 0) {
                submitFormData.append('document_types', JSON.stringify(selectedDocumentTypes))
            }

            // Append files
            if (profileImage) {
                submitFormData.append('profile_image', profileImage)
            }

            if (documents.length > 0) {
                documents.forEach((doc) => {
                    submitFormData.append('documents[]', doc)
                })
            }

            // Dispatch create guard action
            const result = await dispatch(createGuard(submitFormData))

            if (createGuard.fulfilled.match(result)) {
                await SweetAlertService.success(
                    'Security Officer Created Successfully',
                    `${formData.full_name} has been created with code: ${guardCode}`,
                    { timer: 2000, showConfirmButton: false }
                )

                // Reset form and generate new code for next entry
                resetFormAfterSubmit()
                onSuccess?.()

                // Refresh guard list
                await dispatch(fetchGuards({
                    page: 1,
                    per_page: 10,
                    sort_by: 'created_at',
                    sort_order: 'desc'
                }))
            } else {
                const errorMessage = (result.payload as string) || 'Failed to create guard'
                throw new Error(errorMessage)
            }
        } catch (error) {
            await SweetAlertService.error(
                'Creation Failed',
                error instanceof Error ? error.message : 'There was an error creating the guard. Please try again.'
            )
            console.error('Error creating guard:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = useCallback(async () => {
        // Show errors and validate current step, marking all fields as touched
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

    const getMinDate = useCallback((): string => {
        const minDate = new Date()
        minDate.setFullYear(minDate.getFullYear() - 100)
        return minDate.toISOString().split('T')[0]
    }, [])

    // Helper function to check if field should show error
    const shouldShowError = useCallback((fieldName: string): boolean => {
        return showAllErrors || touched.has(fieldName)
    }, [showAllErrors, touched])

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1200px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-6">
                    <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                    <span className="whitespace-nowrap">Add Security Officer</span>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            <User size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            <Briefcase size={20} />
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
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
                                            Randomly generated unique ID
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input
                                                ref={guardCodeRef}
                                                type="text"
                                                value={guardCode}
                                                readOnly
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-lg font-bold text-center"
                                            />
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={copyGuardCode}
                                                className="h-9"
                                            >
                                                <Copy size={16} />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={regenerateGuardCode}
                                                className="h-9"
                                            >
                                                Regenerate
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* First Row - Personal Info */}
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
                                        label="Phone Number *"
                                        value={formData.phone}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        type="tel"
                                        error={shouldShowError('phone') ? errors.phone : undefined}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Email"
                                        value={formData.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        type="email"
                                        error={shouldShowError('email') ? errors.email : undefined}
                                    />
                                </div>

                                <div>
                                    <FloatingLabelSelect
                                        label="Gender *"
                                        value={formData.gender}
                                        onChange={(e) => handleFieldChange('gender', e.target.value as "male" | "female" | "other")}
                                        error={shouldShowError('gender') ? errors.gender : undefined}
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
                                        label="Security Officer Card Number *"
                                        value={formData.employee_company_card_number}
                                        onChange={(e) => handleFieldChange('employee_company_card_number', e.target.value)}
                                        error={shouldShowError('employee_company_card_number') ? errors.employee_company_card_number : undefined}
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

                                {/* Contract Number Section - Commented Out */}
                                {/* <div>
                                    <FloatingLabelInput
                                        label="Contract Number"
                                        type="number"
                                        value={formData.contract_id?.toString() || ''}
                                        onChange={(e) => handleFieldChange('contract_id', e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                </div> */}
                            </div>

                            {/* Third Row - Address Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
                                <div className="lg:col-span-4">
                                    <FloatingLabelInput
                                        label="Address *"
                                        value={formData.address}
                                        onChange={(e) => handleFieldChange('address', e.target.value)}
                                        error={shouldShowError('address') ? errors.address : undefined}
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <FloatingLabelInput
                                        label="City *"
                                        value={formData.city}
                                        onChange={(e) => handleFieldChange('city', e.target.value)}
                                        error={shouldShowError('city') ? errors.city : undefined}
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <FloatingLabelSelect
                                        label="State *"
                                        value={formData.state}
                                        onChange={(e) => handleFieldChange('state', e.target.value)}
                                        error={shouldShowError('state') ? errors.state : undefined}
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
                                        label="Country *"
                                        value={formData.country}
                                        onChange={(e) => handleFieldChange('country', e.target.value)}
                                        error={shouldShowError('country') ? errors.country : undefined}
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
                                        label="ZIP Code *"
                                        value={formData.zip_code}
                                        onChange={(e) => handleFieldChange('zip_code', e.target.value)}
                                        error={shouldShowError('zip_code') ? errors.zip_code : undefined}
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
                                        label="Start Date *"
                                        type="date"
                                        value={formData.joining_date}
                                        onChange={(e) => handleFieldChange('joining_date', e.target.value)}
                                        max={getCurrentDate()}
                                        error={shouldShowError('joining_date') ? errors.joining_date : undefined}
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
                                    label="System Access Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleFieldChange('password', e.target.value)}
                                    placeholder="Min. 6 characters"
                                    error={shouldShowError('password') ? errors.password : undefined}
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
                                                error={shouldShowError('current_zip_code') ? errors.current_zip_code : undefined}
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
                                            error={shouldShowError('graduation_year') ? errors.graduation_year : undefined}
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
                                            error={shouldShowError('experience_years') ? errors.experience_years : undefined}
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
                                {shouldShowError('documents') && errors.documents && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {errors.documents}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {DOCUMENT_TYPES.map((docType) => {
                                        const isSelected = selectedDocumentTypes.includes(docType.id);
                                        const documentIndex = documents.findIndex(doc =>
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
                                                        {documentIndex === -1 ? (
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
                                                                        <span className="text-sm text-gray-600 block mb-1">Click to upload</span>
                                                                        <span className="text-xs text-gray-400">PDF, JPG, PNG, DOC (max 10MB)</span>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border">
                                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                    <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                                                    <span className="text-sm truncate max-w-[150px] sm:max-w-[180px]" title={documents[documentIndex].name}>
                                                                        {documents[documentIndex].name}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeDocument(documentIndex)}
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
                                        {profileImage && (
                                            <button
                                                type="button"
                                                onClick={() => setProfileImage(null)}
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
                                                error={shouldShowError('emergency_contact_name') ? errors.emergency_contact_name : undefined}
                                            />
                                        </div>

                                        <div>
                                            <FloatingLabelInput
                                                label="Contact Phone"
                                                value={formData.profile_data.emergency_contact_phone}
                                                onChange={(e) => handleFieldChange('profile_data.emergency_contact_phone', e.target.value)}
                                                type="tel"
                                                error={shouldShowError('emergency_contact_phone') ? errors.emergency_contact_phone : undefined}
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
                            {documents.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <FileText size={18} className="text-blue-500" />
                                            Uploaded Documents ({documents.length})
                                        </h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDocuments([])}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {documents.map((doc, index) => (
                                            <div
                                                key={index}
                                                className="bg-white dark:bg-gray-900 rounded-lg p-3 flex items-center justify-between group hover:shadow-md transition-all border"
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                                    <span className="text-sm truncate" title={doc.name}>
                                                        {doc.name.length > 30 ? doc.name.substring(0, 30) + '...' : doc.name}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
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
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Security Officer'
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
