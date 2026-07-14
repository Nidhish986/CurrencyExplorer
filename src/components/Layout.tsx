import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowLeftRight, BarChart3, Compass, Heart, Home, Moon, Sun, WalletCards } from "lucide-react";
import { useApp } from "../context/AppContext";
import { classNames } from "../utils/common";
import { OfflineBanner } from "./OfflineBanner";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/converter", label: "Converter", icon: ArrowLeftRight },
  { to: "/salary-comparison", label: "Salary", icon: WalletCards },
  { to: "/history", label: "History", icon: BarChart3 },
  { to: "/explorer", label: "Explorer", icon: Compass },
  { to: "/favorites", label: "Favorites", icon: Heart }
];

export function Layout() {
  const { theme, toggleTheme, countrySource } = useApp();

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors dark:bg-night dark:text-paper">
      <OfflineBanner />
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 text-ink backdrop-blur-xl dark:border-white/10 dark:bg-ink/95 dark:text-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Global Money Companion home">
            <span className="grid size-11 place-items-center rounded-lg bg-lime text-ink shadow-soft">
              <WalletCards aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-black tracking-normal text-ink dark:text-paper sm:text-lg">Global Money Companion</span>
              <span className="text-xs font-semibold text-ink/80 dark:text-paper/80">
                Countries: {countrySource === "live" ? "live source" : "snapshot fallback"}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="grid size-11 place-items-center rounded-lg border border-ink/15 bg-white text-ink transition hover:bg-lime dark:border-white/15 dark:bg-leaf dark:text-paper dark:hover:bg-mint/20"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  classNames(
                    "flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold transition",
                    isActive
                      ? "bg-ink text-lime dark:bg-lime dark:text-ink"
                      : "text-ink/80 hover:bg-ink/5 dark:text-paper/80 dark:hover:bg-white/10"
                  )
                }
              >
                <Icon size={17} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="border-t border-ink/10 pt-6 text-center text-sm font-bold text-ink/80 dark:border-white/10 dark:text-paper/80">
          <p>Global Money Companion — Exchange rates &amp; purchasing power insights.</p>
          <p className="mt-1">Data: <a href="https://frankfurter.dev" className="underline hover:text-leaf dark:hover:text-mint" target="_blank" rel="noopener noreferrer">Frankfurter API</a> · <a href="https://data.worldbank.org" className="underline hover:text-leaf dark:hover:text-mint" target="_blank" rel="noopener noreferrer">World Bank PPP</a></p>
        </div>
      </footer>
    </div>
  );
}
