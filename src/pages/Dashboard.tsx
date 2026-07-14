import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Compass, Heart, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, SectionHeader } from "../components/Card";
import { CurrencySelect } from "../components/Forms";
import { EmptyState } from "../components/EmptyState";
import { SkeletonCard } from "../components/SkeletonCard";
import { useApp } from "../context/AppContext";
import { useCatalogs } from "../hooks/useCatalogs";
import { getExchangeRate, getLatestRates } from "../services/exchangeService";
import type { ExchangeRate } from "../types";
import { formatDateTime, formatMoney, formatNumber } from "../utils/format";

export function Dashboard() {
  const { favorites, recentComparisons, recentlyViewedCountries, countriesLoading, selection, updateSelection, addFavorite, countries } = useApp();
  const { currencies, countriesByCode } = useCatalogs();
  const [amount, setAmount] = useState("");
  const [quickResult, setQuickResult] = useState<ExchangeRate | null>(null);
  const [latestRates, setLatestRates] = useState<ExchangeRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);

  const popularTargets = useMemo(() => ["EUR", "GBP", "INR", "JPY", "CAD", "AUD"], []);

  useEffect(() => {
    if (!selection.baseCurrency || !selection.targetCurrency) return;
    setQuickResult(null);
    getExchangeRate(selection.baseCurrency, selection.targetCurrency).then(setQuickResult).catch(() => setQuickResult(null));
  }, [selection.baseCurrency, selection.targetCurrency]);

  useEffect(() => {
    setLoadingRates(true);
    getLatestRates("USD", popularTargets)
      .then(setLatestRates)
      .catch(() => setLatestRates([]))
      .finally(() => setLoadingRates(false));
  }, [popularTargets]);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-lg bg-ink p-6 text-paper shadow-soft dark:bg-leaf md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-mint">Exchange rate and PPP clarity</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-normal text-lime sm:text-5xl">Global Money Companion</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-paper/88">
            Compare market currency conversion with purchasing power so salary, travel, and relocation decisions feel less abstract.
          </p>
        </div>
        <div className="rounded-lg bg-lime p-5 text-ink">
          <p className="text-sm font-black uppercase tracking-[0.14em]">Portfolio-ready fintech UI</p>
          <p className="mt-4 text-3xl font-black">{countries.length || "246"}</p>
          <p className="font-bold">countries, official PPP data, and live Frankfurter exchange rates.</p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeader title="Quick Currency Converter" eyebrow="Dashboard" />
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <CurrencySelect id="dash-base" label="From" value={selection.baseCurrency} onChange={(value) => updateSelection({ baseCurrency: value })} currencies={currencies} />
            <button
              type="button"
              onClick={() => updateSelection({ baseCurrency: selection.targetCurrency, targetCurrency: selection.baseCurrency })}
              className="grid min-h-12 place-items-center rounded-lg bg-ink px-4 text-lime transition hover:bg-leaf dark:bg-lime dark:text-ink"
              aria-label="Reverse dashboard conversion"
              title="Reverse conversion"
            >
              <ArrowLeftRight aria-hidden="true" />
            </button>
            <CurrencySelect id="dash-target" label="To" value={selection.targetCurrency} onChange={(value) => updateSelection({ targetCurrency: value })} currencies={currencies} />
          </div>
          <label className="mt-4 block" htmlFor="dash-amount">
            <span className="mb-2 block text-sm font-extrabold text-ink/80 dark:text-paper/80">Amount</span>
            <input
              id="dash-amount"
              type="number"
              min="0"
              value={amount}
              placeholder="Enter amount"
              onChange={(event) => setAmount(event.target.value)}
              className="min-h-14 w-full rounded-lg border border-ink/15 px-4 text-2xl font-black text-ink dark:border-white/15 dark:bg-night dark:text-paper"
            />
          </label>
          <div className="mt-5 rounded-lg bg-paper p-5 dark:bg-night/55">
            <p className="text-sm font-bold text-ink/80 dark:text-paper/80">Converted value</p>
            <p className="mt-1 text-3xl font-black text-ink dark:text-lime">
              {quickResult && amount !== "" ? formatMoney(Number(amount) * quickResult.rate, quickResult.target) : "Enter an amount"}
            </p>
            {quickResult?.source === "cached" ? <p className="mt-2 text-sm font-bold text-coral">Stale data from {formatDateTime(quickResult.cachedAt || quickResult.date)}</p> : null}
            <button
              type="button"
              onClick={() => quickResult && addFavorite({ type: "currency", base: quickResult.base, target: quickResult.target, label: `${quickResult.base} to ${quickResult.target}` })}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-lime px-4 font-black text-ink"
            >
              <Heart size={18} aria-hidden="true" /> Save pair
            </button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Favorite Currency Pairs" eyebrow="Saved" action={<Link className="text-sm font-black text-leaf underline dark:text-mint" to="/favorites">View all</Link>} />
          {favorites.length ? (
            <div className="space-y-3">
              {favorites.slice(0, 5).map((favorite) => (
                <div key={favorite.id} className="flex items-center justify-between rounded-lg bg-paper p-3 dark:bg-night/45">
                  <span className="font-black">{favorite.label}</span>
                  <span className="text-sm font-bold text-ink/80 dark:text-paper/80">{favorite.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Heart} title="No favorites yet" message="Save currency or salary pairs and they will appear here." />
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {loadingRates ? <SkeletonCard /> : (
          <Card>
            <SectionHeader title="Latest USD Rates" eyebrow="Live" />
            <div className="space-y-3">
              {latestRates.map((rate) => (
                <div key={rate.target} className="flex items-center justify-between border-b border-ink/10 pb-2 last:border-b-0 dark:border-white/10">
                  <span className="font-black">USD / {rate.target}</span>
                  <span className="font-black text-leaf dark:text-mint">{formatNumber(rate.rate, 4)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <SectionHeader title="Recent Salary Comparisons" eyebrow="PPP" />
          {recentComparisons.length ? (
            <div className="space-y-3">
              {recentComparisons.slice(0, 4).map((comparison) => {
                const from = countriesByCode.get(comparison.fromCountry);
                const to = countriesByCode.get(comparison.toCountry);
                return <div key={comparison.createdAt} className="rounded-lg bg-paper p-3 text-sm font-bold dark:bg-night/45">{from?.name} to {to?.name}: {comparison.pppResult ? formatNumber(comparison.pppResult) : "PPP unavailable"}</div>;
              })}
            </div>
          ) : (
            <EmptyState icon={ReceiptText} title="No comparisons yet" message="Run a salary comparison to track recent PPP decisions." />
          )}
        </Card>

        <Card>
          <SectionHeader title="Recently Viewed Countries" eyebrow="Explorer" />
          {countriesLoading ? <div className="skeleton h-28 rounded-lg" /> : recentlyViewedCountries.length ? (
            <div className="space-y-3">
              {recentlyViewedCountries.slice(0, 5).map((code) => {
                const country = countriesByCode.get(code);
                return country ? <Link key={code} to={`/explorer?country=${code}`} className="flex items-center gap-3 rounded-lg bg-paper p-3 font-black dark:bg-night/45"><img className="h-5 w-8 rounded object-cover" src={country.flagUrl} alt="" />{country.name}</Link> : null;
              })}
            </div>
          ) : (
            <EmptyState icon={Compass} title="No countries viewed" message="Open countries in World Explorer and they will be listed here." />
          )}
        </Card>
      </div>
    </div>
  );
}

