import { useEffect, useMemo, useState } from "react";
import { Compass, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Card, SectionHeader } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { useApp } from "../context/AppContext";
import { getExchangeRate } from "../services/exchangeService";
import { getPPPEntry } from "../services/pppService";
import type { ExchangeRate } from "../types";
import { formatNumber } from "../utils/format";

export function Explorer() {
  const { countries, countriesLoading, addViewedCountry } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [rateError, setRateError] = useState("");

  const selectedCode = searchParams.get("country") || countries[0]?.cca2 || "";
  const selectedCountry = countries.find((country) => country.cca2 === selectedCode) || countries[0];
  const primaryCurrency = selectedCountry?.currencies[0];
  const ppp = selectedCountry ? getPPPEntry(selectedCountry.cca2) : null;

  const regions = useMemo(() => ["All", ...Array.from(new Set(countries.map((country) => country.region))).sort()], [countries]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return countries.filter((country) => {
      const matchesRegion = region === "All" || country.region === region;
      const currencyText = country.currencies.map((currency) => `${currency.code} ${currency.name}`).join(" ").toLowerCase();
      const matchesQuery = !normalized || country.name.toLowerCase().includes(normalized) || currencyText.includes(normalized);
      return matchesRegion && matchesQuery;
    });
  }, [countries, query, region]);

  useEffect(() => {
    if (!selectedCountry || !primaryCurrency) return;
    addViewedCountry(selectedCountry.cca2);
    setRate(null);
    setRateError("");
    getExchangeRate("USD", primaryCurrency.code)
      .then(setRate)
      .catch(() => setRateError("Exchange-rate summary unavailable for this currency."));
  }, [addViewedCountry, primaryCurrency, selectedCountry]);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <SectionHeader title="World Explorer" eyebrow="Countries and currencies" />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block" htmlFor="country-search">
            <Search className="pointer-events-none absolute left-3 top-3 text-ink/50 dark:text-paper/50" size={19} aria-hidden="true" />
            <input
              id="country-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country, rupee, USD..."
              className="min-h-12 w-full rounded-lg border border-ink/15 bg-white pl-10 pr-3 font-bold text-ink dark:border-white/15 dark:bg-night dark:text-paper"
            />
          </label>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="min-h-12 rounded-lg border border-ink/15 bg-white px-3 font-bold text-ink dark:border-white/15 dark:bg-night dark:text-paper"
            aria-label="Filter by continent"
          >
            {regions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="mt-4 max-h-[42rem] space-y-2 overflow-auto pr-1">
          {countriesLoading ? <div className="skeleton h-80 rounded-lg" /> : filtered.length ? filtered.map((country) => (
            <button
              type="button"
              key={country.cca2}
              onClick={() => setSearchParams({ country: country.cca2 })}
              className="flex w-full items-center gap-3 rounded-lg bg-paper p-3 text-left transition hover:bg-lime dark:bg-night/45 dark:hover:bg-white/10"
            >
              <img src={country.flagUrl} alt="" className="h-8 w-12 rounded object-cover" loading="lazy" />
              <span className="min-w-0">
                <span className="block truncate font-black">{country.name}</span>
                <span className="block truncate text-sm font-bold text-ink/80 dark:text-paper/80">
                  {country.currencies.map((currency) => `${currency.code} ${currency.symbol}`).join(", ")}
                </span>
              </span>
            </button>
          )) : <EmptyState icon={Search} title="No countries found" message="Try a continent, country name, currency name, or currency code." />}
        </div>
      </Card>

      <Card>
        {selectedCountry ? (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-leaf/75 dark:text-mint/80">Country detail</p>
                <h1 className="mt-1 text-4xl font-black tracking-normal">{selectedCountry.name}</h1>
                <p className="mt-2 font-bold text-ink/80 dark:text-paper/80">{selectedCountry.region} / {selectedCountry.subregion}</p>
              </div>
              <img src={selectedCountry.flagUrl} alt={`${selectedCountry.name} flag`} className="h-24 w-36 rounded-lg object-cover shadow-soft" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-paper p-4 dark:bg-night/45">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-ink/80 dark:text-paper/80">Currency</p>
                {selectedCountry.currencies.map((currency) => (
                  <div key={currency.code} className="mt-3">
                    <p className="text-2xl font-black">{currency.code} {currency.symbol}</p>
                    <p className="font-bold text-ink/80 dark:text-paper/80">{currency.name}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-paper p-4 dark:bg-night/45">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-ink/80 dark:text-paper/80">USD exchange rate</p>
                {rate ? <p className="mt-3 text-2xl font-black">1 USD = {formatNumber(rate.rate, 4)} {rate.target}</p> : <p className="mt-3 font-bold text-coral">{rateError || "Loading exchange rate..."}</p>}
                {rate?.source === "cached" ? <p className="mt-2 text-sm font-bold text-coral">Stale cached rate</p> : null}
              </div>
              <div className="rounded-lg bg-paper p-4 dark:bg-night/45 sm:col-span-2">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-ink/80 dark:text-paper/80">PPP summary</p>
                {ppp ? (
                  <p className="mt-3 text-xl font-black">PPP factor: {formatNumber(ppp.pppConversionFactor, 4)} {ppp.currencyCode || primaryCurrency?.code} per international dollar ({ppp.year})</p>
                ) : (
                  <p className="mt-3 rounded-lg bg-coral/15 p-3 font-black text-coral">PPP data unavailable for {selectedCountry.name}.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <EmptyState icon={Compass} title="No country selected" message="Choose a country to inspect its currency, rate, and PPP summary." />
        )}
      </Card>
    </div>
  );
}
