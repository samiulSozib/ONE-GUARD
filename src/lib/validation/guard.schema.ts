import * as z from "zod"

export const guardBasicSchema = z.object({
    // Required fields
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    employee_company_card_number: z.string().min(1, "Employee card number is required"),
    gender: z.enum(["male", "female", "other"]),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    joining_date: z.string().min(1, "Joining date is required"),
    
    // Optional fields (handle empty string)
    guard_code: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    driver_license: z.string().optional(),
    date_of_birth: z.string().optional(),
    address: z.string().optional(),
    zip_code: z.string().optional(),
    license_expiry_date: z.string().optional(),
    issuing_source: z.string().optional(),
    
    // Optional numbers from select
    guard_type_id: z.preprocess(
        (v) => v === "" || v == null ? undefined : Number(v), 
        z.number().optional()
    ),
    contract_id: z.preprocess(
        (v) => v === "" || v == null ? undefined : Number(v), 
        z.number().optional()
    ),
    
    // Status
    is_active: z.boolean().default(true),
    
    // Arrays
    document_types: z.array(z.string()).optional(),
    
    // Profile data - Make all fields optional with proper empty string handling
    profile_data: z.object({
        marital_status: z.enum(["single", "married", "divorced", "widowed"]).optional(),
        has_work_permit: z.boolean().optional(),
        has_security_training: z.boolean().optional(),
        languages: z.array(z.string()).optional(),
        
        // All these should handle empty strings
        place_of_birth: z.string().optional(),
        country_of_origin: z.string().optional(),
        current_country: z.string().optional(),
        current_city: z.string().optional(),
        current_address: z.string().optional(),
        citizenship: z.string().optional(),
        visa_expiry_date: z.string().optional(),
        father_name: z.string().optional(),
        mother_name: z.string().optional(),
        national_id_number: z.string().optional(),
        height: z.string().optional(),
        weight: z.string().optional(),
        blood_group: z.string().optional(),
        skills: z.string().optional(),
        highest_education_level: z.string().optional(),
        education_field: z.string().optional(),
        institution_name: z.string().optional(),
        emergency_contact_name: z.string().optional(),
        emergency_contact_phone: z.string().optional(),
        emergency_contact_relation: z.string().optional(),
        notes: z.string().optional(),
        
        visa_countries: z.array(z.string()).optional(),
        experience_years: z.preprocess(
            (v) => v === "" || v == null ? undefined : Number(v), 
            z.number().min(0).optional()
        ),
        graduation_year: z.preprocess(
            (v) => v === "" || v == null ? undefined : Number(v), 
            z.number().min(1900).max(new Date().getFullYear()).optional()
        ),
    }).optional().default({}), // Make the entire object optional with default
})
export type GuardFormData = z.infer<typeof guardBasicSchema>
