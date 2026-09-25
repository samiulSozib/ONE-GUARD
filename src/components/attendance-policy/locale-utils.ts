// locale-utils.ts
import type { LocalizedString } from "@/app/types/attendancePolicy";
export const pickLabel = (v: LocalizedString | null | undefined, locale = "en"): string =>
  v?.[locale] ?? v?.en ?? "";
export const LOCALE_DISPLAY: Record<string, string> = { en: "English", fa: "Farsi", ps: "Pashto" };
