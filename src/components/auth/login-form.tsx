'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { login } from "@/store/slices/authSlice"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"
import SweetAlertService from "@/lib/sweetAlert"
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { LoginFormData, loginSchema } from "@/lib/validation/auth";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

// Storage keys
const STORAGE_KEYS = {
  SAVED_EMAIL: 'saved_email',
  SAVED_PASSWORD: 'saved_password',
  REMEMBER_ME: 'remember_me'
} as const;

export function LoginForm({
  className,
  onSuccess,
  ...props
}: LoginFormProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.auth)
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true'
    }
    return false
  })
  
  const hasLoadedCredentials = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setFocus,
    reset,
    clearErrors,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onChange"
  })

  // Load saved credentials on mount
  const loadSavedCredentials = useCallback(() => {
    if (!hasLoadedCredentials.current && rememberMe) {
      const savedEmail = localStorage.getItem(STORAGE_KEYS.SAVED_EMAIL)
      const savedPassword = localStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD)
      
      if (savedEmail && savedPassword) {
        setValue('email', savedEmail)
        setValue('password', savedPassword)
      }
      
      hasLoadedCredentials.current = true
    }
  }, [rememberMe, setValue])

  useEffect(() => {
    clearErrors()
    loadSavedCredentials()
    setFocus('email')
  }, [clearErrors, loadSavedCredentials, setFocus])

  // Save credentials function
  const saveCredentials = useCallback((email: string, password: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email)
      localStorage.setItem(STORAGE_KEYS.SAVED_PASSWORD, password)
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
    } else {
      localStorage.removeItem(STORAGE_KEYS.SAVED_EMAIL)
      localStorage.removeItem(STORAGE_KEYS.SAVED_PASSWORD)
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
    }
  }, [])

  // Clear saved credentials function
  const clearSavedCredentials = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.SAVED_EMAIL)
    localStorage.removeItem(STORAGE_KEYS.SAVED_PASSWORD)
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
    setRememberMe(false)
    setValue('email', '')
    setValue('password', '')
    
    await SweetAlertService.success(
      'Credentials Cleared',
      'Saved login credentials have been removed.',
      {
        timer: 1500,
        showConfirmButton: false,
      }
    )
  }, [setValue])

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Submitting form with data:', data);
      
      const result = await dispatch(login(data))

      if (login.fulfilled.match(result)) {
        console.log('Login successful');
        saveCredentials(data.email, data.password, rememberMe)
        reset()

        if (onSuccess) {
          onSuccess()
        } else {
          // Show success message before redirect
          await SweetAlertService.success(
            'Login Successful!',
            'Welcome back to the Security Management System.',
            {
              timer: 1500,
              showConfirmButton: false,
            }
          );
          
          setTimeout(() => {
            router.push('/')
          }, 1600);
        }
      } else if (login.rejected.match(result)) {
        // Handle login failure
        console.error('Login failed:', result.payload);
        SweetAlertService.error(
          'Login Failed',
          result.payload as string || 'Invalid email or password. Please try again.',
          {
            confirmButtonColor: '#6b0016',
          }
        );
      }
    } catch (error) {
      console.error('Login error:', error)
      SweetAlertService.error(
        'Login Error',
        'An unexpected error occurred. Please try again.',
        {
          confirmButtonColor: '#6b0016',
        }
      );
    }
  }

  // Check if there are saved credentials
  const hasSavedCredentials = useCallback(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem(STORAGE_KEYS.SAVED_EMAIL)
    }
    return false
  }, [])

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-5xl overflow-hidden shadow-xl">
        <CardContent className="flex flex-col p-0 md:flex-row">

          {/* LEFT PANEL */}
          <div className="flex flex-1 flex-col items-center justify-center bg-[#fbf7f2] p-8 text-center md:p-10">
            <h2 className="text-lg font-semibold text-neutral-800 md:text-xl">
              Welcome to the
            </h2>
            <h1 className="mt-1 text-xl font-bold tracking-wide md:text-2xl">
              Security{" "}
              <span className="font-light text-[#b9a58b]">
                Management
              </span>{" "}
              System
            </h1>

            <div className="mt-8 md:mt-10">
              <Image
                src="/images/login_logo.png"
                width={140}
                height={140}
                alt="One Guard Logo"
                priority
              />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-2 flex-col bg-[#6b0016] p-8 text-white md:p-16 rounded-l-4xl">
            <h2 className="mb-6 text-left text-xl font-semibold md:text-2xl">
              Login
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
              <FieldGroup>
                {/* Email Field */}
                <Field>
                  <FieldLabel className="sr-only">
                    Email
                  </FieldLabel>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className={`bg-white text-black placeholder:text-gray-500 ${errors.email ? 'border-red-500' : ''}`}
                    {...register('email')}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-300">
                      {errors.email.message}
                    </p>
                  )}
                </Field>

                {/* Password Field */}
                <Field>
                  <FieldLabel className="sr-only">
                    Password
                  </FieldLabel>
                  <Input
                    type="password"
                    placeholder="Password"
                    className={`bg-white text-black placeholder:text-gray-500 ${errors.password ? 'border-red-500' : ''}`}
                    {...register('password')}
                    autoComplete="current-password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-300">
                      {errors.password.message}
                    </p>
                  )}
                </Field>

                {/* Remember Me and Clear Credentials Section */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white data-[state=checked]:bg-[#b9a58b] data-[state=checked]:text-white"
                    />
                    <label
                      htmlFor="remember-me"
                      className="text-sm text-white cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                  </div>
                  
                  {/* Clear Saved Credentials Button */}
                  {hasSavedCredentials() && (
                    <button
                      type="button"
                      onClick={clearSavedCredentials}
                      className="text-xs text-white/70 hover:text-white underline transition-colors"
                    >
                      Clear saved credentials
                    </button>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right text-xs mt-2">
                  <button
                    type="button"
                    className="text-white/70 hover:text-white underline transition-colors"
                    onClick={() => {
                      // Handle forgot password
                      router.push('/auth/forgot-password');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="mt-6 w-full bg-[#b9a58b] text-black hover:bg-[#a89478] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </FieldGroup>
            </form>

            {/* Saved credentials indicator */}
            {hasSavedCredentials() && !rememberMe && (
              <p className="mt-4 text-xs text-white/50 text-center">
                Saved credentials available. Check &quot;Remember me&quot; to auto-fill.
              </p>
            )}
          </div>

        </CardContent>
      </div>
    </div>
  )
}