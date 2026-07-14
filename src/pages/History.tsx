import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import { BarChart3 } from "lucide-react";
import { Card, SectionHeader } from "../components/Card";
import { CurrencySelect } from "../components/Forms";
import { EmptyState } from "../components/EmptyState";
import { useApp } from "../context/AppContext";
import { useCatalogs } from "../hooks/useCatalogs";
import { getHistoricalRates, hasFreshHistoricalCache } from "../services/exchangeService";
import type { HistoricalPoint } from "../types";
import { compactChartTicks } from "../utils/format";
import { classNames } from "../utils/common";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const ranges = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
  { label: "5 Years", value: "5y" }
];

export function History() {
  const { selection, updateSelection, isOnline } = useApp();
  const { currencies } = useCatalogs();
  const [range, setRange] = useState("30d");
  const [points, setPoints] = useState<HistoricalPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canRequest = isOnline || hasFreshHistoricalCache(selection.baseCurrency, selection.targetCurrency, range);

  useEffect(() => {
    if (!canRequest) {
      setError("Offline mode disables uncached historical requests.");
      return;
    }
    setLoading(true);
    setError("");
    getHistoricalRates(selection.baseCurrency, selection.targetCurrency, range)
      .then(setPoints)
      .catch(() => setError("Historical exchange rates are unavailable for this pair and range."))
      .finally(() => setLoading(false));
  }, [canRequest, range, selection.baseCurrency, selection.targetCurrency]);

  const chartData = useMemo(
    () => ({
      labels: compactChartTicks(points),
      datasets: [
        {
          label: `${selection.baseCurrency}/${selection.targetCurrency}`,
          data: points.map((point) => point.rate),
          borderColor: "#163f2e",
          backgroundColor: "rgba(217, 255, 100, 0.28)",
          fill: true,
          tension: 0.32,
          pointRadius: points.length > 90 ? 0 : 2
        }
      ]
    }),
    [points, selection.baseCurrency, selection.targetCurrency]
  );

  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader title="Historical Exchange Rates" eyebrow="Responsive charts" />
        <div className="grid gap-4 md:grid-cols-2">
          <CurrencySelect id="history-base" label="Base currency" value={selection.baseCurrency} onChange={(value) => updateSelection({ baseCurrency: value })} currencies={currencies} />
          <CurrencySelect id="history-target" label="Target currency" value={selection.targetCurrency} onChange={(value) => updateSelection({ targetCurrency: value })} currencies={currencies} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="History range">
          {ranges.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={range === item.value}
              aria-controls="history-chart-panel"
              onClick={() => setRange(item.value)}
              className={classNames(
                "min-h-10 rounded-lg px-3 text-sm font-black transition",
                range === item.value ? "bg-ink text-lime dark:bg-lime dark:text-ink" : "bg-paper text-ink hover:bg-lime dark:bg-night/55 dark:text-paper"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div id="history-chart-panel" role="tabpanel" aria-label={`${selection.baseCurrency}/${selection.targetCurrency} ${range} chart`}>
        {loading ? <div className="skeleton h-[24rem] rounded-lg" /> : points.length ? (
          <div className="h-[24rem]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
                scales: {
                  x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } },
                  y: { ticks: { precision: 4 }, grid: { color: "rgba(16,33,27,0.12)" } }
                }
              }}
            />
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="No chart data" message={error || "Choose a currency pair and range to load historical data."} />
        )}
        {error ? <p className="mt-4 text-sm font-bold text-coral">{error}</p> : null}
        </div>
      </Card>
    </div>
  );
}
