// components/ui/sound-toggle.tsx
'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundService } from '@/lib/soundService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SoundToggle() {
  // ✅ Initialize state directly with the value from soundService
  const [isEnabled, setIsEnabled] = useState(() => soundService.isEnabled());

  const toggleSound = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    soundService.setEnabled(newState);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            className="relative h-8 w-8"
          >
            {isEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            {!isEnabled && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isEnabled ? 'Sound notifications on' : 'Sound notifications off'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}