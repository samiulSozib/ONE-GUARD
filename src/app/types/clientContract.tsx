// clientContract.ts

import { User } from "./api.types"
import { Client } from "./client"
import { Site } from "./site"

export interface ClientContract {
    id: number

    contract_number?: string
    name?: string
    reference_number?: string

    type?: string
    type_text?: string

    status?: string
    status_text?: string
    status_color?: string

    start_date?: string
    end_date?: string
    signed_date?: string
    effective_date?: string

    contract_value?: string

    hourly_rate?: string
    overtime_rate?: string
    holiday_rate?: string

    admin_fee_percentage?: string

    billing_cycle?: string
    payment_terms?: string

    currency?: string

    governing_law?: string
    venue_location?: string

    termination_notice_days?: number
    renewal_notice_days?: number

    auto_renew?: boolean

    notes?: string

    is_active?: boolean

    total_sites_count?: number

    client?: Partial<Client>

    created_by?: Partial<User>
    updated_by?: Partial<User>

    sites?: ClientContractSite[]

    created_at?: string
    updated_at?: string
    client_signer_name?: string,
            client_signer_title?: string,
            client_signed_date?: string,
            client_signed_date_formatted?: string,
            client_signature_path?: string,
            client_signature_url?: string,

            company_signer_name?: string,
            company_signer_title?: string,
            company_signed_date?: string,
            company_signed_date_formatted?: string,
            company_signature_path?: string,
            company_signature_url?: string,
            is_fully_signed?:boolean

            client_id: number
}

export interface ClientContractSite {
    id: number
    site?: Partial<Site>
    pivot?: ClientContractPivot
}

export interface ClientContractPivot {
    id?: number

    guards_required?: number
    site_specific_rate?: string

    operating_hours?: Record<string, string>

    special_instructions?: string

    is_primary?: boolean
    is_active?: boolean

    assigned_at?: string
    removed_at?: string

    created_at?: string
    updated_at?: string
}

export interface ClientContractParams {
    page?: number
    per_page?: number

    search?: string

    client_id?: number

    status?: string
    type?: string

    start_date?: string
    end_date?: string

    sort_by?: string
    sort_order?: "asc" | "desc"
}

// export interface CreateClientContractDto {
//     client_id: number
//     name: string
//     type: string

//     start_date: string
//     end_date?: string

//     hourly_rate?: number

//     billing_cycle?: string
//     payment_terms?: string

//     sites: CreateClientContractSite[]
//     signed_date?:string
//     effective_date?:string
// }

export interface CreateClientContractDto {
    // Required fields
    client_id: number
    name: string
    type: "ongoing" | "fixed_term" | "trial" | "one_time"
    start_date: string // Format: YYYY-MM-DD
    
    // Optional fields
    end_date?: string // Format: YYYY-MM-DD
    signed_date?: string // Format: YYYY-MM-DD
    effective_date?: string // Format: YYYY-MM-DD
    
    // Financial fields
    contract_value?: number
    hourly_rate?: number
    overtime_rate?: number
    holiday_rate?: number
    admin_fee_percentage?: number
    
    // Billing & Terms
    billing_cycle?: "weekly" | "bi_weekly" | "monthly" | "quarterly" | "annually"
    payment_terms?: "net_15" | "net_30" | "net_45" | "net_60" | "due_on_receipt"
    currency?: "USD" | "EUR" | "GBP" | "CAD" | "AUD"
    
    // Legal
    governing_law?: string
    venue_location?: string
    
    // Terms
    termination_notice_days?: number
    renewal_notice_days?: number
    auto_renew?: boolean
    
    // Notes
    notes?: string
    
    // Sites (Required - at least one)
    sites: CreateClientContractSite[]
}

export interface CreateClientContractSite {
    site_id?: number

    site_name?: string
    address?: string

    latitude?: number
    longitude?: number

    guards_required?: number

    site_instruction?: string

    pivot: {
        guards_required?: number
        site_specific_rate?: number
        is_primary?: boolean
    }

    locations?: SiteLocationDto[]
}

export interface SiteLocationDto {
    title: string
    latitude: number
    longitude: number

    description?: string

    is_active?: boolean
}

export interface ClientContractState {
    contracts: ClientContract[]

    currentContract: ClientContract | null

    pagination: {
        current_page: number
        last_page: number
        total: number
        per_page?: number
    }

    isLoading: boolean

    error: string | null
}