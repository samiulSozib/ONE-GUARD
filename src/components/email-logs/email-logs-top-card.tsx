// components/email-logs/email-logs-top-card.tsx
"use client";

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { TrashIcon, CalendarIcon } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { clearOldLogs, fetchEmailLogs } from '@/store/slices/email-logSlice';
import SweetAlertService from '@/lib/sweetAlert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailLogsTopCardProps {
  onRefresh?: () => void;
}

const EmailLogsTopCard = ({ onRefresh }: EmailLogsTopCardProps) => {
  const dispatch = useAppDispatch();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(30);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearOldLogs = async () => {
    if (daysToKeep < 1) {
      SweetAlertService.error('Invalid Days', 'Please enter a valid number of days (minimum 1)');
      return;
    }

    setIsClearing(true);
    try {
      const result = await dispatch(clearOldLogs({ days: daysToKeep })).unwrap();
      
      SweetAlertService.success(
        'Logs Cleared',
        result.message || `Successfully deleted ${result.deleted_count} old logs.`,
        { timer: 2000, showConfirmButton: false }
      );
      
      setClearDialogOpen(false);
      setDaysToKeep(30);
      
      // Refresh the logs list and stats
      dispatch(fetchEmailLogs({ page: 1, per_page: 10 }));
      onRefresh?.();
    } catch (error) {
      SweetAlertService.error(
        'Failed to Clear',
        error instanceof Error ? error.message : 'Failed to clear old logs. Please try again.'
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
        <span className='text-lg font-bold dark:text-white'>Email Logs</span>
        <div className='flex flex-row gap-2 w-full md:w-auto'>
          <Button
            onClick={() => setClearDialogOpen(true)}
            variant="outline"
            className='flex-1 xs:flex-initial justify-center text-xs sm:text-sm border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
          >
            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span>Clear Old Logs</span>
          </Button>
        </div>
      </Card>

      {/* Clear Old Logs Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-red-500" />
              Clear Old Logs
            </DialogTitle>
            <DialogDescription>
              Delete email logs older than the specified number of days. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="days" className="text-sm font-medium">
              Delete logs older than (days)
            </Label>
            <Input
              id="days"
              type="number"
              min="1"
              max="365"
              value={daysToKeep}
              onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 0)}
              className="mt-2 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter number of days"
            />
            <p className="text-xs text-gray-500 mt-2">
              Example: Enter 30 to delete all logs older than 30 days.
            </p>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setClearDialogOpen(false);
                setDaysToKeep(30);
              }}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleClearOldLogs}
              disabled={isClearing || daysToKeep < 1}
              className="bg-red-600 hover:bg-red-700"
            >
              {isClearing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Clearing...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Clear Logs
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailLogsTopCard;