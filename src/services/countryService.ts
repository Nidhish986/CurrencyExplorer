import countrySnapshot from "../data/countries-snapshot.json";
import type { Country } from "../types";
import { adaptCountrySource } from "./countryAdapter";

const COUNTRY_SOURCE_URL = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
const REQUEST_TIMEOUT = 7000;

type Snapshot = { countries: Country[] };

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function getCountries(): Promise<{ countries: Country[]; source: "live" | "snapshot" }> {
  try {
    const response = await fetchWithTimeout(COUNTRY_SOURCE_URL);
    if (!response.ok) throw new Error("Country source unavailable");
    const raw = await response.json();
    return { countries: adaptCountrySource(raw), source: "live" };
  } catch {
    return { countries: (countrySnapshot as Snapshot).countries, source: "snapshot" };
  }
}

export function getSnapshotCountries() {
  return (countrySnapshot as Snapshot).countries;
}

export const countrySourceDetails = {
  name: "mledoze/countries",
  url: COUNTRY_SOURCE_URL,
  adapter: "mledoze/countries -> PRD Country contract"
};
