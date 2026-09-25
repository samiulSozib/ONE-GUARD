"use client";

import { SettingGroup, SettingValue } from "@/app/types/settings.types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface NotificationGroupsProps {
  groups: SettingGroup[];
  values: Record<string, SettingValue>;
  onChange: (key: string, value: SettingValue) => void;
  disabled?: boolean;
}

export default function NotificationGroups({
  groups,
  values,
  onChange,
  disabled = false,
}: NotificationGroupsProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.group}
          className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden"
        >
          {/* Group header */}
          <header className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {group.group.replace(/_/g, " ")}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {group.items.length} setting
              {group.items.length === 1 ? "" : "s"}
            </p>
          </header>

          {/* Items */}
          <ul className="divide-y">
            {group.items.map((item) => {
              const currentValue = values[item.key];

              /* ---------- skip JSON types — rendered elsewhere ---------- */
              const isJson =
                item.type === "json" ||
                (currentValue !== null &&
                  typeof currentValue === "object");

              const isBool = item.type === "boolean";
              const isNumber =
                item.type === "integer" || item.type === "float";

              return (
                <li
                  key={item.id}
                  className={cn(
                    "px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                    !item.is_editable && "opacity-60"
                  )}
                >
                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label
                        htmlFor={item.key}
                        className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer"
                      >
                        {item.label}
                      </Label>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono text-gray-500"
                      >
                        {item.type}
                      </Badge>
                      {!item.is_editable && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-amber-300 text-amber-600"
                        >
                          read-only
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </p>
                    )}
                    <p className="text-[10px] font-mono text-gray-400 mt-1 truncate">
                      {item.key}
                    </p>
                  </div>

                  {/* Control */}
                  <div className="flex-shrink-0 self-start sm:self-auto">
                    {isJson ? (
                      /* JSON items are edited by a dedicated editor; show a stub */
                      <span className="text-[10px] text-gray-400 italic">
                        advanced editor
                      </span>
                    ) : isBool ? (
                      <Switch
                        id={item.key}
                        checked={Boolean(currentValue)}
                        onCheckedChange={(checked) =>
                          onChange(item.key, checked)
                        }
                        disabled={disabled || !item.is_editable}
                      />
                    ) : isNumber ? (
                      <Input
                        id={item.key}
                        type="number"
                        value={
                          currentValue === null ||
                          currentValue === undefined
                            ? ""
                            : String(currentValue)
                        }
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            onChange(item.key, 0);
                            return;
                          }
                          const num = Number(raw);
                          if (!Number.isNaN(num)) {
                            onChange(item.key, num);
                          }
                        }}
                        disabled={disabled || !item.is_editable}
                        className="w-24 sm:w-28 text-right"
                      />
                    ) : (
                      <Input
                        id={item.key}
                        type="text"
                        value={
                          currentValue === null ||
                          currentValue === undefined
                            ? ""
                            : String(currentValue)
                        }
                        onChange={(e) =>
                          onChange(item.key, e.target.value)
                        }
                        disabled={disabled || !item.is_editable}
                        className="w-40 sm:w-56"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
