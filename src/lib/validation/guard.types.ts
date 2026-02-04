export interface Country {
    code: string;
    name: string;
    phoneCode: string;
}

export interface GuardType {
    id: number;
    name: string;
    description?: string;
}

export interface FormStep {
    title: string;
    fields: string[];
    completed: boolean;
}

export interface LanguageOption {
    value: string;
    label: string;
}

export interface DocumentType {
    id: string;
    name: string;
    required: boolean;
}

export const COUNTRIES: Country[] = [
    { code: 'US', name: 'United States', phoneCode: '+1' },
    { code: 'CA', name: 'Canada', phoneCode: '+1' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
    { code: 'AU', name: 'Australia', phoneCode: '+61' },
    { code: 'DE', name: 'Germany', phoneCode: '+49' },
    { code: 'FR', name: 'France', phoneCode: '+33' },
    { code: 'JP', name: 'Japan', phoneCode: '+81' },
    { code: 'CN', name: 'China', phoneCode: '+86' },
    { code: 'IN', name: 'India', phoneCode: '+91' },
    { code: 'BR', name: 'Brazil', phoneCode: '+55' },
]

export const LANGUAGES: LanguageOption[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hi', label: 'Hindi' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
]

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export const MARITAL_STATUS = ['single', 'married', 'divorced', 'widowed']

export const DOCUMENT_TYPES: DocumentType[] = [
    { id: 'id_proof', name: 'ID Proof', required: true },
    { id: 'driver_license', name: 'Driver License', required: true },
    { id: 'security_certificate', name: 'Security Certificate', required: true },
    { id: 'background_check', name: 'Background Check', required: true },
    { id: 'resume', name: 'Resume', required: false },
    { id: 'education_certificate', name: 'Education Certificate', required: false },
    { id: 'work_permit', name: 'Work Permit', required: false },
    { id: 'other', name: 'Other Documents', required: false },
]