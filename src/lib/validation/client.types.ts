// Country list
export const COUNTRIES = [
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'QA', name: 'Qatar' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'OM', name: 'Oman' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'PK', name: 'Pakistan' },
    // Add more countries as needed
];

// Business Types
export const BUSINESS_TYPES = [
    'Limited Liability Company',
    'Sole Proprietorship',
    'Partnership',
    'Corporation',
    'Freelancer',
    'Government Entity',
    'Non-Profit Organization',
    'Branch Office'
];

// Industries
export const INDUSTRIES = [
    'Security Services',
    'Construction',
    'Real Estate',
    'Retail',
    'Hospitality',
    'Healthcare',
    'Manufacturing',
    'Technology',
    'Finance',
    'Education',
    'Transportation',
    'Logistics',
    'Oil & Gas',
    'Government',
    'Other'
];

// Document Types
export const CLIENT_DOCUMENT_TYPES = [
    { id: 'trade_license', name: 'Trade License', required: true },
    { id: 'tax_certificate', name: 'Tax Certificate', required: true },
    { id: 'company_registration', name: 'Company Registration', required: true },
    { id: 'insurance_certificate', name: 'Insurance Certificate', required: false },
    { id: 'memorandum_of_association', name: 'Memorandum of Association', required: false },
    { id: 'articles_of_association', name: 'Articles of Association', required: false },
    { id: 'board_resolution', name: 'Board Resolution', required: false },
    { id: 'passport_copy', name: 'Passport Copy (Owner)', required: false },
    { id: 'visa_copy', name: 'Visa Copy', required: false },
    { id: 'authorization_letter', name: 'Authorization Letter', required: false }
];

export const SITE_DOCUMENT_TYPES = [
    { id: 'site_map', name: 'Site Map', required: true },
    { id: 'safety_plan', name: 'Safety Plan', required: true },
    { id: 'emergency_procedures', name: 'Emergency Procedures', required: true },
    { id: 'floor_plan', name: 'Floor Plan', required: false },
    { id: 'site_layout', name: 'Site Layout', required: false },
    { id: 'fire_safety', name: 'Fire Safety Certificate', required: false },
    { id: 'operating_license', name: 'Operating License', required: false },
    { id: 'access_control', name: 'Access Control Plan', required: false }
];

// Status Options
export const CLIENT_STATUS = [
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'pending', name: 'Pending' },
    { id: 'suspended', name: 'Suspended' }
];