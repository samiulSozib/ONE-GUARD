// API Response Types
export interface ApiResponse<T> {
  status: string;
  status_code: number;
  success: boolean;
  body: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  data: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

// User Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}



// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

