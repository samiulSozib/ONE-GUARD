import axios, { AxiosError, AxiosResponse } from 'axios';
import { Client } from '@/app/types/client';
import { ApiResponse, LoginCredentials, LoginResponse, User } from '@/app/types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // You can add common success handling here
    return response;
  },
  (error: AxiosError<{ errors:{message?:string},message?: string }>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      //window.location.href = '/auth/login';
    }
    console.log(error)
    const errorMessage = error.response?.data?.errors?.message || error.message || 'An error occurred';
    return Promise.reject(errorMessage);
  }
);

// Generic API response handler
export const handleApiResponse = async <T>(
  promise: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
  try {
    const response = await promise;
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Request failed');
    }
    
    return response.data.body;
  } catch (error) {
    if (typeof error === 'string') {
      throw new Error(error);
    }
    throw error;
  }
};

// Auth Service
export const authService = {
  login: (credentials: LoginCredentials) =>
    handleApiResponse(
      api.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    ),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getProfile: () =>
    handleApiResponse(api.get<ApiResponse<User>>('/profile')),
};



export default api;