'use client'

import { LoginForm } from "@/components/auth/login-form"
import { useAppSelector } from "@/hooks/useAppSelector";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const handleLoginSuccess = () => {
    console.log('Login successful!');
    router.push('/');
  };
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm onSuccess={handleLoginSuccess}/>
      </div>
    </div>
  )
}
