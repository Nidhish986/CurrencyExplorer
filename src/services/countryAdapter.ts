import type { Country } from "../types";

type SourceCountry = {
  cca2?: string;
  name?: { common?: string };
  region?: string;
  subregion?: string;
  currencies?: Record<string, { name?: string; symbol?: string }>;
};

const decimalDigitsByCurrency: Record<string, number> = {
  BHD: 3,
  CLF: 4,
  IQD: 3,
  JOD: 3,
  KWD: 3,
  LYD: 3,
  OMR: 3,
  TND: 3,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
  BIF: 0,
  CLP: 0,
  DJF: 0,
  GNF: 0,
  ISK: 0,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  MGA: 0,
  PYG: 0,
  RWF: 0,
  UGX: 0,
  UYI: 0,
  VND: 0
};

export function adaptCountrySource(rows: SourceCountry[]): Country[] {
  return rows
    .filter((country) => country.cca2 && country.name?.common)
    .map((country) => ({
      cca2: country.cca2!,
      name: country.name!.common!,
      flagUrl: `https://flagcdn.com/${country.cca2!.toLowerCase()}.svg`,
      region: country.region || "Unassigned",
      subregion: country.subregion || "Unassigned",
      currencies: Object.entries(country.currencies || {}).map(([code, value]) => ({
        code,
        name: value.name || code,
        symbol: value.symbol || code,
        decimalDigits: decimalDigitsByCurrency[code] ?? 2
      }))
    }))
    .filter((country) => country.currencies.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
