import { z } from 'zod';

// Site Location Schema - all optional
export const siteLocationSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    latitude: z.number().optional().default(0),
    longitude: z.number().optional().default(0),
    is_active: z.boolean().optional().default(true)
});

// Site Schema - only essential fields required
export const siteSchema = z.object({
    site_name: z.string().min(1, 'Site name is required'),
    site_instruction: z.string().optional(),
    address: z.string().optional(),
    guards_required: z.number().optional().default(1),
    latitude: z.number().optional().default(0),
    longitude: z.number().optional().default(0),
    status: z.enum(['planned', 'running', 'paused', 'completed']).optional().default('planned'),
    locations: z.array(siteLocationSchema).optional().default([]),
    site_document_types: z.array(z.string()).optional().default([])
});

// Contact Schema - all optional
export const contactSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    position: z.string().optional(),
    department: z.string().optional(),
    is_primary: z.boolean().optional().default(false),
    notes: z.string().optional()
});

// Main Client Schema - only essential fields required
export const clientBasicSchema = z.object({
    // Basic Info (only these 4 are required)
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    
    // Everything else is optional
    client_code: z.string().optional(),
    company_name: z.string().optional(),
    tax_id: z.string().optional(),
    license_number: z.string().optional(),
    
    // Location
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    zip_code: z.string().optional(),
    
    // Business Details
    business_type: z.string().optional(),
    industry: z.string().optional(),
    registration_date: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    currency_id: z.number().optional().nullable(),
    
    // Additional Contacts
    contact_person: z.string().optional(),
    contact_person_phone: z.string().optional(),
    
    // Notes & Status
    notes: z.string().optional(),
    is_active: z.boolean().optional().default(true),
    
    // Arrays
    contacts: z.array(contactSchema).optional().default([]),
    sites: z.array(siteSchema).optional().default([]),
    client_document_types: z.array(z.string()).optional().default([]),
    site_document_types: z.array(z.string()).optional().default([]),
    media_categories: z.array(z.string()).optional().default([])
});

export const clientUpdateSchema = z.object({
    // Basic Info (only these 4 are required)
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone is required'),
    password: z.string().optional(),
    
    // Everything else is optional
    client_code: z.string().optional(),
    company_name: z.string().optional(),
    tax_id: z.string().optional(),
    license_number: z.string().optional(),
    
    // Location
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    zip_code: z.string().optional(),
    
    // Business Details
    business_type: z.string().optional(),
    industry: z.string().optional(),
    registration_date: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    currency_id: z.number().optional().nullable(),
    
    // Additional Contacts
    contact_person: z.string().optional(),
    contact_person_phone: z.string().optional(),
    
    // Notes & Status
    notes: z.string().optional(),
    is_active: z.boolean().optional().default(true),
    
    // Arrays
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



// Update the type
export type ClientUpdateFormData = z.input<typeof clientUpdateSchema>;