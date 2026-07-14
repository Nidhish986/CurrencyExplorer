import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Card, SectionHeader } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { useApp } from "../context/AppContext";
import { useCatalogs } from "../hooks/useCatalogs";
import { getExchangeRate } from "../services/exchangeService";
import { getPPPEntry } from "../services/pppService";
import type { ExchangeRate, FavoritePair } from "../types";
import { formatDateTime, formatNumber } from "../utils/format";

type ResolvedFavorite = {
  favorite: FavoritePair;
  rate?: ExchangeRate;
  pppLabel?: string;
  error?: string;
};

export function Favorites() {
  const { favorites, removeFavorite } = useApp();
  const { countriesByCode } = useCatalogs();
  const [resolved, setResolved] = useState<ResolvedFavorite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(
      favorites.map(async (favorite) => {
        try {
          if (favorite.type === "currency") {
            return { favorite, rate: await getExchangeRate(favorite.base, favorite.target) };
          }
          const from = countriesByCode.get(favorite.base);
          const to = countriesByCode.get(favorite.target);
          const fromPPP = getPPPEntry(favorite.base);
          const toPPP = getPPPEntry(favorite.target);
          const pppLabel = fromPPP && toPPP
            ? `${from?.name || favorite.base} factor ${formatNumber(fromPPP.pppConversionFactor, 3)} / ${to?.name || favorite.target} factor ${formatNumber(toPPP.pppConversionFactor, 3)}`
            : `PPP data unavailable for ${!fromPPP ? from?.name || favorite.base : to?.name || favorite.target}`;
          return { favorite, pppLabel };
        } catch {
          return { favorite, error: "Unable to resolve current data for this favorite." };
        }
      })
    )
      .then((items) => {
        if (!cancelled) setResolved(items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countriesByCode, favorites]);

  return (
    <Card>
      <SectionHeader title="Favorites" eyebrow="Minimal saved pairs" />
      {loading ? <div className="skeleton h-60 rounded-lg" /> : resolved.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {resolved.map(({ favorite, rate, pppLabel, error }) => (
            <article key={favorite.id} className="rounded-lg border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-night/45">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-leaf/75 dark:text-mint/80">{favorite.type}</p>
                  <h2 className="mt-1 text-xl font-black">{favorite.label}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => removeFavorite(favorite.id)}
                  className="grid size-10 place-items-center rounded-lg bg-white text-coral transition hover:bg-coral hover:text-white dark:bg-leaf"
                  aria-label={`Remove ${favorite.label}`}
                  title="Remove favorite"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
              {rate ? (
                <div className="mt-4">
                  <p className="text-2xl font-black">1 {rate.base} = {formatNumber(rate.rate, 5)} {rate.target}</p>
                  <p className="mt-1 text-sm font-bold text-ink/80 dark:text-paper/80">Updated {rate.date}</p>
                  {rate.source === "cached" ? <p className="mt-2 inline-flex rounded bg-coral/15 px-2 py-1 text-sm font-black text-coral">Stale data from {formatDateTime(rate.cachedAt || rate.date)}</p> : null}
                </div>
              ) : null}
              {pppLabel ? <p className="mt-4 rounded-lg bg-white p-3 font-bold dark:bg-leaf">{pppLabel}</p> : null}
              {error ? <p className="mt-4 font-bold text-coral">{error}</p> : null}
              <p className="mt-4 text-xs font-bold text-ink/80 dark:text-paper/80">Saved {formatDateTime(favorite.createdAt)}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Heart} title="No favorites saved" message="Save pairs from the converter or salary comparison pages. Favorites store only pair IDs and re-resolve current data here." />
      )}
    </Card>
  );
}
