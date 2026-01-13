"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { AppSidebarSecondary } from "@/components/app-sidebar-secondary";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AlertProvider } from "@/components/contexts/AlertContext";
import { SidebarToggleProvider } from "@/components/providers/sidebar-toggle-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const noLayoutRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = noLayoutRoutes.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isAuthPage ? (
            <AlertProvider>
              <main className="flex flex-1 flex-col h-full">
                {children}
              </main>
            </AlertProvider>
          ) : (
            <SidebarToggleProvider>
              <SidebarProvider
                style={
                  {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                  } as React.CSSProperties
                }
              >
                <ConditionalSidebar />
                <SidebarInset>
                  <SiteHeader />
                  <AlertProvider>
                    <main className="flex flex-1 flex-col h-full">
                      {children}
                    </main>
                  </AlertProvider>
                </SidebarInset>
              </SidebarProvider>
            </SidebarToggleProvider>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}

// Component to conditionally render the active sidebar
function ConditionalSidebar() {
  const { activeSidebar } = useSidebarToggle();

  return activeSidebar === "main" ? 
    <AppSidebar variant="inset" /> : 
    <AppSidebarSecondary variant="inset" />;
}

// Move the useSidebarToggle import inside the function
import { useSidebarToggle } from "@/components/providers/sidebar-toggle-provider";