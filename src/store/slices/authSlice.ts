import { AuthState, LoginCredentials, User } from '@/app/types/api.types';
import SweetAlertService from '@/lib/sweetAlert';
import { authService } from '@/service/api.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';


const initialState: AuthState = {
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isLoading: false,
    error: null,
};

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);

            // Store token and user in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            return rejectWithValue(errorMessage);
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    authService.logout();
});

export const getProfile = createAsyncThunk(
    'auth/profile',
    async (_, { rejectWithValue }) => {
        try {
            return await authService.getProfile();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
            return rejectWithValue(errorMessage);
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setAuthState: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
    },

    // In the extraReducers builder:
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;

                // Show success alert
                SweetAlertService.success(
                    'Login Successful!',
                    `Welcome back, ${action.payload.user.first_name}!`,
                    {
                        timer: 1500,
                        showConfirmButton: false,
                    }
                ).then(() => {
                    // Optional: Redirect after alert closes
                    // You can also handle this in the component
                });
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                const errorMessage = action.payload as string;
                console.log(errorMessage)
                state.error = errorMessage;

                // Show error alert
                SweetAlertService.error(
                    'Login Failed',
                    errorMessage || 'Please check your credentials and try again.',
                    {
                        timer:2000,
                        confirmButtonColor: '#6b0016',
                    }
                );
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.error = null;

                // Show success alert for logout
                SweetAlertService.success(
                    'Logged Out',
                    'You have been successfully logged out.',
                    {
                        timer: 1500,
                        showConfirmButton: false,
                    }
                );
            })

            // Get Profile
            .addCase(getProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.isLoading = false;
                const errorMessage = action.payload as string;
                state.error = errorMessage;

                SweetAlertService.error(
                    'Session Expired',
                    'Please login again to continue.',
                    {
                        confirmButtonColor: '#6b0016',
                    }
                );
            });
    },
});

export const { clearError, setAuthState } = authSlice.actions;
export default authSlice.reducer;