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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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

            {/* LOGIN TYPE */}
            <div className="mb-6 flex flex-wrap gap-4 text-sm md:gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="loginType" defaultChecked />
                Phone No
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="loginType" />
                ID Number
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="loginType" />
                Card Number
              </label>
            </div>

            <form className="flex-1">
              <FieldGroup>
                <Field>
                  <FieldLabel className="sr-only">
                    ID Number
                  </FieldLabel>
                  <Input
                    placeholder="ID Number"
                    className="bg-white text-black"
                  />
                </Field>

                <Field>
                  <FieldLabel className="sr-only">
                    Password
                  </FieldLabel>
                  <Input
                    type="password"
                    placeholder="Password"
                    className="bg-white text-black"
                  />
                </Field>

                <div className="text-right text-xs">
                  <a href="#" className="underline">
                    Forgot your password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="mt-4 w-full bg-[#b9a58b] text-black hover:bg-[#a89478]"
                >
                  Enter
                </Button>

                <p className="mt-6 text-center text-xs text-neutral-200">
                  Having trouble logging in?{" "}
                  <a href="#" className="underline">
                    Contact Support
                  </a>
                </p>
              </FieldGroup>
            </form>
          </div>

        </CardContent>
      </div>
    </div>
  )
}
