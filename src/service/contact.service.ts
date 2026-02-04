import { Contact, ContactParams } from "@/app/types/contact";
import api, { handleApiResponse } from "./api.service";
import { ApiResponse } from "@/app/types/api.types";

export const contactService = {
  // Get all contacts
  getContacts: (params?: ContactParams) =>
    handleApiResponse(
      api.get<ApiResponse<{ 
        items: Contact[]; 
        data: { 
          current_page: number; 
          last_page: number; 
          total: number;
          per_page: number;
        } 
      }>>('/admin/contacts', { params })
    ),
  
  // Get single contact
  getContact: (id: number) =>
    handleApiResponse(api.get<ApiResponse<Contact>>(`/admin/contacts/${id}`)),
  
  // Create contact
  createContact: (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<Contact>>('/admin/contacts', data)),
  
  // Update contact
  updateContact: (id: number, data: Partial<Contact>) =>
    handleApiResponse(api.put<ApiResponse<Contact>>(`/admin/contacts/${id}`, data)),
  
  // Delete contact
  deleteContact: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/contacts/${id}`)),
  
  // Toggle contact status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(api.patch<ApiResponse<Contact>>(`/admin/contacts/${id}/change-status`, { is_active })),
  
  // Get contacts by type
  getContactsByType: (contactable_type: string, contactable_id: number) =>
    handleApiResponse(api.get<ApiResponse<Contact[]>>(`/admin/contacts/${contactable_type}/${contactable_id}`)),
};