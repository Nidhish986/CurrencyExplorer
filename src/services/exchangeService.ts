import type { ExchangeRate, HistoricalPoint } from "../types";
import { dateForRange } from "../utils/format";
import { isFresh, readCache, writeCache } from "./storage";

const FRANKFURTER_API = "https://api.frankfurter.dev/v2";
const REQUEST_TIMEOUT = 8000;
const HISTORY_TTL = 60 * 60 * 1000;
const RATE_TTL = 30 * 60 * 1000;

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json() as Promise<T>;
  } finally {
    window.clearTimeout(timer);
  }
}

function rateKey(base: string, target: string) {
  return `rate:${base}:${target}`;
}

function historyKey(base: string, target: string, range: string) {
  return `history:${base}:${target}:${range}`;
}

type RateResponse = { base: string; quote: string; rate: number; date: string };

type LatestRatesResponse = Array<{ base: string; quote: string; rate: number; date: string }>;

export async function getExchangeRate(base: string, target: string): Promise<ExchangeRate> {
  const normalizedBase = base.toUpperCase();
  const normalizedTarget = target.toUpperCase();
  if (normalizedBase === normalizedTarget) {
    return { base: normalizedBase, target: normalizedTarget, rate: 1, date: new Date().toISOString().slice(0, 10), source: "live" };
  }

  const key = rateKey(normalizedBase, normalizedTarget);
  try {
    const data = await fetchJson<RateResponse>(`${FRANKFURTER_API}/rate/${normalizedBase}/${normalizedTarget}`);
    const result: ExchangeRate = {
      base: data.base,
      target: data.quote,
      rate: data.rate,
      date: data.date,
      source: "live"
    };
    writeCache(key, result, RATE_TTL);
    return result;
  } catch (error) {
    const cached = readCache<ExchangeRate>(key);
    if (cached) {
      return { ...cached.value, source: "cached", cachedAt: cached.cachedAt };
    }
    throw error;
  }
}

export async function getLatestRates(base: string, targets: string[]) {
  const quoteList = targets.filter((target) => target !== base).map((target) => target.toUpperCase());
  if (quoteList.length === 0) return [];
  const data = await fetchJson<LatestRatesResponse>(
    `${FRANKFURTER_API}/rates?base=${base.toUpperCase()}&quotes=${quoteList.join(",")}`
  );
  return data.map((row) => ({ base: row.base, target: row.quote, rate: row.rate, date: row.date, source: "live" as const }));
}

export async function getHistoricalRates(base: string, target: string, range: string): Promise<HistoricalPoint[]> {
  const key = historyKey(base.toUpperCase(), target.toUpperCase(), range);
  const cached = readCache<HistoricalPoint[]>(key);
  if (isFresh(cached)) return cached!.value;

  const from = dateForRange(range);
  const group = range === "5y" ? "&group=month" : "";
  const data = await fetchJson<LatestRatesResponse>(
    `${FRANKFURTER_API}/rates?from=${from}&base=${base.toUpperCase()}&quotes=${target.toUpperCase()}${group}`
  );
  const points = data.map((row) => ({ date: row.date, rate: row.rate }));
  writeCache(key, points, HISTORY_TTL);
  return points;
}

export function hasFreshHistoricalCache(base: string, target: string, range: string) {
  return isFresh(readCache<HistoricalPoint[]>(historyKey(base.toUpperCase(), target.toUpperCase(), range)));
}
