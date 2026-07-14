import type { HistoricalPoint } from "../types";

export const formatMoney = (value: number, currency: string, maximumFractionDigits = 2) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits
    }).format(value);
  } catch {
    // Fallback if the currency code is invalid (e.g. a country code was passed)
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value)} ${currency}`;
  }
};

export const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));

export const dateForRange = (range: string) => {
  const now = new Date();
  const start = new Date(now);
  if (range === "7d") start.setDate(now.getDate() - 7);
  if (range === "30d") start.setDate(now.getDate() - 30);
  if (range === "6m") start.setMonth(now.getMonth() - 6);
  if (range === "1y") start.setFullYear(now.getFullYear() - 1);
  if (range === "5y") start.setFullYear(now.getFullYear() - 5);
  return start.toISOString().slice(0, 10);
};

export const compactChartTicks = (points: HistoricalPoint[]) =>
  points.map((point) => new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }));
