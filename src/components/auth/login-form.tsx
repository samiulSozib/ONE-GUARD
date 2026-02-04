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
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { login } from "@/store/slices/authSlice"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import SweetAlertService from "@/lib/sweetAlert"
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { LoginFormData, loginSchema } from "@/lib/validation/auth";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

export function LoginForm({
  className,
  onSuccess,
  ...props
}: LoginFormProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setFocus,
    reset,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onChange"
  })

  // Clear form errors on mount
  useEffect(() => {
    clearErrors()
    setFocus('email')
  }, [clearErrors, setFocus])

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(login(data))

      if (login.fulfilled.match(result)) {
        reset()

        if (onSuccess) {
          onSuccess()
        } else {
          // Wait for SweetAlert to finish before redirecting
          setTimeout(() => {
            router.push('/')
          }, 1600); // Wait 1.6 seconds for SweetAlert to complete
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      // Error is handled by Redux slice
    }
  }

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

                {/* Forgot Password Link */}
                {/* <div className="text-right text-xs">
                  <button
                    type="button"
                    className="underline hover:text-[#b9a58b] transition-colors"
                    onClick={async () => {
                      const { value: email } = await SweetAlertService.info({
                        title: 'Reset Password',
                        input: 'email',
                        inputLabel: 'Enter your email address',
                        inputPlaceholder: 'Enter your email',
                        inputAttributes: {
                          autocapitalize: 'off'
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Send Reset Link',
                        confirmButtonColor: '#6b0016',
                        cancelButtonText: 'Cancel',
                        cancelButtonColor: '#6b7280',
                        inputValidator: (value) => {
                          if (!value) {
                            return 'Please enter your email address!'
                          }
                          if (!/^\S+@\S+\.\S+$/.test(value)) {
                            return 'Please enter a valid email address!'
                          }
                          return null
                        }
                      })

                      if (email) {
                        // Call your API to send reset password email
                        try {
                          // api.post('/forgot-password', { email })
                          await SweetAlertService.success(
                            'Reset Link Sent!',
                            'Check your email for password reset instructions.',
                            {
                              confirmButtonColor: '#6b0016',
                            }
                          )
                        } catch (error) {
                          SweetAlertService.error(
                            'Failed to Send',
                            'Please try again or contact support.',
                            {
                              confirmButtonColor: '#6b0016',
                            }
                          )
                        }
                      }
                    }}
                  >
                    Forgot your password?
                  </button>
                </div> */}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="mt-4 w-full bg-[#b9a58b] text-black hover:bg-[#a89478] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Enter'
                  )}
                </Button>

                {/* Support Text */}
                {/* <p className="mt-6 text-center text-xs text-neutral-200">
                  Having trouble logging in?{" "}
                  <button
                    type="button"
                    className="underline hover:text-[#b9a58b] transition-colors"
                    onClick={async () => {
                      const { value: formValues } = await SweetAlertService.fire({
                        title: 'Contact Support',
                        html: `
                          <input id="swal-input1" class="swal2-input" placeholder="Your Name">
                          <input id="swal-input2" class="swal2-input" placeholder="Your Email">
                          <textarea id="swal-input3" class="swal2-textarea" placeholder="Describe your issue"></textarea>
                        `,
                        focusConfirm: false,
                        preConfirm: () => {
                          const name = (document.getElementById('swal-input1') as HTMLInputElement).value
                          const email = (document.getElementById('swal-input2') as HTMLInputElement).value
                          const issue = (document.getElementById('swal-input3') as HTMLTextAreaElement).value
                          
                          if (!name || !email || !issue) {
                            SweetAlertService.showValidationMessage('Please fill all fields')
                            return false
                          }
                          
                          return { name, email, issue }
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Send Message',
                        confirmButtonColor: '#6b0016',
                        cancelButtonText: 'Cancel',
                        cancelButtonColor: '#6b7280',
                      })

                      if (formValues) {
                        // Handle support request submission
                        await SweetAlertService.success(
                          'Message Sent!',
                          'Our support team will contact you shortly.',
                          {
                            timer: 2000,
                            showConfirmButton: false,
                          }
                        )
                      }
                    }}
                  >
                    Contact Support
                  </button>
                </p> */}
              </FieldGroup>
            </form>
          </div>

        </CardContent>
      </div>
    </div>
  )
}