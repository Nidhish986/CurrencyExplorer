import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Heart, Search } from "lucide-react";
import { Card, SectionHeader } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { useApp } from "../context/AppContext";
import { useCatalogs } from "../hooks/useCatalogs";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { getExchangeRate } from "../services/exchangeService";
import type { ExchangeRate } from "../types";
import { isValidCurrencyCode } from "../utils/common";
import { formatDateTime, formatMoney } from "../utils/format";

export function Converter() {
  const { selection, updateSelection, addFavorite, isOnline } = useApp();
  const { currencies, countriesByCurrency } = useCatalogs();
  const [amount, setAmount] = useState("");
  const [base, setBase] = useState(selection.baseCurrency);
  const [target, setTarget] = useState(selection.targetCurrency);
  const [query, setQuery] = useState("");
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedAmount = useDebouncedValue(amount, 300);

  const baseValid = isValidCurrencyCode(base) && currencies.some((currency) => currency.code === base.toUpperCase());
  const targetValid = isValidCurrencyCode(target) && currencies.some((currency) => currency.code === target.toUpperCase());

  const filteredCurrencies = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return currencies.slice(0, 40);
    return currencies
      .filter((currency) => {
        const countries = (countriesByCurrency.get(currency.code) || []).join(" ").toLowerCase();
        return currency.code.toLowerCase().includes(search) || currency.name.toLowerCase().includes(search) || countries.includes(search);
      })
      .slice(0, 40);
  }, [countriesByCurrency, currencies, query]);

  useEffect(() => {
    if (!baseValid || !targetValid) {
      setError("Enter valid ISO 4217 currency codes before converting.");
      setRate(null);
      return;
    }
    if (!isOnline) {
      setError("You are offline. Live conversion is disabled unless a cached rate is available.");
    }
    setLoading(true);
    setError("");
    getExchangeRate(base.toUpperCase(), target.toUpperCase())
      .then((result) => {
        setRate(result);
        updateSelection({ baseCurrency: result.base, targetCurrency: result.target });
      })
      .catch(() => setError("Live rate unavailable and no cached rate exists for this pair."))
      .finally(() => setLoading(false));
  }, [base, baseValid, isOnline, target, targetValid, updateSelection]);

  const parsedAmount = debouncedAmount !== "" ? Number(debouncedAmount) : NaN;
  const converted = rate && !isNaN(parsedAmount) ? parsedAmount * rate.rate : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
      <Card>
        <SectionHeader title="Currency Converter" eyebrow="Live exchange rates" />
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <label className="block" htmlFor="base-code">
            <span className="mb-2 block text-sm font-extrabold text-ink/80 dark:text-paper/80">Base currency</span>
            <input
              id="base-code"
              value={base}
              maxLength={3}
              onChange={(event) => setBase(event.target.value.toUpperCase())}
              className="min-h-12 w-full rounded-lg border border-ink/15 bg-white px-3 text-lg font-black uppercase text-ink dark:border-white/15 dark:bg-night dark:text-paper"
              aria-invalid={!baseValid}
            />
            {!baseValid ? <p className="mt-2 text-sm font-bold text-coral">Invalid or unsupported currency code.</p> : null}
          </label>
          <button
            type="button"
            onClick={() => {
              setBase(target);
              setTarget(base);
            }}
            className="grid min-h-12 place-items-center rounded-lg bg-ink px-4 text-lime transition hover:bg-leaf dark:bg-lime dark:text-ink"
            aria-label="Reverse conversion and fetch new rate"
            title="Reverse conversion"
          >
            <ArrowLeftRight aria-hidden="true" />
          </button>
          <label className="block" htmlFor="target-code">
            <span className="mb-2 block text-sm font-extrabold text-ink/80 dark:text-paper/80">Target currency</span>
            <input
              id="target-code"
              value={target}
              maxLength={3}
              onChange={(event) => setTarget(event.target.value.toUpperCase())}
              className="min-h-12 w-full rounded-lg border border-ink/15 bg-white px-3 text-lg font-black uppercase text-ink dark:border-white/15 dark:bg-night dark:text-paper"
              aria-invalid={!targetValid}
            />
            {!targetValid ? <p className="mt-2 text-sm font-bold text-coral">Invalid or unsupported currency code.</p> : null}
          </label>
        </div>

        <label className="mt-5 block" htmlFor="amount">
          <span className="mb-2 block text-sm font-extrabold text-ink/80 dark:text-paper/80">Amount</span>
          <input
            id="amount"
            type="number"
            min="0"
            value={amount}
            placeholder="Enter amount to convert"
            onChange={(event) => setAmount(event.target.value)}
            className="min-h-14 w-full rounded-lg border border-ink/15 bg-white px-4 text-2xl font-black text-ink dark:border-white/15 dark:bg-night dark:text-paper"
          />
        </label>

        <div className="mt-5 rounded-lg bg-ink p-6 text-paper dark:bg-night">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-mint">Result</p>
          <p className="mt-2 text-4xl font-black text-lime">
            {loading ? <div className="skeleton h-12 w-48 rounded-lg" /> : converted !== null && rate ? formatMoney(converted, rate.target) : "Unavailable"}
          </p>
          {rate ? <p className="mt-3 font-bold text-paper/85">1 {rate.base} = {rate.rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {rate.target}. Last updated {rate.date}.</p> : null}
          {rate?.source === "cached" ? <span className="mt-3 inline-flex rounded bg-coral px-3 py-1 text-sm font-black text-ink">Stale data from {formatDateTime(rate.cachedAt || rate.date)}</span> : null}
          {error ? <p className="mt-3 text-sm font-bold text-coral">{error}</p> : null}
          <button
            type="button"
            disabled={!rate}
            onClick={() => rate && addFavorite({ type: "currency", base: rate.base, target: rate.target, label: `${rate.base} to ${rate.target}` })}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-lime px-4 font-black text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Heart size={18} aria-hidden="true" /> Add favorite
          </button>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Search Currencies" eyebrow="Country, name, code" />
        <label className="relative block" htmlFor="currency-search">
          <Search className="pointer-events-none absolute left-3 top-3 text-ink/50 dark:text-paper/50" size={19} aria-hidden="true" />
          <input
            id="currency-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search India, rupee, USD..."
            className="min-h-12 w-full rounded-lg border border-ink/15 bg-white pl-10 pr-3 font-bold text-ink dark:border-white/15 dark:bg-night dark:text-paper"
          />
        </label>
        <div className="mt-4 max-h-[36rem] space-y-2 overflow-auto pr-1">
          {filteredCurrencies.length ? filteredCurrencies.map((currency) => (
            <button
              type="button"
              key={currency.code}
              onClick={() => setTarget(currency.code)}
              className="w-full rounded-lg bg-paper p-3 text-left transition hover:bg-lime dark:bg-night/45 dark:hover:bg-white/10"
            >
              <span className="block font-black">{currency.code} - {currency.name}</span>
              <span className="text-sm font-bold text-ink/80 dark:text-paper/80">{(countriesByCurrency.get(currency.code) || []).slice(0, 4).join(", ")}</span>
            </button>
          )) : <EmptyState icon={Search} title="No currencies found" message="Try a country name, currency name, or ISO code." />}
        </div>
      </Card>
    </div>
  );
}
