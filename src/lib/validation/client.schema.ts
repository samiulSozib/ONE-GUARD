import { z } from 'zod';

// Site Location Schema
export const siteLocationSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    latitude: z.number().optional().default(0),
    longitude: z.number().optional().default(0),
    is_active: z.boolean().default(true)
});

// Site Schema
export const siteSchema = z.object({
    site_name: z.string().min(1, 'Site name is required'),
    site_instruction: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    guards_required: z.number().min(1, 'At least 1 guard is required'),
    latitude: z.number().optional().default(0),
    longitude: z.number().optional().default(0),
    status: z.enum(['planned', 'running', 'paused', 'completed']).default('planned'),
    locations: z.array(siteLocationSchema).optional().default([]),
    site_document_types: z.array(z.string()).optional().default([])
});

// Contact Schema
export const contactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    position: z.string().optional(),
    department: z.string().optional(),
    is_primary: z.boolean().default(false),
    notes: z.string().optional()
});

// Main Client Schema
export const clientBasicSchema = z.object({
    // Basic Info
    client_code: z.string().optional(),
    full_name: z.string().min(1, 'Contact person name is required'),
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    
    // Company Info
    company_name: z.string().min(1, 'Company name is required'),
    tax_id: z.string().optional(),
    license_number: z.string().optional(),
    
    // Location
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
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
    is_active: z.boolean().default(true),
    
    // Arrays
    contacts: z.array(contactSchema).optional().default([]),
    sites: z.array(siteSchema).optional().default([]),
    client_document_types: z.array(z.string()).optional().default([]),
    site_document_types: z.array(z.string()).optional().default([]),
    media_categories: z.array(z.string()).optional().default([])
});

// Type Definitions
export type SiteLocationFormData = z.infer<typeof siteLocationSchema>;
export type SiteFormData = z.infer<typeof siteSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ClientFormData = z.infer<typeof clientBasicSchema>;