"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EntityOption {
  value: number;
  label: string;
  sublabel?: string;
}

interface Props {
  placeholder?: string;
  value: number | null;
  options: EntityOption[];
  isLoading?: boolean;
  /** Fired on every keystroke (debounced by parent) */
  onSearch?: (term: string) => void;
  onSelect: (value: number, option: EntityOption) => void;
  emptyMessage?: string;
}

export default function SearchableEntityPicker({
  placeholder = "Select…",
  value,
  options,
  isLoading,
  onSearch,
  onSelect,
  emptyMessage = "No results",
}: Props) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const handleTerm = (v: string) => {
    setTerm(v);
    onSearch?.(v);
  };

  return (
    <div className="relative w-full sm:w-[320px]">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full h-9 justify-between text-sm font-normal",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </Button>

      {open && (
        <>
          {/* click-away */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-40 mt-1 w-full rounded-lg border bg-white dark:bg-gray-900 shadow-lg">
            {/* search bar */}
            <div className="flex items-center gap-2 border-b px-2 py-1.5">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                autoFocus
                value={term}
                onChange={(e) => handleTerm(e.target.value)}
                placeholder="Search…"
                className="h-7 border-0 shadow-none focus-visible:ring-0 text-sm"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => handleTerm("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* list */}
            <div className="max-h-64 overflow-y-auto py-1">
              {isLoading && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </div>
              )}

              {!isLoading && options.length === 0 && (
                <div className="px-3 py-3 text-xs text-gray-500">
                  {emptyMessage}
                </div>
              )}

              {!isLoading &&
                options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onSelect(opt.value, opt);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                        isSelected && "bg-gray-100 dark:bg-gray-800"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="text-[11px] text-gray-500 truncate">
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
