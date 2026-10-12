"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/service/api.service";

type LookupKey =
  | "client_id"
  | "site_id"
  | "site_location_id"
  | "guard_id"
  | "duty_schedule_id"
  | "duty_id";

type Entry = {
  id: number;
  name: string;
  parent?: number | null;
};

type Props = {
  field: LookupKey;
  value: string;
  onChange: (value: string) => void;
  clientId?: string;
  siteId?: string;
  className?: string;
};

const resources: Record<
  LookupKey,
  { path: string; title: string; labels: string[] }
> = {
  client_id: {
    path: "/admin/clients",
    title: "Client",
    labels: ["full_name", "company_name", "name", "client_name"],
  },
  site_id: {
    path: "/admin/sites",
    title: "Site",
    labels: ["site_name", "name", "title"],
  },
  site_location_id: {
    path: "/admin/site-locations",
    title: "Site location",
    labels: ["title", "location_name", "name", "address"],
  },
  guard_id: {
    path: "/admin/guards",
    title: "Officer",
    labels: ["full_name", "name", "guard_name"],
  },
  duty_schedule_id: {
    path: "/admin/duty-schedules",
    title: "Shift schedule",
    labels: ["title", "name", "schedule_name"],
  },
  duty_id: {
    path: "/admin/duties",
    title: "Shift",
    labels: ["title", "name"],
  },
};

function asRecord(
  value: unknown
): Record<string, unknown> | null {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  const object = asRecord(payload);

  if (!object) return [];

  for (const key of [
    "items",
    "data",
    "results",
    "records",
    "clients",
    "sites",
    "locations",
    "guards",
    "duties",
    "schedules",
  ]) {
    const value = object[key];

    if (Array.isArray(value)) return value;

    const nested = asRecord(value);

    if (nested) {
      const result = getArray(nested);

      if (result.length) return result;
    }
  }

  if (object.body) return getArray(object.body);

  return [];
}

function normalize(
  payload: unknown,
  field: LookupKey
): Entry[] {
  const config = resources[field];

  return getArray(payload).flatMap((raw) => {
    const item = asRecord(raw);

    if (!item) return [];

    const id = Number(item.id);

    if (!Number.isFinite(id) || id <= 0) return [];

    const primary = config.labels
      .map((key) => item[key])
      .find(
        (value) =>
          typeof value === "string" &&
          value.trim().length > 0
      );

    const prefix =
      typeof primary === "string"
        ? primary
        : `${config.title} #${id}`;

    const code = item.guard_code ?? item.client_code;

    const name =
      typeof code === "string" && code.trim()
        ? `${prefix} (${code})`
        : prefix;

    const parentValue =
      field === "site_id" ? item.client_id : item.site_id;

    return [
      {
        id,
        name,
        parent:
          parentValue === undefined || parentValue === null
            ? null
            : Number(parentValue),
      },
    ];
  });
}

export default function ShiftFilterLookup({
  field,
  value,
  onChange,
  clientId,
  siteId,
  className,
}: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [term, setTerm] = useState("");

  const config = resources[field];

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(false);

    async function fetchOptions() {
      try {
        const response = await api.get(config.path, {
          params: {
            per_page: 100,
            page: 1,
          },
        });

        if (active) {
          setEntries(normalize(response.data, field));
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchOptions();

    return () => {
      active = false;
    };
  }, [config.path, field]);

  const options = useMemo(
    () =>
      entries.filter((entry) => {
        if (
          field === "site_id" &&
          clientId &&
          entry.parent != null &&
          String(entry.parent) !== clientId
        ) {
          return false;
        }

        if (
          field === "site_location_id" &&
          siteId &&
          entry.parent != null &&
          String(entry.parent) !== siteId
        ) {
          return false;
        }

        return (
          entry.name
            .toLowerCase()
            .includes(term.toLowerCase()) ||
          String(entry.id).includes(term)
        );
      }),
    [entries, field, clientId, siteId, term]
  );

  const selected = entries.find(
    (entry) => String(entry.id) === value
  );

  return (
    <div className="min-w-0 space-y-1">
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        aria-label={`Search ${config.title}`}
        placeholder={`Search ${config.title.toLowerCase()}...`}
        className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
      />

      <select
        className={
          className ||
          "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={config.title}
      >
        <option value="">
          All {config.title.toLowerCase()}s
        </option>

        {selected &&
          !options.some((entry) => entry.id === selected.id) && (
            <option value={selected.id}>
              {selected.name}
            </option>
          )}

        {!selected && value && (
          <option value={value}>
            {config.title} #{value}
          </option>
        )}

        {options.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
      </select>

      {loading && (
        <p className="text-xs text-muted-foreground">
          Loading options...
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600">
          Could not load {config.title.toLowerCase()} list.
        </p>
      )}

      {!loading && !error && !entries.length && (
        <p className="text-xs text-muted-foreground">
          No options found.
        </p>
      )}
    </div>
  );
}
