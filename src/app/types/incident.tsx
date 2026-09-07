// app/types/incident.ts

import { Site } from "./site";
import { Client } from "./client";
import { Guard } from "./guard";
import { Duty } from "./duty";

// Incident Media interface - updated to match API response
export interface IncidentMedia {
  id: number;
  model_type: string;
  model_id: number;
  file_category_id: number;
  disk: string;
  path: string;
  original_name: string;
  mime_type: string;
  size: number;
  is_primary: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  url: string;
  media_type: "image" | "video" | "document" | "audio" | string;
}

// Incident type definition based on the API response
export interface Incident {
  id: number;
  tracking_code: string;
  title: string;

  // Foreign keys
  site_id?: number;
  site_location_id?: number;
  client_id?: number;
  guard_id?: number | null;
  duty_id?: number | null;

  // Reporter information
  reporter_type?: "admin" | "guard" | "client" | "system" | string;
  reporter_id?: number;

  // Incident details
  incident_type?: string;
  severity?: "critical" | "high" | "medium" | "low" | "minor" | string;

  // Location details
  incident_place?: string;
  incident_address?: string;

  // Timestamps
  incident_date?: string; // YYYY-MM-DD
  incident_time?: string; // HH:MM:SS
  reported_at?: string; // YYYY-MM-DD HH:MM:SS

  // Geolocation (optional)
  latitude?: number | null;
  longitude?: number | null;

  // Descriptions and notes
  description?: string;
  injury_or_damage_note?: string | null;
  conversation_note?: string | null;
  notes?: string | null;
  note?: string | null;

  // Media attachments
  media_path?: string | null;
  media_type?: string | null;

  // Status - matches API
  status: "pending" | "acknowledged" | "investigating" | "resolved" | "closed" | "rejected" | string;

  // Flags
  visible_to_client: boolean;

  // Relationships
  site?: Partial<Site>;
  client?: Partial<Client>;
  guard?: Partial<Guard>;
  duty?: Partial<Duty>;
  site_location?: {
    id: number;
    site_id: number;
    title: string;
    description?: string | null;
    latitude?: string;
    longitude?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  media?: IncidentMedia[];

  // Timestamps
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Query parameters for fetching incidents
export interface IncidentParams {
  page?: number;
  per_page?: number;
  search?: string;

  // Filter by relations
  site_id?: number;
  site_location_id?: number;
  client_id?: number;
  guard_id?: number;
  duty_id?: number;

  // Filter by reporter
  reporter_type?: "admin" | "guard" | "client" | "system" | string;
  reporter_id?: number;

  // Filter by incident details
  incident_type?: string;
  severity?: "critical" | "high" | "medium" | "low" | "minor" | string;

  // Filter by date range
  incident_date_from?: string;
  incident_date_to?: string;
  reported_at_from?: string;
  reported_at_to?: string;

  // Filter by status
  status?: "pending" | "acknowledged" | "investigating" | "resolved" | "closed" | "rejected" | string;

  // Visibility filter
  visible_to_client?: boolean;

  // Include relationships
  include_site?: boolean | number;
  include_client?: boolean | number;
  include_guard?: boolean | number;
  include_duty?: boolean | number;
  include_media?: boolean | number;

  // Sorting
  sort_by?: string;
  sort_order?: "asc" | "desc";
  incident_date?: string;
}

// Redux state interface
export interface IncidentState {
  incidents: Incident[];
  currentIncident: Incident | null;

  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };

  isLoading: boolean;
  error: string | null;
}

// DTO for creating a new incident
export interface CreateIncidentDto {
  title: string;

  site_id: number;
  site_location_id: number;
  client_id: number;
  guard_id?: number | null;
  duty_id?: number | null;

  reporter_type: "admin" | "guard" | "client" | "system" | string;
  reporter_id: number;

  incident_type: string;
  severity: "critical" | "high" | "medium" | "low" | "minor" | string;

  incident_place: string;
  incident_address: string;

  incident_date: string; // YYYY-MM-DD
  incident_time: string; // HH:MM:SS
  reported_at?: string; // YYYY-MM-DD HH:MM:SS

  latitude?: number | null;
  longitude?: number | null;

  description: string;
  injury_or_damage_note?: string | null;
  conversation_note?: string | null;
  note?: string | null;

  media_path?: string | null;
  media_type?: string | null;

  status?: "pending" | "acknowledged" | "investigating" | "resolved" | "closed" | "rejected" | string;
  visible_to_client?: boolean;
}

// DTO for updating an incident
export interface UpdateIncidentDto {
  title?: string;
  site_id?: number;
  site_location_id?: number;
  client_id?: number;
  guard_id?: number | null;
  duty_id?: number | null;
  incident_type?: string;
  severity?: "critical" | "high" | "medium" | "low" | "minor" | string;
  incident_place?: string;
  incident_address?: string;
  incident_date?: string;
  incident_time?: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
  injury_or_damage_note?: string | null;
  conversation_note?: string | null;
  note?: string | null;
  media_path?: string | null;
  media_type?: string | null;
  status?: "pending" | "acknowledged" | "investigating" | "resolved" | "closed" | "rejected" | string;
  visible_to_client?: boolean;
}
