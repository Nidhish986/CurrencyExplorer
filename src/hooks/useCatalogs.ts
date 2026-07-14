import { useMemo } from "react";
import { useApp } from "../context/AppContext";

export function useCatalogs() {
  const { countries } = useApp();
  const currencies = useMemo(() => {
    const map = new Map<string, { code: string; name: string; symbol: string; decimalDigits: number }>();
    countries.forEach((country) => {
      country.currencies.forEach((currency) => {
        if (!map.has(currency.code)) map.set(currency.code, currency);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [countries]);

  const countriesByCode = useMemo(() => new Map(countries.map((country) => [country.cca2, country])), [countries]);
  const countriesByCurrency = useMemo(() => {
    const map = new Map<string, string[]>();
    countries.forEach((country) => {
      country.currencies.forEach((currency) => {
        map.set(currency.code, [...(map.get(currency.code) || []), country.name]);
      });
    });
    return map;
  }, [countries]);

  return { currencies, countriesByCode, countriesByCurrency };
}
