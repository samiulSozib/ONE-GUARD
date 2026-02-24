import { z } from 'zod';

// Site Location Schema - all optional with defaults
export const siteLocationSchema = z.object({
    title: z.string().optional().default(''),
    description: z.string().optional().default(''),
    latitude: z.number().optional().default(0),
    longitude: z.number().optional().default(0),
    is_active: z.boolean().optional()
});

// Site Schema - only essential fields required
// Site Schema - only essential fields required
export const siteSchema = z.object({
  site_name: z.string().optional().default(""),
    site_instruction: z.string().optional().default(''),
    address: z.string().optional().default(''),
    guards_required: z.number().optional().default(1),
    latitude: z.number().optional().default(0),
    longitude: z.number().optional().default(0),
    status: z.enum(['planned', 'running', 'paused', 'completed']).optional(),
    locations: z.array(siteLocationSchema).optional().default([]),
    site_document_types: z.array(z.string()).optional().default([])
});

// Contact Schema - all optional with defaults
export const contactSchema = z.object({
    name: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    email: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
    position: z.string().optional().default(''),
    department: z.string().optional().default(''),
    is_primary: z.boolean().optional().default(false),
    notes: z.string().optional().default('')
});

// Main Client Schema - only essential fields required
export const clientBasicSchema = z.object({
    // Basic Info (required)
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    
    // Everything else is optional with defaults
    client_code: z.string().optional(),
    company_name: z.string().optional().default(''),
    tax_id: z.string().optional().default(''),
    license_number: z.string().optional().default(''),
    
    // Location
    country: z.string().optional().default(''),
    city: z.string().optional().default(''),
    address: z.string().optional().default(''),
    zip_code: z.string().optional().default(''),
    
    // Business Details
    business_type: z.string().optional().default(''),
    industry: z.string().optional().default(''),
    registration_date: z.string().optional().default(''),
    website: z.string().url('Invalid URL').optional().or(z.literal('')).default(''),
    currency_id: z.union([z.number(), z.null(), z.undefined()]).optional().default(null),
    
    // Additional Contacts
    contact_person: z.string().optional().default(''),
    contact_person_phone: z.string().optional().default(''),
    
    // Notes & Status
    notes: z.string().optional().default(''),
    is_active: z.boolean().optional().default(true),
    
    // Arrays - always provide defaults
    contacts: z.array(contactSchema).optional().default([]),
    sites: z.array(siteSchema).optional().default([]),
    client_document_types: z.array(z.string()).optional().default([]),
    site_document_types: z.array(z.string()).optional().default([]),
    media_categories: z.array(z.string()).optional().default([])
});

export const clientUpdateSchema = z.object({
    // Basic Info (required)
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone is required'),
    password: z.string().optional().default(''),
    
    // Everything else is optional with defaults
    client_code: z.string().optional().default(''),
    company_name: z.string().optional().default(''),
    tax_id: z.string().optional().default(''),
    license_number: z.string().optional().default(''),
    
    // Location
    country: z.string().optional().default(''),
    city: z.string().optional().default(''),
    address: z.string().optional().default(''),
    zip_code: z.string().optional().default(''),
    
    // Business Details
    business_type: z.string().optional().default(''),
    industry: z.string().optional().default(''),
    registration_date: z.string().optional().default(''),
    website: z.string().url('Invalid URL').optional().or(z.literal('')).default(''),
    currency_id: z.union([z.number(), z.null(), z.undefined()]).optional().default(null),
    
    // Additional Contacts
    contact_person: z.string().optional().default(''),
    contact_person_phone: z.string().optional().default(''),
    
    // Notes & Status
    notes: z.string().optional().default(''),
    is_active: z.boolean().optional().default(true),
    
    // Arrays - always provide defaults
    contacts: z.array(contactSchema).optional().default([]),
    sites: z.array(siteSchema).optional().default([]),
    client_document_types: z.array(z.string()).optional().default([]),
    site_document_types: z.array(z.string()).optional().default([]),
    media_categories: z.array(z.string()).optional().default([])
});

// Type Definitions
export type SiteLocationFormData = z.input<typeof siteLocationSchema>;
export type SiteFormData = z.input<typeof siteSchema>;
export type ContactFormData = z.input<typeof contactSchema>;
export type ClientFormData = z.input<typeof clientBasicSchema>;
export type ClientUpdateFormData = z.input<typeof clientUpdateSchema>;