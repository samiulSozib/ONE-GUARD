"use client";

import { Button } from "@/components/ui/button";
import { Globe, Building, MapPin, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PolicyScopeType } from "@/app/types/attendancePolicy";

export const SCOPE_ICONS = {
  global: <Globe className="h-4 w-4" />,
  site: <Building className="h-4 w-4" />,
  site_location: <MapPin className="h-4 w-4" />,
  duty: <Shield className="h-4 w-4" />,
};

interface ScopeOption {
  scopeType: PolicyScopeType;
  scopeId?: number | null;
  label: string;
  icon: React.ReactNode;
}
interface Props {
  options: ScopeOption[];
  active: { scopeType: PolicyScopeType; scopeId?: number | null };
  onChange: (scopeType: PolicyScopeType, scopeId?: number | null) => void;
}

export default function ScopeTabs({ options, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      {options.map((opt) => {
        const isActive =
          active.scopeType === opt.scopeType &&
          (active.scopeId ?? null) === (opt.scopeId ?? null);
        return (
          <Button
            key={`${opt.scopeType}-${opt.scopeId ?? "global"}`}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(opt.scopeType, opt.scopeId ?? null)}
            className={cn(
              "text-xs sm:text-sm",
              isActive && "bg-[#5F0015] hover:bg-[#7a0019] text-white"
            )}
          >
            {opt.icon}
            <span className="ml-2">{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
