import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Country, FavoritePair, SalaryComparison, StoredSelection } from "../types";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { getCountries } from "../services/countryService";
import { createId } from "../utils/common";
import { readStorage, writeStorage } from "../services/storage";

type Theme = "light" | "dark";

type AppContextValue = {
  countries: Country[];
  countrySource: "live" | "snapshot";
  countriesLoading: boolean;
  isOnline: boolean;
  theme: Theme;
  toggleTheme: () => void;
  favorites: FavoritePair[];
  addFavorite: (favorite: Omit<FavoritePair, "id" | "createdAt">) => void;
  removeFavorite: (id: string) => void;
  recentComparisons: SalaryComparison[];
  addRecentComparison: (comparison: SalaryComparison) => void;
  recentlyViewedCountries: string[];
  addViewedCountry: (countryCode: string) => void;
  selection: StoredSelection;
  updateSelection: (partial: Partial<StoredSelection>) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const defaultSelection: StoredSelection = {
  baseCurrency: "USD",
  targetCurrency: "INR",
  fromCountry: "IN",
  toCountry: "US"
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySource, setCountrySource] = useState<"live" | "snapshot">("snapshot");
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => readStorage<Theme>("theme", "light"));
  const [favorites, setFavorites] = useState<FavoritePair[]>(() => readStorage<FavoritePair[]>("favorites", []));
  const [recentComparisons, setRecentComparisons] = useState<SalaryComparison[]>(() =>
    readStorage<SalaryComparison[]>("recent-comparisons", [])
  );
  const [recentlyViewedCountries, setRecentlyViewedCountries] = useState<string[]>(() =>
    readStorage<string[]>("recent-countries", [])
  );
  const [selection, setSelection] = useState<StoredSelection>(() => readStorage<StoredSelection>("selection", defaultSelection));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    writeStorage("theme", theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    setCountriesLoading(true);
    getCountries()
      .then((result) => {
        if (!cancelled) {
          setCountries(result.countries);
          setCountrySource(result.source);
        }
      })
      .finally(() => {
        if (!cancelled) setCountriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => writeStorage("favorites", favorites), [favorites]);
  useEffect(() => writeStorage("recent-comparisons", recentComparisons), [recentComparisons]);
  useEffect(() => writeStorage("recent-countries", recentlyViewedCountries), [recentlyViewedCountries]);
  useEffect(() => writeStorage("selection", selection), [selection]);

  const toggleTheme = useCallback(() => setTheme((current) => (current === "light" ? "dark" : "light")), []);

  const addFavorite = useCallback((favorite: Omit<FavoritePair, "id" | "createdAt">) => {
    setFavorites((current) => {
      const duplicate = current.some((item) => item.type === favorite.type && item.base === favorite.base && item.target === favorite.target);
      if (duplicate) return current;
      return [{ ...favorite, id: createId("fav"), createdAt: new Date().toISOString() }, ...current].slice(0, 24);
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((current) => current.filter((favorite) => favorite.id !== id));
  }, []);

  const addRecentComparison = useCallback((comparison: SalaryComparison) => {
    setRecentComparisons((current) => [comparison, ...current].slice(0, 8));
  }, []);

  const addViewedCountry = useCallback((countryCode: string) => {
    setRecentlyViewedCountries((current) => [countryCode, ...current.filter((item) => item !== countryCode)].slice(0, 8));
  }, []);

  const updateSelection = useCallback((partial: Partial<StoredSelection>) => {
    setSelection((current) => ({ ...current, ...partial }));
  }, []);

  const value = useMemo(
    () => ({
      countries,
      countrySource,
      countriesLoading,
      isOnline,
      theme,
      toggleTheme,
      favorites,
      addFavorite,
      removeFavorite,
      recentComparisons,
      addRecentComparison,
      recentlyViewedCountries,
      addViewedCountry,
      selection,
      updateSelection
    }),
    [
      countries,
      countrySource,
      countriesLoading,
      isOnline,
      theme,
      toggleTheme,
      favorites,
      addFavorite,
      removeFavorite,
      recentComparisons,
      addRecentComparison,
      recentlyViewedCountries,
      addViewedCountry,
      selection,
      updateSelection
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}


