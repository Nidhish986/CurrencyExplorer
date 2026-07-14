export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
}

export interface Country {
  cca2: string;
  name: string;
  flagUrl: string;
  region: string;
  subregion: string;
  currencies: Currency[];
}

export interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
  date: string;
  source: "live" | "cached";
  cachedAt?: string;
}

export interface PPPEntry {
  countryCode: string;
  year: number;
  pppConversionFactor: number;
  currencyCode: string;
  sourceDataset: string;
}

export interface SalaryComparison {
  amount: number;
  fromCountry: string;
  toCountry: string;
  exchangeRateResult: number | null;
  pppResult: number | null;
  createdAt: string;
}

export interface FavoritePair {
  id: string;
  type: "currency" | "salary";
  base: string;
  target: string;
  label: string;
  createdAt: string;
}

export interface HistoricalPoint {
  date: string;
  rate: number;
}

export interface StoredSelection {
  baseCurrency: string;
  targetCurrency: string;
  fromCountry: string;
  toCountry: string;
}
