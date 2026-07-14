import { useMemo, useState } from "react";
import { Heart, Info, WalletCards } from "lucide-react";
import { Card, SectionHeader } from "../components/Card";
import { CountrySelect } from "../components/Forms";
import { EmptyState } from "../components/EmptyState";
import { useApp } from "../context/AppContext";
import { getPPPEntry, getPPPDatasetMeta } from "../services/pppService";
import { compareSalary, type SalaryComparisonResult } from "../services/salaryService";
import { formatMoney, formatNumber } from "../utils/format";

export function SalaryComparisonPage() {
  const { countries, selection, updateSelection, addRecentComparison, addFavorite, isOnline } = useApp();
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<SalaryComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const meta = getPPPDatasetMeta();

  const fromCountry = useMemo(() => countries.find((country) => country.cca2 === selection.fromCountry), [countries, selection.fromCountry]);
  const toCountry = useMemo(() => countries.find((country) => country.cca2 === selection.toCountry), [countries, selection.toCountry]);
  const fromPPP = fromCountry ? getPPPEntry(fromCountry.cca2) : null;
  const toPPP = toCountry ? getPPPEntry(toCountry.cca2) : null;

  const runComparison = async () => {
    if (!fromCountry || !toCountry) return;
    setLoading(true);
    setError("");
    try {
      const next = await compareSalary(Number(amount), fromCountry, toCountry);
      setResult(next);
      addRecentComparison(next.comparison);
    } catch {
      setError("Live exchange rate unavailable and no cached rate exists for this salary pair.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <SectionHeader title="Salary & Purchasing Power" eyebrow="PPP comparison" />
        <label className="block" htmlFor="salary-amount">
          <span className="mb-2 block text-sm font-extrabold text-ink/80 dark:text-paper/80">Monthly salary</span>
          <input
            id="salary-amount"
            type="number"
            min="0"
            value={amount}
            placeholder="Enter amount"
            onChange={(event) => setAmount(event.target.value)}
            className="min-h-14 w-full rounded-lg border border-ink/15 bg-white px-4 text-2xl font-black text-ink dark:border-white/15 dark:bg-night dark:text-paper"
          />
        </label>
        <div className="mt-5 grid gap-4">
          <CountrySelect id="from-country" label="From country" value={selection.fromCountry} onChange={(value) => updateSelection({ fromCountry: value })} countries={countries} />
          <CountrySelect id="to-country" label="To country" value={selection.toCountry} onChange={(value) => updateSelection({ toCountry: value })} countries={countries} />
        </div>
        <button
          type="button"
          disabled={!isOnline || loading || !fromCountry || !toCountry || amount === "" || Number(amount) <= 0}
          onClick={runComparison}
          className="mt-5 min-h-12 w-full rounded-lg bg-ink px-4 font-black text-lime transition hover:bg-leaf disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lime dark:text-ink"
        >
          {loading ? "Comparing..." : "Compare salary"}
        </button>
        {!isOnline ? <p className="mt-3 text-sm font-bold text-coral">Offline mode disables new live salary comparisons.</p> : null}
        {error ? <p className="mt-3 text-sm font-bold text-coral">{error}</p> : null}
        <div className="mt-5 rounded-lg bg-paper p-4 text-sm font-bold leading-6 text-ink/80 dark:bg-night/45 dark:text-paper/80">
          <Info className="mb-2 text-leaf dark:text-mint" aria-hidden="true" />
          PPP uses {meta.indicatorCode}, vintage {meta.vintageYear}: {meta.sourceDataset}.
        </div>
      </Card>

      <div className="space-y-5">
        {!result ? (
          <Card>
            <EmptyState icon={WalletCards} title="Ready to compare" message="Enter a salary and countries to see exchange-rate conversion beside purchasing-power equivalence." />
          </Card>
        ) : (
          <>
            <Card>
              <SectionHeader title="Exchange-Rate Conversion" eyebrow="Market rate" />
              <p className="text-4xl font-black text-ink dark:text-lime">
                {formatMoney(result.comparison.exchangeRateResult || 0, result.toCurrency)}
              </p>
              <p className="mt-3 font-bold text-ink/80 dark:text-paper/80">
                This answers what the salary converts to using live currency markets.
              </p>
            </Card>

            <Card className={!result.comparison.pppResult ? "opacity-75" : ""}>
              <SectionHeader title="PPP Equivalent Salary" eyebrow="Purchasing power" />
              {result.comparison.pppResult ? (
                <>
                  <p className="text-4xl font-black text-leaf dark:text-mint">{formatMoney(result.comparison.pppResult, result.toCurrency)}</p>
                  <p className="mt-3 font-bold text-ink/80 dark:text-paper/80">This estimates a salary with similar local purchasing power.</p>
                </>
              ) : (
                <p className="rounded-lg bg-coral/15 p-4 font-black text-coral">
                  PPP data unavailable for {!fromPPP ? fromCountry?.name : toCountry?.name}. This panel is disabled.
                </p>
              )}
            </Card>

            <Card>
              <SectionHeader title="Why They Differ" eyebrow="Plain language" />
              <p className="leading-7 text-ink/85 dark:text-paper/85">{result.explanation}</p>
              {fromPPP && toPPP ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-paper p-4 dark:bg-night/45">
                    <p className="text-sm font-bold text-ink/80 dark:text-paper/80">{fromCountry?.name} PPP factor</p>
                    <p className="text-xl font-black">{formatNumber(fromPPP.pppConversionFactor, 4)}</p>
                  </div>
                  <div className="rounded-lg bg-paper p-4 dark:bg-night/45">
                    <p className="text-sm font-bold text-ink/80 dark:text-paper/80">{toCountry?.name} PPP factor</p>
                    <p className="text-xl font-black">{formatNumber(toPPP.pppConversionFactor, 4)}</p>
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => fromCountry && toCountry && addFavorite({ type: "salary", base: fromCountry.cca2, target: toCountry.cca2, label: `${fromCountry.name} to ${toCountry.name}` })}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-lime px-4 font-black text-ink"
              >
                <Heart size={18} aria-hidden="true" /> Save salary pair
              </button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
