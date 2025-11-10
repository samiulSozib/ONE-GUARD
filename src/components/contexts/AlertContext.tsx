// contexts/AlertContext.tsx
'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface AlertType {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AlertContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    const id = Date().toString();
    const newAlert: AlertType = { id, message, type };
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      hideAlert(id);
    }, 5000);
  };

  const hideAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      
      {/* Global Alert Container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 space-y-2 max-w-md w-full px-4 z-10000">
        {alerts.map((alert) => (
          <Alert 
            key={alert.id}
            className={`${
              alert.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
              alert.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
              'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className={
              alert.type === 'error' ? 'text-red-800 dark:text-red-300' :
              alert.type === 'warning' ? 'text-yellow-800 dark:text-yellow-300' :
              alert.type === 'success' ? 'text-green-800 dark:text-green-300' :
              'text-blue-800 dark:text-blue-300'
            }>
              {alert.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}