"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, MapPin, Shield, UserRound, Users } from "lucide-react";
import api from "@/service/api.service";
import { SearchableDropdownWithIcon } from "@/components/ui/searchable-dropdown-with-icon";

type EntityField =
  | "client_id"
  | "site_id"
  | "site_location_id"
  | "guard_id"
  | "duty_schedule_id"
  | "duty_id";

type LookupOption = { value: string; label: string };
type RawEntity = Record<string, unknown>;

interface Props {
  field: EntityField;
  value: string;
  onChange: (value: string) => void;
  clientId?: string;
  siteId?: string;
}

const config = {
  client_id: {
    route: "/admin/clients",
    name: "client",
    icon: Users,
    fields: ["company_name", "client_name", "name", "full_name"],
  },
  site_id: {
    route: "/admin/sites",
    name: "site",
    icon: Building2,
    fields: ["site_name", "title", "name"],
  },
  site_location_id: {
    route: "/admin/site-locations",
    name: "site location",
    icon: MapPin,
    fields: ["title", "location_name", "name", "address"],
  },
  guard_id: {
    route: "/admin/guards",
    name: "officer",
    icon: Shield,
    fields: ["full_name", "name", "guard_name"],
  },
  duty_schedule_id: {
    route: "/admin/duty-schedules",
    name: "shift schedule",
    icon: CalendarDays,
    fields: ["title", "name", "schedule_name"],
  },
  duty_id: {
    route: "/admin/duties",
    name: "duty",
    icon: UserRound,
    fields: ["title", "name", "duty_name"],
  },
} as const;

function obj(value: unknown): RawEntity | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as RawEntity)
    : null;
}

function itemsFromResponse(input: unknown): RawEntity[] {
  const outer = obj(input);
  const body = outer && "body" in outer ? outer.body : input;
  const result = obj(body);
  const items = Array.isArray(body)
    ? body
    : result && Array.isArray(result.items)
      ? result.items
      : result && Array.isArray(result.data)
        ? result.data
        : [];
  return items.map(obj).filter((item): item is RawEntity => item !== null);
}

function toOptions(rows: RawEntity[], field: EntityField): LookupOption[] {
  const rule = config[field];
  return rows.flatMap((item) => {
    const id = Number(item.id);
    if (!Number.isSafeInteger(id) || id <= 0) return [];
    const found = rule.fields
      .map((key) => item[key])
      .find((part) => typeof part === "string" && part.trim().length > 0);
    const label = typeof found === "string" ? found : `${rule.name} #${id}`;
    const code = field === "guard_id" ? item.guard_code : undefined;
    return [{
      value: String(id),
      label: typeof code === "string" && code.trim()
        ? `${label} (${code})`
        : label,
    }];
  });
}

export default function ShiftEntitySearchSelect({
  field,
  value,
  onChange,
  clientId = "",
  siteId = "",
}: Props) {
  const rule = config[field];
  const selectedValue = String(value ?? "");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<LookupOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  // A dependent dropdown must not retain a label from the previous parent.
  useEffect(() => {
    setSelectedOption(null);
    setOptions([]);
    setSearch("");
    setQuery("");
  }, [field, clientId, siteId]);

  useEffect(() => {
    if (field === "site_location_id" && !siteId) {
      setOptions([]);
      setLoading(false);
      return;
    }

    const abort = new AbortController();
    let active = true;
    const params: Record<string, string | number> = {
      page: 1,
      per_page: 100,
      search: query,
    };
    if (field === "site_id" && clientId) params.client_id = clientId;
    if (field === "site_location_id") params.site_id = siteId;
    if ((field === "duty_id" || field === "duty_schedule_id") && siteId) {
      params.site_id = siteId;
    }

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get(rule.route, {
          params,
          signal: abort.signal,
        });
        if (active) setOptions(toOptions(itemsFromResponse(response.data), field));
      } catch {
        if (active) {
          setError(true);
          setOptions([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      abort.abort();
    };
  }, [field, rule.route, query, clientId, siteId]);

  const availableOptions = useMemo(() => {
    const allOption: LookupOption = {
      value: "__all__",
      label: `All ${rule.name}s`,
    };
    const selected = selectedOption?.value === selectedValue ? selectedOption : null;
    return [
      allOption,
      ...(selected && !options.some((option) => option.value === selectedValue)
        ? [selected]
        : []),
      ...options,
    ];
  }, [options, selectedOption, rule.name, selectedValue]);

  const disabled = field === "site_location_id" && !siteId;

  return (
    <div className="min-w-0 space-y-1">
      <SearchableDropdownWithIcon
        value={selectedValue || "__all__"}
        onValueChange={(next) => {
          const nextValue = String(next) === "__all__" ? "" : String(next);
          setSelectedOption(
            nextValue
              ? availableOptions.find((option) => option.value === nextValue) ?? null
              : null
          );
          onChange(nextValue);
        }}
        options={availableOptions}
        onSearch={setSearch}
        placeholder={disabled ? "Select site first" : `All ${rule.name}s`}
        searchPlaceholder={`Search ${rule.name}s...`}
        emptyMessage={error ? "Unable to load options" : loading ? "Loading..." : "No results found"}
        disabled={disabled}
        icon={rule.icon}
        iconPosition="left"
      />
      {error && (
        <p className="text-xs text-red-600">Could not load {rule.name}s. Please retry searching.</p>
      )}
    </div>
  );
}
