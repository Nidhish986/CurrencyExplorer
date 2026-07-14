import type { Country } from "../types";

export function CurrencySelect({
  id,
  label,
  value,
  onChange,
  currencies,
  disabled = false
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  currencies: Array<{ code: string; name: string }>;
  disabled?: boolean;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-extrabold text-ink/80 dark:text-paper/80">{label}</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-lg border border-ink/15 bg-white px-3 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-night dark:text-paper"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CountrySelect({
  id,
  label,
  value,
  onChange,
  countries,
  disabled = false
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  countries: Country[];
  disabled?: boolean;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-extrabold text-ink/80 dark:text-paper/80">{label}</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-lg border border-ink/15 bg-white px-3 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-night dark:text-paper"
      >
        {countries.map((country) => (
          <option key={country.cca2} value={country.cca2}>
            {country.name} - {country.currencies[0]?.code}
          </option>
        ))}
      </select>
    </label>
  );
}
