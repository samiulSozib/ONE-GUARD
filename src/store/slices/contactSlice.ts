import { Contact, ContactParams, ContactState } from '@/app/types/contact';
import { contactService } from '@/service/contact.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: ContactState = {
  contacts: [],
  currentContact: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchContacts = createAsyncThunk(
  'contact/fetchContacts',
  async (params: ContactParams = {}, { rejectWithValue }) => {
    try {
      const response = await contactService.getContacts(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contacts';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchContact = createAsyncThunk(
  'contact/fetchContact',
  async (id: number, { rejectWithValue }) => {
    try {
      return await contactService.getContact(id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contact';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createContact = createAsyncThunk(
  'contact/createContact',
  async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await contactService.createContact(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create contact';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateContact = createAsyncThunk(
  'contact/updateContact',
  async ({ id, data }: { id: number; data: Partial<Contact> }, { rejectWithValue }) => {
    try {
      return await contactService.updateContact(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update contact';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contact/deleteContact',
  async (id: number, { rejectWithValue }) => {
    try {
      await contactService.deleteContact(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete contact';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleContactStatus = createAsyncThunk(
  'contact/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      return await contactService.toggleStatus(id, is_active);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle contact status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearContactError: (state) => {
      state.error = null;
    },
    clearCurrentContact: (state) => {
      state.currentContact = null;
    },
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    updateContactInList: (state, action: PayloadAction<Contact>) => {
      const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Single Contact
      .addCase(fetchContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentContact = action.payload.item;
      })
      .addCase(fetchContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Contact
      .addCase(createContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts.unshift(action.payload.item);
        state.currentContact = action.payload.item;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Contact
      .addCase(updateContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contacts.findIndex(contact => contact.id === action.payload.item.id);
        if (index !== -1) {
          state.contacts[index] = action.payload.item;
        }
        if (state.currentContact?.id === action.payload.item.id) {
          state.currentContact = action.payload.item;
        }
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Contact
      .addCase(deleteContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
        if (state.currentContact?.id === action.payload) {
          state.currentContact = null;
        }
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Status
      .addCase(toggleContactStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleContactStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        if (state.currentContact?.id === action.payload.id) {
          state.currentContact = action.payload;
        }
      })
      .addCase(toggleContactStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearContactError, 
  clearCurrentContact, 
  setContacts,
  updateContactInList 
} = contactSlice.actions;
export default contactSlice.reducer;