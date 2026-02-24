"use client";

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
import { Provider } from "react-redux";
import { store } from "@/store/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Public routes that don't require authentication
const publicRoutes = [
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
  const isPublicRoute = publicRoutes.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider store={store}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SweetAlertProvider/>
            {isPublicRoute ? (
              // Public routes (login, register, etc.) - no sidebar, no protection
              <AlertProvider>
                <main className="flex flex-1 flex-col h-full">
                  {children}
                </main>
              </AlertProvider>
            ) : (
              // Protected routes - require authentication, show sidebar
              <GuardedRoute>
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
              </GuardedRoute>
            )}
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}

function ConditionalSidebar() {
  const { activeSidebar } = useSidebarToggle();

  return activeSidebar === "main" ? 
    <AppSidebar variant="inset" /> : 
    <AppSidebarSecondary variant="inset" />;
}

import { useSidebarToggle } from "@/components/providers/sidebar-toggle-provider";
import { SweetAlertProvider } from "@/components/providers/sweetAlertProvider";
import GuardedRoute from "@/components/authGuardedRoute";