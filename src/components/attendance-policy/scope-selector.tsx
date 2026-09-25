"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Building, Globe, MapPin, Shield } from "lucide-react";
import {  useAppSelector } from "@/hooks/useAppSelector";
import { fetchSites } from "@/store/slices/siteSlice";
import { fetchSiteLocations } from "@/store/slices/siteLocationSlice";
import { fetchDuties } from "@/store/slices/dutySlice";
import type { PolicyScopeType } from "@/app/types/attendancePolicy";
import SearchableEntityPicker, {
  type EntityOption,
} from "./searchable-entity-picker";
import { useAppDispatch } from '@/hooks/useAppDispatch';

export interface ScopeSelection {
  scopeType: PolicyScopeType;
  scopeId: number | null;
}

interface Props {
  value: ScopeSelection;
  onChange: (v: ScopeSelection) => void;
}

/* ----------------------------------------------------------------
   Debounce helper
---------------------------------------------------------------- */
function useDebounced<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ScopeSelector({ value, onChange }: Props) {
  const dispatch = useAppDispatch();

  /* -------------------------------------------------------------
     Only the slices for the currently-selected scope are read.
     The other slices may be empty — that's fine.
  ------------------------------------------------------------- */
  const { sites, isLoading: sitesLoading } = useAppSelector((s) => s.site);
  const { siteLocations, isLoading: locationsLoading } = useAppSelector(
    (s) => s.siteLocation
  );
  const { duties, isLoading: dutiesLoading } = useAppSelector((s) => s.duty);

  /* -------------------------------------------------------------
     Local search terms, debounced before hitting the API
  ------------------------------------------------------------- */
  const [siteTerm, setSiteTerm] = useState("");
  const [locTerm, setLocTerm] = useState("");
  const [dutyTerm, setDutyTerm] = useState("");

  const dSite = useDebounced(siteTerm);
  const dLoc = useDebounced(locTerm);
  const dDuty = useDebounced(dutyTerm);

  /* -------------------------------------------------------------
     Fire the right fetch when scopeType or its search term changes
  ------------------------------------------------------------- */
  useEffect(() => {
    if (value.scopeType !== "site") return;
    dispatch(
      fetchSites({ page: 1, per_page: 25, search: dSite || undefined })
    );
  }, [dispatch, value.scopeType, dSite]);

  useEffect(() => {
    if (value.scopeType !== "site_location") return;
    dispatch(
      fetchSiteLocations({
        page: 1,
        per_page: 25,
        search: dLoc || undefined,
      })
    );
  }, [dispatch, value.scopeType, dLoc]);

  useEffect(() => {
    if (value.scopeType !== "duty") return;
    dispatch(
      fetchDuties({ page: 1, per_page: 25, search: dDuty || undefined })
    );
  }, [dispatch, value.scopeType, dDuty]);

  /* -------------------------------------------------------------
     Reset entity id when the scope type changes
  ------------------------------------------------------------- */
  const handleScopeTypeChange = (next: PolicyScopeType) => {
    if (next === value.scopeType) return;
    onChange({ scopeType: next, scopeId: null });
    if (next === "site" && sites.length === 0) {
      dispatch(fetchSites({ page: 1, per_page: 25 }));
    }
    if (next === "site_location" && siteLocations.length === 0) {
      dispatch(fetchSiteLocations({ page: 1, per_page: 25}));
    }
    if (next === "duty" && duties.length === 0) {
      dispatch(fetchDuties({ page: 1, per_page: 25 }));
    }
  };

  /* -------------------------------------------------------------
     Map slice data → EntityOption
  ------------------------------------------------------------- */
  const siteOptions: EntityOption[] = useMemo(
    () =>
      sites.map((s: any) => ({
        value: s.id,
        label: s.site_name || s.title || `Site #${s.id}`,
        sublabel: s.address || undefined,
      })),
    [sites]
  );

  const locOptions: EntityOption[] = useMemo(
    () =>
      siteLocations.map((l: any) => ({
        value: l.id,
        label: l.title || l.name || `Location #${l.id}`,
        sublabel: l.site?.site_name ? `Site: ${l.site.site_name}` : undefined,
      })),
    [siteLocations]
  );

  const dutyOptions: EntityOption[] = useMemo(
    () =>
      duties.map((d: any) => ({
        value: d.id,
        label: d.title || `Duty #${d.id}`,
        sublabel: d.site?.site_name ? `Site: ${d.site.site_name}` : undefined,
      })),
    [duties]
  );

  /* -------------------------------------------------------------
     Render
  ------------------------------------------------------------- */
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      {/* Step 1 — Scope type */}
      <Select
        value={value.scopeType}
        onValueChange={(v) => handleScopeTypeChange(v as PolicyScopeType)}
      >
        <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
          <SelectValue placeholder="Scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" /> Global
            </span>
          </SelectItem>
          <SelectItem value="site">
            <span className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5" /> Site
            </span>
          </SelectItem>
          <SelectItem value="site_location">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Site Location
            </span>
          </SelectItem>
          <SelectItem value="duty">
            <span className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" /> Duty
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Step 2 — Entity picker (hidden for Global) */}
      {value.scopeType === "site" && (
        <SearchableEntityPicker
          placeholder="Search & select a site…"
          value={value.scopeId}
          options={siteOptions}
          isLoading={sitesLoading}
          onSearch={setSiteTerm}
          onSelect={(id) => onChange({ scopeType: "site", scopeId: id })}
          emptyMessage={
            siteTerm ? "No sites match your search" : "Start typing to search sites"
          }
        />
      )}

      {value.scopeType === "site_location" && (
        <SearchableEntityPicker
          placeholder="Search & select a site location…"
          value={value.scopeId}
          options={locOptions}
          isLoading={locationsLoading}
          onSearch={setLocTerm}
          onSelect={(id) =>
            onChange({ scopeType: "site_location", scopeId: id })
          }
          emptyMessage={
            locTerm
              ? "No locations match your search"
              : "Start typing to search site locations"
          }
        />
      )}

      {value.scopeType === "duty" && (
        <SearchableEntityPicker
          placeholder="Search & select a duty…"
          value={value.scopeId}
          options={dutyOptions}
          isLoading={dutiesLoading}
          onSearch={setDutyTerm}
          onSelect={(id) => onChange({ scopeType: "duty", scopeId: id })}
          emptyMessage={
            dutyTerm ? "No duties match your search" : "Start typing to search duties"
          }
        />
      )}
    </div>
  );
}
