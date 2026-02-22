/* =========================================================
   Complaint Types (Based on API JSON Response)
   ========================================================= */

import { Client } from "./client";
import { Guard } from "./guard";
import { Site } from "./site";




/* ---------- Complaint ---------- */
export interface Complaint {
  id: number;
  title: string;

  priority: "low" | "medium" | "high" | string;
  status: "open" | "in_progress" | "resolved" | "closed" | string;

  reported_by_type: "client" | "admin" | "guard" | string;
  reported_by_id: number;

  against_type: "guard" | "site" | string;
  against_id: number;

  notes?: string | null;

  is_visible_to_client: boolean;
  is_visible_to_guard: boolean;

  created_at: string;

  /* ---------- Relationships ---------- */
  site?: Partial<Site>;
  reporter?:Partial<Client|Guard>
  against?:Partial<Client|Guard>
}

/* ---------- Complaint Query Params ---------- */
export interface ComplaintParams {
  page?: number;
  per_page?: number;
  search?: string;

  priority?: "low" | "medium" | "high";
  status?: "open" | "in_progress" | "resolved" | "closed";

  reported_by_type?: string;
  against_type?: string;
  site_id?: number;

  include_site?: boolean | number;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/* ---------- Complaint Redux State ---------- */
export interface ComplaintState {
  complaints: Complaint[];
  currentComplaint: Complaint | null;

  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };

  isLoading: boolean;
  error: string | null;
}


/* =========================================================
   Complaint DTOs
   ========================================================= */

/* ---------- Create Complaint DTO ---------- */
export interface CreateComplaintDto {
  title: string;

  reported_by_type: "client" | "admin" | "guard";
  reported_by_id: number;

  against_type: "guard" | "site"|"client";
  against_id: number;

  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";

  site_id: number;
  site_location_id?: number;

  notes?: string | null;

  is_visible_to_client: boolean;
  is_visible_to_guard: boolean;
}

